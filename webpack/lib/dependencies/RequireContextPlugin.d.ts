export = RequireContextPlugin;
declare class RequireContextPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace RequireContextPlugin {
    export { JavascriptParserOptions, ResolveOptions, Compiler, Parser };
}
type JavascriptParserOptions = import("../../declarations/WebpackOptions").JavascriptParserOptions;
type ResolveOptions = import("../../declarations/WebpackOptions").ResolveOptions;
type Compiler = import("../Compiler");
type Parser = import("../javascript/JavascriptParser");
