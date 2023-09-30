export = JsonpChunkLoadingRuntimeModule;
declare class JsonpChunkLoadingRuntimeModule extends RuntimeModule {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {JsonpCompilationPluginHooks} hooks
   */
  static getCompilationHooks(
    compilation: Compilation,
  ): JsonpCompilationPluginHooks;
  /**
   * @param {Set<string>} runtimeRequirements runtime requirements
   */
  constructor(runtimeRequirements: Set<string>);
  _runtimeRequirements: Set<string>;
  /**
   * @private
   * @param {Chunk} chunk chunk
   * @returns {string} generated code
   */
  private _generateBaseUri;
}
declare namespace JsonpChunkLoadingRuntimeModule {
  export { Chunk, ChunkGraph, JsonpCompilationPluginHooks };
}
import RuntimeModule = require('../RuntimeModule');
import Compilation = require('../Compilation');
type JsonpCompilationPluginHooks = {
  linkPreload: SyncWaterfallHook<[string, Chunk]>;
  linkPrefetch: SyncWaterfallHook<[string, Chunk]>;
};
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
import { SyncWaterfallHook } from 'tapable';
