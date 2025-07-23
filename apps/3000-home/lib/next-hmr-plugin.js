// Next.js HMR Plugin - Patches loadComponents to clear cache before loading
const Module = require('module');
const path = require('path');

let isPatched = false;

console.log('[HMR Plugin] 🚀 Plugin loading...');

// Patch loadComponents directly by intercepting http.IncomingMessage
function patchLoadComponents() {
  if (isPatched || typeof window !== 'undefined') return;

  try {
    // Hook into module loading to catch when loadComponents gets required
    const originalRequire = Module.prototype.require;

    Module.prototype.require = function (id) {
      const result = originalRequire.apply(this, arguments);

      // Check if this is the load-components module
      if (id.includes('load-components') && result && result.loadComponents) {
        try {
          patchLoadComponentsFunction(result);
        } catch (error) {
          console.error('[HMR Plugin] Error patching load-components:', error);
        }
      }

      return result;
    };

    isPatched = true;
    console.log('[HMR Plugin] ✅ Module require hook installed');
  } catch (error) {
    console.error('[HMR Plugin] Failed to setup require hook:', error);
  }
}

function patchLoadComponentsFunction(loadComponentsModule) {
  if (!loadComponentsModule.loadComponents) return;

  const originalLoadComponents = loadComponentsModule.loadComponents;

  // Create a wrapper that can access the request context directly
  loadComponentsModule.loadComponents = async function (options) {
    // Check if we can find HMR parameter in any global context
    let shouldPerformHMR = false;

    // Check global flag first
    if (global.__NEXT_HMR_REQUESTED__) {
      shouldPerformHMR = true;
      global.__NEXT_HMR_REQUESTED__ = false; // Clear the flag
    }

    // Also check if we can access process.env or other global state
    if (
      global.__NEXT_REQUEST_QUERY__ &&
      global.__NEXT_REQUEST_QUERY__.hotReloadAll === 'true'
    ) {
      shouldPerformHMR = true;
      global.__NEXT_REQUEST_QUERY__ = null; // Clear it
    }

    if (shouldPerformHMR) {
      console.log(
        '[HMR Plugin] 🔥 Intercepting loadComponents - performing HMR before component loading',
      );

      try {
        const { performHMR } = require('../lib/server-hmr');
        const cleared = performHMR();
        console.log(
          `[HMR Plugin] ✅ Pre-cleared ${cleared} modules before loadComponents`,
        );
      } catch (error) {
        console.error('[HMR Plugin] Error during HMR:', error);
      }
    }

    // Call original function
    return originalLoadComponents.call(this, options);
  };

  console.log('[HMR Plugin] ✅ Successfully patched loadComponents function');
}

// Also patch via _document to set the global flag
function patchDocumentGetInitialProps() {
  try {
    // Set up a flag checking mechanism
    const originalRequire = Module.prototype.require;

    Module.prototype.require = function (id) {
      const result = originalRequire.apply(this, arguments);

      // Look for _document module being required
      if (
        id.includes('/_document') &&
        result &&
        result.default &&
        result.default.getInitialProps
      ) {
        try {
          const originalGetInitialProps = result.default.getInitialProps;

          result.default.getInitialProps = async function (ctx) {
            // Check for HMR query parameter and set global flag
            if (ctx && ctx.query && ctx.query.hotReloadAll === 'true') {
              console.log(
                '[HMR Plugin] 🔥 Setting global HMR flag from _document',
              );
              global.__NEXT_HMR_REQUESTED__ = true;
            }

            return originalGetInitialProps.call(this, ctx);
          };

          console.log('[HMR Plugin] ✅ Patched _document.getInitialProps');
        } catch (error) {
          console.error('[HMR Plugin] Error patching _document:', error);
        }
      }

      return result;
    };
  } catch (error) {
    console.error('[HMR Plugin] Error setting up document patch:', error);
  }
}

// Fallback: patch already loaded modules
function patchExistingModules() {
  try {
    const moduleKeys = Object.keys(require.cache);

    // Look for load-components module
    const loadComponentsKey = moduleKeys.find(
      (key) =>
        key.includes('load-components.js') && !key.includes('node_modules'),
    );

    if (loadComponentsKey) {
      const module = require.cache[loadComponentsKey];
      if (module && module.exports) {
        patchLoadComponentsFunction(module.exports);
      }
    }
  } catch (error) {
    console.error('[HMR Plugin] Error patching existing modules:', error);
  }
}

// Run patches
if (process.env.NODE_ENV === 'development') {
  patchLoadComponents();
  patchDocumentGetInitialProps();

  // Try to patch existing modules
  process.nextTick(() => {
    patchExistingModules();
  });

  // Try again after a delay
  setTimeout(() => {
    patchExistingModules();
  }, 1000);
}

module.exports = { patchLoadComponents };
