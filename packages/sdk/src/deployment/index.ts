export {
  resolveManifest,
  computeDeploymentSnapshot,
  childSourceKey,
} from './computeSnapshot';
export {
  createDeploymentClient,
  createMemoryDeploymentStore,
  DeploymentSnapshotExpiredError,
  SNAPSHOT_EXPIRED_CODE,
} from './client';
export {
  createDiscoveryHandler,
  type DiscoveryHandlerOptions,
} from './handler';
export type {
  DeploymentChildrenConfig,
  DeploymentApplicationConfig,
  DeploymentConfig,
  DeploymentRemoteRoute,
  DeploymentChildSource,
  DeploymentSnapshot,
  ResolvedProducer,
  ResolveManifestOptions,
  RemoteReferenceResolverResult,
  ComputeDeploymentSnapshotOptions,
  DeploymentStoreReadInput,
  DeploymentStore,
  DeploymentApplicationRef,
  DeploymentDiscoveryContext,
  DeploymentClientOptions,
  DeploymentClientLifecycle,
  DeploymentClient,
} from './types';
