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
    ClassDeclarationNode,
    ClassExpressionNode,
    Node,
    VariableDeclaratorNode,
    JavascriptParserOptions,
    Compiler,
    Dependency,
    HarmonyImportSpecifierDependency,
    JavascriptParser,
    InnerGraph,
    TopLevelSymbol,
  };
}
type Compiler = import('../Compiler');
type ClassDeclarationNode = import('estree').ClassDeclaration;
type ClassExpressionNode = import('estree').ClassExpression;
type Node = import('estree').Node;
type VariableDeclaratorNode = import('estree').VariableDeclarator;
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type Dependency = import('../Dependency');
type HarmonyImportSpecifierDependency =
  import('../dependencies/HarmonyImportSpecifierDependency');
type JavascriptParser = import('../javascript/JavascriptParser');
type InnerGraph = import('./InnerGraph').InnerGraph;
type TopLevelSymbol = import('./InnerGraph').TopLevelSymbol;
