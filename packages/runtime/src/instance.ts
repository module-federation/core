import {
  setGlobalFederationInstance,
  type FederationKernel,
  type UserOptions,
} from '@module-federation/runtime-core/kernel';
import { getGlobalFederationInstance, isMatchingInstance } from './utils';

// The instance this bundle's init created or adopted, shared by the public API and ./compose.
export let current: FederationKernel | null = null;

export function createInstance<T extends FederationKernel>(
  options: UserOptions,
  construct: (options: UserOptions) => T,
): T {
  const instance = construct({
    id: `${options.name}@${options.version || Date.now()}`,
    ...options,
  });
  setGlobalFederationInstance(instance);
  return instance;
}

export function initInstance<T extends FederationKernel>(
  options: UserOptions,
  construct: (options: UserOptions) => T,
): T {
  const { name, version } = options;
  const instance =
    current && isMatchingInstance(current, name, version)
      ? current
      : getGlobalFederationInstance(name, version);
  const normalizedOptions = { ...options, id: options.id || '' };
  if (!instance) {
    return (current = createInstance(normalizedOptions, construct));
  }
  instance.initOptions(normalizedOptions);
  if (!current) {
    current = instance;
  }
  return instance as T;
}
