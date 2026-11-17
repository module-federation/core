export = MultiCompiler;
declare class MultiCompiler {
    /**
     * Creates an instance of MultiCompiler.
     * @param {Compiler[] | Record<string, Compiler>} compilers child compilers
     * @param {MultiCompilerOptions} options options
     */
    constructor(compilers: Compiler[] | Record<string, Compiler>, options: MultiCompilerOptions);
    hooks: Readonly<{
        /** @type {SyncHook<[MultiStats, Compiler[]]>} */
        done: SyncHook<[MultiStats, Compiler[]]>;
        /** @type {MultiHook<SyncHook<[string | null, number]>>} */
        invalid: MultiHook<SyncHook<[string | null, number]>>;
        /** @type {MultiHook<AsyncSeriesHook<[Compiler]>>} */
        run: MultiHook<AsyncSeriesHook<[Compiler]>>;
        /** @type {SyncHook<[]>} */
        watchClose: SyncHook<[]>;
        /** @type {MultiHook<AsyncSeriesHook<[]>>} */
        shutdown: MultiHook<AsyncSeriesHook<[]>>;
        /** @type {MultiHook<AsyncSeriesHook<[Compiler]>>} */
        watchRun: MultiHook<AsyncSeriesHook<[Compiler]>>;
        /** @type {MultiHook<SyncBailHook<[string, string, EXPECTED_ANY[] | undefined], true | void>>} */
        infrastructureLog: MultiHook<SyncBailHook<[string, string, EXPECTED_ANY[] | undefined], true | void>>;
    }>;
    /** @type {Compiler[]} */
    compilers: Compiler[];
    /** @type {MultiCompilerOptions} */
    _options: MultiCompilerOptions;
    /** @type {WeakMap<Compiler, string[]>} */
    dependencies: WeakMap<Compiler, string[]>;
    /** @type {boolean} */
    running: boolean;
    /** @type {MultiWatching | undefined} */
    watching: MultiWatching | undefined;
    _validateCompilersOptions(): void;
    get options(): import("../declarations/WebpackOptions").WebpackOptionsNormalized[] & MultiCompilerOptions;
    get outputPath(): string;
    /**
     * Sets input file system.
     * @param {InputFileSystem} value the new input file system
     */
    set inputFileSystem(value: InputFileSystem);
    get inputFileSystem(): InputFileSystem;
    /**
     * Sets output file system.
     * @param {OutputFileSystem} value the new output file system
     */
    set outputFileSystem(value: OutputFileSystem);
    get outputFileSystem(): OutputFileSystem;
    /**
     * Sets watch file system.
     * @param {WatchFileSystem} value the new watch file system
     */
    set watchFileSystem(value: WatchFileSystem);
    get watchFileSystem(): WatchFileSystem;
    /**
     * Sets intermediate file system.
     * @param {IntermediateFileSystem} value the new intermediate file system
     */
    set intermediateFileSystem(value: IntermediateFileSystem);
    get intermediateFileSystem(): IntermediateFileSystem;
    /**
     * Gets infrastructure logger.
     * @param {string | (() => string)} name name of the logger, or function called once to get the logger name
     * @returns {Logger} a logger with that name
     */
    getInfrastructureLogger(name: string | (() => string)): Logger;
    /**
     * Updates dependencies using the provided compiler.
     * @param {Compiler} compiler the child compiler
     * @param {string[]} dependencies its dependencies
     * @returns {void}
     */
    setDependencies(compiler: Compiler, dependencies: string[]): void;
    /**
     * Validate dependencies.
     * @param {Callback<MultiStats>} callback signals when the validation is complete
     * @returns {boolean} true if the dependencies are valid
     */
    validateDependencies(callback: Callback<MultiStats>): boolean;
    /**
     * Run with dependencies.
     * @deprecated This method should have been private
     * @param {Compiler[]} compilers the child compilers
     * @param {RunWithDependenciesHandler} fn a handler to run for each compiler
     * @param {Callback<Stats[]>} callback the compiler's handler
     * @returns {void}
     */
    runWithDependencies(compilers: Compiler[], fn: RunWithDependenciesHandler, callback: Callback<Stats[]>): void;
    /**
     * Returns result of setup.
     * @template SetupResult
     * @param {(compiler: Compiler, index: number, doneCallback: Callback<Stats>, isBlocked: () => boolean, setChanged: () => void, setInvalid: () => void) => SetupResult} setup setup a single compiler
     * @param {(compiler: Compiler, setupResult: SetupResult, callback: Callback<Stats>) => void} run run/continue a single compiler
     * @param {Callback<MultiStats>} callback callback when all compilers are done, result includes Stats of all changed compilers
     * @returns {SetupResult[]} result of setup
     */
    _runGraph<SetupResult>(setup: (compiler: Compiler, index: number, doneCallback: Callback<Stats>, isBlocked: () => boolean, setChanged: () => void, setInvalid: () => void) => SetupResult, run: (compiler: Compiler, setupResult: SetupResult, callback: Callback<Stats>) => void, callback: Callback<MultiStats>): SetupResult[];
    /**
     * Returns a compiler watcher.
     * @param {WatchOptions | WatchOptions[]} watchOptions the watcher's options
     * @param {Callback<MultiStats>} handler signals when the call finishes
     * @returns {MultiWatching | undefined} a compiler watcher
     */
    watch(watchOptions: WatchOptions | WatchOptions[], handler: Callback<MultiStats>): MultiWatching | undefined;
    /**
     * Processes the provided multi stat.
     * @param {Callback<MultiStats>} callback signals when the call finishes
     * @returns {void}
     */
    run(callback: Callback<MultiStats>): void;
    purgeInputFileSystem(): void;
    /**
     * Processes the provided error callback.
     * @param {ErrorCallback} callback signals when the compiler closes
     * @returns {void}
     */
    close(callback: ErrorCallback): void;
}
declare namespace MultiCompiler {
    export { AsyncSeriesHook, SyncBailHook, MultiCompiler, Callback, RunWithDependenciesHandler, MultiCompilerPluginInstance, MultiCompilerPluginFunction, MultiCompilerOptions, MultiWebpackOptions };
}
import { SyncHook } from "tapable";
import MultiStats = require("./stats/MultiStats");
import type Compiler from "./Compiler";
import { MultiHook } from "tapable";
import MultiWatching = require("./watch/MultiWatching");
import type { InputFileSystem } from "./fs/fs";
import type { OutputFileSystem } from "./fs/fs";
import type { WatchFileSystem } from "./fs/fs";
import type { IntermediateFileSystem } from "./fs/fs";
import type { Logger } from "./logging/Logger";
import type Stats from "./stats/Stats";
import type { WatchOptions } from "../declarations/WebpackOptions";
import type { ErrorCallback } from "./webpack";
/**
 * <T>
 */
