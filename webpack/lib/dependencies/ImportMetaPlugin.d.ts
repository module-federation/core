export = ImportMetaPlugin;
declare class ImportMetaPlugin {
  /**
   * @param {Compiler} compiler compiler
   */
  apply(compiler: Compiler): void;
}
declare namespace ImportMetaPlugin {
  export {
    MemberExpression,
    JavascriptParserOptions,
    Compiler,
    DependencyLocation,
    NormalModule,
    Parser,
    Range,
  };
}
type Compiler = import('../Compiler');
type MemberExpression = import('estree').MemberExpression;
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type DependencyLocation = import('../Dependency').DependencyLocation;
type NormalModule = import('../NormalModule');
type Parser = import('../javascript/JavascriptParser');
type Range = import('../javascript/JavascriptParser').Range;
