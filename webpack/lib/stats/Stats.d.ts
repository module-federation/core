export = Stats;
/** @import { StatsValue } from "../../declarations/WebpackOptions" */
/** @import Compilation from "../Compilation" */
/** @import { StatsCompilation } from "./DefaultStatsFactoryPlugin" */
declare class Stats {
    /**
     * Creates an instance of Stats.
     * @param {Compilation} compilation webpack compilation
     */
    constructor(compilation: Compilation);
    /** @type {Compilation} */
    compilation: Compilation;
    get hash(): string;
    get startTime(): number;
    get endTime(): number;
    /**
     * Checks whether this stats has warnings.
     * @returns {boolean} true if the compilation had a warning
     */
    hasWarnings(): boolean;
    /**
     * Checks whether this stats has errors.
     * @returns {boolean} true if the compilation encountered an error
     */
    hasErrors(): boolean;
    /**
     * Returns json output.
     * @param {StatsValue=} options stats options
     * @returns {StatsCompilation} json output
     */
    toJson(options?: StatsValue | undefined): StatsCompilation;
    /**
     * Returns a string representation.
     * @param {StatsValue=} options stats options
     * @returns {string} string output
     */
    toString(options?: StatsValue | undefined): string;
}
import type Compilation from "../Compilation";
import type { StatsValue } from "../../declarations/WebpackOptions";
import type { StatsCompilation } from "./DefaultStatsFactoryPlugin";
