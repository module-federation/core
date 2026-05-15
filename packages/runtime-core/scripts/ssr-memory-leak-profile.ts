/*
 * Standalone heap profiling script for SSR `registerRemotes({ force: true })`
 * leak discussed in https://github.com/module-federation/core/discussions/4566.
 *
 * This script intentionally bypasses test runners and measures real
 * `process.memoryUsage().heapUsed` in a Node.js process.
 *
 * Usage (from repo root, after building `@module-federation/runtime-core`):
 *
 *   # 1) Build runtime-core to generate dist/index.js
 *   pnpm --filter @module-federation/runtime-core run build
 *
 *   # 2) Run this script with Node.js exposed GC (recommended: Node 20)
 *   NODE_OPTIONS=--expose-gc node \
 *     packages/runtime-core/scripts/ssr-memory-leak-profile.js
 */

/* eslint-disable no-console */

// Note: we intentionally import from the built entry so this script can be
// executed against a regular `pnpm build` output without relying on the
// package's internal TS sources. This minimizes coupling to ts-node/TS
// config while still living close to runtime-core.
//
// The script itself is not part of the published package exports.
import { ModuleFederation, resetFederationGlobalInfo } from '../dist/index.js';

type MinimalManifest = {
  metaData: Record<string, any>;
  exposes: Array<{ name: string; path: string; assets: Array<any> }>;
  shared: Array<{ name: string; version: string; assets?: Array<any> }>;
};

