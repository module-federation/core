export = ProgressPlugin;
declare class ProgressPlugin {
    /**
     * Returns a progress reporter, if any.
     * @param {Compiler} compiler the current compiler
     * @returns {ReportProgress | undefined} a progress reporter, if any
     */
    static getReporter(compiler: Compiler): ReportProgress | undefined;
    /**
     * Creates an instance of ProgressPlugin.
     * @param {ProgressPluginArgument} options options
     */
    constructor(options?: ProgressPluginArgument);
    /** @type {ProgressPluginOptions} */
    options: ProgressPluginOptions;
    /** @type {boolean | null} */
    profile: boolean | null;
    /** @type {HandlerFn | undefined} */
    handler: HandlerFn | undefined;
    /** @type {number} */
    modulesCount: number;
    /** @type {number} */
    dependenciesCount: number;
    /** @type {boolean} */
    showEntries: boolean;
    /** @type {boolean} */
    showModules: boolean;
    /** @type {boolean} */
    showDependencies: boolean;
    /** @type {boolean} */
    showActiveModules: boolean;
    percentBy: "entries" | "dependencies" | "modules";
    /** @type {ProgressBarOptions | false | "auto"} */
    progressBar: ProgressBarOptions | false | "auto";
    /** @type {boolean} */
    estimatedTime: boolean;
    /** @type {boolean} */
    phaseTimings: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler | MultiCompiler} compiler webpack compiler
     * @returns {void}
     */
    apply(compiler: Compiler | MultiCompiler): void;
    /**
     * Apply on multi compiler.
     * @param {MultiCompiler} compiler webpack multi-compiler
     * @param {HandlerFn} handler function that executes for every progress step
     * @returns {void}
     */
    _applyOnMultiCompiler(compiler: MultiCompiler, handler: HandlerFn): void;
    /**
     * Processes the provided compiler.
     * @param {Compiler} compiler webpack compiler
     * @param {HandlerFn} handler function that executes for every progress step
     * @returns {void}
     */
    _applyOnCompiler(compiler: Compiler, handler: HandlerFn): void;
}
declare namespace ProgressPlugin {
    export { DEFAULT_OPTIONS as defaultOptions, createDefaultHandler, Hook, PositiveNumber, ProgressPluginOptionsProgressBarBranch3Object, HandlerFunction, ProgressPluginOptions, ProgressPluginArgument, HandlerFn, ProgressBarOptions, DefaultHandlerOptions, ReportProgress };
}
import Compiler = require("../Compiler");
import MultiCompiler = require("../MultiCompiler");
/** @type {Required<Omit<ProgressPluginOptions, "handler">>} */
declare const DEFAULT_OPTIONS: Required<Omit<ProgressPluginOptions, "handler">>;
/** @typedef {{ progressBar?: ProgressBarOptions | false, estimatedTime?: boolean, phaseTimings?: boolean }} DefaultHandlerOptions */
/**
 * Creates a default handler.
 * @param {boolean | null | undefined} profile need profile
 * @param {Logger} logger logger
 * @param {DefaultHandlerOptions=} options display options
 * @returns {HandlerFn} default handler
 */
declare function createDefaultHandler(profile: boolean | null | undefined, logger: Logger, options?: DefaultHandlerOptions | undefined): HandlerFn;
/**
 * Defines the hook type used by this module.
 */
type Hook<T, R, AdditionalOptions> = import("tapable").Hook<T, R, AdditionalOptions>;
type PositiveNumber = number;
type ProgressPluginOptionsProgressBarBranch3Object = {
    /**
     * Color used for the filled portion of the bar.
     */
    color?: string | undefined;
    /**
     * Name shown before the progress bar.
     */
    name?: string | undefined;
    /**
     * Width of the progress bar in characters. Default: 25.
     */
    width?: PositiveNumber | undefined;
};
/**
 * Function that executes for every progress step.
 */
type HandlerFunction = import("./ProgressPlugin").HandlerFn;
/**
 * Options object for the ProgressPlugin.
 */
type ProgressPluginOptions = {
    /**
     * Show active modules count and one active module in progress message.
     */
    activeModules?: boolean | undefined;
    /**
     * Show dependencies count in progress message.
     */
    dependencies?: boolean | undefined;
    /**
     * Minimum dependencies count to start with. For better progress calculation. Default: 10000.
     */
    dependenciesCount?: number | undefined;
    /**
     * Show entries count in progress message.
     */
    entries?: boolean | undefined;
    /**
     * Show estimated time remaining based on build progress. Default: false.
     */
    estimatedTime?: boolean | undefined;
    handler?: HandlerFunction | undefined;
    /**
     * Show modules count in progress message.
     */
    modules?: boolean | undefined;
    /**
     * Minimum modules count to start with. For better progress calculation. Default: 5000.
     */
    modulesCount?: number | undefined;
    /**
     * Collect percent algorithm. By default it calculates by a median from modules, entries and dependencies percent.
     */
    percentBy?: ("entries" | "modules" | "dependencies" | null) | undefined;
    /**
     * Show a timing breakdown for each build phase when the build completes. Default: false.
     */
    phaseTimings?: boolean | undefined;
    /**
     * Collect profile data for progress steps. Default: false.
     */
    profile?: (true | false | null) | undefined;
    /**
     * Generate progress bar. `"auto"` enables it only for interactive terminals. Default: false.
     */
    progressBar?: ("auto" | boolean | ProgressPluginOptionsProgressBarBranch3Object) | undefined;
};
type ProgressPluginArgument = ProgressPluginOptions | HandlerFunction;
type HandlerFn = (percentage: number, msg: string, ...args: string[]) => void;
type ProgressBarOptions = Required<Exclude<NonNullable<ProgressPluginOptions["progressBar"]>, boolean | "auto">>;
type DefaultHandlerOptions = {
    progressBar?: ProgressBarOptions | false;
    estimatedTime?: boolean;
    phaseTimings?: boolean;
};
/**
 * Defines the report progress callback.
 */
type ReportProgress = (p: number, ...args: string[]) => void;
import type { Logger } from "./Logger";
