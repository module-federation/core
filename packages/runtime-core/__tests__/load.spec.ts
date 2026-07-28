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
  starts: Array<Record<string, any>>;
  results: Array<Record<string, any>>;
} {
  const starts: Array<Record<string, any>> = [];
  const results: Array<Record<string, any>> = [];
  return {
    starts,
    results,
    plugin: {
      name: 'resource-recorder',
      loadEntry(args) {
        starts.push(args);
      },
      afterLoadEntry(args) {
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
    ['success.js', false],
    ['missing.js', true],
    ['exec-error.js', true],
    ['no-global.js', true],
  ] as const)(
    'emits one remote-entry result for %s',
    async (fixture, hasError) => {
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
      const resourceContext = {
        initiator: 'loadRemote' as const,
        id: `remote/${fixture}`,
        resourceType: 'remoteEntry' as const,
        url: `${BASE}/${fixture}`,
      };

      await getRemoteEntry({
        origin,
        remoteInfo,
        resourceContext,
      }).catch(() => undefined);

      expect(recorder.starts).toHaveLength(1);
      expect(recorder.results).toHaveLength(1);
      expect(recorder.results[0]).toMatchObject({
        resourceContext: {
          initiator: 'loadRemote',
          resourceType: 'remoteEntry',
          url: `${BASE}/${fixture}`,
        },
      });
      if (hasError) {
        expect(recorder.results[0].error).toBeInstanceOf(Error);
      } else {
        expect(recorder.results[0]).not.toHaveProperty('error');
      }
    },
  );

  it('shares one real remote-entry result across concurrent callers', async () => {
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
    expect(recorder.starts).toHaveLength(1);
    expect(recorder.results).toHaveLength(1);
    expect(recorder.results[0]).toMatchObject({
      remoteEntryExports: container,
    });
    expect(recorder.results[0]).not.toHaveProperty('cached');
  });

  it('emits the shared remote-entry result to each runtime instance', async () => {
    const firstRecorder = createResourceRecorder();
    const secondRecorder = createResourceRecorder();
    const container = { get: rs.fn(), init: rs.fn() };
    const firstOrigin = new ModuleFederation({
      name: 'resource-concurrent-first',
      remotes: [],
      plugins: [
        firstRecorder.plugin,
        {
          name: 'delayed-entry',
          async loadEntry() {
            await Promise.resolve();
            return container;
          },
        },
      ],
    });
    const secondOrigin = new ModuleFederation({
      name: 'resource-concurrent-second',
      remotes: [],
      plugins: [secondRecorder.plugin],
    });
    const remoteInfo = getRemoteInfo({
      name: 'shared-concurrent-remote',
      entry: 'https://remote.test/shared-concurrent.js',
    });

    const [first, second] = await Promise.all([
      getRemoteEntry({ origin: firstOrigin, remoteInfo }),
      getRemoteEntry({ origin: secondOrigin, remoteInfo }),
    ]);

    expect(first).toBe(container);
    expect(second).toBe(container);
    expect(firstRecorder.starts).toHaveLength(1);
    expect(firstRecorder.results).toHaveLength(1);
    expect(secondRecorder.starts).toHaveLength(0);
    expect(secondRecorder.results).toHaveLength(1);
    expect(secondRecorder.results[0]).toMatchObject({
      origin: secondOrigin,
      remoteEntryExports: container,
    });
    expect(secondRecorder.results[0]).not.toHaveProperty('cached');
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

    expect(recorder.starts).toHaveLength(0);
    expect(recorder.results).toHaveLength(1);
    expect(recorder.results[0]).toMatchObject({
      cached: true,
    });
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

    expect(recorder.results).toHaveLength(2);
    expect(recorder.results[0]).not.toHaveProperty('error');
    expect(recorder.results[1]).toMatchObject({
      recovered: true,
      error: {
        name: 'ScriptNetworkError',
        message: expect.stringContaining('network failed'),
      },
    });
  });
});
