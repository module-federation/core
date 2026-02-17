export = RequireContextDependencyParserPlugin;
declare class RequireContextDependencyParserPlugin {
    /**
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace RequireContextDependencyParserPlugin {
    export { ContextMode, DependencyLocation, JavascriptParser, Range };
}
type ContextMode = import("../ContextModule").ContextMode;
type DependencyLocation = import("../Dependency").DependencyLocation;
type JavascriptParser = import("../javascript/JavascriptParser");
type Range = import("../javascript/JavascriptParser").Range;
