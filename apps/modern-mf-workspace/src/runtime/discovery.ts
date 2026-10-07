import type {
  ApiError,
  Binding,
  ContextRef,
  DiscoveryContext,
  DiscoveryResult,
  Json,
  Provider,
} from '../../shared/contracts.ts';

export interface ResolvedApplication {
  binding: Binding;
  provider: Provider;
  context: DiscoveryContext;
  basename: string;
  props: Record<string, Json>;
}

export interface ApplicationDiscoveryResult {
  target: string;
  contexts: DiscoveryContext[];
  chain: ResolvedApplication[];
}

export interface DiscoverApplicationsOptions {
  pathname: string;
  cache?: 'default' | 'reload';
  signal?: AbortSignal;
}

export class DiscoveryError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'DiscoveryError';
    this.code = code;
  }
}

export class SnapshotExpiredError extends DiscoveryError {
  readonly endpoint: string;
  readonly consumerKey: string;
  readonly expectedSid: string;
  readonly actualSid?: string;

  constructor(details: {
    endpoint: string;
    consumerKey: string;
    expectedSid: string;
    actualSid?: string;
    message?: string;
  }) {
    super(
      'SNAPSHOT_EXPIRED',
      details.message ?? '应用发现数据已经过期，请刷新页面。',
    );
    this.name = 'SnapshotExpiredError';
    this.endpoint = details.endpoint;
    this.consumerKey = details.consumerKey;
    this.expectedSid = details.expectedSid;
    this.actualSid = details.actualSid;
  }
}

export interface ApplicationsServiceOptions {
  endpoint: string;
  fetcher?: typeof fetch;
  onExpired?: (error: SnapshotExpiredError) => void | Promise<void>;
  trace?: (event: string, detail?: unknown) => void;
}

type TargetContext = Partial<Pick<ContextRef, 'consumerKey' | 'sid'>> & {
  endpoint: string;
};

function contextKey(
  context: Pick<ContextRef, 'endpoint' | 'consumerKey'>,
): string {
  return JSON.stringify([context.endpoint, context.consumerKey]);
}

function stableJSON(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item).sort(([a], [b]) => a.localeCompare(b)),
        )
      : item,
  );
}

function invalid(message: string): never {
  throw new DiscoveryError('INVALID_DISCOVERY', message);
}

