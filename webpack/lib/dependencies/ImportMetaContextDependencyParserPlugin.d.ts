export = ImportMetaContextDependencyParserPlugin;
declare class ImportMetaContextDependencyParserPlugin {
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
}
declare namespace ImportMetaContextDependencyParserPlugin {
  export {
    Expression,
    ObjectExpression,
    Property,
    SourceLocation,
    JavascriptParser,
    ContextModuleOptions,
    RawChunkGroupOptions,
    ImportMetaContextOptions,
  };
}
type JavascriptParser = import('../javascript/JavascriptParser');
type Expression = import('estree').Expression;
type ObjectExpression = import('estree').ObjectExpression;
type Property = import('estree').Property;
type SourceLocation = import('estree').SourceLocation;
type ContextModuleOptions = import('../ContextModule').ContextModuleOptions;
type RawChunkGroupOptions = import('../ChunkGroup').RawChunkGroupOptions;
type ImportMetaContextOptions = Pick<
  import('../ContextModule').ContextModuleOptions,
  'include' | 'exclude' | 'regExp' | 'chunkName' | 'mode' | 'recursive'
> & {
  groupOptions: RawChunkGroupOptions;
  exports?: ContextModuleOptions['referencedExports'];
};
