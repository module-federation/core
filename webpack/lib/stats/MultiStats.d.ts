export = MultiStats;
/** @typedef {StatsOptions} MultiStatsOptions */
/** @typedef {{ version: boolean, hash: boolean, errorsCount: boolean, warningsCount: boolean, errors: boolean, warnings: boolean, hints: boolean, hintsCount: boolean, children: NormalizedStatsOptions[] }} ChildOptions */
declare class MultiStats {
    /**
     * Creates an instance of MultiStats.
     * @param {Stats[]} stats the child stats
     */
    constructor(stats: Stats[]);
    /** @type {Stats[]} */
    stats: Stats[];
    get hash(): string;
    /**
     * Checks whether this multi stats has errors.
     * @returns {boolean} true if a child compilation encountered an error
     */
    hasErrors(): boolean;
    /**
     * Checks whether this multi stats has warnings.
     * @returns {boolean} true if a child compilation had a warning
     */
    hasWarnings(): boolean;
    /**
     * Create child options.
     * @param {undefined | StatsValue} options stats options
     * @param {CreateStatsOptionsContext} context context
     * @returns {ChildOptions} context context
     */
    _createChildOptions(options: undefined | StatsValue, context: CreateStatsOptionsContext): ChildOptions;
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
declare namespace MultiStats {
    export { MultiStatsOptions, ChildOptions };
}
import type Stats from "./Stats";
import type { StatsValue } from "../../declarations/WebpackOptions";
import type { CreateStatsOptionsContext } from "../Compilation";
import type { StatsCompilation } from "./DefaultStatsFactoryPlugin";
type MultiStatsOptions = StatsOptions;
type ChildOptions = {
    version: boolean;
    hash: boolean;
    errorsCount: boolean;
    warningsCount: boolean;
    errors: boolean;
    warnings: boolean;
    hints: boolean;
    hintsCount: boolean;
    children: NormalizedStatsOptions[];
};
import type { StatsOptions } from "../../declarations/WebpackOptions";
import type { NormalizedStatsOptions } from "../Compilation";
