import type { ModuleFederation } from '@module-federation/runtime';
import type { Remote } from '@module-federation/runtime/types';

export {
  clearContainerCache,
  planRemoteCache,
} from '@module-federation/webpack-bundler-runtime/clear-cache';

export const nodeLifecycleKey = Symbol.for('module-federation.node.lifecycle');
export const loadTrackerKey = Symbol.for('module-federation.node.load-tracker');
export const updatingKey = Symbol.for('module-federation.node.updating');

export interface NodeInstanceLifecycle {
  readonly closed: boolean;
  destroy(): Promise<void>;
  updateRemotes(remotes: Remote[]): Promise<void>;
  removeRemote(remote: Remote | string): Promise<void>;
}

/** Return the optional lifecycle installed by the Node runtime plugin. */
export function getNodeInstanceLifecycle(
  instance: ModuleFederation,
): NodeInstanceLifecycle | undefined {
  return (instance as any)[nodeLifecycleKey];
}

function requireLifecycle(
  instance: ModuleFederation,
  method: string,
): NodeInstanceLifecycle {
  const lifecycle = getNodeInstanceLifecycle(instance);
  if (!lifecycle)
    throw new Error(
      `MF instance ${instance.name} has no Node lifecycle. Install @module-federation/node/runtimePlugin before using ${method}.`,
    );
  return lifecycle;
}

/** The application must stop admitting requests and drain its own work first. */
export function destroyNodeInstance(instance: ModuleFederation): Promise<void> {
  try {
    return requireLifecycle(instance, 'destroyNodeInstance').destroy();
  } catch (error) {
    return Promise.reject(error);
  }
}

export function updateNodeRemotes(
  instance: ModuleFederation,
  remotes: Remote[],
): Promise<void> {
  try {
    return requireLifecycle(instance, 'updateNodeRemotes').updateRemotes(
      remotes,
    );
  } catch (error) {
    return Promise.reject(error);
  }
}

export function removeNodeRemote(
  instance: ModuleFederation,
  remote: Remote | string,
): Promise<void> {
  try {
    return requireLifecycle(instance, 'removeNodeRemote').removeRemote(remote);
  } catch (error) {
    return Promise.reject(error);
  }
}
