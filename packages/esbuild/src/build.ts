/**
 * @module-federation/esbuild/build
 *
 * Build-time configuration utilities for Module Federation.
 * Use withFederation() to normalize your federation config before
 * passing it to moduleFederationPlugin().
 */

export { withFederation } from './lib/config/with-native-federation';
export {
  share,
  shareAll,
  findPackageJson,
  findRootTsConfigJson,
  lookupVersion,
  setInferVersion,
} from './lib/config/share-utils';
export { getExternals } from './lib/core/get-externals';
export { loadFederationConfig } from './lib/core/load-federation-config';
export { setLogLevel, logger } from './lib/utils/logger';

// Types
export type {
  FederationConfig,
  SharedConfig,
  NormalizedSharedConfig,
  NormalizedFederationConfig,
} from './lib/config/federation-config';
