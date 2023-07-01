/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference path="../../node_modules/webpack/module.d.ts" />
/// <reference path="../../node_modules/webpack/types.d.ts" />

declare module 'webpack/lib/RuntimeGlobals';
declare module 'webpack/lib/runtime/StartupChunkDependenciesPlugin';
declare module 'webpack/lib/RuntimeModule';
declare module 'webpack/lib/Template';
declare module 'webpack/lib/util/compileBooleanMatcher';
declare module 'webpack/lib/util/identifier';
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface global {}
declare global {
  //eslint-disable-next-line
  var usedChunks: Set<string>;
  //eslint-disable-next-line
  var flushChunks: () => Promise<Array<string>>;
  //eslint-disable-next-line
  var __remote_scope__: {
    _config: Record<string, any>;
    _medusa?: Record<string, any>;
    [K: string]: {
      fake?: boolean;
    };
  };
  //eslint-disable-next-line
  var webpackChunkLoad;
}
