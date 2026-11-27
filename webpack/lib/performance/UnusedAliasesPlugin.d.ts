export = UnusedAliasesPlugin;
declare class UnusedAliasesPlugin {
    /**
     * Creates an instance of UnusedAliasesPlugin.
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
declare namespace UnusedAliasesPlugin {
    export { PendingAlias };
}
import type { PerformanceOptions } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
/**
 * One `resolve.alias` entry, prepared for repeated matching.
 */
type PendingAlias = {
    /**
     * the alias name as written, for the report
     */
    name: string;
    /**
     * the name to compare with, separators normalized when absolute
     */
    matchName: string;
    /**
     * whether the alias only matches the whole request
     */
    onlyModule: boolean;
    /**
     * whether the name is an absolute path
     */
    absolute: boolean;
    /**
     * the part of `matchName` before its single "*", when it has one
     */
    wildcardPrefix: string | undefined;
    /**
     * the part of `matchName` after that "*"
     */
    wildcardSuffix: string;
    /**
     * whether some request reached this alias
     */
    used: boolean;
};
