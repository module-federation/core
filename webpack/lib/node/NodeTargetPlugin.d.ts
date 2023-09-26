export = NodeTargetPlugin;
declare class NodeTargetPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NodeTargetPlugin {
  export { Compiler };
}
type Compiler = import('../Compiler');
