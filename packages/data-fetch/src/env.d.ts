import type { ModuleFederation } from '@module-federation/runtime';

declare global {
  var __FEDERATION__: {
    moduleInfo?: unknown;
    __INSTANCES__: ModuleFederation[];
  };
}
