'use strict';

/**
 * Lightweight runtime plugin for Module Federation.
 *
 * This is used for experimentation and introspection. When MF_DEBUG is truthy,
 * it logs key lifecycle events for both browser and Node runtimes:
 * - beforeInit / beforeRequest / afterResolve / onLoad
 * - beforeLoadShare / loadShare
 *
 * The plugin is safe to include in production builds; logging is gated by
 * MF_DEBUG so it stays silent by default.
 */

const isDebugEnabled = () => {
  try {
    // Guard for browser environments where process may not exist
    return (
      typeof process !== 'undefined' &&
      process &&
      process.env &&
      process.env.MF_DEBUG
    );
  } catch (_e) {
    return false;
  }
};

const log = (...args) => {
  if (!isDebugEnabled()) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log('[MF runtime]', ...args);
};

/**
 * Runtime plugin factory.
 *
 * NOTE: This must be a function returning the plugin object, as expected by
 * @module-federation/enhanced runtime.
 */
function runtimeLogPlugin() {
  return {
    name: 'mf-runtime-log-plugin',

    beforeInit(args) {
      log('beforeInit', args && {name: args.name, version: args.version});
      return args;
    },

    beforeRequest(args) {
      log('beforeRequest', {
        id: args.id,
        from: args.from,
        to: args.to,
        method: args.method,
      });
      return args;
    },

    afterResolve(args) {
      log('afterResolve', {
        id: args.id,
        resolved: args.resolved,
        origin: args.origin,
      });
      return args;
    },

    onLoad(args) {
      log('onLoad', {
        id: args.id,
        module: args.moduleId,
        url: args.url,
      });
      return args;
    },

    async beforeLoadShare(args) {
      log('beforeLoadShare', {
        pkg: args.shareKey,
        scope: args.shareScope,
        requiredVersion: args.requiredVersion,
      });
      return args;
    },

    async loadShare(args) {
      log('loadShare', {
        pkg: args.shareKey,
        scope: args.shareScope,
        resolved: !!args.resolved,
      });
      return args;
    },
  };
}

module.exports = runtimeLogPlugin;
