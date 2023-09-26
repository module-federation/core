export = TemplatedPathPlugin;
declare class TemplatedPathPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace TemplatedPathPlugin {
  export { AssetInfo, PathData, Compiler };
}
type Compiler = import('./Compiler');
type AssetInfo = import('./Compilation').AssetInfo;
type PathData = import('./Compilation').PathData;
