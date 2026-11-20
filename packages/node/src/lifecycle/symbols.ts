import type { ModuleFederation } from '@module-federation/runtime';
import type { Remote } from '@module-federation/runtime/types';

export const nodeLifecycleKey = Symbol.for('module-federation.node.lifecycle');
export const loadTrackerKey = Symbol.for('module-federation.node.load-tracker');
export const updatingKey = Symbol.for('module-federation.node.updating');

export interface NodeInstanceLifecycle {
  readonly closed: boolean;
  destroy(): Promise<void>;
  updateRemotes(remotes: Remote[]): Promise<void>;
  removeRemote(remote: Remote | string): Promise<void>;
}

export type NodeFederation = ModuleFederation & {
  retainedProviders: Set<ModuleFederation>;
  updateRemotes(remotes: Remote[]): Promise<void>;
  removeRemote(remote: Remote | string): Promise<void>;
};
