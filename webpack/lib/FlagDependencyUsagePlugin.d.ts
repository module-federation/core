export = FlagDependencyUsagePlugin;
declare class FlagDependencyUsagePlugin {
  /**
   * @param {boolean} global do a global analysis instead of per runtime
   */
  constructor(global: boolean);
  global: boolean;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace FlagDependencyUsagePlugin {
  export {
    Chunk,
    ChunkGroup,
    Compiler,
    DependenciesBlock,
    ReferencedExport,
    ExportsInfo,
    Module,
    RuntimeSpec,
  };
}
type Compiler = import('./Compiler');
type Chunk = import('./Chunk');
type ChunkGroup = import('./ChunkGroup');
type DependenciesBlock = import('./DependenciesBlock');
type ReferencedExport = import('./Dependency').ReferencedExport;
type ExportsInfo = import('./ExportsInfo');
type Module = import('./Module');
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
