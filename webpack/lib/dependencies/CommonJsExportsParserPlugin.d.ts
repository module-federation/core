export = CommonJsExportsParserPlugin;
declare class CommonJsExportsParserPlugin {
    /**
     * @param {ModuleGraph} moduleGraph module graph
     */
    constructor(moduleGraph: ModuleGraph);
    moduleGraph: import("../ModuleGraph");
    /**
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace CommonJsExportsParserPlugin {
    export { AssignmentExpression, CallExpression, Expression, Super, DependencyLocation, ModuleGraph, ExportInfoName, BasicEvaluatedExpression, JavascriptParser, Range, Members, StatementPath, CommonJSDependencyBaseKeywords, BuildMeta };
}
type AssignmentExpression = import("estree").AssignmentExpression;
type CallExpression = import("estree").CallExpression;
type Expression = import("estree").Expression;
type Super = import("estree").Super;
type DependencyLocation = import("../Dependency").DependencyLocation;
type ModuleGraph = import("../ModuleGraph");
type ExportInfoName = import("../ExportsInfo").ExportInfoName;
type BasicEvaluatedExpression = import("../javascript/BasicEvaluatedExpression");
type JavascriptParser = import("../javascript/JavascriptParser");
type Range = import("../javascript/JavascriptParser").Range;
type Members = import("../javascript/JavascriptParser").Members;
type StatementPath = import("../javascript/JavascriptParser").StatementPath;
type CommonJSDependencyBaseKeywords = import("./CommonJsDependencyHelpers").CommonJSDependencyBaseKeywords;
type BuildMeta = import("../Module").BuildMeta;
