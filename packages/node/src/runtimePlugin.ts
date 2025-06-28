import type { FederationRuntimePlugin } from '@module-federation/runtime';
import { initializeFederationChunkLoading } from './utils/node-chunk-loader';
import { initializeHMRRuntimePatchingFromArgs } from './utils/hmr-runtime-patch';

/**
 * Creates a Node.js Federation runtime plugin that patches webpack chunk loading and HMR runtime
 * @returns FederationRuntimePlugin instance
 */
export default function (): FederationRuntimePlugin {
  return {
    name: 'node-federation-plugin',
    beforeInit(args) {
      try {
        // Initialize federation chunk loading
        initializeFederationChunkLoading(args);

        // Initialize HMR runtime patching for hot module replacement
        initializeHMRRuntimePatchingFromArgs(args);

        return args;
      } catch (error) {
        console.error('Failed to initialize node-federation-plugin:', error);
        return args;
      }
    },
  };
}
