import type { ModuleFederation } from '@module-federation/enhanced/runtime';

/** Request policy is private Host configuration, separate from public discovery. */
export interface BridgeServicePolicy {
  timeoutMs?: number;
  /** Business request headers allowed to reach application loaders. */
  forwardHeaders?: string[];
  /** Service-to-service authentication, separate from business request headers. */
  serviceHeaders?: Record<string, string>;
}
export type BridgeServiceBinding = BridgeServicePolicy;
export type BridgeServices = Record<string, BridgeServicePolicy>;
export type BrowserBridgeServices = Record<
  string,
  Pick<BridgeServicePolicy, 'timeoutMs'>
>;
export interface BrowserBridgeServiceOptions {
  /** A same-origin path prefix. The resolved module ID is appended as one segment. */
  ingressPath: string;
  services?: BrowserBridgeServices;
}
// ESM and CJS runtime plugins can coexist in one bundler compilation. Bind
// request configuration to the actual runtime instance across both formats.
const bindings = Symbol.for('module-federation/bridge-services');
const ingress = Symbol.for('module-federation/bridge-service-ingress');
type ServiceRuntime = ModuleFederation & {
  [bindings]?: BridgeServices;
  [ingress]?: string;
};
export function registerBridgeServices(
  instance: ModuleFederation,
  services: BridgeServices,
) {
  Object.defineProperty(instance, bindings, {
    value: services,
    configurable: true,
  });
}
export function registerBridgeServiceIngress(
  instance: ModuleFederation,
  path: string,
) {
  if (!path.startsWith('/') || path.startsWith('//') || /[?#\\]/.test(path))
    throw Error('Service ingress must be a same-origin path prefix.');
  Object.defineProperty(instance, ingress, {
    value: path.endsWith('/') ? path : `${path}/`,
    configurable: true,
  });
}
export function getBridgeServiceIngress(
  instance: ModuleFederation,
  id: string,
) {
  const path = (instance as ServiceRuntime)[ingress];
  return path && `${path}${encodeURIComponent(id)}`;
}
export function getBridgeService(instance: ModuleFederation, id: string) {
  const services = (instance as ServiceRuntime)[bindings];
  const remote = instance.options.remotes.find(
    (remote) =>
      id === remote.name ||
      id.startsWith(`${remote.name}/`) ||
      (remote.alias &&
        (id === remote.alias || id.startsWith(`${remote.alias}/`))),
  );
  if (!remote) return { ...services?.[id], moduleName: id };
  const expose = id.slice(
    (id === remote.name || id.startsWith(`${remote.name}/`)
      ? remote.name
      : remote.alias!
    ).length,
  );
  const canonical = remote.name + expose;
  const alias = (remote.alias || remote.name) + expose;
  return {
    ...(services?.[id] || services?.[alias] || services?.[canonical]),
    moduleName: alias,
  };
}
export interface BrowserServiceRequest {
  moduleName: string;
  url: string;
  buildVersion: string;
  timeoutMs?: number;
}
