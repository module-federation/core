import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import type { BridgeProviderInstance } from '../types';
import { getServiceUrl } from '@module-federation/sdk';
import {
  getBridgeService,
  registerBridgeServices,
  type BridgeServices,
} from './config';
import { fetchBridgeService } from './fetch';

/** Only module descriptions are shared. Every render owns a new HTTP session. */
export default function bridgeServicePlugin(
  services: BridgeServices = {},
): ModuleFederationRuntimePlugin {
  const modules = new Map<string, { default: () => BridgeProviderInstance }>();
  const checkSharing = (
    options: Parameters<
      NonNullable<ModuleFederationRuntimePlugin['init']>
    >[0]['options'],
  ) => {
    if (
      options.shareStrategy !== 'loaded-first' ||
      Object.values(options.shared).some((entries) =>
        entries.some((shared) => shared.strategy === 'version-first'),
      )
    )
      throw Error(
        'Service App requires loaded-first sharing. version-first eagerly loads Node containers before expose selection.',
      );
  };
  return {
    name: 'bridge-service',
    apply(instance) {
      registerBridgeServices(instance, services);
    },
    afterResolve(match) {
      const snapshot = match.remoteSnapshot;
      // Shared discovery resolves a whole remote before calling getEntry. A
      // mixed remote containing any Service cannot participate in version-first.
      if (
        snapshot &&
        'modules' in snapshot &&
        snapshot.modules.some((item) =>
          Object.prototype.hasOwnProperty.call(item, 'servicePath'),
        )
      )
        checkSharing(match.options);
      return match;
    },
    beforeLoadRemote(match) {
      const { remoteSnapshot: snapshot, expose, origin, id } = match;
      const metadata =
        snapshot && 'modules' in snapshot
          ? snapshot.modules.find(
              (item) =>
                item.modulePath === expose ||
                item.moduleName === expose.replace(/^\.\//, ''),
            )
          : undefined;
      if (
        !metadata ||
        !Object.prototype.hasOwnProperty.call(metadata, 'servicePath')
      )
        return;
      checkSharing(origin.options);
      if (metadata.render !== 'bridge')
        throw Error(
          `Service '${id}' must declare the Bridge rendering protocol.`,
        );
      const binding = getBridgeService(origin, id);
      const url = getServiceUrl(
        snapshot && 'serviceBaseUrl' in snapshot
          ? snapshot.serviceBaseUrl
          : undefined,
        metadata.servicePath!,
      );
      const buildVersion = snapshot?.buildVersion;
      if (!buildVersion) throw Error(`Service '${id}' has no build identity.`);
      const key = JSON.stringify([
        match.remote.name,
        expose,
        match.remoteInfo.entry,
        buildVersion,
        url,
        binding,
      ]);
      let module = modules.get(key);
      if (!module) {
        module = {
          default: () => ({
            render() {
              throw Error('A Service SSR provider cannot render into a DOM.');
            },
            destroy() {},
            renderStream(info) {
              const headers: Record<string, string> = {};
              for (const name of binding.forwardHeaders || []) {
                const value = new Headers(info.headers).get(name);
                if (value !== null) headers[name.toLowerCase()] = value;
              }
              return fetchBridgeService(
                { ...info, moduleName: binding.moduleName, headers },
                { ...binding, url, buildVersion },
              );
            },
          }),
        };
        // Match a compiled ESM namespace so static MF default imports select
        // the provider rather than the namespace object itself.
        Object.defineProperty(module, '__esModule', { value: true });
        modules.set(key, module);
      }
      return { factory: () => module };
    },
  };
}