function pathnameOnly(pathname: string): string {
  if (
    !pathname.startsWith('/') ||
    pathname.startsWith('//') ||
    /[?#\\\0]/.test(pathname)
  ) {
    invalid('pathname 必须为不含 query/hash 的页面绝对路径。');
  }
  return (
    new URL(pathname, 'http://discovery.local').pathname
      .replace(/\/{2,}/g, '/')
      .replace(/\/$/, '') || '/'
  );
}

/** Binding paths are relative to their Consumer, including slash-prefixed root paths. */
function matchBinding(
  binding: Binding,
  basename: string,
  pathname: string,
): string | undefined {
  const base = basename === '/' ? '' : basename.replace(/\/$/, '');
  if (base && pathname !== base && !pathname.startsWith(`${base}/`)) return;
  const remaining = pathname.slice(base.length).split('/').filter(Boolean);
  const pattern = binding.path.split('/').filter(Boolean);
  const consumed: string[] = [];
  for (const [index, segment] of pattern.entries()) {
    if (segment === '*') {
      if (index !== pattern.length - 1) invalid('通配符只能位于挂载路径末尾。');
      break;
    }
    const actual = remaining[index];
    if (!actual || (segment !== actual && !segment.startsWith(':'))) return;
    consumed.push(actual);
  }
  return `${base}/${consumed.join('/')}`.replace(/\/$/, '') || '/';
}

function validateContext(value: DiscoveryContext): void {
  if (
    !value ||
    typeof value.endpoint !== 'string' ||
    !value.endpoint ||
    typeof value.consumerKey !== 'string' ||
    !value.consumerKey ||
    typeof value.sid !== 'string' ||
    !value.sid ||
    !Array.isArray(value.bindings) ||
    !Array.isArray(value.routes) ||
    !Array.isArray(value.capabilities) ||
    !Array.isArray(value.loadedPaths)
  )
    invalid('发现响应缺少有效的消费上下文。');
  if (value.loadedPaths.some((path) => typeof path !== 'string'))
    invalid('loadedPaths 必须为路径数组。');
  for (const binding of value.bindings) {
    if (!binding.id || typeof binding.path !== 'string' || !binding.props)
      invalid('应用绑定无效。');
    if (binding.mode === 'fixed' && !binding.provider)
      invalid('固定关系缺少确定的产物。');
    if (binding.mode === 'dynamic' && !binding.childEndpoint)
      invalid('动态关系缺少发现地址。');
    if (binding.mode !== 'fixed' && binding.mode !== 'dynamic')
      invalid('未知的应用绑定类型。');
  }
  for (const route of value.routes) {
    if (!value.bindings.some((binding) => binding.id === route.bindingId))
      invalid('路由引用了未知绑定。');
  }
  // Capabilities may refer to route IDs omitted from this path's projected routes.
}

function mergeById<T extends { id: string }>(
  previous: T[],
  incoming: T[],
): T[] {
  const records = new Map(previous.map((record) => [record.id, record]));
  for (const record of incoming) {
    const known = records.get(record.id);
    if (known && stableJSON(known) !== stableJSON(record))
      invalid(`同一 sid 内记录 ${record.id} 发生变化。`);
    records.set(record.id, record);
  }
  return [...records.values()];
}

function abortReason(signal: AbortSignal): unknown {
  return (
    signal.reason ??
    new DOMException('Application discovery aborted', 'AbortError')
  );
}

/** Cancelling one caller does not abort a request shared by other callers. */
function subscribe<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortReason(signal));
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(abortReason(signal));
    signal.addEventListener('abort', abort, { once: true });
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener('abort', abort));
  });
}

/** One page/request owns one service. This service never navigates or loads application code. */
export class ApplicationsService {
  private readonly options: ApplicationsServiceOptions;
  private readonly fetcher: typeof fetch;
  private readonly contexts = new Map<string, DiscoveryContext>();
  private readonly pending = new Map<string, Promise<DiscoveryResult>>();
  private readonly expired = new Map<string, SnapshotExpiredError>();
  private readonly dynamicTargets = new Map<string, ContextRef>();
  private root?: ContextRef;

  constructor(options: ApplicationsServiceOptions) {
    this.options = options;
    this.fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  }

  getContexts(): DiscoveryContext[] {
    return structuredClone([...this.contexts.values()]);
  }

  discoverApplications(
    options: DiscoverApplicationsOptions,
  ): Promise<ApplicationDiscoveryResult> {
    if (options.signal?.aborted)
      return Promise.reject(abortReason(options.signal));
    return subscribe(this.discover(options), options.signal);
  }

  private expire(error: SnapshotExpiredError): SnapshotExpiredError {
    const key = contextKey(error);
    const previous = this.expired.get(key);
    if (previous) return previous;
    this.expired.set(key, error);
    this.options.trace?.('discovery:expired', error);
    // A user hook cannot turn expiration into a successful discovery or replace its error.
    try {
      Promise.resolve(this.options.onExpired?.(error)).catch((hookError) =>
        this.options.trace?.('discovery:hook-error', hookError),
      );
    } catch (hookError) {
      this.options.trace?.('discovery:hook-error', hookError);
    }
    return error;
  }

  private checkContext(context: ContextRef): void {
    const expired = this.expired.get(contextKey(context));
    if (expired) throw expired;
  }

