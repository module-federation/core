export = ImportParserPlugin;
declare class ImportParserPlugin {
    /**
     * @param {JavascriptParserOptions} options options
     */
    constructor(options: JavascriptParserOptions);
    options: import("../../declarations/WebpackOptions").JavascriptParserOptions;
    /**
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace ImportParserPlugin {
    export { JavascriptParserOptions, RawChunkGroupOptions, ContextMode, DependencyLocation, RawReferencedExports, BuildMeta, JavascriptParser, ImportExpression, Range, JavascriptParserState, Members, MembersOptionals, ArrowFunctionExpression, FunctionExpression, Identifier, ObjectPattern, CallExpression, ImportSettings, State };
}
type JavascriptParserOptions = import("../../declarations/WebpackOptions").JavascriptParserOptions;
type RawChunkGroupOptions = import("../ChunkGroup").RawChunkGroupOptions;
type ContextMode = import("../ContextModule").ContextMode;
type DependencyLocation = import("../Dependency").DependencyLocation;
type RawReferencedExports = import("../Dependency").RawReferencedExports;
type BuildMeta = import("../Module").BuildMeta;
type JavascriptParser = import("../javascript/JavascriptParser");
type ImportExpression = import("../javascript/JavascriptParser").ImportExpression;
type Range = import("../javascript/JavascriptParser").Range;
type JavascriptParserState = import("../javascript/JavascriptParser").JavascriptParserState;
type Members = import("../javascript/JavascriptParser").Members;
type MembersOptionals = import("../javascript/JavascriptParser").MembersOptionals;
type ArrowFunctionExpression = import("../javascript/JavascriptParser").ArrowFunctionExpression;
type FunctionExpression = import("../javascript/JavascriptParser").FunctionExpression;
type Identifier = import("../javascript/JavascriptParser").Identifier;
type ObjectPattern = import("../javascript/JavascriptParser").ObjectPattern;
type CallExpression = import("../javascript/JavascriptParser").CallExpression;
type ImportSettings = {
    references: RawReferencedExports;
    expression: ImportExpression;
};
type State = WeakMap<ImportExpression, RawReferencedExports>;
