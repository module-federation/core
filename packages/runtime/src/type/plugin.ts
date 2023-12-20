import { FederationHost } from '../core';
import { Module } from '../module';
import { SnapshotHandler } from '../plugins/snapshot/SnapshotHandler';

type CoreLifeCycle = FederationHost['hooks']['lifecycle'];
type CoreLifeCyclePartial = Partial<{
  [k in keyof CoreLifeCycle]: Parameters<CoreLifeCycle[k]['on']>[0];
}>;

type SnapshotLifeCycle = SnapshotHandler['hooks']['lifecycle'];
type SnapshotLifeCycleCyclePartial = Partial<{
  [k in keyof SnapshotLifeCycle]: Parameters<SnapshotLifeCycle[k]['on']>[0];
}>;

type ModuleLifeCycle = Module['loaderHook']['lifecycle'];
type ModuleLifeCycleCyclePartial = Partial<{
  [k in keyof ModuleLifeCycle]: Parameters<ModuleLifeCycle[k]['on']>[0];
}>;

export type FederationRuntimePlugin = CoreLifeCyclePartial &
  SnapshotLifeCycleCyclePartial &
  ModuleLifeCycleCyclePartial & {
    name: string;
    version?: string;
  };
