export = NodeTargetPlugin;
declare class NodeTargetPlugin {
  /**
   * @param {ExternalsType} type default external type
   */
  constructor(type?: ExternalsType);
  type: import('../../declarations/WebpackOptions').ExternalsType;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NodeTargetPlugin {
  export { ExternalsType, Compiler };
}
type ExternalsType = import('../../declarations/WebpackOptions').ExternalsType;
type Compiler = import('../Compiler');
