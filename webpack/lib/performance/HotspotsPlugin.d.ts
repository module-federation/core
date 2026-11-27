export = HotspotsPlugin;
declare class HotspotsPlugin {
    /**
     * Creates an instance of HotspotsPlugin.
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
declare namespace HotspotsPlugin {
    export { FullTap, TapCallback, AsyncTapFunction, PerformanceOptions, Compiler, Compilation, NormalModuleFactory, ContextModuleFactory, HookDetails, HotspotDetails };
}
type FullTap = import("tapable").FullTap;
/**
 * The callback an `async` tap reports its error or result through.
 */
type TapCallback<R> = (error?: Error | null, result?: R) => void;
/**
 * An `async` tap's function, the hook's callback after its arguments.
 */
type AsyncTapFunction<A extends unknown[], R> = (...args: [...A, TapCallback<R>]) => void;
type PerformanceOptions = import("../../declarations/WebpackOptions").PerformanceOptions;
type Compiler = import("../Compiler");
type Compilation = import("../Compilation");
type NormalModuleFactory = import("../module/NormalModuleFactory");
type ContextModuleFactory = import("../context/ContextModuleFactory");
type HookDetails = import("../errors/HotspotsWarning").HookDetails;
type HotspotDetails = import("../errors/HotspotsWarning").HotspotDetails;
