import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import type { BridgeProviderInstance } from '../types';
import {
  getBridgeService,
  registerBridgeServices,
  type BridgeServices,
} from './config';
import { fetchBridgeService } from './fetch';

/** Only module descriptions are shared. Every render owns a new HTTP session. */
export default function bridgeServicePlugin(
  services: BridgeServices,
): ModuleFederationRuntimePlugin {
  const modules = new Map<string, { default: () => BridgeProviderInstance }>();
  return {
    name: 'bridge-service',
    init({ options }) {
      if (
        Object.keys(services).length &&
        (options.shareStrategy !== 'loaded-first' ||
          Object.values(options.shared).some((entries) =>
            entries.some((shared) => shared.strategy === 'version-first'),
          ))
      )
        throw Error(
          'Service App requires loaded-first sharing. version-first eagerly loads Node containers before expose selection.',
        );
    },
    apply(instance) {
      if (
        Object.keys(services).length &&
        (instance.options.shareStrategy === 'version-first' ||
          Object.values(instance.options.shared).some((entries) =>
            entries.some((shared) => shared.strategy === 'version-first'),
          ))
      )
        throw Error(
          'Service App requires loaded-first sharing. version-first eagerly loads Node containers before expose selection.',
        );
      registerBridgeServices(instance, services);
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
      if (!metadata?.isService) return;
      if (metadata.render !== 'bridge')
        throw Error(
          `Service '${id}' must declare the Bridge rendering protocol.`,
        );
      const binding = getBridgeService(origin, id);
      if (!binding)
        throw Error(`Service '${id}' has no configured deployment binding.`);
      const buildVersion = snapshot?.buildVersion;
      if (!buildVersion) throw Error(`Service '${id}' has no build identity.`);
      const key = JSON.stringify([
        match.remote.name,
        expose,
        match.remoteInfo.entry,
        buildVersion,
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
                { ...binding, buildVersion },
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
