export = LargeModulesPlugin;
declare class LargeModulesPlugin {
    /**
     * Creates an instance of LargeModulesPlugin.
     * @param {PerformanceOptions} options the plugin options
     */
    constructor(options: PerformanceOptions);
    /** @type {PerformanceOptions["hints"]} */
    hints: PerformanceOptions["hints"];
    /** @type {PerformanceOptions["maxAssetSize"]} */
    maxAssetSize: PerformanceOptions["maxAssetSize"];
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace LargeModulesPlugin {
    export { PerformanceOptions, Compiler, Module, LargeModuleDetails };
}
type PerformanceOptions = import("../../declarations/WebpackOptions").PerformanceOptions;
type Compiler = import("../Compiler");
type Module = import("../module/Module");
type LargeModuleDetails = import("../errors/LargeModulesWarning").LargeModuleDetails;
