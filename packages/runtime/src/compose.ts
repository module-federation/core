import {
  FederationKernel,
  type Capabilities,
  type ModuleFederation,
  type UserOptions,
} from '@module-federation/runtime-core/kernel';
import { createInstance as createInstanceWith, initInstance } from './instance';

export type { Capabilities };

// The page registry and the bundle's instance slot are typed as the full
// ModuleFederation; a kernel is that class with some handlers disabled.
const kernelFactory =
  (capabilities: Capabilities) =>
  (options: UserOptions): ModuleFederation =>
    new FederationKernel(options, capabilities) as ModuleFederation;

export function createInstance(
  options: UserOptions,
  capabilities: Capabilities,
): FederationKernel {
  return createInstanceWith(options, kernelFactory(capabilities));
}

export function init(
  options: UserOptions,
  capabilities: Capabilities,
): FederationKernel {
  return initInstance(options, kernelFactory(capabilities));
}
