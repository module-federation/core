import { injectInMemoryHMRRuntime } from './custom-hmr-helpers';
import type { HMRWebpackRequire } from '../types/hmr';

/**
 * Patches webpack require with HMR runtime capabilities for Module Federation
 * This function integrates HMR functionality into the webpack runtime to support
 * hot module replacement in federation environments.
 *
 * @param args - Runtime initialization arguments from Module Federation
 */
export function initializeHMRRuntimePatching(args: any): void {
  try {
    // Check if we're in a webpack environment with __webpack_require__ available
    if (
      typeof globalThis !== 'undefined' &&
      '__webpack_require__' in globalThis
    ) {
      const webpackRequire = (globalThis as any)
        .__webpack_require__ as HMRWebpackRequire;

      if (typeof webpackRequire === 'function') {
        // Inject HMR runtime into webpack require
        injectInMemoryHMRRuntime(webpackRequire);

        console.log(
          '[HMR Runtime Plugin] Successfully patched webpack require with HMR capabilities',
        );
      } else {
        console.warn(
          '[HMR Runtime Plugin] __webpack_require__ is not a function, skipping HMR patch',
        );
      }
    } else {
      console.warn(
        '[HMR Runtime Plugin] __webpack_require__ not available, skipping HMR patch',
      );
    }
  } catch (error) {
    console.error(
      '[HMR Runtime Plugin] Failed to initialize HMR runtime patching:',
      error,
    );
  }
}

/**
 * Alternative approach to patch webpack require when it's available on the args
 * Some federation setups might provide webpack require through the args object
 *
 * @param args - Runtime initialization arguments that might contain webpack require
 */
export function initializeHMRRuntimePatchingFromArgs(args: any): void {
  try {
    // Check if webpack require is available in args
    const webpackRequire = args?.__webpack_require__ || args?.webpackRequire;

    if (webpackRequire && typeof webpackRequire === 'function') {
      injectInMemoryHMRRuntime(webpackRequire as HMRWebpackRequire);
      console.log(
        '[HMR Runtime Plugin] Successfully patched webpack require from args with HMR capabilities',
      );
      return;
    }

    // Fallback to global approach
    initializeHMRRuntimePatching(args);
  } catch (error) {
    console.error(
      '[HMR Runtime Plugin] Failed to initialize HMR runtime patching from args:',
      error,
    );
  }
}
