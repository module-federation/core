export = AssetModulesPlugin;
declare class AssetModulesPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace AssetModulesPlugin {
  export {
    Source,
    Schema,
    AssetInfo,
    Compiler,
    BuildInfo,
    CodeGenerationResult,
    NormalModule,
  };
}
type Source = import('webpack-sources').Source;
type Schema = import('schema-utils').Schema;
type AssetInfo = import('../Compilation').AssetInfo;
type Compiler = import('../Compiler');
type BuildInfo = import('../Module').BuildInfo;
type CodeGenerationResult = import('../Module').CodeGenerationResult;
type NormalModule = import('../NormalModule');
