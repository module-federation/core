export = DataUriPlugin;
declare class DataUriPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DataUriPlugin {
  export { Compiler };
}
type Compiler = import('../Compiler');
