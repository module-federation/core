export = AMDPlugin;
declare class AMDPlugin {
  /**
   * @param {Record<string, any>} amdOptions the AMD options
   */
  constructor(amdOptions: Record<string, any>);
  amdOptions: Record<string, any>;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace AMDPlugin {
  export { JavascriptParserOptions, ModuleOptions, Compiler, Parser };
}
type Compiler = import('../Compiler');
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type ModuleOptions =
  import('../../declarations/WebpackOptions').ModuleOptionsNormalized;
type Parser = import('../javascript/JavascriptParser');
