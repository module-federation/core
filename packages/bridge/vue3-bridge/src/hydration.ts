import { inject, type App, type InjectionKey } from 'vue';
import type { BridgeHydrationRegistry } from '@module-federation/bridge-shared';

export const BridgeHydrationRegistryKey: InjectionKey<BridgeHydrationRegistry> =
  Symbol.for('mf.bridge.hydration-registry');

export function provideBridgeHydrationRegistry(
  app: App,
  registry: BridgeHydrationRegistry,
) {
  app.provide(BridgeHydrationRegistryKey, registry);
  return app;
}

export function useBridgeHydrationRegistry() {
  return inject(BridgeHydrationRegistryKey, undefined);
}
