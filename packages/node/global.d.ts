/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference path="../../webpack/module.d.ts" />
/// <reference path="../../webpack/types.d.ts" />

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
      __MF_REMOTE_HOT_RELOAD_CONTROLLER__?: {
        start: () => void;
        stop: () => void;
        touch: (force?: boolean) => void;
        check: (force?: boolean) => Promise<boolean>;
      };
    }
  }
  var usedChunks: Set<string>;

  var __FEDERATION__: {
    __INSTANCES__: Array<{
      moduleCache?: Map<string, Module>;
    }>;
  };
  var __MF_REMOTE_HOT_RELOAD_CONTROLLER__:
    | {
        start: () => void;
        stop: () => void;
        touch: (force?: boolean) => void;
        check: (force?: boolean) => Promise<boolean>;
      }
    | undefined;
}
