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
    apply(instance) {
      registerBridgeServices(instance, options.services || {});
      registerBridgeServiceIngress(instance, options.ingressPath);
    },
  };
}
