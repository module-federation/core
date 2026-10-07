import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type {
  ApplicationCapability,
  Binding,
  ContextRef,
  DiscoveryContext,
  DiscoveryResult,
  Json,
  PlatformConfig,
  PlatformId,
  PlatformView,
  Preferences,
  Provider,
  RecommendationsConfig,
  RootConfig,
} from '../shared/contracts.ts';
import { TOOL_DECLARATIONS } from '../shared/capabilities.ts';
import { defaultPreferences } from './data.ts';
import {
  HttpError,
  invalid,
  validateConfig,
  validatePreferences,
} from './validation.ts';

interface StoredPlatform extends PlatformView {
  contexts: DiscoveryContext[];
}
interface StoredState {
  formatVersion: 1;
  platforms: Record<PlatformId, StoredPlatform>;
  preferences: Preferences;
}
export interface DiscoveryParams {
  consumerKey?: string;
  sid?: string;
  basename?: string;
  pathname?: string;
}
const endpoints = {
  root: '/api/discovery/root',
  recommendations: '/api/discovery/recommendations',
};
export const initialRootConfig: RootConfig = {
  delivery: 'ondemand',
  recommendationMode: 'dynamic',
  entries: {
    catalog: {
      path: '/catalog',
      title: '发现好物',
      props: { subtitle: '为认真生活挑选的日常好物' },
    },
    preferences: { path: '/preferences', title: '我的偏好', props: {} },
    recommendations: {
      path: '/recommendations',
      title: '为你推荐',
      props: { greeting: '一些可能适合你的新发现' },
    },
  },
};
export const initialRecommendationsConfig: RecommendationsConfig = {
  delivery: 'ondemand',
  version: 'v1',
  detailsEnabled: true,
  defaultPreferences,
};
const clone = <T>(value: T): T => structuredClone(value);
const provider = (name: string, version = '1.0.0'): Provider => ({
  name,
  entry: `/remotes/${name}/mf-manifest.json`,
  version,
  expose: './App',
});
function toolCapability(
  target: ApplicationCapability['target'],
  title: string,
  description: string,
  names?: string[],
  entryPath?: string,
): ApplicationCapability {
  return {
    target,
    title,
    description,
    ...(entryPath ? { entryPath } : {}),
    ...(names
      ? { tools: names.map((name) => clone(TOOL_DECLARATIONS[name]!)) }
      : {}),
  };
}
function recommendationContexts(
  config: RecommendationsConfig,
  sid: string,
  copied: boolean,
): DiscoveryContext[] {
  const endpoint = copied ? endpoints.root : endpoints.recommendations;
  const consumerKey = copied ? 'root-copy-recommendations' : 'recommendations';
  const detailsKey = copied ? 'root-copy-details' : 'recommendations-details';
  const detailBinding: Binding = {
    id: 'details',
    title: '商品详情',
    path: 'detail',
    mode: 'fixed',
    provider: provider('details'),
    props: {},
    childEndpoint: endpoint,
    consumerKey: detailsKey,
    sid,
  };
  const contexts: DiscoveryContext[] = [
    {
      endpoint,
      consumerKey,
      sid,
      provider: provider(
        `recommendations_${config.version}`,
        config.version === 'v1' ? '1.0.0' : '2.0.0',
      ),
      props: {
        defaultPreferences: clone(config.defaultPreferences) as unknown as Json,
        detailsEnabled: config.detailsEnabled,
      },
      bindings: config.detailsEnabled ? [detailBinding] : [],
      routes: config.detailsEnabled
        ? [{ id: 'details', path: 'detail', bindingId: 'details' }]
        : [],
      capabilities: [
        toolCapability(
          { kind: 'self' },
          '个性化推荐',
          '读取偏好并生成当前版本的推荐列表',
          config.detailsEnabled
            ? ['get_recommendations', 'open_recommendation']
            : ['get_recommendations'],
        ),
        ...(config.detailsEnabled
          ? [
              toolCapability(
                { kind: 'route', routeId: 'details' },
                '商品详情',
                '查看推荐商品的参数、价格与库存',
                ['get_product_details'],
                'detail',
              ),
            ]
          : []),
      ],
      loadedPaths: [],
    },
  ];
  if (config.detailsEnabled)
    contexts.push({
      endpoint,
      consumerKey: detailsKey,
      sid,
      provider: provider('details'),
      bindings: [],
      routes: [],
      capabilities: [
        toolCapability({ kind: 'self' }, '商品详情', '查看指定商品的完整信息', [
          'get_product_details',
        ]),
      ],
      loadedPaths: [],
    });
  return contexts;
}
function rootContexts(
  config: RootConfig,
  fixedConfig: RecommendationsConfig,
  sid: string,
): DiscoveryContext[] {
  const bindings: Binding[] = Object.entries(config.entries).map(
    ([id, entry]) => ({
      id,
      ...clone(entry),
      mode: id === 'recommendations' ? config.recommendationMode : 'fixed',
      ...(id === 'recommendations'
        ? config.recommendationMode === 'dynamic'
          ? {
              childEndpoint: endpoints.recommendations,
              consumerKey: 'recommendations',
            }
          : {
              provider: provider('recommendations_v1'),
              childEndpoint: endpoints.root,
              consumerKey: 'root-copy-recommendations',
              sid,
            }
        : { provider: provider(id) }),
    }),
  );
  const capabilities = bindings.map((binding) =>
    toolCapability(
      { kind: 'route', routeId: binding.id },
      binding.title,
      binding.id === 'catalog'
        ? '浏览、搜索与比较商品'
        : binding.id === 'preferences'
          ? '设置预算与喜欢的品类'
          : '进入独立发布的推荐应用，发现个性化建议',
      binding.id === 'catalog'
        ? ['search_products']
        : binding.id === 'preferences'
          ? ['get_preferences', 'update_preferences']
          : binding.mode === 'fixed'
            ? ['get_recommendations']
            : undefined,
      binding.path,
    ),
  );
  return [
    {
      endpoint: endpoints.root,
      consumerKey: 'root',
      sid,
      provider: null,
      bindings,
      routes: bindings.map((binding) => ({
        id: binding.id,
        path: binding.path,
        bindingId: binding.id,
      })),
      capabilities,
      loadedPaths: [],
    },
    ...(config.recommendationMode === 'fixed'
      ? recommendationContexts({ ...fixedConfig, version: 'v1' }, sid, true)
      : []),
  ];
}
function makePublication(id: PlatformId, config: PlatformConfig) {
  return {
    consumerKey: id,
    sid: `${id}_${randomUUID()}`,
    config: clone(config),
    publishedAt: new Date().toISOString(),
  };
}
function initialState(): StoredState {
  const root = makePublication('root', initialRootConfig);
  const recommendations = makePublication(
    'recommendations',
    initialRecommendationsConfig,
  );
  return {
    formatVersion: 1,
    preferences: { ...clone(defaultPreferences), customized: false },
    platforms: {
      root: {
        id: 'root',
        draft: clone(root.config),
        published: root,
        history: [root],
        contexts: rootContexts(
          initialRootConfig,
          initialRecommendationsConfig,
          root.sid,
        ),
      },
      recommendations: {
        id: 'recommendations',
        draft: clone(recommendations.config),
        published: recommendations,
        history: [recommendations],
        contexts: recommendationContexts(
          initialRecommendationsConfig,
          recommendations.sid,
          false,
        ),
      },
    },
  };
}
function normalizePath(value: string | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.length > 2000 ||
    /[?#\\\0]/.test(value)
  )
    invalid('basename/pathname 必须为有效路径，不含 query 或 hash');
  return value.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
}
const join = (base: string, path: string) =>
  path.startsWith('/') ? path : `${base.replace(/\/$/, '')}/${path}`;
