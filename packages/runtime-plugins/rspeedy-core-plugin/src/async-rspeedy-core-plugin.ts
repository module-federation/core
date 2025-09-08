import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import type { 
  ModuleFederationContainer 
} from './types';
import { loadScriptAsync, validateContainer } from './utils';

/**
 * Async version of the Rspeedy Core Plugin that uses loadScriptAsync
 * instead of the synchronous loadScript method
 */
const AsyncRspeedyCorePlugin: () => ModuleFederationRuntimePlugin = () => ({
  name: 'rspeedy-core-plugin-async',
  loadEntry: async ({ remoteInfo }: any) => {
    const { entry, entryGlobalName } = remoteInfo;

    try {
      // Use async script loading
      const bundleResult = await loadScriptAsync(entry);
      
      if (!bundleResult || typeof bundleResult.init !== 'function') {
        throw new Error(`Failed to load remote entry: ${entryGlobalName}`);
      }

      // Initialize the bundle with the required Lynx context
      const nativeApp = (globalThis as any).nativeApp;
      const initialized = bundleResult.init({ tt: nativeApp });
      
      // Validate that we have a proper Module Federation container
      validateContainer(initialized, entryGlobalName);

      // Return the container for module federation
      return initialized as any;
    } catch (error) {
      console.error(`Failed to load remote entry: ${entryGlobalName}`, error);
      throw error;
    }
  },
  generatePreloadAssets: async () => {
    return Promise.resolve({
      cssAssets: [],
      jsAssetsWithoutEntry: [],
      entryAssets: [],
    });
  },
});

export default AsyncRspeedyCorePlugin;