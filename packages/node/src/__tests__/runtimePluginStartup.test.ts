import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import runtimePlugin, {
  setupChunkHandler,
  setupWebpackRequirePatching,
} from '../runtimePlugin';

jest.mock('fs', () => ({ existsSync: jest.fn(), readFile: jest.fn() }));

const RuntimeTemplate = require(
  normalizeWebpackPath('webpack/lib/RuntimeTemplate'),
);
const OnChunksLoadedRuntimeModule = require(
  normalizeWebpackPath('webpack/lib/runtime/OnChunksLoadedRuntimeModule'),
);
const fs = require('fs');
const origin = {
  loaderHook: {
    lifecycle: { fetch: { emit: jest.fn().mockResolvedValue(null) } },
  },
};

function createRuntime(loaded: string[] = []) {
  const runtime = {
    m: {},
    u: (id: string) => `${id}.js`,
    p: 'http://localhost:3000/',
    f: { readFileVm: jest.fn() },
    federation: {
      rootOutputDir: '/dist',
      initOptions: { name: 'host' },
      instance: origin,
    },
  } as any;
  // Exercise webpack's generated startup scheduler, including its own table.
  const scheduler = new OnChunksLoadedRuntimeModule();
  scheduler.compilation = {
    runtimeTemplate: new RuntimeTemplate({}, { environment: {} }, {}),
  };
  new Function('__webpack_require__', scheduler.generate())(runtime);
  runtime.O.readFileVm = (id: string) => loaded.includes(id);
  (global as any).__webpack_require__ = runtime;
  return runtime;
}

async function load(runtime: any, id = 'vendor') {
  const promises: Promise<unknown>[] = [];
  runtime.f.readFileVm(id, promises);
  await Promise.all(promises);
}

beforeEach(() => {
  jest.clearAllMocks();
  (global as any).__non_webpack_require__ = require;
  fs.existsSync.mockReturnValue(true);
  fs.readFile.mockImplementation(
    (
      _path: string,
      _encoding: string,
      callback: (error: Error | null, source?: string) => void,
    ) => {
      callback(null, "exports.ids = ['vendor']; exports.modules = {}; ");
    },
  );
  global.fetch = jest
    .fn()
    .mockResolvedValue(
      new Response("exports.ids = ['vendor']; exports.modules = {};"),
    );
});

test('filesystem chunks release deferred startup through the generated scheduler', async () => {
  const runtime = createRuntime();
  const entry = jest.fn(() => ({ requestHandler: () => {} }));
  runtime.O(undefined, ['vendor'], entry);
  const plugin = runtimePlugin();
  plugin.beforeInit?.({ origin } as any);
  await load(runtime);
  expect(runtime.O.readFileVm('vendor')).toBe(true);
  expect(entry).toHaveBeenCalledTimes(1);
});

test('chunks already installed by the bundler are not loaded again', async () => {
  const runtime = createRuntime(['vendor']);
  const plugin = runtimePlugin();
  plugin.beforeInit?.({ origin } as any);
  await load(runtime);
  expect(fs.existsSync).not.toHaveBeenCalled();
  expect(global.fetch).not.toHaveBeenCalled();
  expect(runtime.O.readFileVm('vendor')).toBe(true);
});

test('failed chunks remain unready and a retry releases deferred startup', async () => {
  const runtime = createRuntime();
  const entry = jest.fn();
  runtime.O(undefined, ['vendor'], entry);
  const plugin = runtimePlugin();
  plugin.beforeInit?.({ origin } as any);
  fs.readFile.mockImplementationOnce(
    (
      _path: string,
      _encoding: string,
      callback: (error: Error | null, source?: string) => void,
    ) => callback(new Error('read failed')),
  );
  await expect(load(runtime)).rejects.toThrow('read failed');
  expect(runtime.O.readFileVm('vendor')).toBe(false);
  expect(entry).not.toHaveBeenCalled();
  await load(runtime);
  expect(entry).toHaveBeenCalledTimes(1);
});

test('HTTP chunks use the host fetch hook and release deferred startup', async () => {
  const runtime = createRuntime();
  const entry = jest.fn();
  runtime.O(undefined, ['vendor'], entry);
  const plugin = runtimePlugin();
  plugin.beforeInit?.({ origin } as any);
  fs.existsSync.mockReturnValue(false);
  await load(runtime);
  expect(origin.loaderHook.lifecycle.fetch.emit).toHaveBeenCalled();
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(entry).toHaveBeenCalledTimes(1);
});

test('reinitialization preserves the chunk loader and its installed state', async () => {
  const runtime = createRuntime();
  const plugin = runtimePlugin();
  plugin.beforeInit?.({ origin } as any);
  const handler = runtime.f.readFileVm;
  await load(runtime);
  const reads = fs.readFile.mock.calls.length;
  plugin.beforeInit?.({ origin } as any);
  expect(runtime.f.readFileVm).toBe(handler);
  await load(runtime);
  expect(fs.readFile).toHaveBeenCalledTimes(reads);
});

