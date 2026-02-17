export = URLParserPlugin;
declare class URLParserPlugin {
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
declare namespace URLParserPlugin {
    export { MemberExpression, NewExpressionNode, JavascriptParserOptions, DependencyLocation, NormalModule, JavascriptParser, Range };
}
type MemberExpression = import("estree").MemberExpression;
type NewExpressionNode = import("estree").NewExpression;
type JavascriptParserOptions = import("../../declarations/WebpackOptions").JavascriptParserOptions;
type DependencyLocation = import("../Dependency").DependencyLocation;
type NormalModule = import("../NormalModule");
type JavascriptParser = import("../javascript/JavascriptParser");
type Range = import("../javascript/JavascriptParser").Range;
