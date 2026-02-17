export = ExternalsPlugin;
/** @typedef {import("../declarations/WebpackOptions").Externals} Externals */
/** @typedef {import("./Compiler")} Compiler */
declare class ExternalsPlugin {
  /**
   * @param {string | undefined} type default external type
   * @param {Externals} externals externals config
   */
  constructor(type: string | undefined, externals: Externals);
  type: string;
  externals: import('../declarations/WebpackOptions').Externals;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ExternalsPlugin {
  export { Externals, Compiler };
}
type Compiler = import('./Compiler');
type Externals = import('../declarations/WebpackOptions').Externals;
