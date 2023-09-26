export = FlagAllModulesAsUsedPlugin;
declare class FlagAllModulesAsUsedPlugin {
  /**
   * @param {string} explanation explanation
   */
  constructor(explanation: string);
  explanation: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace FlagAllModulesAsUsedPlugin {
  export { Compiler, FactoryMeta, RuntimeSpec };
}
type Compiler = import('./Compiler');
type FactoryMeta = import('./Module').FactoryMeta;
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
