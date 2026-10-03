import { describe, it, expect, rs, beforeEach, afterEach } from '@rstest/core';
import {
  getRemoteEntry,
  getRemoteEntryUniqueKey,
  getRemoteInfo,
} from '../src/utils/load';
import { ModuleFederation } from '../src/core';
import {
  globalLoading,
  globalLoadingMeta,
  resetFederationGlobalInfo,
} from '../src/global';
import {
  attachRuntimeImage,
  type RuntimeImageDescriptorV1,
} from '../src/runtimeImage';
import {
  RUNTIME_001,
  RUNTIME_008,
  RUNTIME_015,
} from '@module-federation/error-codes';
import { mockStaticServer, removeScriptTags } from './mock/utils';
import type { ModuleFederationRuntimePlugin } from '../src/type/plugin';
import { logger } from '../src/utils/logger';

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
const runtimeImage = (
  overrides: Partial<RuntimeImageDescriptorV1> = {},
): RuntimeImageDescriptorV1 => ({
  contract: 1,
  compatibilityId: 'runtime-family',
  required: ['remote'],
  forbidden: [],
  available: ['remote', 'shared'],
  target: 'web',
  entryLoadingIdentity: 'web-loader',
  ...overrides,
});
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

describe('getRemoteEntry - globalLoading rejection cache', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
  });

  it('keeps a successful remote-entry promise cached', async () => {
    const container = { get: rs.fn(), init: rs.fn() };
    let attempts = 0;
    const origin = new ModuleFederation({
      name: 'global-loading-success-cache',
      remotes: [],
      plugins: [
        {
          name: 'success-entry',
          loadEntry() {
            attempts += 1;
            return container;
          },
        },
      ],
    });
    const remoteInfo = getRemoteInfo({
      name: 'cached-success-remote',
      entry: 'https://remote.test/cached-success.js',
    });
    const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);

    const first = await getRemoteEntry({ origin, remoteInfo });
    const cached = globalLoading[uniqueKey];
    const second = await getRemoteEntry({ origin, remoteInfo });

    expect(first).toBe(container);
    expect(second).toBe(container);
    expect(attempts).toBe(1);
    expect(globalLoading[uniqueKey]).toBe(cached);
    await expect(cached).resolves.toBe(container);
  });

  it('rejects cache reuse across known runtime families', async () => {
    const container = { get: rs.fn(), init: rs.fn() };
    let secondOriginAttempts = 0;
    const firstOrigin = new ModuleFederation({
      name: 'cache-family-a',
      remotes: [],
      plugins: [
        {
          name: 'family-a-entry',
          loadEntry() {
            return container;
          },
        },
      ],
    });
    const secondOrigin = new ModuleFederation({
      name: 'cache-family-b',
      remotes: [],
      plugins: [
        {
          name: 'family-b-entry',
          loadEntry() {
            secondOriginAttempts += 1;
            return container;
          },
        },
      ],
    });
    attachRuntimeImage(firstOrigin, runtimeImage());
    attachRuntimeImage(
      secondOrigin,
      runtimeImage({ compatibilityId: 'other-family' }),
    );
    const remoteInfo = getRemoteInfo({
      name: 'family-cache-remote',
      entry: 'https://remote.test/family-cache.js',
    });

    await expect(
      getRemoteEntry({ origin: firstOrigin, remoteInfo }),
    ).resolves.toBe(container);
    await expect(
      getRemoteEntry({ origin: secondOrigin, remoteInfo }),
    ).rejects.toThrow(
      'compatibilityId changed from runtime-family to other-family',
    );
    expect(secondOriginAttempts).toBe(0);
  });

  it.each([false, true])(
    'isolates distinct host evaluators with matching image metadata (reverse=%s)',
    async (reverse) => {
      const containers = [
        { get: rs.fn(), init: rs.fn() },
        { get: rs.fn(), init: rs.fn() },
      ];
      const evaluators = containers.map((container, index) => ({
        name: `distinct-evaluator-${index}`,
        loadEntry: rs.fn(() => container),
      }));
      const hosts = evaluators.map((plugin, index) => {
        const host = new ModuleFederation({
          name: `evaluator-host-${index}`,
          remotes: [],
          plugins: [plugin],
        });
        attachRuntimeImage(host, runtimeImage());
        return host;
      });
      const first = reverse ? 1 : 0;
      const second = 1 - first;
      const remoteInfo = getRemoteInfo({
        name: 'evaluator-remote',
        entry: 'https://remote.test/evaluator.js',
      });
      await expect(
        getRemoteEntry({ origin: hosts[first], remoteInfo }),
      ).resolves.toBe(containers[first]);
      await expect(
        getRemoteEntry({ origin: hosts[second], remoteInfo }),
      ).resolves.toBe(containers[second]);
      expect(evaluators[second].loadEntry).toHaveBeenCalledTimes(1);
    },
  );

  it.each([false, true])(
    'isolates distinct createScript evaluators while a load is pending (reverse=%s)',
    async (reverse) => {
      const container = { get: rs.fn(), init: rs.fn() };
      const finishes: Array<(value: typeof container) => void> = [];
      const loadEntry = rs.fn(
        () =>
          new Promise<typeof container>((resolve) => {
            finishes.push(resolve);
          }),
      );
      const hosts = [0, 1].map((index) => {
        const host = new ModuleFederation({
          name: `script-evaluator-host-${index}`,
          remotes: [],
          plugins: [
            {
              name: `script-evaluator-${index}`,
              loadEntry,
              createScript: rs.fn(),
            },
          ],
        });
        attachRuntimeImage(host, runtimeImage());
        return host;
      });
      const remoteInfo = getRemoteInfo({
        name: 'pending-evaluator-remote',
        entry: 'https://remote.test/pending-evaluator.js',
      });
      const first = reverse ? 1 : 0;
      const pending = getRemoteEntry({ origin: hosts[first], remoteInfo });
      const otherPending = getRemoteEntry({
        origin: hosts[1 - first],
        remoteInfo,
      });
      expect(loadEntry).toHaveBeenCalledTimes(2);
      for (const finish of finishes) finish(container);
      await expect(pending).resolves.toBe(container);
      await expect(otherPending).resolves.toBe(container);
    },
  );

  it.each([false, true])(
    'allows a different evaluator after rejection and reset (reverse=%s)',
    async (reverse) => {
      const container = { get: rs.fn(), init: rs.fn() };
      const evaluators = [0, 1].map((index) => ({
        name: `retry-evaluator-${index}`,
        loadEntry: rs.fn(() => Promise.resolve(container)),
      }));
      const first = reverse ? 1 : 0;
      evaluators[first].loadEntry.mockRejectedValueOnce(
        new Error('evaluator transient failure'),
      );
      const hosts = evaluators.map((plugin, index) => {
        const host = new ModuleFederation({
          name: `retry-evaluator-host-${index}`,
          remotes: [],
          plugins: [plugin],
        });
        attachRuntimeImage(host, runtimeImage());
        return host;
      });
      const remoteInfo = getRemoteInfo({
        name: 'retry-evaluator-remote',
        entry: 'https://remote.test/retry-evaluator.js',
      });
      const key = getRemoteEntryUniqueKey(remoteInfo);
      await expect(
        getRemoteEntry({ origin: hosts[first], remoteInfo }),
      ).rejects.toThrow('evaluator transient failure');
      expect(globalLoading[key]).toBeUndefined();
      expect(globalLoadingMeta[key]).toBeUndefined();
      await expect(
        getRemoteEntry({ origin: hosts[1 - first], remoteInfo }),
      ).resolves.toBe(container);
      resetFederationGlobalInfo();
      expect(globalLoading[key]).toBeUndefined();
      expect(globalLoadingMeta[key]).toBeUndefined();
      await expect(
        getRemoteEntry({ origin: hosts[first], remoteInfo }),
      ).resolves.toBe(container);
    },
  );

  it.each([false, true])(
    'isolates shared callbacks across hosts and deduplicates each host (reverse=%s)',
    async (reverse) => {
      const container = { get: rs.fn(), init: rs.fn() };
      const loadEntry = rs.fn(async () => {
        await Promise.resolve();
        return container;
      });
      const plugin = { name: 'compatible-entry-evaluator', loadEntry };
      const hosts = [0, 1].map((index) => {
        const host = new ModuleFederation({
          name: `compatible-evaluator-host-${index}`,
          remotes: [],
          plugins: [plugin],
        });
        attachRuntimeImage(host, runtimeImage());
        return host;
      });
      if (reverse) hosts.reverse();
      const remoteInfo = getRemoteInfo({
        name: 'compatible-evaluator-remote',
        entry: 'https://remote.test/compatible-evaluator.js',
      });
      const results = await Promise.all(
        hosts.map((origin) => getRemoteEntry({ origin, remoteInfo })),
      );
      expect(results).toEqual([container, container]);
      expect(loadEntry).toHaveBeenCalledTimes(2);
      await expect(
        getRemoteEntry({ origin: hosts[1], remoteInfo }),
      ).resolves.toBe(container);
      expect(loadEntry).toHaveBeenCalledTimes(2);
    },
  );

  it.each([false, true])(
    'refuses distinct actual browser IIFE evaluators sharing a physical global (reverse=%s)',
    async (reverse) => {
      Reflect.deleteProperty(globalThis, 'remote');
      const labels = reverse ? ['b', 'a'] : ['a', 'b'];
      const origins = labels.map((label) => {
        const origin = new ModuleFederation({
          name: `browser-script-${label}`,
          remotes: [],
          plugins: [
            {
              name: `browser-script-${label}`,
              createScript() {
                const script = document.createElement('script');
                script.src = `${BASE}/evaluator-${label}.js`;
                return script;
              },
            },
          ],
        });
        attachRuntimeImage(origin, runtimeImage());
        return origin;
      });
      const remoteInfo = getRemoteInfo({
        name: 'remote',
        entry: `${BASE}/original-evaluator.js`,
      });
      const results = await Promise.allSettled(
        origins.map((origin) => getRemoteEntry({ origin, remoteInfo })),
      );
      expect(results[0].status).toBe('fulfilled');
      if (results[0].status !== 'fulfilled' || !results[0].value)
        throw new Error('first IIFE evaluator did not complete');
      expect((await results[0].value.get('./value'))()).toBe(
        `literal-${labels[0]}`,
      );
      expect(results[1].status).toBe('rejected');
      if (results[1].status !== 'rejected')
        throw new Error('physical global conflict was accepted');
      expect(results[1].reason.message).toContain(
        'Distinct browser script evaluators share physical global remote',
      );
      Reflect.deleteProperty(globalThis, 'remote');
      removeScriptTags();
    },
  );

  it('keeps scoped cache keys distinct from a real entry URL with the same suffix', async () => {
    const base = 'https://remote.test/key-collision.js';
    const firstContainer = { get: rs.fn(), init: rs.fn() };
    const secondContainer = { get: rs.fn(), init: rs.fn() };
    const suffixContainer = { get: rs.fn(), init: rs.fn() };
    const first = new ModuleFederation({
      name: 'collision-first',
      remotes: [],
      plugins: [
        { name: 'collision-first-entry', loadEntry: () => firstContainer },
      ],
    });
    const second = new ModuleFederation({
      name: 'collision-second',
      remotes: [],
      plugins: [
        {
          name: 'collision-second-entry',
          loadEntry: ({ remoteInfo }) =>
            remoteInfo.entry === base ? secondContainer : suffixContainer,
        },
      ],
    });
    attachRuntimeImage(first, runtimeImage());
    attachRuntimeImage(second, runtimeImage());
    const remoteInfo = getRemoteInfo({ name: 'collision-remote', entry: base });
    await expect(getRemoteEntry({ origin: first, remoteInfo })).resolves.toBe(
      firstContainer,
    );
    await expect(getRemoteEntry({ origin: second, remoteInfo })).resolves.toBe(
      secondContainer,
    );
    await expect(
      getRemoteEntry({
        origin: second,
        remoteInfo: getRemoteInfo({
          name: 'collision-remote',
          entry: `${base}:evaluator:1`,
        }),
      }),
    ).resolves.toBe(suffixContainer);
  });

  it('deduplicates default platform loading across image-backed hosts', async () => {
    Reflect.deleteProperty(globalThis, 'remote');
    const hosts = [0, 1].map((index) => {
      const host = new ModuleFederation({
        name: `default-loader-host-${index}`,
        remotes: [],
      });
      attachRuntimeImage(host, runtimeImage());
      return host;
    });
    const firstLoad = rs.spyOn(
      hosts[0].loaderHook.lifecycle.createScript,
      'emit',
    );
    const secondLoad = rs.spyOn(
      hosts[1].loaderHook.lifecycle.createScript,
      'emit',
    );
    const remoteInfo = getRemoteInfo({
      name: 'remote',
      entry: `${BASE}/success.js`,
    });
    const results = await Promise.all(
      hosts.map((origin) => getRemoteEntry({ origin, remoteInfo })),
    );
    expect(results[0]).toBe(results[1]);
    expect(firstLoad).toHaveBeenCalledTimes(1);
    expect(secondLoad).not.toHaveBeenCalled();
    firstLoad.mockRestore();
    secondLoad.mockRestore();
    Reflect.deleteProperty(globalThis, 'remote');
    removeScriptTags();
  });

  it.each(['createScript', 'fetch', 'loadEntryError'] as const)(
    'isolates changed %s hooks within one image-backed host',
    async (hook) => {
      const container = { get: rs.fn(), init: rs.fn() };
      const loadEntry = rs.fn(() => container);
      const origin = new ModuleFederation({
        name: `changed-${hook}-host`,
        remotes: [],
        plugins: [{ name: 'changed-hook-entry', loadEntry }],
      });
      attachRuntimeImage(origin, runtimeImage());
      const remoteInfo = getRemoteInfo({
        name: `changed-${hook}-remote`,
        entry: `https://remote.test/changed-${hook}.js`,
      });
      await expect(getRemoteEntry({ origin, remoteInfo })).resolves.toBe(
        container,
      );
      origin.loaderHook.lifecycle[hook].on(rs.fn());
      await expect(getRemoteEntry({ origin, remoteInfo })).resolves.toBe(
        container,
      );
      expect(loadEntry).toHaveBeenCalledTimes(2);
    },
  );

  it.each([false, true])(
    'isolates same-host URL transforms for actual ESM evaluation (reverse=%s)',
    async (reverse) => {
      const origin = new ModuleFederation({
        name: 'esm-transform-host',
        remotes: [],
      });
      attachRuntimeImage(origin, runtimeImage());
      const remoteInfo = getRemoteInfo({
        name: 'esm-transform-remote',
        entry: 'https://remote.test/original.js',
        type: 'module',
      });
      const transforms = ['literal-first', 'literal-second'].map((label) => ({
        label,
        getEntryUrl: () =>
          createDataUrlEntry(
            `export function get() { return () => '${label}'; } export function init() {}`,
          ),
      }));
      if (reverse) transforms.reverse();
      for (const transform of transforms) {
        const result = await getRemoteEntry({
          origin,
          remoteInfo,
          getEntryUrl: transform.getEntryUrl,
        });
        expect(result).toBeTruthy();
        if (!result) throw new Error('ESM entry did not load');
        expect((await result.get('./value'))()).toBe(transform.label);
      }
    },
  );

  it('reuses a cached entry when the retry URL policy changes', async () => {
    const container = { get: rs.fn(), init: rs.fn() };
    let attempts = 0;
    const origin = new ModuleFederation({
      name: 'cache-url-policy',
      remotes: [],
      plugins: [
        {
          name: 'url-policy-entry',
          loadEntry() {
            attempts += 1;
            return container;
          },
        },
      ],
    });
    const remoteInfo = getRemoteInfo({
      name: 'url-policy-remote',
      entry: 'https://remote.test/url-policy.js',
    });

    await expect(
      getRemoteEntry({
        origin,
        remoteInfo,
        getEntryUrl: (url) => `${url}?retry=1`,
      }),
    ).resolves.toBe(container);
    await expect(
      getRemoteEntry({
        origin,
        remoteInfo,
        getEntryUrl: (url) => `${url}?retry=2`,
      }),
    ).resolves.toBe(container);
    await expect(getRemoteEntry({ origin, remoteInfo })).resolves.toBe(
      container,
    );
    expect(attempts).toBe(1);
  });

  it('ignores cache identity fields without runtime images', async () => {
    const container = { get: rs.fn(), init: rs.fn() };
    const warnSpy = rs.spyOn(logger, 'warn').mockImplementation(() => {});
    const imageOrigin = new ModuleFederation({
      name: 'cache-legacy-image',
      remotes: [],
      plugins: [
        {
          name: 'legacy-image-entry',
          loadEntry() {
            return container;
          },
        },
      ],
    });
    attachRuntimeImage(imageOrigin, runtimeImage());
    const legacyOrigin = new ModuleFederation({
      name: 'cache-legacy-plain',
      remotes: [],
    });
    const remote = {
      name: 'legacy-identity-remote',
      entry: 'https://remote.test/legacy-identity.js',
    };

    await expect(
      getRemoteEntry({
        origin: imageOrigin,
        remoteInfo: getRemoteInfo(remote),
      }),
    ).resolves.toBe(container);
    await expect(
      getRemoteEntry({
        origin: legacyOrigin,
        remoteInfo: getRemoteInfo({
          ...remote,
          type: 'module',
          entryGlobalName: 'renamed-global',
        }),
      }),
    ).resolves.toBe(container);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('does not pair stale metadata with a replacement promise', async () => {
    const firstContainer = { get: rs.fn(), init: rs.fn() };
    const replacementContainer = { get: rs.fn(), init: rs.fn() };
    const firstOrigin = new ModuleFederation({
      name: 'cache-metadata-first',
      remotes: [],
      plugins: [
        {
          name: 'cache-metadata-entry',
          loadEntry() {
            return firstContainer;
          },
        },
      ],
    });
    const secondOrigin = new ModuleFederation({
      name: 'cache-metadata-second',
      remotes: [],
    });
    attachRuntimeImage(firstOrigin, runtimeImage());
    attachRuntimeImage(
      secondOrigin,
      runtimeImage({ compatibilityId: 'replacement-family' }),
    );
    const remoteInfo = getRemoteInfo({
      name: 'metadata-replacement-remote',
      entry: 'https://remote.test/metadata-replacement.js',
    });
    const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);

    await getRemoteEntry({ origin: firstOrigin, remoteInfo });
    globalLoading[uniqueKey] = Promise.resolve(replacementContainer);

    await expect(
      getRemoteEntry({ origin: secondOrigin, remoteInfo }),
    ).resolves.toBe(replacementContainer);
    expect(globalLoadingMeta[uniqueKey]).toBeUndefined();
  });

  it('shares one in-flight promise across concurrent callers', async () => {
    const container = { get: rs.fn(), init: rs.fn() };
    let attempts = 0;
    let resolveLoad!: (value: typeof container) => void;
    const origin = new ModuleFederation({
      name: 'global-loading-concurrent',
      remotes: [],
      plugins: [
        {
          name: 'deferred-entry',
          loadEntry() {
            attempts += 1;
            return new Promise((resolve) => {
              resolveLoad = resolve;
            });
          },
        },
      ],
    });
    const remoteInfo = getRemoteInfo({
      name: 'concurrent-cache-remote',
      entry: 'https://remote.test/concurrent-cache.js',
    });
    const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);

    const firstPromise = getRemoteEntry({ origin, remoteInfo });
    const secondPromise = getRemoteEntry({ origin, remoteInfo });
    const inFlight = globalLoading[uniqueKey];

    // getRemoteEntry is async, so callers get distinct wrappers around the same cache entry.
    expect(inFlight).toBeInstanceOf(Promise);
    expect(attempts).toBe(1);

    resolveLoad(container);
    const [first, second] = await Promise.all([firstPromise, secondPromise]);

    expect(first).toBe(container);
    expect(second).toBe(container);
    expect(globalLoading[uniqueKey]).toBe(inFlight);
    expect(attempts).toBe(1);
  });

  it('removes a rejected load so a later call can succeed', async () => {
    const container = { get: rs.fn(), init: rs.fn() };
    let attempts = 0;
    const origin = new ModuleFederation({
      name: 'global-loading-retry-after-reject',
      remotes: [],
      plugins: [
        {
          name: 'fail-then-succeed',
          loadEntry() {
            attempts += 1;
            if (attempts === 1) {
              return Promise.reject(
                new Error('transient remote-entry failure'),
              );
            }
            return container;
          },
        },
      ],
    });
    const remoteInfo = getRemoteInfo({
      name: 'retry-after-reject-remote',
      entry: 'https://remote.test/retry-after-reject.js',
    });
    const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);

    const firstError = await getRemoteEntry({ origin, remoteInfo }).catch(
      (error) => error,
    );
    expect(firstError).toBeInstanceOf(Error);
    expect(firstError.message).toContain('transient remote-entry failure');
    expect(globalLoading[uniqueKey]).toBeUndefined();

    const second = await getRemoteEntry({ origin, remoteInfo });
    expect(second).toBe(container);
    expect(attempts).toBe(2);
    await expect(globalLoading[uniqueKey]).resolves.toBe(container);
  });

  it('does not poison the cache after a permanent failure', async () => {
    let attempts = 0;
    const origin = new ModuleFederation({
      name: 'global-loading-permanent-failure',
      remotes: [],
      plugins: [
        {
          name: 'always-fail',
          loadEntry() {
            attempts += 1;
            return Promise.reject(new Error(`permanent failure #${attempts}`));
          },
        },
      ],
    });
    const remoteInfo = getRemoteInfo({
      name: 'permanent-failure-remote',
      entry: 'https://remote.test/permanent-failure.js',
    });
    const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);

    const firstError = await getRemoteEntry({ origin, remoteInfo }).catch(
      (error) => error,
    );
    const secondError = await getRemoteEntry({ origin, remoteInfo }).catch(
      (error) => error,
    );

    expect(firstError.message).toContain('permanent failure #1');
    expect(secondError.message).toContain('permanent failure #2');
    expect(attempts).toBe(2);
    expect(globalLoading[uniqueKey]).toBeUndefined();
  });

  it('does not let an older rejection delete a newer deferred request', async () => {
    const container = { get: rs.fn(), init: rs.fn() };
    let attempts = 0;
    let resolveSecond!: (value: typeof container) => void;
    const origin = new ModuleFederation({
      name: 'global-loading-identity-check',
      remotes: [],
      plugins: [
        {
          name: 'race-entry',
          loadEntry() {
            attempts += 1;
            if (attempts === 1) {
              const loadError = new Error(
                '#RUNTIME-008 ScriptNetworkError: first request failed',
              );
              loadError.name = 'ScriptNetworkError';
              // Reject via promise so AsyncHook emits a rejected chain (sync
              // throw only rejects when a prior listener already returned).
              return Promise.reject(loadError);
            }
            return new Promise((resolve) => {
              resolveSecond = resolve;
            });
          },
          async loadEntryError(args) {
            delete args.globalLoading[args.uniqueKey];
            // Start a newer in-flight request while the original loading
            // promise is still settling toward rejection.
            void args.getRemoteEntry({
              origin: args.origin,
              remoteInfo: args.remoteInfo,
              remoteEntryExports: args.remoteEntryExports,
            });
            return undefined;
          },
        },
      ],
    });
    const remoteInfo = getRemoteInfo({
      name: 'identity-check-remote',
      entry: 'https://remote.test/identity-check.js',
    });
    const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);

    const firstError = await getRemoteEntry({ origin, remoteInfo }).catch(
      (error) => error,
    );

    expect(firstError.message).toContain('first request failed');
    expect(attempts).toBe(2);
    const newerInFlight = globalLoading[uniqueKey];
    expect(newerInFlight).toBeInstanceOf(Promise);

    resolveSecond(container);
    await expect(newerInFlight).resolves.toBe(container);
    expect(globalLoading[uniqueKey]).toBe(newerInFlight);
    expect(attempts).toBe(2);
  });
});
