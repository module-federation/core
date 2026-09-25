import {
  FederationKernel,
  type Capabilities,
  type UserOptions,
} from '@module-federation/runtime-core/kernel';
import { createInstance as createInstanceWith, initInstance } from './instance';

export type { Capabilities };

export function createInstance(
  options: UserOptions,
  capabilities: Capabilities,
): FederationKernel {
  return createInstanceWith(
    options,
    (opts) => new FederationKernel(opts, capabilities),
  );
}

export function init(
  options: UserOptions,
  capabilities: Capabilities,
): FederationKernel {
  return initInstance(
    options,
    (opts) => new FederationKernel(opts, capabilities),
  );
}
