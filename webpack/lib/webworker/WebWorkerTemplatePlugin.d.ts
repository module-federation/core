export = WebWorkerTemplatePlugin;
/** @typedef {import("../Compiler")} Compiler */
declare class WebWorkerTemplatePlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace WebWorkerTemplatePlugin {
  export { Compiler };
}
type Compiler = import('../Compiler');
