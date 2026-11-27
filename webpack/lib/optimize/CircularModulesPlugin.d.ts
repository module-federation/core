export = CircularModulesPlugin;
/**
 * @typedef {object} CircularModulesPluginOptions
 * @property {PerformanceOptions["hints"]=} hints when set, report SCC groups
 */
/**
 * One sync SCC scan: marks Synchronous and Binding kinds, reports groups when hints are set.
 */
declare class CircularModulesPlugin {
    /**
     * The circular kind recorded on `module.buildInfo`, or `undefined` when this
     * plugin did not run for the compilation.
     * @param {Module} module the module
     * @returns {number | undefined} bit flags from CircularKind
     */
    static getCircularKind(module: Module): number | undefined;
    /**
     * Whether the module is circular. With `kind`, requires that bit to be set.
     * Without `kind`, any non-None kind counts. Missing kind (plugin off) is false.
     * @param {Module} module the module
     * @param {number=} kind CircularKind bit to test (e.g. CircularKind.Binding)
     * @returns {boolean} true when the module matches
     */
    static isCircular(module: Module, kind?: number | undefined): boolean;
    /**
     * @param {CircularModulesPluginOptions=} options options
     */
    constructor(options?: CircularModulesPluginOptions | undefined);
    /** @type {PerformanceOptions["hints"] | undefined} */
    hints: PerformanceOptions["hints"] | undefined;
    /**
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace CircularModulesPlugin {
    export { CircularKind, STAGE_DETECT, CircularModulesPluginOptions };
}
import type { PerformanceOptions } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
import type Module from "../module/Module";
/**
 * Bit flags for why a module is treated as circular.
 * A module may carry both bits when it sits in a sync SCC and is a binding-read target.
 */
type CircularKind = number;
declare namespace CircularKind {
    let None: number;
    let Binding: number;
    let Synchronous: number;
}
declare const STAGE_DETECT: 1;
type CircularModulesPluginOptions = {
    /**
     * when set, report SCC groups
     */
    hints?: PerformanceOptions["hints"] | undefined;
};