test('each runtime is patched even when a global instance deduplicates its plugin', async () => {
  for (let index = 0; index < 2; index++) {
    const runtime = createRuntime();
    const original = runtime.f.readFileVm;
    const entry = jest.fn();
    runtime.O(undefined, ['vendor'], entry);
    const plugin = runtimePlugin();
    // Only the first plugin is registered on the shared global instance.
    if (index === 0) plugin.beforeInit?.({ origin } as any);
    expect(runtime.f.readFileVm).not.toBe(original);
    await load(runtime);
    expect(entry).toHaveBeenCalledTimes(1);
  }
});

test('constructing another plugin does not replace an existing loader', async () => {
  const runtime = createRuntime();
  runtimePlugin().beforeInit?.({ origin } as any);
  const handler = runtime.f.readFileVm;
  await load(runtime);
  runtimePlugin().beforeInit?.({ origin } as any);
  expect(runtime.f.readFileVm).toBe(handler);
  const reads = fs.readFile.mock.calls.length;
  await load(runtime);
  expect(fs.readFile).toHaveBeenCalledTimes(reads);
});

test('require-mode readiness preserves native truthy flags and HMR chunk state', async () => {
  const runtime = createRuntime();
  const chunks: Record<string, unknown> = { already: 1 };
  runtime.f = { require: jest.fn() };
  runtime.hmrS_require = chunks;
  delete runtime.O.readFileVm;
  runtime.O.require = (id: string) => chunks[id] === 1;
  runtimePlugin();
  const promises: Promise<unknown>[] = [];
  runtime.f.require('already', promises);
  expect(promises).toHaveLength(0);
  expect(chunks.already).toBe(1);
  expect(fs.existsSync).not.toHaveBeenCalled();
  const entry = jest.fn();
  runtime.O(undefined, ['vendor'], entry);
  runtime.f.require('vendor', promises);
  await Promise.all(promises);
  expect(chunks.vendor).toBe(1);
  expect(entry).toHaveBeenCalledTimes(1);
});

test('both loader predicates admit chunks loaded by their handlers', async () => {
  const runtime = createRuntime();
  runtime.f.require = jest.fn();
  runtime.O.require = () => false;
  runtimePlugin();
  const entry = jest.fn();
  runtime.O(undefined, ['vendor'], entry);
  const promises: Promise<unknown>[] = [];
  runtime.f.require('vendor', promises);
  runtime.f.readFileVm('vendor', promises);
  await Promise.all(promises);
  expect(entry).toHaveBeenCalledTimes(1);
  expect(fs.readFile).toHaveBeenCalledTimes(1);
});

test('separate module copies recognize the same patched handler', () => {
  const runtime = createRuntime();
  runtimePlugin();
  const handler = runtime.f.readFileVm;
  jest.isolateModules(() => {
    require('../runtimePlugin').default();
  });
  expect(runtime.f.readFileVm).toBe(handler);
});

test('chunks excluded by the matcher become ready without draining during loading', async () => {
  const runtime = createRuntime();
  runtime.federation.chunkMatcher = () => false;
  runtimePlugin();
  const entry = jest.fn();
  runtime.O(undefined, ['vendor'], entry);
  await load(runtime);
  expect(entry).not.toHaveBeenCalled();
  runtime.O();
  expect(entry).toHaveBeenCalledTimes(1);
  expect(fs.existsSync).not.toHaveBeenCalled();
});

test('HMR require chunks stay unready while concurrent callers share their promise', async () => {
  const runtime = createRuntime();
  const chunks: Record<string, unknown> = {};
  runtime.f = { require: jest.fn() };
  runtime.hmrS_require = chunks;
  delete runtime.O.readFileVm;
  // Native require loading uses truthy installed flags, not async-node's zero.
  runtime.O.require = (id: string) => chunks[id];
  runtimePlugin();
  let complete!: (error: Error | null, source: string) => void;
  fs.readFile.mockImplementationOnce(
    (_path: string, _encoding: string, callback: typeof complete) => {
      complete = callback;
    },
  );
  const entry = jest.fn();
  runtime.O(undefined, ['vendor'], entry);
  const first: Promise<unknown>[] = [];
  const second: Promise<unknown>[] = [];
  runtime.f.require('vendor', first);
  runtime.f.require('vendor', second);
  expect(second[0]).toBe(first[0]);
  expect(runtime.O.require('vendor')).toBe(false);
  runtime.O();
  expect(entry).not.toHaveBeenCalled();
  complete(null, "exports.ids = ['vendor']; exports.modules = {}; ");
  await Promise.all([...first, ...second]);
  expect(chunks.vendor).toBe(1);
  expect(entry).toHaveBeenCalledTimes(1);
});

test('a fetch hook Response supplies the chunk without native fetch', async () => {
  const runtime = createRuntime();
  runtimePlugin();
  fs.existsSync.mockReturnValue(false);
  origin.loaderHook.lifecycle.fetch.emit.mockResolvedValueOnce(
    new Response("exports.ids = ['vendor']; exports.modules = {};"),
  );
  await load(runtime);
  expect(global.fetch).not.toHaveBeenCalled();
  expect(runtime.O.readFileVm('vendor')).toBe(true);
});

