export = ConstPlugin;
declare class ConstPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   * Eliminate an unused statement.
   * @param {JavascriptParser} parser the parser
   * @param {Statement} statement the statement to remove
   * @param {boolean} alwaysInBlock whether to always generate curly brackets
   * @returns {void}
   */
  eliminateUnusedStatement(
    parser: JavascriptParser,
    statement: Statement,
    alwaysInBlock: boolean,
  ): void;
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
    VariableDeclaration,
    Compiler,
    JavascriptParser,
    Range,
    Declarations,
  };
}
type AssignmentProperty = import('estree').AssignmentProperty;
type Expression = import('estree').Expression;
type Identifier = import('estree').Identifier;
type Pattern = import('estree').Pattern;
type SourceLocation = import('estree').SourceLocation;
type Statement = import('estree').Statement;
type Super = import('estree').Super;
type VariableDeclaration = import('estree').VariableDeclaration;
type Compiler = import('./Compiler');
type JavascriptParser = import('./javascript/JavascriptParser');
type Range = import('./javascript/JavascriptParser').Range;
type Declarations = Set<string>;
