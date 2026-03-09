export = InnerGraphPlugin;
declare class InnerGraphPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace InnerGraphPlugin {
  export {
    ClassDeclaration,
    ClassExpression,
    Expression,
    MaybeNamedClassDeclaration,
    MaybeNamedFunctionDeclaration,
    Node,
    VariableDeclarator,
    JavascriptParserOptions,
    Compiler,
    DependencyLocation,
    JavascriptParser,
    Range,
    TopLevelSymbol,
  };
}
type ClassDeclaration = import('estree').ClassDeclaration;
type ClassExpression = import('estree').ClassExpression;
type Expression = import('estree').Expression;
type MaybeNamedClassDeclaration = import('estree').MaybeNamedClassDeclaration;
type MaybeNamedFunctionDeclaration =
  import('estree').MaybeNamedFunctionDeclaration;
type Node = import('estree').Node;
type VariableDeclarator = import('estree').VariableDeclarator;
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type Compiler = import('../Compiler');
type DependencyLocation = import('../Dependency').DependencyLocation;
type JavascriptParser = import('../javascript/JavascriptParser');
type Range = import('../javascript/JavascriptParser').Range;
type TopLevelSymbol = import('./InnerGraph').TopLevelSymbol;
