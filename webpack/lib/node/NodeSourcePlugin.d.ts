export = NodeSourcePlugin;
/** @typedef {import("../Compiler")} Compiler */
declare class NodeSourcePlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NodeSourcePlugin {
  export { Compiler };
}
type Compiler = import('../Compiler');
