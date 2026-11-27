export = EmbeddedSourceMapsPlugin;
declare class EmbeddedSourceMapsPlugin {
    /**
     * Creates an instance of EmbeddedSourceMapsPlugin.
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
import type { PerformanceOptions } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
