export = WarnCaseSensitiveModulesPlugin;
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./NormalModule")} NormalModule */
declare class WarnCaseSensitiveModulesPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace WarnCaseSensitiveModulesPlugin {
  export { Compiler, Module, NormalModule };
}
type Compiler = import('./Compiler');
type Module = import('./Module');
type NormalModule = import('./NormalModule');
