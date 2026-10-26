import { displayCopy } from '../../shared/display-copy.ts';
import { t } from '../../shared/i18n.ts';
import type { Json, ToolDeclaration } from '../../shared/contracts.ts';
import type { RemoteContext, RemoteTool } from '../remotes/types.ts';

export interface RegisteredNativeTool {
  name: string;
  [key: string]: unknown;
}
export interface NativeModelContext {
  registerTool(
    definition: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ): Promise<void>;
  getTools(): Promise<RegisteredNativeTool[]>;
  executeTool(
    tool: RegisteredNativeTool,
    input: Record<string, Json>,
    options?: { signal?: AbortSignal },
  ): Promise<unknown>;
}
export interface ToolHandle {
  name: string;
  localName: string;
  description: string;
  inputSchema: Record<string, Json>;
  context: RemoteContext;
  status: 'registering' | 'ready' | 'expired' | 'error';
  error?: string;
  tool: RemoteTool;
  controller: AbortController;
}
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(',')}}`;
  return JSON.stringify(value);
};
// This demo accepts the JSON Schema subset used by its producer artifacts.
function validate(
  schema: Record<string, Json>,
  value: unknown,
  at = 'arguments',
): void {
  if (
    schema.enum &&
    Array.isArray(schema.enum) &&
    !schema.enum.some((v) => canonical(v) === canonical(value))
  )
    throw new Error(t(`${at} 不在允许值内`, `${at} is not an allowed value`));
  const kind = schema.type;
  if (kind === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error(t(`${at} 必须是对象`, `${at} must be an object`));
    const record = value as Record<string, unknown>;
    const properties = (schema.properties || {}) as Record<
      string,
      Record<string, Json>
    >;
    for (const key of (schema.required || []) as string[])
      if (!Object.hasOwn(record, key))
        throw new Error(t(`${at}.${key} 为必填项`, `${at}.${key} is required`));
    for (const [key, item] of Object.entries(record)) {
      if (Object.hasOwn(properties, key))
        validate(properties[key], item, `${at}.${key}`);
      else if (schema.additionalProperties === false)
        throw new Error(
          t(
            `${at}.${key} 不是已声明参数`,
            `${at}.${key} is not a declared parameter`,
          ),
        );
    }
  } else if (kind === 'array') {
    if (!Array.isArray(value))
      throw new Error(t(`${at} 必须是数组`, `${at} must be an array`));
    if (schema.items)
      value.forEach((item, i) =>
        validate(schema.items as Record<string, Json>, item, `${at}[${i}]`),
      );
  } else if (typeof kind === 'string') {
    if (kind === 'integer' ? !Number.isInteger(value) : typeof value !== kind)
      throw new Error(t(`${at} 类型错误`, `${at} has an invalid type`));
    if (
      typeof value === 'number' &&
      (!Number.isFinite(value) ||
        (typeof schema.minimum === 'number' && value < schema.minimum) ||
        (typeof schema.maximum === 'number' && value > schema.maximum))
    )
      throw new Error(
        t(`${at} 超出允许范围`, `${at} is outside the allowed range`),
      );
  }
}
export class ToolRegistry {
  private handles = new Map<string, ToolHandle>();
  private listeners = new Set<() => void>();
  private retired = new Set<string>();
  private expiredSnapshots = new Set<string>();
  private expiredConsumers = new Set<string>();
  private registrationSequence = 0;
  private native: NativeModelContext | null;
  private trace: (event: string, detail?: unknown) => void;
  private initialization?: Promise<void>;
  mode: 'checking' | 'native' | 'local' | 'unavailable';
  reason = '';
  constructor(
    trace: (event: string, detail?: unknown) => void,
    native?: NativeModelContext | null,
  ) {
    this.trace = trace;
    this.native =
      native === undefined && typeof document !== 'undefined'
        ? ((document as unknown as { modelContext?: NativeModelContext })
            .modelContext ?? null)
        : (native ?? null);
    this.mode =
      this.native &&
      ['registerTool', 'getTools', 'executeTool'].every(
        (key) =>
          typeof (this.native as unknown as Record<string, unknown>)[key] ===
          'function',
      )
        ? 'checking'
        : 'local';
    if (this.mode === 'local') this.native = null;
  }
  initialize(): Promise<void> {
    return (this.initialization ??= this.probeTransport());
  }
  private async probeTransport() {
    if (!this.native) {
      this.reason = t(
        '浏览器没有完整 Document WebMCP API，使用本地注册表',
        'The browser does not support the full Document WebMCP API. Using the local registry.',
      );
      this.emit();
      return;
    }
    const probe = new AbortController();
    const name = `workspace_probe_${Date.now()}`;
    try {
      await this.native.registerTool(
        {
          name,
          description: 'Verify read-only WebMCP transport',
          inputSchema: { type: 'object', properties: {} },
          annotations: { readOnlyHint: true },
          execute: () => ({ content: [{ type: 'text', text: 'ok' }] }),
        },
        { signal: probe.signal },
      );
      const entry = (await this.native.getTools()).find(
        (tool) => tool.name === name,
      );
      if (!entry)
        throw new Error(
          t(
            '原生工具已注册但不可枚举',
            'The native tool was registered but cannot be listed',
          ),
        );
      await this.native.executeTool(entry, {});
      this.mode = 'native';
    } catch (error) {
      this.mode = 'unavailable';
      this.reason = error instanceof Error ? error.message : String(error);
    } finally {
      probe.abort();
      this.emit();
    }
  }
  useLocalFallback() {
    if (this.handles.size)
      throw new Error(
        t(
          '请在挂载页面前切换工具传输',
          'Switch tool transport before mounting a page',
        ),
      );
    this.native = null;
    this.mode = 'local';
    this.reason = t('已选择本地注册表', 'Using the local registry');
    this.emit();
  }
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private emit() {
    this.listeners.forEach((listener) => listener());
  }
  list() {
    return [...this.handles.values()];
  }
  register(
    context: RemoteContext,
    tools: RemoteTool[],
    declared: ToolDeclaration[],
  ) {
    const accepted = tools.filter((tool) => {
      if (declared.some((item) => item.name === tool.name)) return true;
      this.trace('tool.disabled', {
        tool: tool.name,
        mountId: context.mountId,
      });
      return false;
    });
    // Check the whole batch before installing any handlers, so failures cannot leak registrations.
    const localNames = new Set<string>();
    for (const tool of accepted) {
      const name = `mf_${context.mountId}_${tool.name}_${this.registrationSequence + accepted.length}`;
      if (
        !/^[a-zA-Z0-9_.-]{1,128}$/.test(name) ||
        localNames.has(tool.name) ||
        this.list().some(
          (handle) =>
            handle.context.mountId === context.mountId &&
            handle.localName === tool.name,
        )
      )
        throw new Error(
          t(
            `工具名称重复或不合法：${tool.name}`,
            `Duplicate or invalid tool name: ${tool.name}`,
          ),
        );
      localNames.add(tool.name);
    }
    const controllers: ToolHandle[] = [];
    for (const tool of accepted) {
      const declaration = declared.find((item) => item.name === tool.name)!;
      // Names identify a registration generation, never just a reusable local name or mount ID.
      const name = `mf_${context.mountId}_${tool.name}_${++this.registrationSequence}`;
      const handle: ToolHandle = {
        name,
        localName: tool.name,
        description: t(
          `${tool.description}（当前应用：${context.providerName}，实例：${context.mountId}）`,
          `${displayCopy(tool.description)} (application: ${context.providerName}, instance: ${context.mountId})`,
        ),
        inputSchema: structuredClone(declaration.inputSchema),
        context: structuredClone(context),
        status: 'registering',
        tool,
        controller: new AbortController(),
      };
      this.handles.set(name, handle);
      controllers.push(handle);
      if (
        this.expiredSnapshots.has(
          JSON.stringify([context.endpoint, context.sid]),
        ) ||
        this.expiredConsumers.has(
          JSON.stringify([context.endpoint, context.consumerKey]),
        )
      ) {
        handle.status = 'expired';
        handle.controller.abort();
        continue;
      }
      if (canonical(tool.inputSchema) !== canonical(declaration.inputSchema)) {
        handle.status = 'error';
        handle.error = t(
          '产物声明与页面工具 Schema 不一致',
          'Artifact declarations do not match the page tool schema',
        );
        this.trace('tool.mismatch', { name });
        continue;
      }
      if (this.mode === 'local') handle.status = 'ready';
      else if (this.mode === 'native' && this.native) {
        const native = this.native;
        void Promise.resolve()
          .then(() => {
            if (handle.controller.signal.aborted) return;
            return native.registerTool(
              {
                name,
                description: handle.description,
                inputSchema: handle.inputSchema,
                annotations: declaration.annotations,
                execute: async (
                  input: Record<string, Json>,
                  options?: { signal?: AbortSignal },
                ) => ({
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify(
                        await this.invoke(handle, input, options?.signal),
                      ),
                    },
                  ],
                }),
              },
              { signal: handle.controller.signal },
            );
          })
          .then(() => {
            if (
              this.handles.get(name) === handle &&
              !handle.controller.signal.aborted
            ) {
              handle.status = 'ready';
              this.emit();
            }
          })
          .catch((error) => {
            if (!handle.controller.signal.aborted) {
              handle.status = 'error';
              handle.error = String(error);
              this.emit();
            }
          });
      } else {
        handle.status = 'error';
        handle.error =
          this.reason || t('WebMCP 尚未就绪', 'WebMCP is not ready');
      }
      this.trace('tool.register', {
        name,
        sid: context.sid,
        mountId: context.mountId,
      });
    }
    this.emit();
    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      for (const handle of controllers) {
        handle.controller.abort();
        this.retired.add(handle.name);
        if (this.handles.get(handle.name) === handle)
          this.handles.delete(handle.name);
        this.trace('tool.unregister', {
          name: handle.name,
          mountId: context.mountId,
        });
      }
      this.emit();
    };
  }
  expire(endpoint: string, consumerKey: string, expectedSid?: string) {
    const sids = new Set(
      expectedSid
        ? [expectedSid]
        : this.list()
            .filter(
              (handle) =>
                handle.context.endpoint === endpoint &&
                handle.context.consumerKey === consumerKey,
            )
            .map((handle) => handle.context.sid),
    );
    for (const sid of sids)
      this.expiredSnapshots.add(JSON.stringify([endpoint, sid]));
    if (!sids.size)
      this.expiredConsumers.add(JSON.stringify([endpoint, consumerKey]));
    for (const handle of this.handles.values()) {
      if (
        handle.context.endpoint === endpoint &&
        (sids.has(handle.context.sid) ||
          (!sids.size && handle.context.consumerKey === consumerKey))
      ) {
        handle.status = 'expired';
        handle.controller.abort();
      }
    }
    this.emit();
  }
  private assertActive(handle: ToolHandle) {
    if (
      this.handles.get(handle.name) !== handle ||
      handle.controller.signal.aborted ||
      handle.status === 'expired'
    )
      throw new Error(`TOOL_INSTANCE_EXPIRED: ${handle.name}`);
    if (handle.status !== 'ready')
      throw new Error(`TOOL_UNAVAILABLE: ${handle.error || handle.status}`);
  }
  private async invoke(
    handle: ToolHandle,
    input: Record<string, Json>,
    signal?: AbortSignal,
  ) {
    this.assertActive(handle);
    validate(handle.inputSchema, input);
    const combined = signal
      ? AbortSignal.any([signal, handle.controller.signal])
      : handle.controller.signal;
    combined.throwIfAborted();
    const result = await handle.tool.execute(input, { signal: combined });
    this.assertActive(handle);
    combined.throwIfAborted();
    return result;
  }
  async execute(
    name: string,
    input: Record<string, Json>,
    signal?: AbortSignal,
  ): Promise<Json> {
    const handle = this.handles.get(name);
    if (!handle)
      throw new Error(
        `${this.retired.has(name) ? 'TOOL_INSTANCE_EXPIRED' : 'TOOL_NOT_FOUND'}: ${name}`,
      );
    this.assertActive(handle);
    validate(handle.inputSchema, input);
    const combined = signal
      ? AbortSignal.any([signal, handle.controller.signal])
      : handle.controller.signal;
    combined.throwIfAborted();
    this.trace('tool.call', {
      name,
      input,
      mountId: handle.context.mountId,
      sid: handle.context.sid,
    });
    let result: Json;
    if (this.mode === 'native' && this.native) {
      const native = (await this.native.getTools()).find(
        (tool) => tool.name === name,
      );
      if (!native)
        throw new Error(
          t(
            `原生注册表缺少工具 ${name}`,
            `The native registry is missing tool ${name}`,
          ),
        );
      this.assertActive(handle);
      combined.throwIfAborted();
      const response = await this.native.executeTool(native, input, {
        signal: combined,
      });
      this.assertActive(handle);
      combined.throwIfAborted();
      if (response === null)
        throw new Error(
          t(
            '工具触发了页面导航，当前调用没有返回结果',
            'The tool triggered navigation and returned no result',
          ),
        );
      const content = (response as { content?: Array<{ text?: string }> })
        ?.content;
      if ((response as { isError?: boolean })?.isError)
        throw new Error(
          content?.[0]?.text || t('原生工具执行失败', 'The native tool failed'),
        );
      result = content?.[0]?.text
        ? JSON.parse(content[0].text)
        : (response as Json);
      this.assertActive(handle);
    } else result = await this.invoke(handle, input, combined);
    this.trace('tool.result', { name, result });
    return result;
  }
  async waitFor(providerName: string, signal?: AbortSignal) {
    const ready = () =>
      this.list().some(
        (h) => h.context.providerName === providerName && h.status === 'ready',
      );
    if (ready()) return;
    await new Promise<void>((resolve, reject) => {
      const finish = (error?: unknown) => {
        clearTimeout(timer);
        off();
        signal?.removeEventListener('abort', cancel);
        error ? reject(error) : resolve();
      };
      const off = this.subscribe(() => {
        if (ready()) finish();
      });
      const timer = setTimeout(
        () =>
          finish(
            new Error(
              t(
                `${providerName} 页面工具未就绪，请检查加载记录`,
                `Tools for ${providerName} are not ready. Check the loading trace.`,
              ),
            ),
          ),
        12000,
      );
      const cancel = () =>
        finish(signal?.reason ?? new Error(t('已取消', 'Cancelled')));
      signal?.addEventListener('abort', cancel, { once: true });
      if (signal?.aborted) cancel();
    });
  }
}
