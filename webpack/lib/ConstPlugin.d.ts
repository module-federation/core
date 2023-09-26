export = ConstPlugin;
declare class ConstPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ConstPlugin {
  export {
    AssignmentProperty,
    Expression,
    Identifier,
    Pattern,
    SourceLocation,
    Statement,
    Super,
    Compiler,
    BasicEvaluatedExpression,
    JavascriptParser,
    Range,
  };
}
type Compiler = import('./Compiler');
type AssignmentProperty = import('estree').AssignmentProperty;
type Expression = import('estree').Expression;
type Identifier = import('estree').Identifier;
type Pattern = import('estree').Pattern;
type SourceLocation = import('estree').SourceLocation;
type Statement = import('estree').Statement;
type Super = import('estree').Super;
type BasicEvaluatedExpression = import('./javascript/BasicEvaluatedExpression');
type JavascriptParser = import('./javascript/JavascriptParser');
type Range = import('./javascript/JavascriptParser').Range;
