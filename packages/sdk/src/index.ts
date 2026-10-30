export * from './constant';
export * from './types';
export * from './utils';
export {
  generateSnapshotFromManifest,
  isManifestProvider,
  simpleJoinRemoteEntry,
  inferAutoPublicPath,
  getManifestFileName,
} from './generateSnapshotFromManifest';
export {
  logger,
  infrastructureLogger,
  createLogger,
  createInfrastructureLogger,
  bindLoggerToCompiler,
} from './logger';
export type { Logger, InfrastructureLogger } from './logger';
export * from './env';
export * from './dom';
export * from './node';
export * from './normalizeOptions';
export { createModuleFederationConfig } from './createModuleFederationConfig';

/** Canonical registry extended by generated declarations without extra imports. */
declare global {
  // Global augmentation avoids a direct SDK dependency in generated host types.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ModuleFederation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging registry
    interface RemoteModuleMap {}
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- allow SDK module augmentation too
export interface RemoteModuleMap extends ModuleFederation.RemoteModuleMap {}
