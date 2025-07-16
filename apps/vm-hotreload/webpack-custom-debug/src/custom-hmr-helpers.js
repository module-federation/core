const vm = require('vm');
const { createHMRRuntime } = require('./hmr-runtime');

// Webpack runtime code for in-memory HMR - only executed when webpack is available
function injectInMemoryHMRRuntime(__webpack_require__) {
  if (typeof __webpack_require__ === 'undefined') {
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
    var inMemoryChunks = {};

    // no on chunks loaded

    // no chunk install function needed

    // no chunk loading

    // no external install chunk

    // Global storage for in-memory manifest content
    var manifestRef = { value: null };

    // Create the complete HMR runtime with shared state
    var hmrRuntime = createHMRRuntime(
      __webpack_require__,
      installedChunks,
      inMemoryChunks,
      manifestRef,
    );

    // Assign the HMR handlers
    __webpack_require__.hmrI.readFileVm = hmrRuntime.hmrHandlers.hmrI;
    __webpack_require__.hmrC.readFileVm = hmrRuntime.hmrHandlers.hmrC;

    // Assign the HMR manifest loader
    __webpack_require__.hmrM = hmrRuntime.hmrManifestLoader;

    // Helper functions to set in-memory content
    __webpack_require__.setInMemoryManifest = function (manifestContent) {
      manifestRef.value = manifestContent;
    };

    __webpack_require__.setInMemoryChunk = function (chunkId, chunkContent) {
      inMemoryChunks[chunkId] = chunkContent;
    };
  })();
}

/**
 * Applies a hot update from in-memory strings by patching webpack's runtime modules.
 * @param {object} moduleObj - The module object (usually 'module')
 * @param {object} webpackRequire - The __webpack_require__ function
 * @param {string} manifestJsonString - The JSON string content of the HMR manifest
 * @param {object} chunkJsStringsMap - A map of chunkId to the JS string content of the HMR chunk
 * @returns {Promise<string[]>} A promise that resolves to an array of module IDs that were updated
 */
function applyHotUpdateFromStringsByPatching(
  moduleObj,
  webpackRequire,
  manifestJsonString,
  chunkJsStringsMap,
) {
  console.log(
    '🔥 [Custom HMR Helper] Applying update using patched runtime modules',
  );

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
        console.log('🔧 [Custom HMR Helper] Injecting in-memory HMR runtime');
        injectInMemoryHMRRuntime(webpackRequire);
      }

      console.log('🚀 [Custom HMR Helper] Setting in-memory content for HMR');

      // Set the in-memory manifest content
      if (webpackRequire.setInMemoryManifest) {
        webpackRequire.setInMemoryManifest(manifestJsonString);
        console.log('📄 [Custom HMR Helper] Set in-memory manifest');
      } else {
        console.warn(
          '⚠️ [Custom HMR Helper] setInMemoryManifest not available',
        );
      }

      // Set the in-memory chunk content for each chunk
      if (webpackRequire.setInMemoryChunk) {
        for (const chunkId in chunkJsStringsMap) {
          webpackRequire.setInMemoryChunk(chunkId, chunkJsStringsMap[chunkId]);
          console.log(`📦 [Custom HMR Helper] Set in-memory chunk: ${chunkId}`);
        }
      } else {
        console.warn('⚠️ [Custom HMR Helper] setInMemoryChunk not available');
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
            console.log(
              '✅ [Custom HMR Helper] Update applied. Updated modules:',
              updatedModules,
            );
            resolve(updatedModules || []);
          })
          .catch((error) => {
            const status = moduleObj.hot.status();
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

module.exports = {
  applyHotUpdateFromStringsByPatching,
};
