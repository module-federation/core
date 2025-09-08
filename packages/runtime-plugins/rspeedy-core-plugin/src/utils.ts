import type { LynxGlobalThis } from './types';

declare const globalThis: LynxGlobalThis;

/**
 * Check if we're running in a Lynx environment
 */
export function isLynxEnvironment(): boolean {
  return typeof globalThis.nativeApp === 'object' && 
         globalThis.nativeApp !== null &&
         typeof globalThis.nativeApp.loadScript === 'function';
}

/**
 * Get the Lynx nativeApp instance
 */
export function getLynxNativeApp() {
  if (!isLynxEnvironment()) {
    throw new Error(
      'Not running in a Lynx environment. globalThis.nativeApp is not available.'
    );
  }
  return globalThis.nativeApp!;
}

/**
 * Create a promise-based wrapper for loadScriptAsync
 */
export function loadScriptAsync(sourceURL: string): Promise<any> {
  const nativeApp = getLynxNativeApp();
  
  return new Promise((resolve, reject) => {
    nativeApp.loadScriptAsync(sourceURL, (error, exports) => {
      if (error) {
        reject(new Error(`Failed to load script ${sourceURL}: ${error}`));
      } else if (!exports) {
        reject(new Error(`No exports returned from script: ${sourceURL}`));
      } else {
        resolve(exports);
      }
    });
  });
}

/**
 * Validate that a loaded object is a valid Module Federation container
 */
export function validateContainer(container: any, entryName: string): void {
  if (!container || typeof container !== 'object') {
    throw new Error(`Invalid container for ${entryName}: not an object`);
  }
  
  // Module Federation containers should have init and/or get methods
  if (typeof container.init !== 'function' && typeof container.get !== 'function') {
    throw new Error(
      `Invalid Module Federation container for ${entryName}: missing init/get methods`
    );
  }
}