import type { ModuleFederation } from '@module-federation/enhanced/runtime';

/** Browser bindings contain only a same-origin ingress, never upstream credentials. */
export interface BridgeServiceBinding {
  url: string;
  timeoutMs?: number;
  /** Business request headers allowed to reach application loaders. */
  forwardHeaders?: string[];
  /** Service-to-service authentication, separate from business request headers. */
  serviceHeaders?: Record<string, string>;
}
export type BridgeServices = Record<string, BridgeServiceBinding>;
export type BrowserBridgeServices = Record<
  string,
  Pick<BridgeServiceBinding, 'url' | 'timeoutMs'>
>;
// ESM and CJS runtime plugins can coexist in one bundler compilation. Bind
// deployment configuration to the actual runtime instance across both formats.
const bindings = Symbol.for('module-federation/bridge-services');
type ServiceRuntime = ModuleFederation & { [bindings]?: BridgeServices };
export function registerBridgeServices(
  instance: ModuleFederation,
  services: BridgeServices,
) {
  Object.defineProperty(instance, bindings, {
    value: services,
    configurable: true,
  });
}
export function getBridgeService(
  instance: ModuleFederation | null | undefined,
  id: string,
) {
  if (!instance) return;
  const services = (instance as ServiceRuntime)[bindings];
  if (services?.[id]) return { ...services[id], moduleName: id };
  const remote = instance.options.remotes.find(
    (remote) =>
      id.startsWith(`${remote.name}/`) ||
      (remote.alias && id.startsWith(`${remote.alias}/`)),
  );
  if (!remote) return;
  const expose = id.slice(
    (id.startsWith(`${remote.name}/`) ? remote.name : remote.alias!).length,
  );
  const key = services?.[remote.name + expose]
    ? remote.name + expose
    : remote.alias
      ? remote.alias + expose
      : undefined;
  return key && services?.[key]
    ? { ...services[key], moduleName: key }
    : undefined;
}
export interface BrowserServiceRequest {
  moduleName: string;
  url: string;
  buildVersion: string;
  timeoutMs?: number;
}
