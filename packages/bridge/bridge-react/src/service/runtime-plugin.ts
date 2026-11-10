import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import { registerBridgeServices, type BrowserBridgeServices } from './config';
export default function bridgeServicePlugin(
  services: BrowserBridgeServices,
): ModuleFederationRuntimePlugin {
  return {
    name: 'bridge-service',
    apply(instance) {
      registerBridgeServices(instance, services);
    },
  };
}
