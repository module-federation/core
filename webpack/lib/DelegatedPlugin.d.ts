export = DelegatedPlugin;
/** @typedef {import("./Compiler")} Compiler */
declare class DelegatedPlugin {
  constructor(options: any);
  options: any;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DelegatedPlugin {
  export { Compiler };
}
type Compiler = import('./Compiler');
