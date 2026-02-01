import { TaggedError } from '@module-federation/micro-effect';

// RUNTIME_001 — Remote entry not found in global scope after script load
export interface RemoteEntryNotFound {
  readonly remoteName: string;
  readonly remoteEntryUrl: string;
  readonly remoteEntryKey: string;
}
export class RemoteEntryNotFound extends TaggedError('RemoteEntryNotFound') {}

// RUNTIME_002 — Remote entry has no init function
export interface RemoteEntryNoInit {
  readonly hostName: string;
  readonly remoteName: string;
  readonly remoteEntryUrl: string;
  readonly remoteEntryKey: string;
}
export class RemoteEntryNoInit extends TaggedError('RemoteEntryNoInit') {}

// RUNTIME_003 — Manifest load failed
export interface ManifestLoadFailed {
  readonly hostName: string;
  readonly remoteUrl: string;
}
export class ManifestLoadFailed extends TaggedError('ManifestLoadFailed') {}

// RUNTIME_004 — Remote not found in host remotes config
export interface RemoteNotFound {
  readonly hostName: string;
  readonly requestId: string;
}
export class RemoteNotFound extends TaggedError('RemoteNotFound') {}

// RUNTIME_005, RUNTIME_006 — Share sync invalid (build vs runtime)
export interface ShareSyncInvalid {
  readonly hostName: string;
  readonly sharedPkgName: string;
  readonly from: 'build' | 'runtime';
}
export class ShareSyncInvalid extends TaggedError('ShareSyncInvalid') {}

// RUNTIME_007 — Snapshot load failed
export interface SnapshotLoadFailed {
  readonly hostName: string;
  readonly remoteUrl: string;
}
export class SnapshotLoadFailed extends TaggedError('SnapshotLoadFailed') {}

// RUNTIME_008 — Script/entry load failed
export interface ScriptLoadFailed {
  readonly remoteName: string;
  readonly resourceUrl: string;
}
export class ScriptLoadFailed extends TaggedError('ScriptLoadFailed') {}

// RUNTIME_009 — Instance not created
export class InstanceNotCreated extends TaggedError('InstanceNotCreated') {}

// Union type for all runtime errors
export type RuntimeError =
  | RemoteEntryNotFound
  | RemoteEntryNoInit
  | ManifestLoadFailed
  | RemoteNotFound
  | ShareSyncInvalid
  | SnapshotLoadFailed
  | ScriptLoadFailed
  | InstanceNotCreated;
