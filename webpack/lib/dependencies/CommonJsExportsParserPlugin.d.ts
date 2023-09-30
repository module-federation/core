export = CommonJsExportsParserPlugin;
declare class CommonJsExportsParserPlugin {
  /**
   * @param {ModuleGraph} moduleGraph module graph
   */
  constructor(moduleGraph: ModuleGraph);
  moduleGraph: import('../ModuleGraph');
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
}
declare namespace CommonJsExportsParserPlugin {
  export {
    AssignmentExpression,
    CallExpression,
    Expression,
    Super,
    ModuleGraph,
    NormalModule,
    BasicEvaluatedExpression,
    JavascriptParser,
    CommonJSDependencyBaseKeywords,
  };
}
type JavascriptParser = import('../javascript/JavascriptParser');
type ModuleGraph = import('../ModuleGraph');
type AssignmentExpression = import('estree').AssignmentExpression;
type CallExpression = import('estree').CallExpression;
type Expression = import('estree').Expression;
type Super = import('estree').Super;
type NormalModule = import('../NormalModule');
type BasicEvaluatedExpression =
  import('../javascript/BasicEvaluatedExpression');
type CommonJSDependencyBaseKeywords =
  import('./CommonJsDependencyHelpers').CommonJSDependencyBaseKeywords;
