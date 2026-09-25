import {
  ModuleFederation as KernelModuleFederation,
  type Capabilities,
  getGlobalFederationConstructor,
  setGlobalFederationInstance,
} from '@module-federation/runtime-core/kernel';
import { getGlobalFederationInstance } from './utils';

// The one instance slot shared by the public API and ./compose.
let current: any = null;

export const getCurrentInstance = (): any => current;

export function createInstance(
  options: any,
  capabilities?: Capabilities,
  Ctor: any = KernelModuleFederation,
): any {
  const C: any = getGlobalFederationConstructor() || Ctor;
  const instance = new C(
    { id: `${options.name}@${options.version || Date.now()}`, ...options },
    capabilities,
  );
  setGlobalFederationInstance(instance);
  return instance;
}

export function initInstance(
  options: any,
  capabilities?: Capabilities,
  Ctor?: any,
): any {
  const instance = getGlobalFederationInstance(options.name, options.version);
  const normalizedOptions = { ...options, id: options.id || '' };
  if (!instance) {
    current = createInstance(normalizedOptions, capabilities, Ctor);
    return current;
  }
  instance.initOptions(normalizedOptions);
  if (!current) {
    current = instance;
  }
  return instance;
}
