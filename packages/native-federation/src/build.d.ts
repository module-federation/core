export { NormalizedFederationConfig } from './lib/config/federation-config';
export { FederationOptions } from './lib/core/federation-options';
export { setBuildAdapter } from './lib/core/build-adapter';
export { writeImportMap } from './lib/core/write-import-map';
export { writeFederationInfo } from './lib/core/write-federation-info';
export { getExternals } from './lib/core/get-externals';
export { loadFederationConfig } from './lib/core/load-federation-config';
export { MappedPath } from './lib/utils/mapped-paths';
export {
  BuildAdapter,
  BuildAdapterOptions,
  BuildResult,
  BuildKind,
} from './lib/core/build-adapter';
export { withNativeFederation } from './lib/config/with-native-federation';
export { buildForFederation } from './lib/core/build-for-federation';
export { bundleExposedAndMappings } from './lib/core/bundle-exposed-and-mappings';
export {
  share,
  shareAll,
  findRootTsConfigJson,
} from './lib/config/share-utils';
export {
  federationBuilder,
  BuildHelperParams,
} from './lib/core/federation-builder';
export { logger, setLogLevel } from './lib/utils/logger';
export { hashFile } from './lib/utils/hash-file';
export * from './lib/utils/build-result-map';
