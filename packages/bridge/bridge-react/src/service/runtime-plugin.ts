import { loadServiceClient } from './client';
import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import {
  registerBridgeServices,
  registerBridgeServiceIngress,
  type BrowserBridgeServiceOptions,
} from './config';
export default function bridgeServicePlugin(
  options: BrowserBridgeServiceOptions,
): ModuleFederationRuntimePlugin {
  return {
    name: 'bridge-service',
    generatePreloadAssets: (async ({ preloadOptions, remoteSnapshot }) => {
      if (!('modules' in remoteSnapshot)) return;
      const exposes = preloadOptions.preloadConfig.exposes;
      if (
        exposes?.length &&
        exposes.every((expose) =>
          remoteSnapshot.modules.some(
            (item) =>
              (item.modulePath === expose ||
                item.moduleName === expose.replace(/^\.\//, '')) &&
              Object.prototype.hasOwnProperty.call(item, 'servicePath'),
          ),
        )
      )
        return { cssAssets: [], jsAssetsWithoutEntry: [], entryAssets: [] };
    }) as ModuleFederationRuntimePlugin['generatePreloadAssets'],
    beforeLoadRemote(match) {
      const snapshot = match.remoteSnapshot;
      const metadata =
        snapshot && 'modules' in snapshot
          ? snapshot.modules.find(
              (item) =>
                item.modulePath === match.expose ||
                item.moduleName === match.expose.replace(/^\.\//, ''),
            )
          : undefined;
      if (
        !metadata ||
        !Object.prototype.hasOwnProperty.call(metadata, 'servicePath')
      )
        return;
      // Discover Service identity without evaluating a stale client application.
      // CSR-only mounts use this lazy fallback. SSR mounts load from the stream.
      const module = {
        default: async () => {
          const selected = await loadServiceClient(
            {
              name: match.remote.name,
              expose: match.expose,
              snapshot: snapshot!,
            },
            match.origin,
          );
          const provider = selected.factory();
          const destroy = provider.destroy.bind(provider);
          provider.destroy = async (info) => {
            try {
              await destroy(info);
            } finally {
              selected.release();
            }
          };
          return provider;
        },
      };
      Object.defineProperty(module, '__esModule', { value: true });
      return { factory: () => module };
    },
    apply(instance) {
      registerBridgeServices(instance, options.services || {});
      registerBridgeServiceIngress(instance, options.ingressPath);
    },
  };
}
