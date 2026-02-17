export = EnvironmentPlugin;
declare class EnvironmentPlugin {
  /**
   * @param {(string | string[] | Record<string, EXPECTED_ANY>)[]} keys keys
   */
  constructor(...keys: (string | string[] | Record<string, EXPECTED_ANY>)[]);
  /** @type {string[]} */
  keys: string[];
  defaultValues: Record<string, EXPECTED_ANY>;
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
