export = Watching;
/** @import { WatchOptions } from "../../declarations/WebpackOptions" */
/** @import Compilation from "../Compilation" */
/** @import Compiler from "../Compiler" */
/** @import { Logger } from "../logging/Logger" */
/** @import { TimeInfoEntries, WatchFileSystem, Watcher } from "../fs/fs" */
/** @import { ErrorCallback } from "../webpack" */
/**
 * Defines the callback type used by this module.
 * @template T
 * @template [R=void]
 * @typedef {import("../webpack").Callback<T, R>} Callback
 */
/** @typedef {Set<string>} CollectedFiles */
declare class Watching {
    /**
     * Creates an instance of Watching.
     * @param {Compiler} compiler the compiler
     * @param {WatchOptions} watchOptions options
     * @param {Callback<Stats>} handler completion handler
     */
    constructor(compiler: Compiler, watchOptions: WatchOptions, handler: Callback<Stats>);
    /** @type {null | number} */
    startTime: null | number;
    /** @type {boolean} */
    invalid: boolean;
    /** @type {Callback<Stats>} */
    handler: Callback<Stats>;
    /** @type {ErrorCallback[]} */
    callbacks: ErrorCallback[];
    /** @type {ErrorCallback[] | undefined} */
    _closeCallbacks: ErrorCallback[] | undefined;
    /** @type {boolean} */
    closed: boolean;
    /** @type {boolean} */
    suspended: boolean;
    /** @type {boolean} */
    blocked: boolean;
    _isBlocked: () => boolean;
    _onChange: () => void;
    _onInvalid: () => void;
    /** @type {WatchOptions} */
    watchOptions: WatchOptions;
    /** @type {Compiler} */
    compiler: Compiler;
    /** @type {boolean} */
    running: boolean;
    /** @type {boolean} */
    _initial: boolean;
    /** @type {boolean} */
    _invalidReported: boolean;
    /** @type {boolean} */
    _needRecords: boolean;
    /** @type {undefined | null | Watcher} */
    watcher: undefined | null | Watcher;
    /** @type {undefined | null | Watcher} */
    pausedWatcher: undefined | null | Watcher;
    /** @type {CollectedFiles | undefined} */
    _collectedChangedFiles: CollectedFiles | undefined;
    /** @type {CollectedFiles | undefined} */
    _collectedRemovedFiles: CollectedFiles | undefined;
    /**
     * Processes the provided err.
     * @param {(Error | null)=} err an optional error
     * @param {Compilation=} compilation the compilation
     * @returns {void}
     */
    _done(err?: (Error | null) | undefined, compilation?: Compilation | undefined): void;
    /**
     * Merge with collected.
     * @param {ReadonlySet<string> | undefined | null} changedFiles changed files
     * @param {ReadonlySet<string> | undefined | null} removedFiles removed files
     */
    _mergeWithCollected(changedFiles: ReadonlySet<string> | undefined | null, removedFiles: ReadonlySet<string> | undefined | null): void;
    /**
     * Processes the provided file time info entries.
     * @param {TimeInfoEntries=} fileTimeInfoEntries info for files
     * @param {TimeInfoEntries=} contextTimeInfoEntries info for directories
     * @param {ReadonlySet<string>=} changedFiles changed files
     * @param {ReadonlySet<string>=} removedFiles removed files
     * @returns {void}
     */
    _go(fileTimeInfoEntries?: TimeInfoEntries | undefined, contextTimeInfoEntries?: TimeInfoEntries | undefined, changedFiles?: ReadonlySet<string> | undefined, removedFiles?: ReadonlySet<string> | undefined): void;
    lastWatcherStartTime: number;
    /**
     * Returns the compilation stats.
     * @param {Compilation} compilation the compilation
     * @returns {Stats} the compilation stats
     */
    _getStats(compilation: Compilation): Stats;
    /**
     * Processes the provided file.
     * @param {Iterable<string>} files watched files
     * @param {Iterable<string>} dirs watched directories
     * @param {Iterable<string>} missing watched existence entries
     * @returns {void}
     */
    watch(files: Iterable<string>, dirs: Iterable<string>, missing: Iterable<string>): void;
    /**
     * Processes the provided error callback.
     * @param {ErrorCallback=} callback signals when the build has completed again
     * @returns {void}
     */
    invalidate(callback?: ErrorCallback | undefined): void;
    /**
     * Processes the provided file time info entries.
     * @param {TimeInfoEntries=} fileTimeInfoEntries info for files
     * @param {TimeInfoEntries=} contextTimeInfoEntries info for directories
     * @param {ReadonlySet<string>=} changedFiles changed files
     * @param {ReadonlySet<string>=} removedFiles removed files
     * @returns {void}
     */
    _invalidate(fileTimeInfoEntries?: TimeInfoEntries | undefined, contextTimeInfoEntries?: TimeInfoEntries | undefined, changedFiles?: ReadonlySet<string> | undefined, removedFiles?: ReadonlySet<string> | undefined): void;
    suspend(): void;
    resume(): void;
    /**
     * Processes the provided error callback.
     * @param {ErrorCallback} callback signals when the watcher is closed
     * @returns {void}
     */
    close(callback: ErrorCallback): void;
}
declare namespace Watching {
    export { Callback, CollectedFiles };
}
import Stats = require("../stats/Stats");
import type { ErrorCallback } from "../webpack";
import type { WatchOptions } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
import type { Watcher } from "../fs/fs";
import type Compilation from "../Compilation";
import type { TimeInfoEntries } from "../fs/fs";
/**
 * Defines the callback type used by this module.
 */
type Callback<T, R = void> = import("../webpack").Callback<T, R>;
type CollectedFiles = Set<string>;
