// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModuleFederation } from '../src/index';
import { resetFederationGlobalInfo } from '../src/global';

/**
 * Repro for https://github.com/module-federation/core/discussions/4566
 *
 * In Node/SSR, `registerRemotes(..., { force: true })` calls `removeRemote`,
 * but it does NOT fully clean up global caches (notably
 * `globalThis.__FEDERATION__.__MANIFEST_LOADING__` and snapshot entries under
 * `globalThis.__FEDERATION__.moduleInfo`).
 *
 * This test asserts on deterministic internal structures instead of
 * `process.memoryUsage()`.
 */

type MinimalManifest = {
  metaData: Record<string, any>;
  exposes: Array<{ name: string; path: string; assets: Array<any> }>;
  shared: Array<{ name: string; version: string; assets?: Array<any> }>;
};

function makeManifest(opts: {
  name: string;
  remoteEntryBase: string;
  ssrRemoteEntryBase?: string;
}): MinimalManifest {
  // Minimal shape for `packages/sdk/src/generateSnapshotFromManifest.ts`.
  // Also satisfies runtime-core's SnapshotHandler assertions:
  // `metaData`, `exposes`, `shared` must exist.
  return {
    metaData: {
      name: opts.name,
      globalName: opts.name,
      buildInfo: { buildVersion: 'test-build' },
      remoteEntry: {
        path: opts.remoteEntryBase,
        name: 'remoteEntry.js',
        type: 'global',
      },
      ...(opts.ssrRemoteEntryBase
        ? {
            ssrRemoteEntry: {
              path: opts.ssrRemoteEntryBase,
              name: 'remoteEntry.ssr.js',
              type: 'commonjs-module',
            },
          }
        : {}),
    },
    exposes: [
      {
        name: './noop',
        path: './noop',
        assets: [],
      },
    ],
    shared: [],
  };
}

describe('registerRemotes(force:true) SSR/Node leak repro', () => {
  const hostName = '@register-remotes-force/host';
  const remoteName = '@register-remotes-force/remote';

  const manifestV1 =
    'http://localhost:1111/resources/ssr-leak/remote/v1/manifest.json';
  const manifestV2 =
    'http://localhost:1111/resources/ssr-leak/remote/v2/manifest.json';

  beforeEach(() => {
    resetFederationGlobalInfo();

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === manifestV1) {
          return new Response(
            JSON.stringify(
              makeManifest({
                name: remoteName,
                remoteEntryBase:
                  'http://localhost:1111/resources/ssr-leak/remote/v1/',
              }),
            ),
            {
              status: 200,
              headers: { 'content-type': 'application/json' },
            },
          );
        }
        if (url === manifestV2) {
          return new Response(
            JSON.stringify(
              makeManifest({
                name: remoteName,
                remoteEntryBase:
                  'http://localhost:1111/resources/ssr-leak/remote/v2/',
              }),
            ),
            {
              status: 200,
              headers: { 'content-type': 'application/json' },
            },
          );
        }
        return new Response('not found', { status: 404 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('leaks global manifest/snapshot cache entries when re-registering same remote with different manifest entry', async () => {
    const FM = new ModuleFederation({
      name: hostName,
      version: '0.0.0-test',
      remotes: [
        {
          name: remoteName,
          entry: manifestV1,
          // Ensure snapshot plugin runs (manifest URL => not a pure remoteEntry).
          type: 'global',
        },
      ],
    });

    // Ensure `removeRemote` takes the loaded path.
    FM.initRawContainer(remoteName, manifestV1, {
      // minimal container shape
      init: () => void 0,
      get: () => () => ({}),
    } as any);

    // 1) First load snapshot (populates global manifest loading + global snapshot entries).
    await FM.snapshotHandler.loadRemoteSnapshotInfo({
      moduleInfo: FM.options.remotes[0],
    });

    const manifestLoading1 = Object.keys(
      globalThis.__FEDERATION__.__MANIFEST_LOADING__,
    );
    const remoteSnapshotKeys1 = Object.keys(
      globalThis.__FEDERATION__.moduleInfo,
    )
      .filter((k) => k.startsWith(`${remoteName}:`))
      .sort();

    expect(manifestLoading1.sort()).toEqual([manifestV1]);
    expect(remoteSnapshotKeys1).toEqual([`${remoteName}:${manifestV1}`]);

    // 2) Force re-register same remote name but different manifest URL.
    FM.registerRemotes(
      [
        {
          name: remoteName,
          entry: manifestV2,
          type: 'global',
        },
      ],
      { force: true },
    );

    // 3) Load snapshot again (creates NEW global entries keyed by manifestV2).
    const nextRemote = FM.options.remotes.find((r) => r.name === remoteName);
    expect(nextRemote).toBeTruthy();
    await FM.snapshotHandler.loadRemoteSnapshotInfo({
      moduleInfo: nextRemote!,
    });

    const manifestLoading2 = Object.keys(
      globalThis.__FEDERATION__.__MANIFEST_LOADING__,
    ).sort();
    const remoteSnapshotKeys2 = Object.keys(
      globalThis.__FEDERATION__.moduleInfo,
    )
      .filter((k) => k.startsWith(`${remoteName}:`))
      .sort();

    // Current (buggy) behavior: old manifest & snapshot entries are retained.
    // Expected (fixed) behavior: only manifestV2 should remain.
    expect(manifestLoading2).toEqual([manifestV1, manifestV2]);
    expect(remoteSnapshotKeys2).toEqual([
      `${remoteName}:${manifestV1}`,
      `${remoteName}:${manifestV2}`,
    ]);
  });
});
