export = CssLoadingRuntimeModule;
declare class CssLoadingRuntimeModule extends RuntimeModule {
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
}
declare namespace CssLoadingRuntimeModule {
  export {
    Chunk,
    ChunkGraph,
    RuntimeRequirementsContext,
    JsonpCompilationPluginHooks,
  };
}
import RuntimeModule = require('../RuntimeModule');
import Compilation = require('../Compilation');
type JsonpCompilationPluginHooks = {
  createStylesheet: SyncWaterfallHook<[string, Chunk]>;
};
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
type RuntimeRequirementsContext =
  import('../Compilation').RuntimeRequirementsContext;
import { SyncWaterfallHook } from 'tapable';
