/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference path="../../node_modules/webpack/module.d.ts" />
/// <reference path="../../node_modules/webpack/types.d.ts" />

declare module 'webpack/lib/RuntimeGlobals';
declare module 'webpack/lib/Compilation';
declare module 'webpack/lib/Compiler';
declare module 'webpack/lib/runtime/StartupChunkDependenciesPlugin';
declare module 'webpack/lib/RuntimeModule';
declare module 'webpack/lib/Template';
declare module 'webpack/lib/util/compileBooleanMatcher';
declare module 'webpack/lib/util/identifier';
declare module 'btoa';
declare global {
  namespace NodeJS {
    interface Global {
      usedChunks: Set<string>;
      flushChunks: () => Promise<Array<string>>;
      __remote_scope__: {
        _config: Record<string, any>;
        _medusa?: Record<string, any>;
        [K: string]: {
          fake?: boolean;
        };
      };
      webpackChunkLoad: () => any;

      __FEDERATION__: {
        __INSTANCES__: Array<{
          moduleCache?: Map<string, Module>;
        }>;
      };
    }
  }
  var usedChunks: Set<string>;

  var __FEDERATION__: {
    __INSTANCES__: Array<{
      moduleCache?: Map<string, Module>;
    }>;
  };
}