type AsyncSeriesHook<T> = import("tapable").AsyncSeriesHook<T>;
/**
 * <T, R>
 */
type SyncBailHook<T, R> = import("tapable").SyncBailHook<T, R>;
type MultiCompiler = import("./MultiCompiler");
/**
 * Defines the callback type used by this module.
 */
type Callback<T, R = void> = import("./webpack").Callback<T, R>;
/**
 * Defines the run with dependencies handler callback.
 */
type RunWithDependenciesHandler = (compiler: Compiler, callback: Callback<MultiStats>) => void;
/**
 * A plugin applied to the MultiCompiler itself rather than to each child.
 */
type MultiCompilerPluginInstance = {
    /**
     * called once with the MultiCompiler
     */
    apply: (compiler: MultiCompiler) => void;
};
type MultiCompilerPluginFunction = (this: MultiCompiler, compiler: MultiCompiler) => void;
/**
 * Defines the multi compiler options type used by this module.
 */
type MultiCompilerOptions = {
    /**
     * how many Compilers are allows to run at the same time in parallel
     */
    parallelism?: number | undefined;
    /**
     * plugins applied once to the MultiCompiler when it is created
     */
    plugins?: (false | "" | 0 | null | undefined | MultiCompilerPluginInstance | MultiCompilerPluginFunction)[] | undefined;
};
type MultiWebpackOptions = ReadonlyArray<WebpackOptions> & MultiCompilerOptions;
import type { WebpackOptions } from "../declarations/WebpackOptions";
