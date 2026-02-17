export = WarnDeprecatedOptionPlugin;
/** @typedef {import("./Compiler")} Compiler */
declare class WarnDeprecatedOptionPlugin {
  /**
   * Create an instance of the plugin
   * @param {string} option the target option
   * @param {string | number} value the deprecated option value
   * @param {string} suggestion the suggestion replacement
   */
  constructor(option: string, value: string | number, suggestion: string);
  option: string;
  value: string | number;
  suggestion: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace WarnDeprecatedOptionPlugin {
  export { Compiler };
}
type Compiler = import('./Compiler');