  private commit(result: DiscoveryResult): void {
    const updates = [result, ...result.contexts].map((incoming) => {
      validateContext(incoming);
      this.checkContext(incoming);
      const key = contextKey(incoming);
      const previous = this.contexts.get(key);
      if (previous && previous.sid !== incoming.sid) {
        throw this.expire(
          new SnapshotExpiredError({
            ...previous,
            expectedSid: previous.sid,
            actualSid: incoming.sid,
          }),
        );
      }
      const context: DiscoveryContext = {
        endpoint: incoming.endpoint,
        consumerKey: incoming.consumerKey,
        sid: incoming.sid,
        provider: incoming.provider,
        props: incoming.props,
        bindings: incoming.bindings,
        routes: incoming.routes,
        capabilities: incoming.capabilities,
        loadedPaths: incoming.loadedPaths,
      };
      if (previous) {
        if (
          stableJSON(previous.provider) !== stableJSON(context.provider) ||
          stableJSON(previous.props) !== stableJSON(context.props) ||
          stableJSON(previous.capabilities) !== stableJSON(context.capabilities)
        ) {
          invalid('同一 sid 内的产物或入口目录发生变化。');
        }
        context.bindings = mergeById(previous.bindings, context.bindings);
        context.routes = mergeById(previous.routes, context.routes);
        context.loadedPaths = [
          ...new Set([...previous.loadedPaths, ...context.loadedPaths]),
        ];
      }
      return [key, structuredClone(context)] as const;
    });
    // Validate every included context before exposing any part of the response.
    for (const [key, context] of updates) this.contexts.set(key, context);
  }