test('beforeInit uses the registering instance fetch hook', async () => {
  const runtime = createRuntime();
  const registeredOrigin = {
    loaderHook: {
      lifecycle: { fetch: { emit: jest.fn().mockResolvedValue(null) } },
    },
  };
  runtimePlugin().beforeInit?.({ origin: registeredOrigin } as any);
  fs.existsSync.mockReturnValue(false);
  await load(runtime);
  expect(registeredOrigin.loaderHook.lifecycle.fetch.emit).toHaveBeenCalled();
  expect(origin.loaderHook.lifecycle.fetch.emit).not.toHaveBeenCalled();
});

test('readFileVm reuses pending promises installed by the native HMR loader', async () => {
  const runtime = createRuntime();
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  const chunks: Record<string, unknown> = {
    vendor: [resolve, jest.fn(), promise],
  };
  runtime.hmrS_readFileVm = chunks;
  runtime.O.readFileVm = (id: string) => chunks[id] === 0;
  runtimePlugin();
  const promises: Promise<unknown>[] = [];
  runtime.f.readFileVm('vendor', promises);
  expect(promises).toEqual([promise]);
  expect(fs.existsSync).not.toHaveBeenCalled();
  chunks.vendor = 0;
  resolve();
  await Promise.all(promises);
  expect(runtime.O.readFileVm('vendor')).toBe(true);
});

test.each(['require', 'readFileVm', 'both'])(
  'mixed loaders share one pending load with %s HMR tables',
  async (mode) => {
    const runtime = createRuntime();
    const requireChunks: Record<string, unknown> = {};
    const vmChunks: Record<string, unknown> = {};
    runtime.f.require = jest.fn();
    runtime.testRuns = 0;
    runtime.O.require = (id: string) => requireChunks[id];
    runtime.O.readFileVm = (id: string) => vmChunks[id] === 0;
    if (mode !== 'readFileVm') runtime.hmrS_require = requireChunks;
    if (mode !== 'require') runtime.hmrS_readFileVm = vmChunks;
    runtimePlugin();
    let complete!: (error: Error | null, source: string) => void;
    fs.readFile.mockImplementationOnce(
      (_path: string, _encoding: string, callback: typeof complete) => {
        complete = callback;
      },
    );
    const entry = jest.fn();
    runtime.O(undefined, ['vendor'], entry);
    const promises: Promise<unknown>[] = [];
    for (const handler of Object.values(runtime.f))
      (handler as any)('vendor', promises);
    expect(promises).toHaveLength(2);
    expect(promises[0]).toBe(promises[1]);
    expect(fs.readFile).toHaveBeenCalledTimes(1);
    runtime.O();
    expect(entry).not.toHaveBeenCalled();
    complete(
      null,
      "exports.ids = ['vendor']; exports.modules = {}; exports.runtime = function(r) { r.testRuns++; };",
    );
    await Promise.all(promises);
    expect(runtime.testRuns).toBe(1);
    expect(entry).toHaveBeenCalledTimes(1);
    expect(runtime.O.require('vendor')).toBe(true);
    expect(runtime.O.readFileVm('vendor')).toBe(true);
    if (mode !== 'readFileVm') expect(requireChunks.vendor).toBe(1);
    if (mode !== 'require') expect(vmChunks.vendor).toBe(0);
  },
);

test('mixed HMR loaders clear both tables after failure and share the retry', async () => {
  const runtime = createRuntime();
  const requireChunks: Record<string, unknown> = {};
  const vmChunks: Record<string, unknown> = {};
  runtime.f.require = jest.fn();
  runtime.hmrS_require = requireChunks;
  runtime.hmrS_readFileVm = vmChunks;
  runtime.O.require = (id: string) => requireChunks[id];
  runtime.O.readFileVm = (id: string) => vmChunks[id] === 0;
  runtimePlugin();
  fs.readFile.mockImplementationOnce(
    (
      _path: string,
      _encoding: string,
      callback: (error: Error | null, source?: string) => void,
    ) => callback(new Error('read failed')),
  );
  const ensure = () => {
    const promises: Promise<unknown>[] = [];
    runtime.f.require('vendor', promises);
    runtime.f.readFileVm('vendor', promises);
    return Promise.all(promises);
  };
  await expect(ensure()).rejects.toThrow('read failed');
  expect(requireChunks.vendor).toBeUndefined();
  expect(vmChunks.vendor).toBeUndefined();
  await ensure();
  expect(fs.readFile).toHaveBeenCalledTimes(2);
  expect(requireChunks.vendor).toBe(1);
  expect(vmChunks.vendor).toBe(0);
});

test('one-argument patching preserves the native readiness predicate', async () => {
  const runtime = createRuntime(['native']);
  const ready = runtime.O.readFileVm;
  const chunks: Record<string, unknown> = {};
  const handler = setupChunkHandler(chunks, { origin });
  setupWebpackRequirePatching(handler);
  expect(runtime.O.readFileVm).toBe(ready);
  await load(runtime);
  expect(chunks.vendor).toBe(0);
  expect(runtime.O.readFileVm('native')).toBe(true);
});
