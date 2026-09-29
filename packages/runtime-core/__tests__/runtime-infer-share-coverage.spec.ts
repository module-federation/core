import { beforeEach, describe, expect, it } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import type { Shared, ShareArgs } from '../src/type';
import { getRegisteredShare, shouldUseTreeShaking } from '../src/utils/share';
import { SyncWaterfallHook } from '../src/utils/hooks';

type LodashLike = {
  chunk?: (...args: unknown[]) => unknown;
  debounce?: (...args: unknown[]) => unknown;
  __source?: string;
};

const SHARED_VERSION = '4.17.21';
const PKG = 'lodash-es';

const chunkFn = () => ['chunked'];
const debounceFn = () => undefined;

function createShareArgs(options: {
  from: string;
  usedExports: string[];
  providedExports?: string[];
  omitProviderExports?: boolean;
}): ShareArgs {
  const pruned: LodashLike = { __source: `${options.from}:pruned` };
  if (options.usedExports.includes('chunk')) {
    pruned.chunk = chunkFn;
  }
  if (options.usedExports.includes('debounce')) {
    pruned.debounce = debounceFn;
  }

  const full: LodashLike = {
    chunk: chunkFn,
    debounce: debounceFn,
    __source: `${options.from}:full`,
  };

  return {
    version: SHARED_VERSION,
    shareConfig: {
      requiredVersion: SHARED_VERSION,
      singleton: false,
      eager: false,
      strictVersion: false,
    },
    strategy: 'version-first',
    get: () => Promise.resolve(() => full),
    treeShaking: {
      mode: 'runtime-infer',
      ...(options.omitProviderExports
        ? {}
        : {
            usedExports: options.usedExports,
            providedExports: options.providedExports ?? options.usedExports,
          }),
      get: () => Promise.resolve(() => pruned),
    },
  };
}

function createApp(
  name: string,
  usedExports: string[],
  shareOptions?: Partial<Parameters<typeof createShareArgs>[0]>,
) {
  return new ModuleFederation({
    name,
    remotes: [],
    shareStrategy: 'version-first',
    shared: {
      [PKG]: createShareArgs({
        from: name,
        usedExports,
        ...shareOptions,
      }),
    },
  });
}

async function loadLodash(
  mf: ModuleFederation,
  usedExports: string[],
): Promise<LodashLike> {
  const factory = await mf.loadShare<LodashLike>(PKG, {
    customShareInfo: {
      treeShaking: {
        usedExports,
      },
    },
  });
  expect(factory).toBeTruthy();
  return factory!();
}

function assertHasExports(lib: LodashLike, usedExports: string[]) {
  for (const exportName of usedExports) {
    expect(typeof lib[exportName as keyof LodashLike]).toBe('function');
  }
}

describe('runtime-infer shared export coverage', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
  });

  it.each([
    { firstName: 'a-host', secondName: 'z-remote' },
    { firstName: 'z-host', secondName: 'a-remote' },
  ])(
    'serves a covering tree-shaken variant or the full fallback regardless of app-name order ($firstName then $secondName)',
    async ({ firstName, secondName }) => {
      const first = createApp(firstName, ['chunk']);
      const second = createApp(secondName, ['debounce']);

      second.initShareScopeMap('default', first.shareScopeMap.default, {
        hostShareScopeMap: first.shareScopeMap,
      });
      first.initializeSharing('default', { from: 'build' });
      second.initializeSharing('default', { from: 'build' });

      const firstLib = await loadLodash(first, ['chunk']);
      const secondLib = await loadLodash(second, ['debounce']);

      assertHasExports(firstLib, ['chunk']);
      assertHasExports(secondLib, ['debounce']);
      expect(
        firstLib.__source === `${firstName}:pruned` ||
          firstLib.__source?.endsWith(':full'),
      ).toBe(true);
      expect(
        secondLib.__source === `${secondName}:pruned` ||
          secondLib.__source?.endsWith(':full'),
      ).toBe(true);
    },
  );

  it('falls back to the full getter when the registered provider omits export coverage', async () => {
    const host = createApp('a-host', ['chunk'], { omitProviderExports: true });
    const remote = createApp('z-remote', ['debounce'], {
      omitProviderExports: true,
    });

    remote.initShareScopeMap('default', host.shareScopeMap.default, {
      hostShareScopeMap: host.shareScopeMap,
    });
    host.initializeSharing('default', { from: 'build' });
    remote.initializeSharing('default', { from: 'build' });

    const hostLib = await loadLodash(host, ['chunk']);
    const remoteLib = await loadLodash(remote, ['debounce']);

    assertHasExports(hostLib, ['chunk']);
    assertHasExports(remoteLib, ['debounce']);
    expect(hostLib.__source?.endsWith(':full')).toBe(true);
    expect(remoteLib.__source?.endsWith(':full')).toBe(true);
  });

  it('prefers providedExports over usedExports when deciding coverage', () => {
    expect(
      shouldUseTreeShaking(
        {
          mode: 'runtime-infer',
          usedExports: ['chunk'],
          providedExports: ['debounce'],
        },
        ['debounce'],
      ),
    ).toBe(true);
    expect(
      shouldUseTreeShaking(
        {
          mode: 'runtime-infer',
          usedExports: ['debounce'],
          providedExports: ['chunk'],
        },
        ['debounce'],
      ),
    ).toBe(false);
  });

  it('does not select a disjoint tree-shaken factory from getRegisteredShare', () => {
    const resolveShare = new SyncWaterfallHook<{
      shareScopeMap: Record<string, unknown>;
      scope: string;
      pkgName: string;
      version: string;
      shareInfo: Shared;
      GlobalFederation: unknown;
      resolver: () => { shared: Shared; useTreesShaking: boolean } | undefined;
    }>('resolveShare');

    const winner: Shared = {
      version: SHARED_VERSION,
      from: 'z-remote',
      get: () =>
        Promise.resolve(() => ({ debounce: debounceFn, __source: 'full' })),
      shareConfig: {
        requiredVersion: SHARED_VERSION,
        singleton: false,
        eager: false,
        strictVersion: false,
      },
      scope: ['default'],
      useIn: [],
      deps: [],
      strategy: 'version-first',
      treeShaking: {
        mode: 'runtime-infer',
        usedExports: ['debounce'],
        providedExports: ['debounce'],
        get: () =>
          Promise.resolve(() => ({
            debounce: debounceFn,
            __source: 'z-remote:pruned',
          })),
      },
    };

    const consumer: Shared = {
      ...winner,
      from: 'a-host',
      treeShaking: {
        mode: 'runtime-infer',
        usedExports: ['chunk'],
      },
    };

    const result = getRegisteredShare(
      {
        default: {
          [PKG]: {
            [SHARED_VERSION]: winner,
          },
        },
      },
      PKG,
      consumer,
      resolveShare as never,
    );

    expect(result?.shared).toBe(winner);
    expect(result?.useTreesShaking).toBe(false);
  });
});
