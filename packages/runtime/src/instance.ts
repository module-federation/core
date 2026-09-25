import {
  setGlobalFederationInstance,
  type ModuleFederation,
  type UserOptions,
} from '@module-federation/runtime-core/kernel';
import { getGlobalFederationInstance } from './utils';

export let bundleInstance: ModuleFederation | null = null;

export function createInstance<T extends ModuleFederation>(
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

export function initInstance<T extends ModuleFederation>(
  options: UserOptions,
  construct: (options: UserOptions) => T,
): T {
  const instance = getGlobalFederationInstance(
    options.name,
    options.version,
    bundleInstance,
  );
  const normalizedOptions = { ...options, id: options.id || '' };
  if (!instance) {
    return (bundleInstance = createInstance(normalizedOptions, construct));
  }
  instance.initOptions(normalizedOptions);
  if (!bundleInstance) {
    bundleInstance = instance;
  }
  return instance as T;
}