  private async request(
    target: TargetContext,
    basename: string,
    pathname: string,
  ): Promise<DiscoveryResult> {
    const requestKey = JSON.stringify([
      target.endpoint,
      target.consumerKey,
      target.sid,
      basename,
      pathname,
    ]);
    const shared = this.pending.get(requestKey);
    if (shared) return shared;
    const work = (async () => {
      const params = {
        consumerKey: target.consumerKey,
        sid: target.sid,
        basename,
        pathname,
      };
      this.options.trace?.('discovery:request', {
        endpoint: target.endpoint,
        ...params,
      });
      const response = await this.fetcher(target.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(params),
      });
      const body = (await response.json()) as DiscoveryResult | ApiError;
      if (!body || typeof body !== 'object')
        invalid('发现响应必须为 JSON 对象。');
      if ('error' in body) {
        const error = body.error;
        if (error.code === 'SNAPSHOT_EXPIRED') {
          throw this.expire(
            new SnapshotExpiredError({
              endpoint: target.endpoint,
              consumerKey: target.consumerKey ?? error.consumerKey ?? '',
              expectedSid: target.sid ?? error.expectedSid ?? '',
              actualSid: error.actualSid,
              message: error.message,
            }),
          );
        }
        throw new DiscoveryError(error.code, error.message);
      }
      if (!response.ok)
        throw new DiscoveryError(
          'DISCOVERY_HTTP_ERROR',
          `Application discovery failed: ${response.status}`,
        );
      if (body.protocolVersion !== '1.0' || !Array.isArray(body.contexts))
        invalid('未知的应用发现协议。');
      validateContext(body);
      if (
        body.endpoint !== target.endpoint ||
        (target.consumerKey && body.consumerKey !== target.consumerKey)
      )
        invalid('发现响应不属于请求的 Consumer。');
      if (body.pathname !== pathname || body.basename !== basename)
        invalid('发现响应不属于请求的路径。');
      if (target.sid && body.sid !== target.sid) {
        throw this.expire(
          new SnapshotExpiredError({
            endpoint: target.endpoint,
            consumerKey: body.consumerKey,
            expectedSid: target.sid,
            actualSid: body.sid,
          }),
        );
      }
      if (!body.loadedPaths.includes(pathname))
        invalid('发现响应没有完成目标路径准备。');
      for (const context of body.contexts) {
        if (context.endpoint !== body.endpoint || context.sid !== body.sid)
          invalid('响应跨越了独立动态发现边界。');
      }
      this.commit(body);
      this.options.trace?.('discovery:received', {
        endpoint: body.endpoint,
        consumerKey: body.consumerKey,
        sid: body.sid,
        pathname,
      });
      return body;
    })();
    this.pending.set(requestKey, work);
    try {
      return await work;
    } finally {
      if (this.pending.get(requestKey) === work)
        this.pending.delete(requestKey);
    }
  }

  private async discover(
    options: DiscoverApplicationsOptions,
  ): Promise<ApplicationDiscoveryResult> {
    const pathname = pathnameOnly(options.pathname);
    const fresh = new Set<string>();
    const used = new Map<string, DiscoveryContext>();
    const chain: ResolvedApplication[] = [];
    const ancestors = new Set<string>();
    const ensure = async (
      target: TargetContext,
      basename: string,
    ): Promise<DiscoveryContext> => {
      let context = target.consumerKey
        ? this.contexts.get(contextKey(target as ContextRef))
        : undefined;
      if (context) {
        this.checkContext(context);
        if (target.sid && target.sid !== context.sid)
          invalid('绑定与已经接受的消费代次不一致。');
      }
      if (
        !context ||
        !context.loadedPaths.includes(pathname) ||
        (options.cache === 'reload' && !fresh.has(contextKey(context)))
      ) {
        const result = await this.request(
          { ...target, sid: target.sid ?? context?.sid },
          basename,
          pathname,
        );
        for (const item of [result, ...result.contexts]) {
          if (item.loadedPaths.includes(pathname)) fresh.add(contextKey(item));
        }
        context = this.contexts.get(contextKey(result))!;
      }
      this.checkContext(context);
      used.set(contextKey(context), context);
      return context;
    };

    const root = await ensure(
      this.root ?? { endpoint: this.options.endpoint },
      '/',
    );
    this.root = {
      endpoint: root.endpoint,
      consumerKey: root.consumerKey,
      sid: root.sid,
    };
    const walk = async (
      context: DiscoveryContext,
      basename: string,
    ): Promise<void> => {
      const key = contextKey(context);
      if (ancestors.has(key) || ancestors.size >= 32)
        invalid('应用挂载链包含递归关系。');
      ancestors.add(key);
      const matches = context.bindings
        .flatMap((binding) => {
          const mount = matchBinding(binding, basename, pathname);
          return mount ? [{ binding, basename: mount }] : [];
        })
        .sort((a, b) => b.basename.length - a.basename.length);
      const match = matches[0];
      if (!match) return;
      if (matches[1]?.basename === match.basename)
        invalid('同一路径匹配了冲突的应用绑定。');
      const { binding } = match;
      let child = context;
      if (binding.mode === 'dynamic') {
        // Parent generations never become the expected sid of an independent child source.
        const relation = JSON.stringify([key, context.sid, binding.id]);
        const target = this.dynamicTargets.get(relation) ?? {
          endpoint: binding.childEndpoint!,
          consumerKey: binding.consumerKey,
        };
        child = await ensure(target, match.basename);
        this.dynamicTargets.set(relation, {
          endpoint: child.endpoint,
          consumerKey: child.consumerKey,
          sid: child.sid,
        });
      } else if (binding.consumerKey) {
        if (
          (binding.childEndpoint &&
            binding.childEndpoint !== context.endpoint) ||
          (binding.sid && binding.sid !== context.sid)
        )
          invalid('固定复制关系不能查询另一代动态来源。');
        child = await ensure(
          {
            endpoint: context.endpoint,
            consumerKey: binding.consumerKey,
            sid: context.sid,
          },
          match.basename,
        );
      }
      const provider =
        binding.mode === 'dynamic' ? child.provider : binding.provider;
      if (!provider) invalid('已解析应用缺少 MF 产物。');
      if (
        binding.mode === 'fixed' &&
        child !== context &&
        stableJSON(child.provider) !== stableJSON(provider)
      )
        invalid('固定绑定的产物与消费上下文不一致。');
      chain.push({
        binding,
        provider,
        context: child,
        basename: match.basename,
        props: {
          ...(child !== context ? child.props : undefined),
          ...binding.props,
        },
      });
      if (child !== context) await walk(child, match.basename);
    };
    await walk(root, '/');
    // A concurrent request may have expired a context while this chain was being prepared.
    for (const context of used.values()) this.checkContext(context);
    return structuredClone({
      target: pathname,
      contexts: [...used.values()],
      chain,
    });
  }
}
