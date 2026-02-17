export = ElectronTargetPlugin;
/** @typedef {import("../Compiler")} Compiler */
declare class ElectronTargetPlugin {
  /**
   * @param {"main" | "preload" | "renderer"=} context in main, preload or renderer context?
   */
  constructor(context?: ('main' | 'preload' | 'renderer') | undefined);
  _context: 'main' | 'preload' | 'renderer';
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ElectronTargetPlugin {
  export { Compiler };
}
type Compiler = import('../Compiler');
