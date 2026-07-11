import { ModuleFederation } from '../core';
import { Module } from '../module';
import { SnapshotHandler } from '../plugins/snapshot/SnapshotHandler';
import { SharedHandler } from '../shared';
import { RemoteHandler } from '../remote';

type CoreLifeCycle = ModuleFederation['hooks']['lifecycle'];
type CoreLifeCyclePartial = Partial<{
  [k in keyof CoreLifeCycle]: Parameters<CoreLifeCycle[k]['on']>[0];
}>;

type SnapshotLifeCycle = SnapshotHandler['hooks']['lifecycle'];
type SnapshotLifeCycleCyclePartial = Partial<{
  [k in keyof SnapshotLifeCycle]: Parameters<SnapshotLifeCycle[k]['on']>[0];
}>;

type ModuleLifeCycle = Module['host']['loaderHook']['lifecycle'];
type ModuleLifeCycleCyclePartial = Partial<{
  [k in keyof ModuleLifeCycle]: Parameters<ModuleLifeCycle[k]['on']>[0];
}>;

type ModuleBridgeLifeCycle = Module['host']['bridgeHook']['lifecycle'];
type ModuleBridgeLifeCycleCyclePartial = Partial<{
  [k in keyof ModuleBridgeLifeCycle]: Parameters<
    ModuleBridgeLifeCycle[k]['on']
  >[0];
}>;

type SharedLifeCycle = SharedHandler['hooks']['lifecycle'];
type SharedLifeCycleCyclePartial = Partial<{
  [k in keyof SharedLifeCycle]: Parameters<SharedLifeCycle[k]['on']>[0];
}>;

type RemoteLifeCycle = RemoteHandler['hooks']['lifecycle'];
type RemoteLifeCycleCyclePartial = Partial<{
  [k in keyof RemoteLifeCycle]: Parameters<RemoteLifeCycle[k]['on']>[0];
}>;

export type ApplicationLifecycleScope =
  | 'installation'
  | 'realm'
  | 'contribution'
  | 'mount';

export interface ApplicationLifecycleTransition {
  transitionId: string;
  lifecycleEpoch: number;
  scope: ApplicationLifecycleScope;
  reason: string;
  force: boolean;
  deadline?: number;
  signal?: AbortSignal;
  context?: Readonly<Record<string, unknown>>;
  origin: ModuleFederation;
}

export interface PauseTransitionContext extends ApplicationLifecycleTransition {
  checkpointReference?: string;
}

export interface ResumeTransitionContext extends ApplicationLifecycleTransition {
  checkpointReference?: string;
}

export interface LifecycleDecision {
  delayMs?: number;
}

export interface PauseCommittedEvent extends ApplicationLifecycleTransition {
  committedAt: number;
  checkpointReference?: string;
}

export interface ResumeCommittedEvent extends ApplicationLifecycleTransition {
  committedAt: number;
}

export type ApplicationLifecyclePhase =
  | 'prePause'
  | 'pause'
  | 'preResume'
  | 'resume';

export interface LifecycleTransitionError {
  phase: ApplicationLifecyclePhase;
  transition: ApplicationLifecycleTransition;
  error: unknown;
}

type ApplicationLifeCycle = ModuleFederation['applicationHook']['lifecycle'];
type ApplicationLifeCyclePartial = Partial<{
  [k in keyof ApplicationLifeCycle]: Parameters<
    ApplicationLifeCycle[k]['on']
  >[0];
}>;

export type ModuleFederationRuntimePlugin = CoreLifeCyclePartial &
  SnapshotLifeCycleCyclePartial &
  SharedLifeCycleCyclePartial &
  RemoteLifeCycleCyclePartial &
  ModuleLifeCycleCyclePartial &
  ModuleBridgeLifeCycleCyclePartial &
  ApplicationLifeCyclePartial & {
    name: string;
    version?: string;
    apply?: (instance: ModuleFederation) => void;
  };
