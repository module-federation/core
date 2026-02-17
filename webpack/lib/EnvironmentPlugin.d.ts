export = EnvironmentPlugin;
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./DefinePlugin").CodeValue} CodeValue */
declare class EnvironmentPlugin {
  constructor(...keys: any[]);
  keys: any[];
  defaultValues: any;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace EnvironmentPlugin {
  export { Compiler, CodeValue };
}
type Compiler = import('./Compiler');
type CodeValue = import('./DefinePlugin').CodeValue;
