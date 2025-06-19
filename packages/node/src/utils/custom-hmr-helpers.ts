import * as vm from 'vm';
import type { WebpackRequire } from './webpack-runtime-handlers';
import { createHMRRuntime } from './hmr-runtime';
import type { HMRWebpackRequire, ModuleHot, ModuleObject } from '../types/hmr';

// Injects the necessary webpack runtime patches for in-memory HMR functionality
function injectInMemoryHMRRuntime(__webpack_require__: HMRWebpackRequire): void {
  if (
    typeof __webpack_require__ === 'undefined' ||
    __webpack_require__.setInMemoryManifest
  ) {
    console.warn(
      '[Custom HMR Helper] __webpack_require__ not available, skipping runtime injection',
    );
    return;
  }

  // we need to patch the runtime module for chunk loading hot update chunks to support in memory
  /* webpack/runtime/readFile chunk loading */
  (() => {
    // no baseURI

    // object to store loaded chunks
    // "0" means "already loaded", Promise means loading
    var installedChunks = (__webpack_require__.hmrS_readFileVm =
      __webpack_require__.hmrS_readFileVm || {
        index: 0,
      });

    // Global storage for in-memory chunk content
    var inMemoryChunks: { [chunkId: string]: string } = {};

    // no on chunks loaded

    // no chunk install function needed

    // no chunk loading

    // no external install chunk

    // Global storage for in-memory manifest content
    var manifestRef: { value: string | null } = { value: null };

    // Create the complete HMR runtime with shared state
    var hmrRuntime = createHMRRuntime(
      __webpack_require__,
      installedChunks,
      inMemoryChunks,
      manifestRef,
    );

    // Assign the HMR handlers
    __webpack_require__.hmrI['readFileVm'] = hmrRuntime.hmrHandlers.hmrI;
    __webpack_require__.hmrC['readFileVm'] = hmrRuntime.hmrHandlers.hmrC;

    // Assign the HMR manifest loader
    __webpack_require__.hmrM = hmrRuntime.hmrManifestLoader;

    // Helper functions to set in-memory content
    __webpack_require__.setInMemoryManifest = function (manifestContent: string): void {
      manifestRef.value = manifestContent;
    };

    __webpack_require__.setInMemoryChunk = function (chunkId: string, chunkContent: string): void {
      inMemoryChunks[chunkId] = chunkContent;
    };
  })();
}

/**
 * Applies hot module replacement using in-memory content and webpack's native HMR system.
 * This function injects the necessary runtime patches and triggers webpack's HMR update flow.
 * @param moduleObj - The module object (usually 'module') with .hot API
 * @param webpackRequire - The __webpack_require__ function with HMR capabilities
 * @param manifestJsonString - The JSON string content of the HMR manifest
 * @param chunkJsStringsMap - A map of chunkId to the JS string content of the HMR chunk
 * @returns A promise that resolves to an array of module IDs that were updated
 */
function applyInMemoryHotUpdate(
  moduleObj: ModuleObject,
  webpackRequire: HMRWebpackRequire | null,
  manifestJsonString: string,
  chunkJsStringsMap: { [chunkId: string]: string },
): Promise<string[]> {
  // Applying update using patched runtime modules

  return new Promise((resolve, reject) => {
    try {
      // Check if module.hot is available
      if (!moduleObj || !moduleObj.hot) {
        reject(new Error('[HMR] Hot Module Replacement is disabled.'));
        return;
      }

      if (!webpackRequire) {
        reject(new Error('[HMR] __webpack_require__ is not available.'));
        return;
      }

      // Inject the in-memory HMR runtime if not already injected
      if (!webpackRequire.setInMemoryManifest) {
        // Injecting in-memory HMR runtime
        injectInMemoryHMRRuntime(webpackRequire);
      }

      // Setting in-memory content for HMR

      // Set the in-memory manifest content
      if (webpackRequire.setInMemoryManifest) {
        webpackRequire.setInMemoryManifest(manifestJsonString);
        // Set in-memory manifest
      } else {
        // setInMemoryManifest not available
      }
      // Set the in-memory chunk content for each chunk
      if (webpackRequire.setInMemoryChunk) {
        for (const chunkId in chunkJsStringsMap) {
          webpackRequire.setInMemoryChunk(chunkId, chunkJsStringsMap[chunkId]);
          // Set in-memory chunk
        }
      } else {
        // setInMemoryChunk not available
      }

      console.log(
        '📊 [Custom HMR Helper] Current HMR status:',
        moduleObj.hot.status(),
      );

      if (moduleObj.hot.status() === 'idle') {
        moduleObj.hot
          .check(true) // true means auto-apply
          .then((updatedModules) => {
            if (!updatedModules) {
              console.log(
                'ℹ️ [Custom HMR Helper] No updates detected by webpack',
              );
              resolve([]);
              return;
            }
            // Update applied
            resolve(updatedModules || []);
          })
          .catch((error) => {
            const status = moduleObj.hot!.status();
            if (['abort', 'fail'].indexOf(status) >= 0) {
              console.error('[Custom HMR Helper] Cannot apply update:', error);
              console.error(
                '[Custom HMR Helper] You need to restart the application!',
              );
            } else {
              console.error('[Custom HMR Helper] Update failed:', error);
            }
            reject(error);
          });
      } else {
        console.warn(
          `⚠️ [Custom HMR Helper] HMR not in idle state (${moduleObj.hot.status()}), cannot check for updates`,
        );
        resolve([]);
      }
    } catch (error) {
      console.error('[Custom HMR Helper] Error processing update:', error);
      reject(error);
    }
  });
}

export {
  applyInMemoryHotUpdate,
  // Keep the old name for backward compatibility
  applyInMemoryHotUpdate as applyHotUpdateFromStringsByPatching,
  type HMRWebpackRequire,
  type ModuleHot,
  type ModuleObject,
};
