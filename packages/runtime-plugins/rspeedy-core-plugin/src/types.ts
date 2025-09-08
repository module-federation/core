/**
 * Lynx runtime types for Module Federation integration
 */

export interface NativeTTObject {
  // Add specific Lynx TT object properties as needed
  [key: string]: any;
}

export interface BundleInitReturnObj {
  /**
   * Bundle initialization function that takes Lynx context
   */
  init: (opt: { tt: NativeTTObject }) => unknown;
  /**
   * Optional build version information
   */
  buildVersion?: string;
}

export interface LynxNativeApp {
  /**
   * Synchronously load a script and return the bundle initialization object
   */
  loadScript: (sourceURL: string) => BundleInitReturnObj;
  
  /**
   * Asynchronously load a script with a callback
   */
  loadScriptAsync: (
    sourceURL: string,
    callback: (message: string | null, exports?: BundleInitReturnObj) => void
  ) => void;

  // Other native app properties (not needed for module federation)
  [key: string]: any;
}

export interface LynxGlobalThis {
  /**
   * Lynx native app instance providing script loading capabilities
   */
  nativeApp?: LynxNativeApp;
}

export interface ModuleFederationContainer {
  /**
   * Initialize the container with shared modules
   */
  init?: (shareScope?: any) => Promise<void> | void;
  
  /**
   * Get a module from the container
   */
  get?: (module: string) => Promise<() => any> | (() => any);
  
  [key: string]: any;
}