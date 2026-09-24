export const RUNTIME_SELECTION_CONTRACT_VERSION = 1;

export const RUNTIME_SELECTION_SLOT = Symbol.for(
  'module-federation.runtime-selection.v1',
);

export const MEMBER_ROLES = [
  'runtime-tools',
  'runtime',
  'runtime-core',
  'bundler-runtime',
  'sdk',
] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

export type CapabilityName =
  | 'remote'
  | 'shared'
  | 'snapshotPlugins'
  | 'containerEntry';

export type CapabilityIntent = 'neutral' | 'required' | 'forbidden';

export type RuntimeTarget = 'web' | 'node' | 'worker' | 'universal';

export type ContractMode = 'conditions' | 'legacy-defines';

export type ExternalMode = 'bundled' | 'external-core';

export type SelectorLeaf = 'enabled' | 'disabled' | 'legacy';

export interface SelectorManifestEntry {
  ownerRole: MemberRole;
  disabledCondition?: string;
  leaves: Record<SelectorLeaf, string>;
}

export interface AllowedRequest {
  role: MemberRole;
  exportName: string;
}

export interface FamilyMemberTopology {
  role: MemberRole;
  packageName: string;
  dependsOn: readonly MemberRole[];
}

export interface FamilyMember {
  role: MemberRole;
  packageName: string;
  version: string;
  canonicalRoot: string;
  resolverVisibleRoots: readonly string[];
  entry: string;
  packageJsonPath: string;
}

export interface FamilyIdentity {
  compatibilityId: string;
  instanceId: string;
  members: Readonly<Record<MemberRole, FamilyMember>>;
}

export interface ResolvedRuntimeImplementation {
  anchor: string;
  mode: ContractMode;
  externalMode: ExternalMode;
  family: FamilyIdentity;
  facadeEntry: string;
  entryLoadingIdentity: string;
  allowedRequests: Readonly<Record<string, AllowedRequest>>;
  allowedEntries: Readonly<Record<string, string>>;
  selectors: Readonly<Record<string, SelectorManifestEntry>>;
}

export interface CapabilityProfile {
  remote: CapabilityIntent;
  shared: CapabilityIntent;
  snapshotPlugins: CapabilityIntent;
  containerEntry: CapabilityIntent;
  explicitTarget: Exclude<RuntimeTarget, 'universal'> | null;
  target: RuntimeTarget;
  externalMode: ExternalMode;
}

export interface ParticipantRequest {
  pluginName: string;
  name?: string;
  implementation?: string;
  remotes?: unknown;
  shared?: unknown;
  exposes?: unknown;
  runtimePlugins?: unknown;
  shareStrategy?: string;
  experiments?: {
    externalRuntime?: boolean;
    provideExternalRuntime?: boolean;
    optimization?: {
      disableRemote?: boolean;
      disableShared?: boolean;
      disableSnapshot?: boolean;
      target?: string | null;
    };
  };
}

export interface RuntimeSelectionState {
  version: 1;
  participants: ParticipantRequest[];
  finalized: boolean;
  image?: ResolvedRuntimeImplementation;
  profile?: CapabilityProfile;
}

export class RuntimeSelectionError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'RuntimeSelectionError';
    this.code = code;
  }
}
