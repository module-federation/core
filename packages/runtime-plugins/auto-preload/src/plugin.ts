import type {
  PreloadOptions,
  PreloadConfig,
  LoadRemoteMatch,
} from '@module-federation/runtime/types';

export function autoPreload(
  hookArgs: LoadRemoteMatch,
  preloadConfig?: Partial<PreloadConfig>,
) {
  const { remote, origin, expose, pkgNameOrAlias } = hookArgs;
  // preloading assets
  const preloadOptions: PreloadOptions[0] = {
    remote: remote,
    preloadConfig: {
      nameOrAlias: pkgNameOrAlias,
      exposes: [expose],
      resourceCategory: 'sync',
      share: false,
      depsRemote: false,
      useLinkPreload: false,
      ...preloadConfig,
    },
  };
  return origin.remoteHandler.preloadAssets(preloadOptions);
}
