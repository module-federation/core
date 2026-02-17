export = MultiCompiler;
declare class MultiCompiler {
    /**
     * @param {Compiler[] | Record<string, Compiler>} compilers child compilers
     * @param {MultiCompilerOptions} options options
     */
    constructor(compilers: Compiler[] | Record<string, Compiler>, options: MultiCompilerOptions);
    hooks: Readonly<{
        /** @type {SyncHook<[MultiStats]>} */
        done: SyncHook<[MultiStats]>;
        /** @type {MultiHook<SyncHook<[string | null, number]>>} */
        invalid: MultiHook<SyncHook<[string | null, number]>>;
        /** @type {MultiHook<AsyncSeriesHook<[Compiler]>>} */
        run: MultiHook<AsyncSeriesHook<[Compiler]>>;
        /** @type {SyncHook<[]>} */
        watchClose: SyncHook<[]>;
        /** @type {MultiHook<AsyncSeriesHook<[Compiler]>>} */
        watchRun: MultiHook<AsyncSeriesHook<[Compiler]>>;
        /** @type {MultiHook<SyncBailHook<[string, string, EXPECTED_ANY[] | undefined], true | void>>} */
        infrastructureLog: MultiHook<SyncBailHook<[string, string, EXPECTED_ANY[] | undefined], true | void>>;
    }>;
    compilers: import("./Compiler")[];
    /** @type {MultiCompilerOptions} */
    _options: MultiCompilerOptions;
    /** @type {WeakMap<Compiler, string[]>} */
    dependencies: WeakMap<Compiler, string[]>;
    running: boolean;
    _validateCompilersOptions(): void;
    get options(): import("../declarations/WebpackOptions").WebpackOptionsNormalized[] & MultiCompilerOptions;
    get outputPath(): string;
    /**
     * @param {InputFileSystem} value the new input file system
     */
    set inputFileSystem(value: InputFileSystem);
    get inputFileSystem(): InputFileSystem;
    /**
     * @param {OutputFileSystem} value the new output file system
     */
    set outputFileSystem(value: OutputFileSystem);
    get outputFileSystem(): OutputFileSystem;
    /**
     * @param {WatchFileSystem} value the new watch file system
     */
    set watchFileSystem(value: WatchFileSystem);
    get watchFileSystem(): WatchFileSystem;
    /**
     * @param {IntermediateFileSystem} value the new intermediate file system
     */
    set intermediateFileSystem(value: IntermediateFileSystem);
    get intermediateFileSystem(): IntermediateFileSystem;
    /**
     * @param {string | (() => string)} name name of the logger, or function called once to get the logger name
     * @returns {Logger} a logger with that name
     */
    getInfrastructureLogger(name: string | (() => string)): Logger;
    /**
     * @param {Compiler} compiler the child compiler
     * @param {string[]} dependencies its dependencies
     * @returns {void}
     */
    setDependencies(compiler: Compiler, dependencies: string[]): void;
    /**
     * @param {Callback<MultiStats>} callback signals when the validation is complete
     * @returns {boolean} true if the dependencies are valid
     */
    validateDependencies(callback: Callback<MultiStats>): boolean;
    /**
     * @deprecated This method should have been private
     * @param {Compiler[]} compilers the child compilers
     * @param {RunWithDependenciesHandler} fn a handler to run for each compiler
     * @param {Callback<Stats[]>} callback the compiler's handler
     * @returns {void}
     */
    runWithDependencies(compilers: Compiler[], fn: RunWithDependenciesHandler, callback: Callback<Stats[]>): void;
    /**
     * @template SetupResult
     * @param {(compiler: Compiler, index: number, doneCallback: Callback<Stats>, isBlocked: () => boolean, setChanged: () => void, setInvalid: () => void) => SetupResult} setup setup a single compiler
     * @param {(compiler: Compiler, setupResult: SetupResult, callback: Callback<Stats>) => void} run run/continue a single compiler
     * @param {Callback<MultiStats>} callback callback when all compilers are done, result includes Stats of all changed compilers
     * @returns {SetupResult[]} result of setup
     */
    _runGraph<SetupResult>(setup: (compiler: Compiler, index: number, doneCallback: Callback<Stats>, isBlocked: () => boolean, setChanged: () => void, setInvalid: () => void) => SetupResult, run: (compiler: Compiler, setupResult: SetupResult, callback: Callback<Stats>) => void, callback: Callback<MultiStats>): SetupResult[];
    /**
     * @param {WatchOptions | WatchOptions[]} watchOptions the watcher's options
     * @param {Callback<MultiStats>} handler signals when the call finishes
     * @returns {MultiWatching | undefined} a compiler watcher
     */
    watch(watchOptions: WatchOptions | WatchOptions[], handler: Callback<MultiStats>): MultiWatching | undefined;
    /**
     * @param {Callback<MultiStats>} callback signals when the call finishes
     * @returns {void}
     */
    run(callback: Callback<MultiStats>): void;
    purgeInputFileSystem(): void;
    /**
     * @param {ErrorCallback} callback signals when the compiler closes
     * @returns {void}
     */
    close(callback: ErrorCallback): void;
}
declare namespace MultiCompiler {
    export { AsyncSeriesHook, SyncBailHook, WebpackOptions, WatchOptions, Compiler, Callback, ErrorCallback, Stats, Logger, InputFileSystem, IntermediateFileSystem, OutputFileSystem, WatchFileSystem, RunWithDependenciesHandler, MultiCompilerOptions, MultiWebpackOptions };
}
import { SyncHook } from "tapable";
import MultiStats = require("./MultiStats");
import { MultiHook } from "tapable";
import MultiWatching = require("./MultiWatching");
/**
 * <T>
 */
type AsyncSeriesHook<T> = import("tapable").AsyncSeriesHook<T>;
/**
 * <T, R>
 */
type SyncBailHook<T, R> = import("tapable").SyncBailHook<T, R>;
type WebpackOptions = import("../declarations/WebpackOptions").WebpackOptions;
type WatchOptions = import("../declarations/WebpackOptions").WatchOptions;
type Compiler = import("./Compiler");
type Callback<T, R = void> = import("./webpack").Callback<T, R>;
type ErrorCallback = import("./webpack").ErrorCallback;
type Stats = import("./Stats");
type Logger = import("./logging/Logger").Logger;
type InputFileSystem = import("./util/fs").InputFileSystem;
type IntermediateFileSystem = import("./util/fs").IntermediateFileSystem;
type OutputFileSystem = import("./util/fs").OutputFileSystem;
type WatchFileSystem = import("./util/fs").WatchFileSystem;
type RunWithDependenciesHandler = (compiler: Compiler, callback: Callback<MultiStats>) => void;
type MultiCompilerOptions = {
    /**
     * how many Compilers are allows to run at the same time in parallel
     */
    parallelism?: number | undefined;
};
type MultiWebpackOptions = ReadonlyArray<WebpackOptions> & MultiCompilerOptions;
