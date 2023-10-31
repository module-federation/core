export = NodeStuffPlugin;
declare class NodeStuffPlugin {
  /**
   * @param {NodeOptions} options options
   */
  constructor(options: NodeOptions);
  options: import('../declarations/WebpackOptions').NodeOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NodeStuffPlugin {
  export {
    ReplaceSource,
    JavascriptParserOptions,
    NodeOptions,
    Compiler,
    Dependency,
    DependencyLocation,
    DependencyTemplates,
    NormalModule,
    RuntimeTemplate,
    JavascriptParser,
    Range,
  };
}
type Compiler = import('./Compiler');
type NodeOptions = import('../declarations/WebpackOptions').NodeOptions;
type ReplaceSource = any;
type JavascriptParserOptions =
  import('../declarations/WebpackOptions').JavascriptParserOptions;
type Dependency = import('./Dependency');
type DependencyLocation = import('./Dependency').DependencyLocation;
type DependencyTemplates = import('./DependencyTemplates');
type NormalModule = import('./NormalModule');
type RuntimeTemplate = import('./RuntimeTemplate');
type JavascriptParser = import('./javascript/JavascriptParser');
type Range = import('./javascript/JavascriptParser').Range;
