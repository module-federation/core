export = BroadContextsPlugin;
declare class BroadContextsPlugin {
    /**
     * Creates an instance of BroadContextsPlugin.
     * @param {PerformanceOptions} options the plugin options
     */
    constructor(options: PerformanceOptions);
    /** @type {PerformanceOptions["hints"]} */
    hints: PerformanceOptions["hints"];
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace BroadContextsPlugin {
    export { PerformanceOptions, Compiler, Dependency, ContextModule, Module, BroadContextDetails };
}
type PerformanceOptions = import("../../declarations/WebpackOptions").PerformanceOptions;
type Compiler = import("../Compiler");
type Dependency = import("../graph/Dependency");
type ContextModule = import("../context/ContextModule");
type Module = import("../module/Module");
type BroadContextDetails = import("../errors/BroadContextsWarning").BroadContextDetails;
