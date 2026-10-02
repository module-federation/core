import { describe, it, expect, afterEach } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import {
  CurrentGlobal,
  resetFederationGlobalInfo,
  resetFederationRuntime,
  setGlobalFederationInstance,
} from '../src/global';

const HOST = 'reset_host';
const REMOTE_GLOBAL = 'reset_remote_entry';

type Globals = Record<string, unknown>;

// One server-side build: a host that shares react as a singleton and consumes
// a remote whose container lives on globalThis, like an SSR bundle does.
function startGeneration(
  generation: number,
  hostName = HOST,
  remoteGlobal = REMOTE_GLOBAL,
) {
  (CurrentGlobal as unknown as Globals)[hostName] = { generation };
  (CurrentGlobal as unknown as Globals)[remoteGlobal] = {
    init: () => undefined,
    get: () => () => ({ generation }),
  };

  const host = new ModuleFederation({
    name: hostName,
    remotes: [
      {
        name: 'remote',
        entry: 'http://localhost:1111/reset/remoteEntry.js',
        entryGlobalName: remoteGlobal,
      },
    ],
    shared: {
      react: {
        version: '18.3.1',
        lib: () => ({ generation }),
        shareConfig: { singleton: true, requiredVersion: '^18.0.0' },
      },
    },
  });
  setGlobalFederationInstance(host);
  return host;
}

async function render(host: ModuleFederation) {
  const react = await host.loadShare<{ generation: number }>('react');
  const app = await host.loadRemote<{ generation: number }>('remote/App');
  return {
    react: react ? react().generation : undefined,
    app: app?.generation,
  };
}

describe('resetFederationRuntime', () => {
  afterEach(() => {
    delete (CurrentGlobal as unknown as Globals)[HOST];
    delete (CurrentGlobal as unknown as Globals)[REMOTE_GLOBAL];
    resetFederationGlobalInfo();
  });

  it('mixes generations without a reset', async () => {
    await render(startGeneration(1));

    // The rebuilt host gets its new react but the old remote container.
    expect(await render(startGeneration(2))).toEqual({ react: 2, app: 1 });
  });

  it('starts the next generation from a clean runtime', async () => {
    const first = startGeneration(1);
    expect(await render(first)).toEqual({ react: 1, app: 1 });
    expect(first.moduleCache.size).toBe(1);
    CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.set('remote/App', true);

    resetFederationRuntime();

    expect(first.moduleCache.size).toBe(0);
    expect(HOST in CurrentGlobal).toBe(false);
    expect(REMOTE_GLOBAL in CurrentGlobal).toBe(false);
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toEqual([]);
    expect(CurrentGlobal.__FEDERATION__.__SHARE__).toEqual({});
    expect(CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.size).toBe(0);

    expect(await render(startGeneration(2))).toEqual({ react: 2, app: 2 });
  });

  it('clears writable container globals that cannot be deleted', async () => {
    const hostName = 'reset_non_configurable_host';
    const remoteGlobal = 'reset_non_configurable_remote_entry';
    const globals = CurrentGlobal as unknown as Globals;

    try {
      for (const name of [hostName, remoteGlobal]) {
        Object.defineProperty(CurrentGlobal, name, {
          value: undefined,
          configurable: false,
          writable: true,
        });
      }

      const first = startGeneration(1, hostName, remoteGlobal);
      expect(await render(first)).toEqual({ react: 1, app: 1 });
      expect(first.moduleCache.size).toBe(1);

      resetFederationRuntime();

      expect(globals[hostName]).toBeUndefined();
      expect(globals[remoteGlobal]).toBeUndefined();
      expect(first.moduleCache.size).toBe(0);
      expect(await render(startGeneration(2, hostName, remoteGlobal))).toEqual({
        react: 2,
        app: 2,
      });
    } finally {
      // Non-configurable properties remain on this isolated test global.
      globals[hostName] = undefined;
      globals[remoteGlobal] = undefined;
    }
  });
});
