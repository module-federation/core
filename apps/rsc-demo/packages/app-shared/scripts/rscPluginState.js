'use strict';

/**
 * Shared plugin state for RSC webpack builds.
 *
 * Following Next.js's pattern from build-context.js, this module provides
 * a global state object that persists across webpack compilation phases
 * within the same Node.js process.
 *
 * TODO(federation-rsc): This pattern works when all webpack configs run in
 * the same process via `webpack([...configs])`. If builds are ever split
 * across worker threads, state will need to be serialized and passed between
 * workers (like Next.js's resumePluginState/getPluginState pattern).
 *
 * @see https://github.com/vercel/next.js - build/build-context.js
 */

// Module-level shared state (persists across webpack compilations in same process)
let pluginState = {
  // SSR module ID mappings: maps (client)/ IDs to (ssr)/ IDs
  ssrModuleIds: {},

  // Client component registry extracted from react-ssr-manifest.json
  clientComponents: {},

  // Indicates SSR manifest has been processed
  ssrManifestProcessed: false,
};

/**
 * Get a proxied plugin state that lazily initializes missing keys.
 * Following Next.js's getProxiedPluginState pattern.
 *
 * @param {object} initialState - Default values for state keys
 * @returns {Proxy} Proxied state object
 */
function getProxiedPluginState(initialState) {
  return new Proxy(pluginState, {
    get(target, key) {
      if (typeof target[key] === 'undefined') {
        target[key] = initialState[key];
      }
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
  });
}

/**
 * Get the raw plugin state object.
 * Useful for serialization when passing state between processes.
 *
 * @returns {object} The plugin state
 */
function getPluginState() {
  return pluginState;
}

/**
 * Resume plugin state from a serialized state object.
 * Used when running builds in worker threads.
 *
 * @param {object} resumedState - State to merge into pluginState
 */
function resumePluginState(resumedState) {
  Object.assign(pluginState, resumedState);
}

/**
 * Reset plugin state (useful for tests or fresh builds).
 */
function resetPluginState() {
  pluginState = {
    ssrModuleIds: {},
    clientComponents: {},
    ssrManifestProcessed: false,
  };
}

module.exports = {
  getProxiedPluginState,
  getPluginState,
  resumePluginState,
  resetPluginState,
};
