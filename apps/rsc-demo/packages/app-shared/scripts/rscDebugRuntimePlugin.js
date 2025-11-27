'use strict';

/**
 * RSC Debug Runtime Plugin
 *
 * This plugin logs all Module Federation runtime hooks to understand
 * what data flows through them and how they can be used for RSC integration.
 */

const LOG_PREFIX = '[RSC-MF-DEBUG]';

function rscDebugRuntimePlugin() {
  return {
    name: 'rsc-debug-runtime-plugin',
    version: '1.0.0',

    // ============================================================================
    // CORE LIFECYCLE HOOKS
    // ============================================================================

    beforeInit(args) {
      console.log(`${LOG_PREFIX} beforeInit called`);
      console.log(
        `${LOG_PREFIX}   userOptions:`,
        JSON.stringify(args.userOptions, null, 2)
      );
      console.log(`${LOG_PREFIX}   options:`, Object.keys(args.options || {}));
      console.log(`${LOG_PREFIX}   origin:`, args.origin);
      console.log(
        `${LOG_PREFIX}   shareInfo:`,
        args.shareInfo ? Object.keys(args.shareInfo) : 'none'
      );
      return args;
    },

    init(args) {
      console.log(`${LOG_PREFIX} init called`);
      console.log(`${LOG_PREFIX}   options.name:`, args.options?.name);
      console.log(`${LOG_PREFIX}   options.remotes:`, args.options?.remotes);
      console.log(
        `${LOG_PREFIX}   options.shared:`,
        args.options?.shared ? Object.keys(args.options.shared) : 'none'
      );
    },

    // ============================================================================
    // REMOTE HANDLER HOOKS
    // ============================================================================

    beforeRegisterRemote(args) {
      console.log(`${LOG_PREFIX} beforeRegisterRemote called`);
      console.log(`${LOG_PREFIX}   remote.name:`, args.remote?.name);
      console.log(`${LOG_PREFIX}   remote.entry:`, args.remote?.entry);
      console.log(`${LOG_PREFIX}   remote.type:`, args.remote?.type);
      console.log(`${LOG_PREFIX}   origin:`, args.origin);
      return args;
    },

    registerRemote(args) {
      console.log(`${LOG_PREFIX} registerRemote called`);
      console.log(
        `${LOG_PREFIX}   remote:`,
        JSON.stringify(args.remote, null, 2)
      );
      return args;
    },

    async beforeRequest(args) {
      console.log(`${LOG_PREFIX} beforeRequest called`);
      console.log(`${LOG_PREFIX}   id:`, args.id);
      console.log(`${LOG_PREFIX}   options:`, args.options);
      console.log(`${LOG_PREFIX}   origin:`, args.origin);
      return args;
    },

    async afterResolve(args) {
      console.log(`${LOG_PREFIX} afterResolve called`);
      console.log(`${LOG_PREFIX}   id:`, args.id);
      console.log(`${LOG_PREFIX}   pkgNameOrAlias:`, args.pkgNameOrAlias);
      console.log(`${LOG_PREFIX}   expose:`, args.expose);
      console.log(`${LOG_PREFIX}   remote:`, args.remote?.name);
      console.log(`${LOG_PREFIX}   remoteInfo:`, args.remoteInfo);
      return args;
    },

    async onLoad(args) {
      console.log(`${LOG_PREFIX} onLoad called`);
      console.log(`${LOG_PREFIX}   id:`, args.id);
      console.log(`${LOG_PREFIX}   expose:`, args.expose);
      console.log(`${LOG_PREFIX}   pkgNameOrAlias:`, args.pkgNameOrAlias);
      console.log(`${LOG_PREFIX}   remote:`, args.remote?.name);
      console.log(
        `${LOG_PREFIX}   exposeModule type:`,
        typeof args.exposeModule
      );
      console.log(
        `${LOG_PREFIX}   exposeModuleFactory type:`,
        typeof args.exposeModuleFactory
      );
      if (args.exposeModule) {
        console.log(
          `${LOG_PREFIX}   exposeModule keys:`,
          Object.keys(args.exposeModule)
        );
        // Check for RSC-specific markers
        if (args.exposeModule.$$typeof) {
          console.log(
            `${LOG_PREFIX}   $$typeof:`,
            args.exposeModule.$$typeof?.toString()
          );
        }
        if (args.exposeModule.$$id) {
          console.log(
            `${LOG_PREFIX}   $$id (client ref):`,
            args.exposeModule.$$id
          );
        }
      }
      return args;
    },

    async errorLoadRemote(args) {
      console.log(`${LOG_PREFIX} errorLoadRemote called`);
      console.log(`${LOG_PREFIX}   id:`, args.id);
      console.log(`${LOG_PREFIX}   error:`, args.error?.message);
      console.log(`${LOG_PREFIX}   lifecycle:`, args.lifecycle);
      console.log(`${LOG_PREFIX}   from:`, args.from);
      return args;
    },

    // ============================================================================
    // SHARED HANDLER HOOKS
    // ============================================================================

    async beforeLoadShare(args) {
      console.log(`${LOG_PREFIX} beforeLoadShare called`);
      console.log(`${LOG_PREFIX}   pkgName:`, args.pkgName);
      console.log(
        `${LOG_PREFIX}   shareInfo:`,
        args.shareInfo ? Object.keys(args.shareInfo) : 'none'
      );
      console.log(`${LOG_PREFIX}   origin:`, args.origin);
      return args;
    },

    resolveShare(args) {
      console.log(`${LOG_PREFIX} resolveShare called`);
      console.log(`${LOG_PREFIX}   pkgName:`, args.pkgName);
      console.log(`${LOG_PREFIX}   version:`, args.version);
      console.log(`${LOG_PREFIX}   scope:`, args.scope);
      console.log(
        `${LOG_PREFIX}   shareScopeMap keys:`,
        Object.keys(args.shareScopeMap || {})
      );
      return args;
    },

    initContainerShareScopeMap(args) {
      console.log(`${LOG_PREFIX} initContainerShareScopeMap called`);
      console.log(`${LOG_PREFIX}   shareScope:`, args.shareScope);
      console.log(
        `${LOG_PREFIX}   shareScopeMap:`,
        Object.keys(args.shareScopeMap || {})
      );
      console.log(`${LOG_PREFIX}   initScope:`, args.initScope);
      return args;
    },

    // ============================================================================
    // LOADER HOOKS
    // ============================================================================

    async fetch(url, init) {
      console.log(`${LOG_PREFIX} fetch called`);
      console.log(`${LOG_PREFIX}   url:`, url);
      console.log(`${LOG_PREFIX}   method:`, init?.method || 'GET');
      console.log(`${LOG_PREFIX}   headers:`, init?.headers);
      // Don't intercept, just log and pass through
      return undefined; // Let default fetch handle it
    },

    createScript(args) {
      console.log(`${LOG_PREFIX} createScript called`);
      console.log(`${LOG_PREFIX}   url:`, args.url);
      console.log(`${LOG_PREFIX}   attrs:`, args.attrs);
      return args;
    },

    async loadEntry(args) {
      console.log(`${LOG_PREFIX} loadEntry called`);
      console.log(`${LOG_PREFIX}   remoteInfo:`, args.remoteInfo);
      console.log(
        `${LOG_PREFIX}   remoteEntryExports type:`,
        typeof args.remoteEntryExports
      );
      return args;
    },

    async getModuleFactory(args) {
      console.log(`${LOG_PREFIX} getModuleFactory called`);
      console.log(`${LOG_PREFIX}   expose:`, args.expose);
      console.log(`${LOG_PREFIX}   moduleInfo:`, args.moduleInfo);
      console.log(
        `${LOG_PREFIX}   remoteEntryExports type:`,
        typeof args.remoteEntryExports
      );
      return args;
    },

    // ============================================================================
    // PRELOAD HOOKS
    // ============================================================================

    handlePreloadModule(args) {
      console.log(`${LOG_PREFIX} handlePreloadModule called`);
      console.log(`${LOG_PREFIX}   id:`, args.id);
      console.log(`${LOG_PREFIX}   name:`, args.name);
      console.log(`${LOG_PREFIX}   remote:`, args.remote);
    },

    async beforePreloadRemote(args) {
      console.log(`${LOG_PREFIX} beforePreloadRemote called`);
      console.log(`${LOG_PREFIX}   preloadOps:`, args.preloadOps?.length);
      return args;
    },

    async afterPreloadRemote(args) {
      console.log(`${LOG_PREFIX} afterPreloadRemote called`);
      return args;
    },
  };
}

module.exports = rscDebugRuntimePlugin;
module.exports.default = rscDebugRuntimePlugin;
