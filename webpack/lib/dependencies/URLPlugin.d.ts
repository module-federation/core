export = URLPlugin;
declare class URLPlugin {
  /**
   * @param {Compiler} compiler compiler
   */
  apply(compiler: Compiler): void;
}
declare namespace URLPlugin {
  export {
    NewExpressionNode,
    JavascriptParserOptions,
    Compiler,
    DependencyLocation,
    NormalModule,
    JavascriptParser,
    Parser,
    Range,
  };
}
type Compiler = import('../Compiler');
type NewExpressionNode = import('estree').NewExpression;
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type DependencyLocation = import('../Dependency').DependencyLocation;
type NormalModule = import('../NormalModule');
type JavascriptParser = import('../javascript/JavascriptParser');
type Parser = import('../javascript/JavascriptParser');
type Range = import('../javascript/JavascriptParser').Range;
