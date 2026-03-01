import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const BOOTSTRAP_FILE_PATH = path.resolve(
  __dirname,
  './rsc-client-callback-bootstrap.js',
);
const CALLBACK_CHUNK_HANDLER_KEY = '__MODERN_RSC_MF_CALLBACK_CHUNK_HANDLER__';

type RuntimeModule = {
  setServerCallback: ReturnType<typeof vi.fn>;
  createTemporaryReferenceSet: ReturnType<typeof vi.fn>;
  encodeReply: ReturnType<typeof vi.fn>;
  createFromFetch: ReturnType<typeof vi.fn>;
};

function createClientRuntimeModule(): RuntimeModule {
  return {
    setServerCallback: vi.fn(),
    createTemporaryReferenceSet: vi.fn(() => ({ __temp: true })),
    encodeReply: vi.fn(async () => 'encoded-body'),
    createFromFetch: vi.fn(async () => ({ ok: true })),
  };
}

function stripImports(source: string) {
  return source.replace(/^import[\s\S]*?;\n/gm, '');
}

function flushMicrotasks() {
  return new Promise((resolve) => queueMicrotask(resolve));
}

function evaluateBootstrap({
  runtimeRequire,
  windowObject,
}: {
  runtimeRequire: Record<string, any>;
  windowObject?: Record<string, any>;
}) {
  const source = stripImports(fs.readFileSync(BOOTSTRAP_FILE_PATH, 'utf-8'));
  const resolvedActionIds: Array<(id: string) => Promise<string>> = [];
  const importedRuntime = createClientRuntimeModule();
  const fetchMock = vi.fn(async () => new Response('ok', { status: 200 }));

  const context = {
    __webpack_require__: runtimeRequire,
    setResolveActionId: vi.fn((resolver: (id: string) => Promise<string>) => {
      resolvedActionIds.push(resolver);
    }),
    createFromFetch: importedRuntime.createFromFetch,
    createTemporaryReferenceSet: importedRuntime.createTemporaryReferenceSet,
    encodeReply: importedRuntime.encodeReply,
    setServerCallback: importedRuntime.setServerCallback,
    fetch: fetchMock,
    clearTimeout: vi.fn(),
    setTimeout: vi.fn(() => 1),
    queueMicrotask: (cb: () => void) => cb(),
    window: windowObject,
    globalThis: undefined as any,
    Response,
    Promise,
    Object,
    Array,
    WeakMap,
    WeakSet,
    Set,
    Map,
    JSON,
    Reflect,
    URL,
    console,
    process: { env: {} },
  };
  context.globalThis = context;

  vm.runInNewContext(source, context, {
    filename: BOOTSTRAP_FILE_PATH,
  });

  return {
    context,
    importedRuntime,
    fetchMock,
    resolveActionId: resolvedActionIds[0] as (
      id: string,
    ) => Promise<string> | undefined,
  };
}

