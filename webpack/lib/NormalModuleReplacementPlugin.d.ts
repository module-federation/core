export = NormalModuleReplacementPlugin;
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {function(import("./NormalModuleFactory").ResolveData): void} ModuleReplacer */
declare class NormalModuleReplacementPlugin {
  /**
   * Create an instance of the plugin
   * @param {RegExp} resourceRegExp the resource matcher
   * @param {string|ModuleReplacer} newResource the resource replacement
   */
  constructor(resourceRegExp: RegExp, newResource: string | ModuleReplacer);
  resourceRegExp: RegExp;
  newResource: string | ModuleReplacer;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NormalModuleReplacementPlugin {
  export { Compiler, ModuleReplacer };
}
type ModuleReplacer = (
  arg0: import('./NormalModuleFactory').ResolveData,
) => void;
type Compiler = import('./Compiler');
