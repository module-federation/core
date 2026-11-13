import type { ModuleFederation } from '@module-federation/runtime';

// The caller and the installed plugin can come from different server bundles.
export const nodeLifecycleKey = Symbol.for('module-federation.node.lifecycle');

export interface NodeInstanceLifecycle {
  /** True from the first destroy attempt, including while draining or retrying. */
  readonly closed: boolean;
  /** Drain MF operations and release this instance's owned resources. */
  destroy(): Promise<void>;
}

type ManagedInstance = ModuleFederation & {
  [nodeLifecycleKey]?: NodeInstanceLifecycle;
};

/** Return the optional lifecycle installed by the Node runtime plugin. */
export function getNodeInstanceLifecycle(
  instance: ModuleFederation,
): NodeInstanceLifecycle | undefined {
  return (instance as ManagedInstance)[nodeLifecycleKey];
}

/** The application must stop admitting requests and drain its own work first. */
export function destroyNodeInstance(instance: ModuleFederation): Promise<void> {
  const lifecycle = getNodeInstanceLifecycle(instance);
  if (!lifecycle) {
    return Promise.reject(
      new Error(
        `MF instance ${instance.name} has no Node lifecycle. Install @module-federation/node/runtimePlugin before using destroyNodeInstance.`,
      ),
    );
  }
  return lifecycle.destroy();
}
