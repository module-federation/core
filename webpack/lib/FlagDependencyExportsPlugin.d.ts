export = FlagDependencyExportsPlugin;
declare class FlagDependencyExportsPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace FlagDependencyExportsPlugin {
  export {
    Compiler,
    DependenciesBlock,
    Dependency,
    ExportSpec,
    ExportsSpec,
    ExportsInfo,
    Module,
  };
}
type Compiler = import('./Compiler');
type DependenciesBlock = import('./DependenciesBlock');
type Dependency = import('./Dependency');
type ExportSpec = import('./Dependency').ExportSpec;
type ExportsSpec = import('./Dependency').ExportsSpec;
type ExportsInfo = import('./ExportsInfo');
type Module = import('./Module');