describe('rsc-client-callback-bootstrap', () => {
  it('registers resolver and installs callback on imported client runtime', () => {
    const runtimeRequire = {
      e: vi.fn(async () => undefined),
      c: {},
    };
    const { importedRuntime, resolveActionId } = evaluateBootstrap({
      runtimeRequire,
    });

    expect(resolveActionId).toBeTypeOf('function');
    expect(importedRuntime.setServerCallback).toHaveBeenCalled();
  });

  it('prefers ensureChunkHandlers hook and leaves chunk loader unpatched', async () => {
    const runtimeRequire: Record<string, any> = {
      c: {},
      f: {},
    };
    const originalChunkLoader = vi.fn(async (chunkId: string) => {
      const promises: Promise<unknown>[] = [];
      for (const handler of Object.values(runtimeRequire.f)) {
        if (typeof handler === 'function') {
          handler(chunkId, promises);
        }
      }
      await Promise.all(promises);
      return 'chunk-loaded';
    });
    runtimeRequire.e = originalChunkLoader;

    evaluateBootstrap({ runtimeRequire });

    expect(runtimeRequire.e).toBe(originalChunkLoader);

    const lateRuntime = createClientRuntimeModule();
    runtimeRequire.c['late-runtime-module'] = { exports: lateRuntime };

    await runtimeRequire.e('late-runtime');
    await flushMicrotasks();

    expect(lateRuntime.setServerCallback).toHaveBeenCalledTimes(1);
  });

  it('waits for handlers added after the hook to settle before installing callbacks', async () => {
    const runtimeRequire: Record<string, any> = {
      c: {},
      f: {},
    };
    const originalChunkLoader = vi.fn(async (chunkId: string) => {
      const promises: Promise<unknown>[] = [];
      for (const handler of Object.values(runtimeRequire.f)) {
        if (typeof handler === 'function') {
          handler(chunkId, promises);
        }
      }
      await Promise.all(promises);
      return 'chunk-loaded';
    });
    runtimeRequire.e = originalChunkLoader;

    evaluateBootstrap({ runtimeRequire });

    const lateRuntime = createClientRuntimeModule();
    runtimeRequire.f.zzzLateChunkHandler = vi.fn(
      (_chunkId: string, promises: Promise<unknown>[]) => {
        promises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              runtimeRequire.c['late-runtime-module'] = {
                exports: lateRuntime,
              };
              resolve();
            }, 0);
          }),
        );
      },
    );

    await runtimeRequire.e('late-runtime');
    await new Promise((resolve) => setTimeout(resolve, 0));
    await flushMicrotasks();

    expect(lateRuntime.setServerCallback).toHaveBeenCalledTimes(1);
  });

  it('wraps existing callback chunk handler and still installs late callbacks', async () => {
    const existingCallbackChunkHandler = vi.fn(
      (_chunkId: string, promises: Promise<unknown>[]) => {
        promises.push(Promise.resolve('existing-handler'));
      },
    );
    const runtimeRequire: Record<string, any> = {
      c: {},
      f: {
        [CALLBACK_CHUNK_HANDLER_KEY]: existingCallbackChunkHandler,
      },
    };
    const originalChunkLoader = vi.fn(async (chunkId: string) => {
      const promises: Promise<unknown>[] = [];
      for (const handler of Object.values(runtimeRequire.f)) {
        if (typeof handler === 'function') {
          handler(chunkId, promises);
        }
      }
      await Promise.all(promises);
      return 'chunk-loaded';
    });
    runtimeRequire.e = originalChunkLoader;

    evaluateBootstrap({ runtimeRequire });

    expect(runtimeRequire.e).toBe(originalChunkLoader);

    const lateRuntime = createClientRuntimeModule();
    runtimeRequire.c['late-runtime-module'] = { exports: lateRuntime };

    await runtimeRequire.e('late-runtime');
    await flushMicrotasks();

    expect(existingCallbackChunkHandler).toHaveBeenCalledWith(
      'late-runtime',
      expect.any(Array),
    );
    expect(lateRuntime.setServerCallback).toHaveBeenCalledTimes(1);
  });

  it('wraps configurable chunk loader and installs callback for late client runtimes', async () => {
    const originalChunkLoader = vi.fn(async () => 'chunk-loaded');
    const runtimeRequire = {
      e: originalChunkLoader,
      c: {},
    };

    evaluateBootstrap({ runtimeRequire });
    expect(runtimeRequire.e).not.toBe(originalChunkLoader);

    const lateRuntime = createClientRuntimeModule();
    runtimeRequire.c['late-runtime-module'] = { exports: lateRuntime };

    await runtimeRequire.e('late-runtime');
    await flushMicrotasks();

    expect(lateRuntime.setServerCallback).toHaveBeenCalledTimes(1);
  });

  it('wraps non-configurable chunk loader when writable and installs late callbacks', async () => {
    const originalChunkLoader = vi.fn(async () => 'chunk-loaded');
    const runtimeRequire: Record<string, any> = { c: {} };
    Object.defineProperty(runtimeRequire, 'e', {
      configurable: false,
      writable: true,
      enumerable: true,
      value: originalChunkLoader,
    });

    evaluateBootstrap({ runtimeRequire });
    expect(runtimeRequire.e).not.toBe(originalChunkLoader);

    const lateRuntime = createClientRuntimeModule();
    runtimeRequire.c['late-runtime-module'] = { exports: lateRuntime };

    await runtimeRequire.e('late-runtime');
    await flushMicrotasks();

    expect(lateRuntime.setServerCallback).toHaveBeenCalledTimes(1);
  });

  it('uses root action endpoint when entry name is missing/main/index', async () => {
    const runtimeRequire = {
      e: vi.fn(async () => undefined),
      c: {},
    };
    const { importedRuntime, fetchMock } = evaluateBootstrap({
      runtimeRequire,
      windowObject: { __MODERN_JS_ENTRY_NAME: 'main' },
    });

    const serverCallback = importedRuntime.setServerCallback.mock.calls[0]?.[0];
    expect(serverCallback).toBeTypeOf('function');

    await serverCallback('remote:demo:action', ['arg']);
    const [endpoint, requestInit] = fetchMock.mock.calls[0];
    expect(endpoint).toBe('/');
    expect(requestInit?.method).toBe('POST');
    expect(requestInit?.headers?.['x-rsc-action']).toBe('remote:demo:action');
  });

  it('fails closed when remap map marks raw action id as ambiguous', async () => {
    const runtimeRequire = {
      e: vi.fn(async () => undefined),
      c: {},
    };
    const { context, resolveActionId } = evaluateBootstrap({ runtimeRequire });

    expect(resolveActionId).toBeTypeOf('function');
    context.__MODERN_RSC_MF_ACTION_ID_MAP__ = { rawAction: false };

    await expect(resolveActionId!('rawAction')).rejects.toThrow(
      /Ambiguous remote action id "rawAction"/,
    );
  });
});
