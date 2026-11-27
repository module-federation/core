import type { GlobalModuleInfo, Manifest, ProviderModuleInfo } from '../types';

export type DeploymentChildrenConfig =
  | false
  | {
      source: string;
      deploymentId?: string;
    };

export interface DeploymentApplicationConfig {
  manifestUrl: string;
  route: string;
  expose: string;
  children?: DeploymentChildrenConfig;
  props?: Record<string, unknown>;
  /**
   * Optional rendering protocol hint for legacy producers whose manifest does
   * not emit `exposes[i].render` metadata (e.g. older Bridge/Vmok builds).
   */
  render?: 'bridge' | 'component';
}

export interface DeploymentConfig {
  consumer: string;
  consumerManifestUrl?: string;
  applications: DeploymentApplicationConfig[];
  remotes?: Record<string, string>;
  overrides?: Record<string, string>;
  sid?: string;
}

export interface DeploymentRemoteRoute {
  route: string;
  moduleName: string;
  expose: string;
  versionOrUrl: string;
  discoverChildren: boolean;
  props?: Record<string, unknown>;
  /** Optional rendering protocol hint for legacy producers lacking manifest render metadata. */
  render?: 'bridge' | 'component';
}

export interface DeploymentChildSource {
  source: string;
  deploymentId?: string;
  producerManifestUrl: string;
  moduleName: string;
  expose: string;
  route: string;
}

export interface DeploymentSnapshot {
  version: 1;
  consumer: string;
  consumerManifestUrl?: string;
  sid?: string;
  routes: DeploymentRemoteRoute[];
  moduleInfo: GlobalModuleInfo;
  sources: Record<string, DeploymentChildSource>;
  fixedChildren?: Record<string, DeploymentSnapshot>;
  /**
   * Pre-bundled dynamic child snapshots for full-delivery mode. Unlike
   * `fixedChildren`, these retain independent `sid` validation while avoiding
   * extra network requests on child discovery.
   */
  bundledChildren?: Record<string, DeploymentSnapshot>;
}

export interface ResolvedProducer {
  manifestUrl: string;
  moduleName: string;
  manifest: Manifest;
  snapshot: ProviderModuleInfo;
}

export interface ResolveManifestOptions {
  signal?: AbortSignal;
  loadManifest?: (url: string, signal?: AbortSignal) => Promise<Manifest>;
}

export type RemoteReferenceResolverResult =
  | string
  | {
      manifestUrl?: string;
      remoteEntry?: string;
      globalName?: string;
    };

export interface ComputeDeploymentSnapshotOptions {
  signal?: AbortSignal;
  loadManifest?: (url: string, signal?: AbortSignal) => Promise<Manifest>;
  resolveManifest?: (
    manifestUrl: string,
    options?: ResolveManifestOptions,
  ) => Promise<ResolvedProducer>;
  readDeployment?: DeploymentStore['read'];
  resolveRemote?: (input: {
    consumer: string;
    moduleName: string;
    reference: string;
    signal?: AbortSignal;
  }) => Promise<RemoteReferenceResolverResult>;
}

export interface DeploymentStoreReadInput {
  source: string;
  deploymentId?: string;
  signal?: AbortSignal;
}

export interface DeploymentStore {
  save(source: string, deployment: DeploymentSnapshot): Promise<string>;
  read(
    input: DeploymentStoreReadInput,
  ): Promise<DeploymentSnapshot | undefined>;
  activate(source: string, deploymentId: string): Promise<void>;
  list(
    source: string,
  ): Promise<Array<{ deploymentId: string; active: boolean; sid?: string }>>;
}

export interface DeploymentApplicationRef {
  moduleName: string;
  expose: string;
  versionOrUrl: string;
}

export interface DeploymentDiscoveryContext {
  consumer: DeploymentApplicationRef | null;
  pathname: string;
  search: string;
  basename: string;
  mountId: string;
  parentMountId?: string;
  transactionId?: string;
  signal?: AbortSignal;
}

export interface DeploymentClientOptions {
  rootSource: string;
  rootDeploymentId?: string;
  readDeployment: DeploymentStore['read'];
}

export interface DeploymentClientLifecycle {
  onCommit(transactionId: string): void;
  onDiscard(transactionId: string, reason?: unknown): void;
  dehydrate(): unknown;
  hydrate(state: unknown): void;
}

export interface DeploymentClient {
  getApplications(ctx: DeploymentDiscoveryContext): Promise<{
    routes: DeploymentRemoteRoute[];
    moduleInfo: GlobalModuleInfo;
  }>;
  readonly lifecycle: DeploymentClientLifecycle;
}
