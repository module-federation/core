export = CommonJsImportsParserPlugin;
declare class CommonJsImportsParserPlugin {
    /**
     * @param {JavascriptParserOptions} options parser options
     */
    constructor(options: JavascriptParserOptions);
    options: import("../../declarations/WebpackOptions").JavascriptParserOptions;
    /**
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace CommonJsImportsParserPlugin {
    export { CallExpression, Expression, NewExpression, JavascriptParserOptions, DependencyLocation, JavascriptParser, ImportSource, Range, Members, CalleeMembers, CommonJsImportSettings };
}
type CallExpression = import("estree").CallExpression;
type Expression = import("estree").Expression;
type NewExpression = import("estree").NewExpression;
type JavascriptParserOptions = import("../../declarations/WebpackOptions").JavascriptParserOptions;
type DependencyLocation = import("../Dependency").DependencyLocation;
type JavascriptParser = import("../javascript/JavascriptParser");
type ImportSource = import("../javascript/JavascriptParser").ImportSource;
type Range = import("../javascript/JavascriptParser").Range;
type Members = import("../javascript/JavascriptParser").Members;
type CalleeMembers = import("../javascript/JavascriptParser").CalleeMembers;
type CommonJsImportSettings = {
    name?: string | undefined;
    context: string;
};
