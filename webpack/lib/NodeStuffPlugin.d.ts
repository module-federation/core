export = NodeStuffPlugin;
declare class NodeStuffPlugin {
    /**
     * @param {NodeOptions} options options
     */
    constructor(options: NodeOptions);
    options: import("../declarations/WebpackOptions").NodeOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NodeStuffPlugin {
    export { JavascriptParserOptions, NodeOptions, Compiler, DependencyLocation, NormalModule, JavascriptParser, Expression, Range, InputFileSystem };
}
type JavascriptParserOptions = import("../declarations/WebpackOptions").JavascriptParserOptions;
type NodeOptions = import("../declarations/WebpackOptions").NodeOptions;
type Compiler = import("./Compiler");
type DependencyLocation = import("./Dependency").DependencyLocation;
type NormalModule = import("./NormalModule");
type JavascriptParser = import("./javascript/JavascriptParser");
type Expression = import("./javascript/JavascriptParser").Expression;
type Range = import("./javascript/JavascriptParser").Range;
type InputFileSystem = import("./util/fs").InputFileSystem;