const matches = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

export class PlatformStore {
  #state: StoredState;
  #file?: string;
  #pending: Promise<unknown> = Promise.resolve();
  private constructor(state: StoredState, file?: string) {
    this.#state = state;
    this.#file = file;
  }
  static async open(file?: string): Promise<PlatformStore> {
    if (file) {
      try {
        const value = JSON.parse(await readFile(file, 'utf8')) as StoredState;
        if (
          value.formatVersion !== 1 ||
          !value.platforms?.root ||
          !value.platforms.recommendations
        )
          throw new Error('Unsupported platform state');
        validateConfig('root', value.platforms.root.published.config);
        validateConfig(
          'recommendations',
          value.platforms.recommendations.published.config,
        );
        validatePreferences(value.preferences);
        value.preferences.customized = value.preferences.customized === true;
        return new PlatformStore(value, file);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
    const store = new PlatformStore(initialState(), file);
    await store.#save(store.#state);
    return store;
  }
  async #save(state: StoredState) {
    if (!this.#file) return;
    await mkdir(dirname(this.#file), { recursive: true });
    const temp = `${this.#file}.${randomUUID()}.tmp`;
    await writeFile(temp, JSON.stringify(state, null, 2), { mode: 0o600 });
    await rename(temp, this.#file);
  }
  #mutate<T>(fn: (next: StoredState) => T): Promise<T> {
    const operation = this.#pending.then(async () => {
      const next = clone(this.#state);
      const result = fn(next);
      await this.#save(next);
      this.#state = next;
      return clone(result);
    });
    this.#pending = operation.catch(() => {});
    return operation;
  }
  platform(id: PlatformId): PlatformView {
    const { contexts: _contexts, ...view } = this.#state.platforms[id];
    return clone(view);
  }
  async publish(id: PlatformId, input: unknown): Promise<PlatformView> {
    const config = validateConfig(id, input);
    return this.#mutate((state) => {
      const publication = makePublication(id, config);
      const previous = state.platforms[id];
      const v1 = state.platforms.recommendations.history.find(
        (entry) => (entry.config as RecommendationsConfig).version === 'v1',
      )?.config as RecommendationsConfig | undefined;
      const contexts =
        id === 'root'
          ? rootContexts(
              config as RootConfig,
              v1 || initialRecommendationsConfig,
              publication.sid,
            )
          : recommendationContexts(
              config as RecommendationsConfig,
              publication.sid,
              false,
            );
      state.platforms[id] = {
        id,
        draft: clone(config),
        published: publication,
        history: [publication, ...previous.history].slice(0, 30),
        contexts,
      };
      const { contexts: _contexts, ...view } = state.platforms[id];
      return view;
    });
  }
  async reset(): Promise<{
    root: PlatformView;
    recommendations: PlatformView;
  }> {
    return this.#mutate((next) => {
      Object.assign(next, initialState());
      const view = (id: PlatformId) => {
        const { contexts: _contexts, ...item } = next.platforms[id];
        return item;
      };
      return { root: view('root'), recommendations: view('recommendations') };
    });
  }
  preferences(): Preferences {
    return clone(this.#state.preferences);
  }
  async setPreferences(input: unknown): Promise<Preferences> {
    const preferences = { ...validatePreferences(input), customized: true };
    return this.#mutate((next) => {
      next.preferences = preferences;
      return preferences;
    });
  }
  discover(id: PlatformId, params: DiscoveryParams): DiscoveryResult {
    const platform = this.#state.platforms[id];
    const consumerKey = params.consumerKey || id;
    if (
      typeof consumerKey !== 'string' ||
      consumerKey.length > 180 ||
      (params.sid !== undefined &&
        (typeof params.sid !== 'string' ||
          !params.sid ||
          params.sid.length > 180))
    )
      invalid('consumerKey/sid 无效');
    if (params.sid && params.sid !== platform.published.sid)
      throw new HttpError(
        409,
        'SNAPSHOT_EXPIRED',
        '平台已发布新的消费数据，请刷新后继续，或保留当前页面。',
        {
          endpoint: endpoints[id],
          consumerKey,
          expectedSid: params.sid,
          actualSid: platform.published.sid,
        },
      );
    const original = platform.contexts.find(
      (context) => context.consumerKey === consumerKey,
    );
    if (!original)
      throw new HttpError(
        404,
        'CONSUMER_NOT_FOUND',
        '此平台没有对应的 Consumer；不能回退到其他来源。',
      );
    const basename = normalizePath(params.basename, '/');
    const pathname = normalizePath(params.pathname, basename);
    const delivery = platform.published.config.delivery;
    const prepare = (
      context: DiscoveryContext,
      base: string,
    ): DiscoveryContext => ({
      ...clone(context),
      routes:
        delivery === 'full'
          ? clone(context.routes)
          : context.routes.filter((route) =>
              matches(pathname, join(base, route.path)),
            ),
      loadedPaths: [pathname],
    });
    const context = prepare(original, basename);
    const contexts: DiscoveryContext[] = [];
    const visit = (parent: DiscoveryContext, base: string) => {
      for (const binding of parent.bindings) {
        if (
          binding.mode !== 'fixed' ||
          !binding.consumerKey ||
          binding.childEndpoint !== endpoints[id]
        )
          continue;
        const childBase = join(base, binding.path);
        if (delivery !== 'full' && !matches(pathname, childBase)) continue;
        const child = platform.contexts.find(
          (item) => item.consumerKey === binding.consumerKey,
        );
        if (
          child &&
          !contexts.some((item) => item.consumerKey === child.consumerKey)
        ) {
          contexts.push(prepare(child, childBase));
          visit(child, childBase);
        }
      }
    };
    visit(original, basename);
    return {
      protocolVersion: '1.0',
      ...context,
      delivery,
      basename,
      pathname,
      contexts,
      loadedConsumerKeys: [
        context.consumerKey,
        ...contexts.map((item) => item.consumerKey),
      ],
    };
  }
  validateContext(ref: ContextRef): DiscoveryContext {
    const id = (Object.keys(endpoints) as PlatformId[]).find(
      (key) => endpoints[key] === ref.endpoint,
    );
    if (!id) invalid('未知发现来源');
    return this.discover(id, ref);
  }
}
