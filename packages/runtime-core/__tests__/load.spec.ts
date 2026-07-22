import { describe, it, expect, rs, beforeEach, afterEach } from '@rstest/core';
import { getRemoteEntry, getRemoteInfo } from '../src/utils/load';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import {
  RUNTIME_001,
  RUNTIME_008,
  RUNTIME_015,
} from '@module-federation/error-codes';
import { mockStaticServer, removeScriptTags } from './mock/utils';
import type {
  ResourceLoadEvent,
  ResourceLoadResult,
} from '../src/type/preload';
import type { ModuleFederationRuntimePlugin } from '../src/type/plugin';

// All fixture URLs are served via two complementary mechanisms both pointing to __tests__/:
//   1. mockScriptDomResponse (setup.ts) — patches Element.prototype.appendChild, executes
//      matching JS files inline, fires element.onload without a real network request.
//   2. mockStaticServer (below) — mocks window.fetch so jsdom's background script-fetch
//      also gets a valid response instead of failing with ECONNREFUSED.
const BASE = 'http://localhost:1111/resources/load';

mockStaticServer({
  baseDir: __dirname,
  filterKeywords: [],
  basename: 'http://localhost:1111/',
});

const createMF = () => new ModuleFederation({ name: 'test-host', remotes: [] });
const createDataUrlEntry = (code: string) =>
  `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;

function createResourceRecorder(): {
  plugin: ModuleFederationRuntimePlugin;
  starts: ResourceLoadEvent[];
  results: ResourceLoadResult[];
} {
  const starts: ResourceLoadEvent[] = [];
  const results: ResourceLoadResult[] = [];
  return {
    starts,
    results,
    plugin: {
      name: 'resource-recorder',
      beforeLoadResource(args) {
        starts.push(args);
      },
      afterLoadResource(args) {
        results.push(args);
      },
    },
  };
}

describe('getRemoteEntry - script load error discrimination', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
    delete (globalThis as any)['remote'];
    removeScriptTags();
  });

  afterEach(() => {
    delete (globalThis as any)['remote'];
    removeScriptTags();
  });

  it('script load failure is reported as RUNTIME_008 with the original error included', async () => {
    // "missing.js" does not exist on disk. The mockScriptDomResponse interceptor tries
    // to fs.readFileSync it, throws ENOENT, which propagates synchronously through
    // document.head.appendChild → loadScript's Promise executor → promise rejects.
    // The onRejected handler in loadEntryScript wraps it as RUNTIME_008.
    const entry = `${BASE}/missing.js`;
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry });

    const err = await getRemoteEntry({ origin, remoteInfo }).catch((e) => e);

    expect(err.message).toContain(RUNTIME_008);
    // Original ENOENT message is forwarded into the RUNTIME_008 error
    expect(err.message).toMatch(/missing\.js|ENOENT/);
  });

  it('IIFE execution error is reported as RUNTIME_008 with ScriptExecutionError details', async () => {
    // exec-error.js dispatches a window ErrorEvent with its own URL as filename.
    // dom.ts's executionErrorHandler captures it; when onload fires afterwards,
    // onErrorCallback(ScriptExecutionError) is called → loadScript rejects.
    const entry = `${BASE}/exec-error.js`;
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry });

    const err = await getRemoteEntry({ origin, remoteInfo }).catch((e) => e);

    expect(err.message).toContain(RUNTIME_008);
    expect(err.message).toContain('ScriptExecutionError');
    expect(err.message).toContain('TypeError: exec failed');
  });

  it('script loaded successfully but global not registered throws RUNTIME_001, not RUNTIME_008', async () => {
    // no-global.js executes without side effects — global is never registered.
    // loadScript resolves (onload fires), handleRemoteEntryLoaded finds no global → RUNTIME_001.
    // The key assertion: RUNTIME_001 is NOT swallowed and replaced with RUNTIME_008.
    const entry = `${BASE}/no-global.js`;
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry });

    const err = await getRemoteEntry({ origin, remoteInfo }).catch((e) => e);

    expect(err.message).toContain(RUNTIME_001);
    expect(err.message).not.toContain(RUNTIME_008);
  });

  it('script loaded and global registered returns the remote entry exports', async () => {
    // success.js sets globalThis['remote'] = { get, init } before onload fires.
    const entry = `${BASE}/success.js`;
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry });

    const result = await getRemoteEntry({ origin, remoteInfo });

    expect(result).toEqual(
      expect.objectContaining({
        get: expect.any(Function),
        init: expect.any(Function),
      }),
    );
  });

  it('module entry load failure can recover through loadEntryError with getEntryUrl', async () => {
    const entry = createDataUrlEntry(
      `throw new TypeError('Failed to fetch dynamically imported module: http://localhost:4999/remoteEntry.js');`,
    );
    const fallbackEntry = createDataUrlEntry(`
      export function get() {}
      export function init() {}
    `);
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry, type: 'module' });
    const getEntryUrl = rs.fn(() => fallbackEntry);
    const loadEntryError = rs.fn(
      async ({ getRemoteEntry, globalLoading, uniqueKey }) => {
        delete globalLoading[uniqueKey];
        return getRemoteEntry({
          origin,
          remoteInfo,
          getEntryUrl,
        });
      },
    );
    const afterLoadEntry = rs.fn();

    origin.registerPlugins([
      {
        name: 'module-entry-retry-test',
        loadEntryError,
        afterLoadEntry,
      },
    ]);

    const result = await getRemoteEntry({ origin, remoteInfo });

    expect(loadEntryError).toHaveBeenCalledTimes(1);
    expect(getEntryUrl).toHaveBeenCalledWith(entry);
    expect(result).toEqual(
      expect.objectContaining({
        get: expect.any(Function),
        init: expect.any(Function),
      }),
    );
    expect(afterLoadEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        remoteInfo,
        remoteEntryExports: result,
        recovered: true,
      }),
    );
  });

  it('module entry load failure is reported as RUNTIME_008 when unrecovered', async () => {
    const entry = createDataUrlEntry(
      `throw new TypeError('Failed to fetch dynamically imported module: http://localhost:4999/remoteEntry.js');`,
    );
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry, type: 'module' });

    const err = await getRemoteEntry({ origin, remoteInfo }).catch((e) => e);

    expect(err.message).toContain(RUNTIME_008);
    expect(err.message).toContain(
      'Failed to fetch dynamically imported module',
    );
  });

  it('module entry execution errors are not retried through loadEntryError', async () => {
    const entry = createDataUrlEntry(
      `throw new Error('remote entry execution failed');`,
    );
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry, type: 'module' });
    const loadEntryError = rs.fn();

    origin.registerPlugins([
      {
        name: 'module-entry-execution-error-test',
        loadEntryError,
      },
    ]);

    const err = await getRemoteEntry({ origin, remoteInfo }).catch((e) => e);

    expect(err.message).toContain('remote entry execution failed');
    expect(loadEntryError).not.toHaveBeenCalled();
  });

  it('module entry TypeError execution errors are not reported as RUNTIME_008', async () => {
    const entry = createDataUrlEntry(`throw new TypeError('Load failed');`);
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry, type: 'module' });
    const loadEntryError = rs.fn();

    origin.registerPlugins([
      {
        name: 'module-entry-type-error-test',
        loadEntryError,
      },
    ]);

    const err = await getRemoteEntry({ origin, remoteInfo }).catch((e) => e);

    expect(err.message).toContain('Load failed');
    expect(err.message).not.toContain(RUNTIME_008);
    expect(loadEntryError).not.toHaveBeenCalled();
  });

  it('remote container init failure is reported as RUNTIME_015 with the original error', async () => {
    const entry = `${BASE}/init-error.js`;
    const mf = new ModuleFederation({
      name: 'test-host',
      remotes: [{ name: 'remote', entry }],
    });

    const err = await mf.loadRemote('remote/Button').catch((e) => e);

    expect(err.message).toContain(RUNTIME_015);
    expect(err.message).toContain('remote init failed');
    expect(err.message).toContain('remoteEntryUrl');
  });

  it.each([
    ['success.js', 'success', undefined],
    ['missing.js', 'error', 'network'],
    ['exec-error.js', 'error', 'execution'],
    ['no-global.js', 'error', 'initialization'],
  ] as const)(
    'emits one real resource result for %s',
    async (fixture, outcome, errorType) => {
      const recorder = createResourceRecorder();
      const origin = new ModuleFederation({
        name: `resource-${fixture}`,
        remotes: [],
        plugins: [recorder.plugin],
      });
      const remoteInfo = getRemoteInfo({
        name: 'remote',
        entry: `${BASE}/${fixture}`,
      });

      await getRemoteEntry({ origin, remoteInfo }).catch(() => undefined);

      expect(recorder.starts).toHaveLength(1);
      expect(recorder.results).toHaveLength(1);
      expect(recorder.results[0]).toMatchObject({
        initiator: 'loadRemote',
        resourceType: 'remoteEntry',
        url: `${BASE}/${fixture}`,
        outcome,
      });
      if (errorType) {
        expect(recorder.results[0].errorType).toBe(errorType);
      } else {
        expect(recorder.results[0]).not.toHaveProperty('errorType');
      }
      expect(recorder.results[0].endedAt).toBeGreaterThanOrEqual(
        recorder.results[0].startedAt,
      );
      expect(recorder.results[0].duration).toBeGreaterThanOrEqual(0);
      expect(recorder.results[0]).not.toHaveProperty('httpStatus');
      expect(recorder.results[0]).not.toHaveProperty('mimeType');
    },
  );

  it('reports one real attempt plus a cache hit for a concurrent waiter', async () => {
    const recorder = createResourceRecorder();
    const container = { get: rs.fn(), init: rs.fn() };
    const origin = new ModuleFederation({
      name: 'resource-concurrent',
      remotes: [],
      plugins: [
        recorder.plugin,
        {
          name: 'delayed-entry',
          async loadEntry() {
            await Promise.resolve();
            return container;
          },
        },
      ],
    });
    const remoteInfo = getRemoteInfo({
      name: 'concurrent-remote',
      entry: 'https://remote.test/concurrent.js',
    });

    const [first, second] = await Promise.all([
      getRemoteEntry({ origin, remoteInfo }),
      getRemoteEntry({ origin, remoteInfo }),
    ]);

    expect(first).toBe(container);
    expect(second).toBe(container);
    expect(recorder.starts).toHaveLength(2);
    expect(recorder.results).toHaveLength(2);
    expect(recorder.results.map((item) => item.outcome).sort()).toEqual([
      'cached',
      'success',
    ]);
    expect(
      recorder.results.find((item) => item.outcome === 'cached')?.cacheSource,
    ).toBe('mf-memory');
  });

  it('reports explicit remote exports reuse as an MF memory cache hit', async () => {
    const recorder = createResourceRecorder();
    const container = { get: rs.fn(), init: rs.fn() };
    const origin = new ModuleFederation({
      name: 'resource-cache',
      remotes: [],
      plugins: [recorder.plugin],
    });
    const remoteInfo = getRemoteInfo({
      name: 'cached-remote',
      entry: 'https://remote.test/cached.js',
    });

    await getRemoteEntry({
      origin,
      remoteInfo,
      remoteEntryExports: container,
    });

    expect(recorder.starts).toHaveLength(1);
    expect(recorder.results).toHaveLength(1);
    expect(recorder.results[0]).toMatchObject({
      outcome: 'cached',
      cacheSource: 'mf-memory',
    });
  });

  it('reports a remote entry timeout without inventing a network response', async () => {
    const recorder = createResourceRecorder();
    const appendSpy = rs
      .spyOn(document.head, 'appendChild')
      .mockImplementation((node) => node);
    const origin = new ModuleFederation({
      name: 'resource-timeout',
      remotes: [],
      plugins: [
        recorder.plugin,
        {
          name: 'short-entry-timeout',
          createScript() {
            return {
              script: document.createElement('script'),
              timeout: 5,
            };
          },
        },
      ],
    });
    const remoteInfo = getRemoteInfo({
      name: 'timeout-remote',
      entry: 'https://remote.test/timeout.js',
    });

    try {
      await expect(getRemoteEntry({ origin, remoteInfo })).rejects.toThrow(
        RUNTIME_008,
      );
    } finally {
      appendSpy.mockRestore();
    }

    expect(recorder.results).toHaveLength(1);
    expect(recorder.results[0]).toMatchObject({
      outcome: 'timeout',
      errorType: 'timeout',
    });
    expect(recorder.results[0]).not.toHaveProperty('httpStatus');
    expect(recorder.results[0]).not.toHaveProperty('mimeType');
  });

  it('records a real Node remote entry completion', async () => {
    const recorder = createResourceRecorder();
    const origin = new ModuleFederation({
      name: 'resource-node',
      remotes: [],
      plugins: [recorder.plugin],
    });
    origin.options.inBrowser = false;
    const remoteInfo = getRemoteInfo({
      name: 'nodeRemote',
      entry: `${BASE}/node-success.js`,
    });

    await expect(getRemoteEntry({ origin, remoteInfo })).resolves.toEqual(
      expect.objectContaining({
        get: expect.any(Function),
        init: expect.any(Function),
      }),
    );

    expect(recorder.results).toHaveLength(1);
    expect(recorder.results[0]).toMatchObject({
      resourceType: 'remoteEntry',
      outcome: 'success',
    });
    expect(recorder.results[0]).not.toHaveProperty('httpStatus');
    expect(recorder.results[0]).not.toHaveProperty('mimeType');
  });

  it('keeps the original failure and the recovered resource attempt', async () => {
    const recorder = createResourceRecorder();
    const container = { get: rs.fn(), init: rs.fn() };
    let attempts = 0;
    const origin = new ModuleFederation({
      name: 'resource-recovery',
      remotes: [],
      plugins: [
        recorder.plugin,
        {
          name: 'recover-entry',
          loadEntry() {
            attempts += 1;
            if (attempts === 1) {
              const loadError = new Error(
                '#RUNTIME-008 ScriptNetworkError: network failed',
              );
              loadError.name = 'ScriptNetworkError';
              throw loadError;
            }
            return container;
          },
          async loadEntryError(args) {
            delete args.globalLoading[args.uniqueKey];
            return args.getRemoteEntry({
              origin: args.origin,
              remoteInfo: args.remoteInfo,
              remoteEntryExports: args.remoteEntryExports,
            });
          },
        },
      ],
    });
    const remoteInfo = getRemoteInfo({
      name: 'recovered-remote',
      entry: 'https://remote.test/recovered.js',
    });

    await expect(getRemoteEntry({ origin, remoteInfo })).resolves.toBe(
      container,
    );

    expect(recorder.results.map((result) => result.outcome)).toEqual([
      'error',
      'success',
    ]);
    expect(recorder.results[0]).toMatchObject({
      errorType: 'network',
      error: {
        name: 'ScriptNetworkError',
        message: expect.stringContaining('network failed'),
      },
    });
  });

  it('covers ESM and SystemJS remote entry completion', async () => {
    const recorder = createResourceRecorder();
    const origin = new ModuleFederation({
      name: 'resource-module-types',
      remotes: [],
      plugins: [recorder.plugin],
    });
    const esmRemote = getRemoteInfo({
      name: 'esm-remote',
      entry: 'data:text/javascript,export%20const%20value%3D1',
      type: 'module',
    });
    const systemContainer = { get: rs.fn(), init: rs.fn() };
    const previousSystem = (globalThis as any).System;
    (globalThis as any).System = {
      import: rs.fn().mockResolvedValue(systemContainer),
    };

    try {
      await expect(
        getRemoteEntry({ origin, remoteInfo: esmRemote }),
      ).resolves.toBeDefined();
      await expect(
        getRemoteEntry({
          origin,
          remoteInfo: getRemoteInfo({
            name: 'system-remote',
            entry: 'https://remote.test/system.js',
            type: 'system',
          }),
        }),
      ).resolves.toBe(systemContainer);
    } finally {
      (globalThis as any).System = previousSystem;
    }

    expect(recorder.results.map((result) => result.outcome)).toEqual([
      'success',
      'success',
    ]);
  });
});