function makeManifestFromUrl(url: string): MinimalManifest {
  const base = url.replace(/manifest\.json$/, '');

  return {
    metaData: {
      name: '@register-remotes-force/remote',
      globalName: '@register-remotes-force/remote',
      buildInfo: { buildVersion: 'ssr-memory-leak-profile' },
      remoteEntry: {
        path: base,
        name: 'remoteEntry.js',
        type: 'global',
      },
      ssrRemoteEntry: {
        path: base,
        name: 'remoteEntry.ssr.js',
        type: 'commonjs-module',
      },
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

function makeManifestUrl(iteration: number): string {
  // Each iteration uses a distinct manifest URL so that buggy
  // `registerRemotes(..., { force: true })` behavior will accumulate
  // entries under `globalThis.__FEDERATION__.__MANIFEST_LOADING__` and
  // snapshot keys `globalThis.__FEDERATION__.moduleInfo`.
  return `http://localhost:1111/resources/ssr-leak/remote/v${iteration}/manifest.json`;
}

function ensureGC(): void {
  if (typeof global.gc !== 'function') {
    // eslint-disable-next-line no-console
    console.error(
      '[ssr-memory-leak-profile] global.gc 不可用。请使用 `node --expose-gc`（或设置 NODE_OPTIONS=--expose-gc）运行此脚本。',
    );
    throw new Error('global.gc is not available. Run with `node --expose-gc`.');
  }
}

function formatMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

async function runProfile(iterations = 1000): Promise<void> {
  ensureGC();

  // Reset federation globals so the measurement starts from a clean state.
  resetFederationGlobalInfo();

  const originalFetch = globalThis.fetch;

  // In Node 20, `fetch` and `Response` are available on the global scope.
  // We override `fetch` with an in-memory manifest responder so that no
  // actual HTTP traffic is performed during profiling.
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    const body = JSON.stringify(makeManifestFromUrl(url));

    return new Response(body, {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    global.gc();
    const startHeap = process.memoryUsage().heapUsed;

    const hostName = '@register-remotes-force/host';
    const remoteName = '@register-remotes-force/remote';

    const initialManifest = makeManifestUrl(0);

    const fm = new ModuleFederation({
      name: hostName,
      version: '0.0.0-ssr-memory-leak-profile',
      remotes: [
        {
          name: remoteName,
          entry: initialManifest,
          // Ensure snapshot plugin runs (manifest URL => not a pure remoteEntry).
          type: 'global',
        },
      ],
    });

    // Minimal container to satisfy `initRawContainer` in Node env.
    fm.initRawContainer(remoteName, initialManifest, {
      init: () => void 0,
      get: () => () => ({}),
    } as any);

    // Seed snapshot / manifest cache for the initial manifest.
    await fm.snapshotHandler.loadRemoteSnapshotInfo({
      moduleInfo: fm.options.remotes[0],
    });

    for (let i = 1; i <= iterations; i += 1) {
      const manifestUrl = makeManifestUrl(i);

      // 1) Force re-register same remote name but with a new manifest URL.
      fm.registerRemotes(
        [
          {
            name: remoteName,
            entry: manifestUrl,
            type: 'global',
          },
        ],
        { force: true },
      );

      const nextRemote = fm.options.remotes.find(
        (r) => r.name === remoteName && r.entry === manifestUrl,
      );

      if (!nextRemote) {
        throw new Error(
          `[ssr-memory-leak-profile] Failed to find remote config for ${manifestUrl} after registerRemotes().`,
        );
      }

      // 2) Load snapshot again for the new manifest URL. Under the bug,
      //    this populates new entries in global manifest/snapshot caches
      //    without fully cleaning old ones.
      //
      //    This is effectively the same pattern as
      //    `register-remotes-force-ssr-leak.spec.ts`, repeated many times.
      // eslint-disable-next-line no-await-in-loop
      await fm.snapshotHandler.loadRemoteSnapshotInfo({
        moduleInfo: nextRemote,
      });

      if (i % 100 === 0) {
        // Provide coarse-grained progress for long runs.
        // eslint-disable-next-line no-console
        console.log(
          `[ssr-memory-leak-profile] Completed ${i}/${iterations} iterations...`,
        );
      }
    }

    global.gc();
    const endHeap = process.memoryUsage().heapUsed;

    const startMB = formatMB(startHeap);
    const endMB = formatMB(endHeap);
    const deltaMB = (endHeap - startHeap) / 1024 / 1024;

    // eslint-disable-next-line no-console
    console.log('--- SSR registerRemotes({ force: true }) heap profile ---');
    // eslint-disable-next-line no-console
    console.log(`Iterations   : ${iterations}`);
    // eslint-disable-next-line no-console
    console.log(`Heap before  : ${startMB} MB`);
    // eslint-disable-next-line no-console
    console.log(`Heap after   : ${endMB} MB`);
    // eslint-disable-next-line no-console
    console.log(`Heap delta   : ${deltaMB.toFixed(2)} MB`);

    const thresholdMB = 5;
    if (deltaMB > thresholdMB) {
      throw new Error(
        `[ssr-memory-leak-profile] Suspected memory leak: heap grew by ${deltaMB.toFixed(
          2,
        )} MB (> ${thresholdMB} MB) after forced GC.`,
      );
    }

    // eslint-disable-next-line no-console
    console.log(
      `[ssr-memory-leak-profile] Heap growth (${deltaMB.toFixed(
        2,
      )} MB) is within threshold (${thresholdMB} MB).`,
    );
  } finally {
    // Restore original fetch implementation to avoid polluting the environment
    // if this script is ever imported (even though it is intended to be
    // executed as a standalone entrypoint).
    globalThis.fetch = originalFetch;
  }
}

// Allow overriding iteration count via env for quick experiments, e.g.
//   RUNTIME_CORE_SSR_LEAK_ITERATIONS=200 NODE_OPTIONS=--expose-gc node ...
const iterationsFromEnv = Number.parseInt(
  process.env.RUNTIME_CORE_SSR_LEAK_ITERATIONS || '',
  10,
);

runProfile(Number.isFinite(iterationsFromEnv) ? iterationsFromEnv : 1000).catch(
  (err) => {
    // eslint-disable-next-line no-console
    console.error('[ssr-memory-leak-profile] Profiling failed:', err);
    process.exitCode = 1;
  },
);
