export = OsDependentRuleWarningPlugin;
declare class OsDependentRuleWarningPlugin {
    /**
     * Creates an instance of OsDependentRuleWarningPlugin.
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
declare namespace OsDependentRuleWarningPlugin {
    export { Separator };
}
import type { PerformanceOptions } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
type Separator = "posix" | "windows" | undefined;
