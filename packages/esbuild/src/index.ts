/**
 * @module-federation/esbuild
 *
 * Main entry point for the Module Federation esbuild plugin.
 * Re-exports the plugin and configuration utilities.
 */

// Plugin
export { moduleFederationPlugin } from './adapters/lib/plugin';

// Configuration utilities
export { withFederation } from './lib/config/with-native-federation';
export {
  share,
  shareAll,
  findPackageJson,
  lookupVersion,
  setInferVersion,
} from './lib/config/share-utils';

// Config context
export {
  useWorkspace,
  usePackageJson,
  getConfigContext,
} from './lib/config/configuration-context';

// Types
export type {
  FederationConfig,
  SharedConfig,
  NormalizedSharedConfig,
  NormalizedFederationConfig,
  NormalizedRemoteConfig,
} from './lib/config/federation-config';

// Core utilities
export { getExternals } from './lib/core/get-externals';
export { loadFederationConfig } from './lib/core/load-federation-config';
export { setLogLevel, logger } from './lib/utils/logger';
