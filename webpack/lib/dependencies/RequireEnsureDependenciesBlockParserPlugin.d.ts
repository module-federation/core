export = RequireEnsureDependenciesBlockParserPlugin;
declare class RequireEnsureDependenciesBlockParserPlugin {
    /**
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace RequireEnsureDependenciesBlockParserPlugin {
    export { GroupOptions, DependencyLocation, BasicEvaluatedExpression, JavascriptParser, Range };
}
type GroupOptions = import("../AsyncDependenciesBlock").GroupOptions;
type DependencyLocation = import("../Dependency").DependencyLocation;
type BasicEvaluatedExpression = import("../javascript/BasicEvaluatedExpression");
type JavascriptParser = import("../javascript/JavascriptParser");
type Range = import("../javascript/JavascriptParser").Range;
