export = PrefetchPlugin;
/** @typedef {import("./Compiler")} Compiler */
declare class PrefetchPlugin {
  /**
   * @param {string} context context or request if context is not set
   * @param {string} [request] request
   */
  constructor(context: string, request?: string);
  context: string;
  request: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace PrefetchPlugin {
  export { Compiler };
}
type Compiler = import('./Compiler');
