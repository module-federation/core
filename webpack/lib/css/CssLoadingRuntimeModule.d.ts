export = CssLoadingRuntimeModule;
declare class CssLoadingRuntimeModule extends RuntimeModule {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {CssLoadingRuntimeModulePluginHooks} hooks
   */
  static getCompilationHooks(
    compilation: Compilation,
  ): CssLoadingRuntimeModulePluginHooks;
  /**
   * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
   */
  constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
  _runtimeRequirements: import('../Module').ReadOnlyRuntimeRequirements;
}
declare namespace CssLoadingRuntimeModule {
  export {
    Chunk,
    ChunkId,
    ChunkGraph,
    ReadOnlyRuntimeRequirements,
    CssLoadingRuntimeModulePluginHooks,
  };
}
import RuntimeModule = require('../RuntimeModule');
import Compilation = require('../Compilation');
type Chunk = import('../Chunk');
type ChunkId = import('../Chunk').ChunkId;
type ChunkGraph = import('../ChunkGraph');
type ReadOnlyRuntimeRequirements =
  import('../Module').ReadOnlyRuntimeRequirements;
type CssLoadingRuntimeModulePluginHooks = {
  createStylesheet: SyncWaterfallHook<[string, Chunk]>;
  linkPreload: SyncWaterfallHook<[string, Chunk]>;
  linkPrefetch: SyncWaterfallHook<[string, Chunk]>;
};
import { SyncWaterfallHook } from 'tapable';
