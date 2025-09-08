import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import type { 
  LynxNativeApp, 
  BundleInitReturnObj, 
  LynxGlobalThis, 
  ModuleFederationContainer 
} from './types';
import { getLynxNativeApp, validateContainer, loadScriptAsync } from './utils';

declare const globalThis: LynxGlobalThis;

const RspeedyCorePlugin: () => ModuleFederationRuntimePlugin = () => ({
  name: 'rspeedy-core-plugin',
  loadEntry: async ({ remoteInfo }: any) => {
    const { entry, entryGlobalName } = remoteInfo;

    try {
      // Get the Lynx nativeApp (throws if not available)
      const nativeApp = getLynxNativeApp();

      // Use Lynx's native script loading mechanism
      const bundleResult = nativeApp.loadScript(entry);
      
      if (!bundleResult || typeof bundleResult.init !== 'function') {
        throw new Error(`Failed to load remote entry: ${entryGlobalName}`);
      }

      // Initialize the bundle with the required Lynx context
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
    // Lynx doesn't need preload assets in the traditional sense
    // since it handles script loading through its native mechanism
    return Promise.resolve({
      cssAssets: [],
      jsAssetsWithoutEntry: [],
      entryAssets: [],
    });
  },
});

export default RspeedyCorePlugin;