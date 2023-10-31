export = LoaderTargetPlugin;
/** @typedef {import("./Compiler")} Compiler */
declare class LoaderTargetPlugin {
  /**
   * @param {string} target the target
   */
  constructor(target: string);
  target: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace LoaderTargetPlugin {
  export { Compiler };
}
type Compiler = import('./Compiler');
