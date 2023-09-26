export = ModuleChunkLoadingRuntimeModule;
declare class ModuleChunkLoadingRuntimeModule extends RuntimeModule {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {JsonpCompilationPluginHooks} hooks
   */
  static getCompilationHooks(
    compilation: Compilation,
  ): JsonpCompilationPluginHooks;
  /**
   * @param {ReadonlySet<string>} runtimeRequirements runtime requirements
   */
  constructor(runtimeRequirements: ReadonlySet<string>);
  _runtimeRequirements: ReadonlySet<string>;
  /**
   * @private
   * @param {Chunk} chunk chunk
   * @param {string} rootOutputDir root output directory
   * @returns {string} generated code
   */
  private _generateBaseUri;
}
declare namespace ModuleChunkLoadingRuntimeModule {
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
