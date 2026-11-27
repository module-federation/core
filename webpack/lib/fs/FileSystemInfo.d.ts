export = FileSystemInfo;
/** @typedef {(err?: WebpackError | null, result?: boolean) => void} CheckSnapshotValidCallback */
/**
 * Used to access information about the filesystem in a cached way
 */
declare class FileSystemInfo {
    /**
     * Creates an instance of FileSystemInfo.
     * @param {InputFileSystem} fs file system
     * @param {object} options options
     * @param {Iterable<string | RegExp>=} options.unmanagedPaths paths that are not managed by a package manager and the contents are subject to change
     * @param {Iterable<string | RegExp>=} options.managedPaths paths that are only managed by a package manager
     * @param {Iterable<string | RegExp>=} options.immutablePaths paths that are immutable
     * @param {Logger=} options.logger logger used to log invalid snapshots
     * @param {HashFunction=} options.hashFunction the hash function to use
     */
    constructor(fs: InputFileSystem, { unmanagedPaths, managedPaths, immutablePaths, logger, hashFunction }?: {
        unmanagedPaths?: Iterable<string | RegExp> | undefined;
        managedPaths?: Iterable<string | RegExp> | undefined;
        immutablePaths?: Iterable<string | RegExp> | undefined;
        logger?: Logger | undefined;
        hashFunction?: HashFunction | undefined;
    });
    /** @type {InputFileSystem} */
    fs: InputFileSystem;
    logger: Logger;
    /** @type {number} */
    _remainingLogs: number;
    /** @type {LoggedPaths | undefined} */
    _loggedPaths: LoggedPaths | undefined;
    /** @type {HashFunction} */
    _hashFunction: HashFunction;
    /** @type {WeakMap<Snapshot, boolean | CheckSnapshotValidCallback[]>} */
    _snapshotCache: WeakMap<Snapshot, boolean | CheckSnapshotValidCallback[]>;
    /** @type {SnapshotOptimization<FileSystemInfoEntry | null, false>} */
    _fileTimestampsOptimization: SnapshotOptimization<FileSystemInfoEntry | null, false>;
    /** @type {SnapshotOptimization<string | null, false>} */
    _fileHashesOptimization: SnapshotOptimization<string | null, false>;
    /** @type {SnapshotOptimization<string | TimestampAndHash | null, false>} */
    _fileTshsOptimization: SnapshotOptimization<string | TimestampAndHash | null, false>;
    /** @type {SnapshotOptimization<ResolvedContextFileSystemInfoEntry | null, false>} */
    _contextTimestampsOptimization: SnapshotOptimization<ResolvedContextFileSystemInfoEntry | null, false>;
    /** @type {SnapshotOptimization<string | null, false>} */
    _contextHashesOptimization: SnapshotOptimization<string | null, false>;
    /** @type {SnapshotOptimization<ResolvedContextTimestampAndHash | null, false>} */
    _contextTshsOptimization: SnapshotOptimization<ResolvedContextTimestampAndHash | null, false>;
    /** @type {SnapshotOptimization<boolean, false>} */
    _missingExistenceOptimization: SnapshotOptimization<boolean, false>;
    /** @type {SnapshotOptimization<string, false>} */
    _managedItemInfoOptimization: SnapshotOptimization<string, false>;
    _managedFilesOptimization: SnapshotOptimization<any, true>;
    _managedContextsOptimization: SnapshotOptimization<any, true>;
    _managedMissingOptimization: SnapshotOptimization<any, true>;
    /** @type {StackedCacheMap<string, FileTimestamp>} */
    _fileTimestamps: StackedCacheMap<string, FileTimestamp>;
    /** @type {Map<string, string | null>} */
    _fileHashes: Map<string, string | null>;
    /** @type {Map<string, TimestampAndHash | string>} */
    _fileTshs: Map<string, TimestampAndHash | string>;
    /** @type {StackedCacheMap<string, ContextTimestamp>} */
    _contextTimestamps: StackedCacheMap<string, ContextTimestamp>;
    /** @type {Map<string, ContextHash>} */
    _contextHashes: Map<string, ContextHash>;
    /** @type {Map<string, ContextTimestampAndHash>} */
    _contextTshs: Map<string, ContextTimestampAndHash>;
    /** @type {Map<string, string>} */
    _managedItems: Map<string, string>;
    /** @type {Map<string, 0 | 1 | string>} */
    _pathClassificationCache: Map<string, 0 | 1 | string>;
    /** @type {AsyncQueue<string, string, FileSystemInfoEntry>} */
    fileTimestampQueue: AsyncQueue<string, string, FileSystemInfoEntry>;
    /** @type {AsyncQueue<string, string, string>} */
    fileHashQueue: AsyncQueue<string, string, string>;
    /** @type {AsyncQueue<string, string, ContextFileSystemInfoEntry>} */
    contextTimestampQueue: AsyncQueue<string, string, ContextFileSystemInfoEntry>;
    /** @type {AsyncQueue<string, string, ContextHash>} */
    contextHashQueue: AsyncQueue<string, string, ContextHash>;
    /** @type {AsyncQueue<string, string, ContextTimestampAndHash>} */
    contextTshQueue: AsyncQueue<string, string, ContextTimestampAndHash>;
    /** @type {AsyncQueue<string, string, string>} */
    managedItemQueue: AsyncQueue<string, string, string>;
    /** @type {AsyncQueue<string, string, Set<string>>} */
    managedItemDirectoryQueue: AsyncQueue<string, string, Set<string>>;
    /** @type {string[]} */
    unmanagedPathsWithSlash: string[];
    /** @type {RegExp[]} */
    unmanagedPathsRegExps: RegExp[];
    managedPaths: (string | RegExp)[];
    /** @type {string[]} */
    managedPathsWithSlash: string[];
    /** @type {RegExp[]} */
    managedPathsRegExps: RegExp[];
    immutablePaths: (string | RegExp)[];
    /** @type {string[]} */
    immutablePathsWithSlash: string[];
    /** @type {RegExp[]} */
    immutablePathsRegExps: RegExp[];
    /** @type {Map<string, number | null> | undefined} */
    _cachedDeprecatedFileTimestamps: Map<string, number | null> | undefined;
    /** @type {Map<string, number | null> | undefined} */
    _cachedDeprecatedContextTimestamps: Map<string, number | null> | undefined;
    /** @type {boolean} */
    _warnAboutExperimentalEsmTracking: boolean;
    /** @type {number} */
    _statCreatedSnapshots: number;
    /** @type {number} */
    _statTestedSnapshotsCached: number;
    /** @type {number} */
    _statTestedSnapshotsNotCached: number;
    /** @type {number} */
    _statTestedChildrenCached: number;
    /** @type {number} */
    _statTestedChildrenNotCached: number;
    /** @type {number} */
    _statTestedEntries: number;
    logStatistics(): void;
    /**
     * Processes the provided path.
     * @private
     * @param {string} path path
     * @param {string} reason reason
     * @param {(string | number | null | undefined | WebpackError)[]} args arguments
     */
    private _log;
    clear(): void;
    /**
     * Adds file timestamps.
     * @param {ReadonlyMap<string, FileTimestamp>} map timestamps
     * @param {boolean=} immutable if 'map' is immutable and FileSystemInfo can keep referencing it
     * @returns {void}
     */
    addFileTimestamps(map: ReadonlyMap<string, FileTimestamp>, immutable?: boolean | undefined): void;
    /**
     * Adds context timestamps.
     * @param {ReadonlyMap<string, ContextTimestamp>} map timestamps
     * @param {boolean=} immutable if 'map' is immutable and FileSystemInfo can keep referencing it
     * @returns {void}
     */
    addContextTimestamps(map: ReadonlyMap<string, ContextTimestamp>, immutable?: boolean | undefined): void;
    /**
     * Gets file timestamp.
     * @param {string} path file path
     * @param {(err?: WebpackError | null, fileTimestamp?: FileSystemInfoEntry | "ignore" | null) => void} callback callback function
     * @returns {void}
     */
    getFileTimestamp(path: string, callback: (err?: WebpackError | null, fileTimestamp?: FileSystemInfoEntry | "ignore" | null) => void): void;
    /**
     * Gets context timestamp.
     * @param {string} path context path
     * @param {(err?: WebpackError | null, resolvedContextTimestamp?: ResolvedContextTimestamp) => void} callback callback function
     * @returns {void}
     */
    getContextTimestamp(path: string, callback: (err?: WebpackError | null, resolvedContextTimestamp?: ResolvedContextTimestamp) => void): void;
    /**
     * Reads a context timestamp directly from disk, bypassing any cached
     * entry. Used by `getContextTimestamp` and the snapshot validity
     * checks when the cached entry is missing or is an `ExistenceOnlyTimeEntry`
     * (`{}`) supplied by watchpack — both cases require a fresh read to
     * obtain the `timestampHash`.
     * @private
     * @param {string} path context path
     * @param {(err?: WebpackError | null, resolvedContextTimestamp?: ResolvedContextTimestamp) => void} callback callback function
     * @returns {void}
     */
    private _readFreshContextTimestamp;
    /**
     * Get unresolved context timestamp. Existence-only cache entries (`{}`)
     * are bypassed so the callback always receives a complete entry, "ignore"
     * or null.
     * @private
     * @param {string} path context path
     * @param {(err?: WebpackError | null, contextTimestamp?: ContextFileSystemInfoEntry | "ignore" | null) => void} callback callback function
     * @returns {void}
     */
    private _getUnresolvedContextTimestamp;
    /**
     * Returns file hash.
     * @param {string} path file path
     * @param {(err?: WebpackError | null, hash?: string | null) => void} callback callback function
     * @returns {void}
     */
    getFileHash(path: string, callback: (err?: WebpackError | null, hash?: string | null) => void): void;
    /**
     * Returns context hash.
     * @param {string} path context path
     * @param {(err?: WebpackError | null, contextHash?: string) => void} callback callback function
     * @returns {void}
     */
    getContextHash(path: string, callback: (err?: WebpackError | null, contextHash?: string) => void): void;
    /**
     * Get unresolved context hash.
     * @private
     * @param {string} path context path
     * @param {(err?: WebpackError | null, contextHash?: ContextHash | null) => void} callback callback function
     * @returns {void}
     */
    private _getUnresolvedContextHash;
    /**
     * Returns context tsh.
     * @param {string} path context path
     * @param {(err?: WebpackError | null, resolvedContextTimestampAndHash?: ResolvedContextTimestampAndHash | null) => void} callback callback function
     * @returns {void}
     */
    getContextTsh(path: string, callback: (err?: WebpackError | null, resolvedContextTimestampAndHash?: ResolvedContextTimestampAndHash | null) => void): void;
    /**
     * Get unresolved context tsh.
     * @private
     * @param {string} path context path
     * @param {(err?: WebpackError | null, contextTimestampAndHash?: ContextTimestampAndHash | null) => void} callback callback function
     * @returns {void}
     */
    private _getUnresolvedContextTsh;
    _createBuildDependenciesResolvers(): {
        resolveContext: ResolveFunctionAsync;
        resolveEsm: ResolveFunctionAsync;
        resolveCjs: ResolveFunctionAsync;
        resolveCjsAsChild: ResolveFunctionAsync;
    };
    /**
     * Resolves build dependencies.
     * @param {string} context context directory
     * @param {Iterable<string>} deps dependencies
     * @param {Iterable<string> | undefined} optionalDeps optional dependencies that may be missing
     * @param {(err?: Error | null, resolveBuildDependenciesResult?: ResolveBuildDependenciesResult) => void} callback callback function
     * @returns {void}
     */
    resolveBuildDependencies(context: string, deps: Iterable<string>, optionalDeps: Iterable<string> | undefined, callback: (err?: Error | null, resolveBuildDependenciesResult?: ResolveBuildDependenciesResult) => void): void;
    /**
     * Checks resolve results valid.
     * @param {ResolveResults} resolveResults results from resolving
     * @param {(err?: Error | null, result?: boolean) => void} callback callback with true when resolveResults resolve the same way
     * @returns {void}
     */
    checkResolveResultsValid(resolveResults: ResolveResults, callback: (err?: Error | null, result?: boolean) => void): void;
    /**
     * Creates a snapshot.
     * @param {number | null | undefined} startTime when processing the files has started
     * @param {Iterable<string> | null | undefined} files all files
     * @param {Iterable<string> | null | undefined} directories all directories
     * @param {Iterable<string> | null | undefined} missing all missing files or directories
     * @param {SnapshotOptions | null | undefined} options options object (for future extensions)
     * @param {(err: WebpackError | null, snapshot: Snapshot | null) => void} callback callback function
     * @returns {void}
     */
    createSnapshot(startTime: number | null | undefined, files: Iterable<string> | null | undefined, directories: Iterable<string> | null | undefined, missing: Iterable<string> | null | undefined, options: SnapshotOptions | null | undefined, callback: (err: WebpackError | null, snapshot: Snapshot | null) => void): void;
    /**
     * Merges the provided values into a single result.
     * @param {Snapshot} snapshot1 a snapshot
     * @param {Snapshot} snapshot2 a snapshot
     * @returns {Snapshot} merged snapshot
     */
    mergeSnapshots(snapshot1: Snapshot, snapshot2: Snapshot): Snapshot;
    /**
     * Checks snapshot valid.
     * @param {Snapshot} snapshot the snapshot made
     * @param {CheckSnapshotValidCallback} callback callback function
     * @returns {void}
     */
    checkSnapshotValid(snapshot: Snapshot, callback: CheckSnapshotValidCallback): void;
    /**
     * Check snapshot valid no cache.
     * @private
     * @param {Snapshot} snapshot the snapshot made
     * @param {CheckSnapshotValidCallback} callback callback function
     * @returns {void}
     */
    private _checkSnapshotValidNoCache;
    /**
     * @private
     * @type {Processor<string, FileSystemInfoEntry>}
     */
    private _readFileTimestamp;
    /**
     * @private
     * @type {Processor<string, string>}
     */
    private _readFileHash;
    /**
     * Get file timestamp and hash.
     * @private
     * @param {string} path path
     * @param {(err: WebpackError | null, timestampAndHash?: TimestampAndHash | string) => void} callback callback
     */
    private _getFileTimestampAndHash;
    /**
     * Processes the provided object.
     * @private
     * @template T
     * @template ItemType
     * @param {object} options options
     * @param {string} options.path path
     * @param {(value: string) => ItemType} options.fromImmutablePath called when context item is an immutable path
     * @param {(value: string) => ItemType} options.fromManagedItem called when context item is a managed path
     * @param {(value: string, result: string, callback: (err?: WebpackError | null, itemType?: ItemType) => void) => void} options.fromSymlink called when context item is a symlink
     * @param {(value: string, stats: IStats, callback: (err?: WebpackError | null, itemType?: ItemType | null) => void) => void} options.fromFile called when context item is a file
     * @param {(value: string, stats: IStats, callback: (err?: WebpackError | null, itemType?: ItemType) => void) => void} options.fromDirectory called when context item is a directory
     * @param {(arr: string[], arr1: ItemType[]) => T} options.reduce called from all context items
     * @param {(err?: Error | null, result?: T | null) => void} callback callback
     */
    private _readContext;
    /**
     * @private
     * @type {Processor<string, ContextFileSystemInfoEntry>}
     */
    private _readContextTimestamp;
    /**
     * Resolve context timestamp.
     * @private
     * @param {ContextFileSystemInfoEntry} entry entry
     * @param {(err?: WebpackError | null, resolvedContextTimestamp?: ResolvedContextTimestamp) => void} callback callback
     * @returns {void}
     */
    private _resolveContextTimestamp;
    /**
     * @private
     * @type {Processor<string, ContextHash>}
     */
    private _readContextHash;
    /**
     * Resolve context hash.
     * @private
     * @param {ContextHash} entry context hash
     * @param {(err: WebpackError | null, contextHash?: string) => void} callback callback
     * @returns {void}
     */
    private _resolveContextHash;
    /**
     * @private
     * @type {Processor<string, ContextTimestampAndHash>}
     */
    private _readContextTimestampAndHash;
    /**
     * Resolve context tsh.
     * @private
     * @param {ContextTimestampAndHash} entry entry
     * @param {ProcessorCallback<ResolvedContextTimestampAndHash>} callback callback
     * @returns {void}
     */
    private _resolveContextTsh;
    /**
     * @private
     * @type {Processor<string, Set<string>>}
     */
    private _getManagedItemDirectoryInfo;
    /**
     * @private
     * @type {Processor<string, string>}
     */
    private _getManagedItemInfo;
    getDeprecatedFileTimestamps(): Map<string, number>;
    getDeprecatedContextTimestamps(): Map<string, number>;
}
declare namespace FileSystemInfo {
    export { Snapshot, ProcessorCallback, Processor, JobType, ExistenceOnlyTimeEntry, FileSystemInfoEntry, ResolvedContextFileSystemInfoEntry, Symlinks, ContextFileSystemInfoEntry, TimestampAndHash, ResolvedContextTimestampAndHash, ContextTimestampAndHash, ContextHash, SnapshotContent, SnapshotOptimizationEntry, ResolveResults, Files, Directories, Missing, ResolveDependencies, ResolveBuildDependenciesResult, SnapshotOptions, GetMapsFunction, FileTimestamps, FileHashes, FileTshs, ContextTimestamps, ContextHashes, ContextTshs, MissingExistence, ManagedItemInfo, ManagedFiles, ManagedContexts, ManagedMissing, Children, SnapshotOptimizationValue, LoggedPaths, FileTimestamp, ContextTimestamp, ResolvedContextTimestamp, CheckSnapshotValidCallback };
}
import type { InputFileSystem } from "./fs";
import type { Logger } from "../logging/Logger";
import type { HashFunction } from "../../declarations/WebpackOptions";
declare class Snapshot {
    /** @type {number} */
    _flags: number;
    /** @type {Iterable<string> | undefined} */
    _cachedFileIterable: Iterable<string> | undefined;
    /** @type {Iterable<string> | undefined} */
    _cachedContextIterable: Iterable<string> | undefined;
    /** @type {Iterable<string> | undefined} */
    _cachedMissingIterable: Iterable<string> | undefined;
    /** @type {number | undefined} */
    startTime: number | undefined;
    /** @type {FileTimestamps | undefined} */
    fileTimestamps: FileTimestamps | undefined;
    /** @type {FileHashes | undefined} */
    fileHashes: FileHashes | undefined;
    /** @type {FileTshs | undefined} */
    fileTshs: FileTshs | undefined;
    /** @type {ContextTimestamps | undefined} */
    contextTimestamps: ContextTimestamps | undefined;
    /** @type {ContextHashes | undefined} */
    contextHashes: ContextHashes | undefined;
    /** @type {ContextTshs | undefined} */
    contextTshs: ContextTshs | undefined;
    /** @type {MissingExistence | undefined} */
    missingExistence: MissingExistence | undefined;
    /** @type {ManagedItemInfo | undefined} */
    managedItemInfo: ManagedItemInfo | undefined;
    /** @type {ManagedFiles | undefined} */
    managedFiles: ManagedFiles | undefined;
    /** @type {ManagedContexts | undefined} */
    managedContexts: ManagedContexts | undefined;
    /** @type {ManagedMissing | undefined} */
    managedMissing: ManagedMissing | undefined;
    /** @type {Children | undefined} */
    children: Children | undefined;
    hasStartTime(): boolean;
    /**
     * Updates start time using the provided value.
     * @param {number} value start value
     */
    setStartTime(value: number): void;
    /**
     * Sets merged start time.
     * @param {number | undefined} value value
     * @param {Snapshot} snapshot snapshot
     */
    setMergedStartTime(value: number | undefined, snapshot: Snapshot): void;
    hasFileTimestamps(): boolean;
    /**
     * Sets file timestamps.
     * @param {FileTimestamps} value file timestamps
     */
    setFileTimestamps(value: FileTimestamps): void;
    hasFileHashes(): boolean;
    /**
     * Updates file hashes using the provided value.
     * @param {FileHashes} value file hashes
     */
    setFileHashes(value: FileHashes): void;
    hasFileTshs(): boolean;
    /**
     * Updates file tshs using the provided value.
     * @param {FileTshs} value file tshs
     */
    setFileTshs(value: FileTshs): void;
    hasContextTimestamps(): boolean;
    /**
     * Sets context timestamps.
     * @param {ContextTimestamps} value context timestamps
     */
    setContextTimestamps(value: ContextTimestamps): void;
    hasContextHashes(): boolean;
    /**
     * Sets context hashes.
     * @param {ContextHashes} value context hashes
     */
    setContextHashes(value: ContextHashes): void;
    hasContextTshs(): boolean;
    /**
     * Updates context tshs using the provided value.
     * @param {ContextTshs} value context tshs
     */
    setContextTshs(value: ContextTshs): void;
    hasMissingExistence(): boolean;
    /**
     * Sets missing existence.
     * @param {MissingExistence} value context tshs
     */
    setMissingExistence(value: MissingExistence): void;
    hasManagedItemInfo(): boolean;
    /**
     * Sets managed item info.
     * @param {ManagedItemInfo} value managed item info
     */
    setManagedItemInfo(value: ManagedItemInfo): void;
    hasManagedFiles(): boolean;
    /**
     * Sets managed files.
     * @param {ManagedFiles} value managed files
     */
    setManagedFiles(value: ManagedFiles): void;
    hasManagedContexts(): boolean;
    /**
     * Sets managed contexts.
     * @param {ManagedContexts} value managed contexts
     */
    setManagedContexts(value: ManagedContexts): void;
    hasManagedMissing(): boolean;
    /**
     * Sets managed missing.
     * @param {ManagedMissing} value managed missing
     */
    setManagedMissing(value: ManagedMissing): void;
    hasChildren(): boolean;
    /**
     * Updates children using the provided value.
     * @param {Children} value children
     */
    setChildren(value: Children): void;
    /**
     * Adds the provided child to the snapshot.
     * @param {Snapshot} child children
     */
    addChild(child: Snapshot): void;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize({ write }: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize({ read }: ObjectDeserializerContext): void;
    /**
     * Creates an iterable from the provided get map.
     * @template {{ keys(): IterableIterator<string> } | undefined} T
     * @param {GetMapsFunction<T>} getMaps first
     * @returns {SnapshotIterable<T>} iterable
     */
    _createIterable<T extends {
        keys(): IterableIterator<string>;
    } | undefined>(getMaps: GetMapsFunction<T>): SnapshotIterable<T>;
    /**
     * Gets file iterable.
     * @returns {Iterable<string>} iterable
     */
    getFileIterable(): Iterable<string>;
    /**
     * Gets context iterable.
     * @returns {Iterable<string>} iterable
     */
    getContextIterable(): Iterable<string>;
    /**
     * Gets missing iterable.
     * @returns {Iterable<string>} iterable
     */
    getMissingIterable(): Iterable<string>;
}
/**
 * Defines the snapshot optimization value type used by this module.
 * @template U, T
 * @typedef {U extends true ? Set<string> : Map<string, T>} SnapshotOptimizationValue
 */
/**
 * Represents SnapshotOptimization.
 * @template T
 * @template {boolean} [U=false]
 */
declare class SnapshotOptimization<T, U extends boolean = false> {
    /**
     * Creates an instance of SnapshotOptimization.
     * @param {(snapshot: Snapshot) => boolean} has has value
     * @param {(snapshot: Snapshot) => SnapshotOptimizationValue<U, T> | undefined} get get value
     * @param {(snapshot: Snapshot, value: SnapshotOptimizationValue<U, T>) => void} set set value
     * @param {boolean=} useStartTime use the start time of snapshots
     * @param {U=} isSet value is an Set instead of a Map
     */
    constructor(has: (snapshot: Snapshot) => boolean, get: (snapshot: Snapshot) => SnapshotOptimizationValue<U, T> | undefined, set: (snapshot: Snapshot, value: SnapshotOptimizationValue<U, T>) => void, useStartTime?: boolean | undefined, isSet?: U | undefined);
    _has: (snapshot: Snapshot) => boolean;
    _get: (snapshot: Snapshot) => SnapshotOptimizationValue<U, T> | undefined;
    _set: (snapshot: Snapshot, value: SnapshotOptimizationValue<U, T>) => void;
    /** @type {boolean} */
    _useStartTime: boolean;
    /** @type {U} */
    _isSet: U;
    /** @type {Map<string, SnapshotOptimizationEntry>} */
    _map: Map<string, SnapshotOptimizationEntry>;
    /** @type {number} */
    _statItemsShared: number;
    /** @type {number} */
    _statItemsUnshared: number;
    /** @type {number} */
    _statSharedSnapshots: number;
    /** @type {number} */
    _statReusedSharedSnapshots: number;
    getStatisticMessage(): string;
    clear(): void;
    /**
     * Processes the provided new snapshot.
     * @param {Snapshot} newSnapshot snapshot
     * @param {Set<string>} capturedFiles files to snapshot/share
     * @returns {void}
     */
    optimize(newSnapshot: Snapshot, capturedFiles: Set<string>): void;
}
import StackedCacheMap = require("./StackedCacheMap");
import AsyncQueue = require("../util/AsyncQueue");
import type WebpackError from "../errors/WebpackError";
import type { ResolveFunctionAsync } from "enhanced-resolve";
/**
 * Defines the processor callback type used by this module.
 */
type ProcessorCallback<T> = import("../util/AsyncQueue").Callback<T>;
/**
 * Defines the processor type used by this module.
 */
type Processor<T, R> = import("../util/AsyncQueue").Processor<T, R>;
type JobType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type ExistenceOnlyTimeEntry = {};
/**
 * Defines the file system info entry type used by this module.
 */
type FileSystemInfoEntry = {
    safeTime: number;
    timestamp?: number | undefined;
};
/**
 * Defines the resolved context file system info entry type used by this module.
 */
type ResolvedContextFileSystemInfoEntry = {
    safeTime: number;
    timestampHash?: string | undefined;
};
type Symlinks = Set<string>;
/**
 * Defines the context file system info entry type used by this module.
 */
type ContextFileSystemInfoEntry = {
    safeTime: number;
    timestampHash?: string | undefined;
    resolved?: ResolvedContextFileSystemInfoEntry | undefined;
    symlinks?: Symlinks | undefined;
};
/**
 * Defines the timestamp and hash type used by this module.
 */
type TimestampAndHash = {
    safeTime: number;
    timestamp?: number | undefined;
    hash: string;
};
/**
 * Defines the resolved context timestamp and hash type used by this module.
 */
type ResolvedContextTimestampAndHash = {
    safeTime: number;
    timestampHash?: string | undefined;
    hash: string;
};
/**
 * Defines the context timestamp and hash type used by this module.
 */
type ContextTimestampAndHash = {
    safeTime: number;
    timestampHash?: string | undefined;
    hash: string;
    resolved?: ResolvedContextTimestampAndHash | undefined;
    symlinks?: Symlinks | undefined;
};
/**
 * Defines the context hash type used by this module.
 */
type ContextHash = {
    hash: string;
    resolved?: string | undefined;
    symlinks?: Symlinks | undefined;
};
type SnapshotContent = Set<string>;
/**
 * Defines the snapshot optimization entry type used by this module.
 */
type SnapshotOptimizationEntry = {
    snapshot: Snapshot;
    shared: number;
    snapshotContent: SnapshotContent | undefined;
    children: Set<SnapshotOptimizationEntry> | undefined;
};
type ResolveResults = Map<string, string | false | undefined>;
type Files = Set<string>;
type Directories = Set<string>;
type Missing = Set<string>;
/**
 * Defines the resolve dependencies type used by this module.
 */
type ResolveDependencies = {
    /**
     * list of files
     */
    files: Files;
    /**
     * list of directories
     */
    directories: Directories;
    /**
     * list of missing entries
     */
    missing: Missing;
};
/**
 * Defines the resolve build dependencies result type used by this module.
 */
type ResolveBuildDependenciesResult = {
    /**
     * list of files
     */
    files: Files;
    /**
     * list of directories
     */
    directories: Directories;
    /**
     * list of missing entries
     */
    missing: Missing;
    /**
     * stored resolve results
     */
    resolveResults: ResolveResults;
    /**
     * dependencies of the resolving
     */
    resolveDependencies: ResolveDependencies;
};
/**
 * Defines the snapshot options type used by this module.
 */
type SnapshotOptions = {
    /**
     * should use hash to snapshot
     */
    hash?: boolean | undefined;
    /**
     * should use timestamp to snapshot
     */
    timestamp?: boolean | undefined;
};
/**
 * Defines the get maps function type used by this module.
 */
type GetMapsFunction<T> = (snapshot: Snapshot) => T[];
type FileTimestamps = Map<string, FileSystemInfoEntry | null>;
type FileHashes = Map<string, string | null>;
type FileTshs = Map<string, TimestampAndHash | string | null>;
type ContextTimestamps = Map<string, ResolvedContextFileSystemInfoEntry | null>;
type ContextHashes = Map<string, string | null>;
type ContextTshs = Map<string, ResolvedContextTimestampAndHash | null>;
type MissingExistence = Map<string, boolean>;
type ManagedItemInfo = Map<string, string>;
type ManagedFiles = Set<string>;
type ManagedContexts = Set<string>;
type ManagedMissing = Set<string>;
type Children = Set<Snapshot>;
/**
 * Defines the snapshot optimization value type used by this module.
 */
type SnapshotOptimizationValue<U, T> = U extends true ? Set<string> : Map<string, T>;
type LoggedPaths = Set<string>;
type FileTimestamp = FileSystemInfoEntry | ExistenceOnlyTimeEntry | "ignore" | null;
type ContextTimestamp = ContextFileSystemInfoEntry | ExistenceOnlyTimeEntry | "ignore" | null;
type ResolvedContextTimestamp = ResolvedContextFileSystemInfoEntry | "ignore" | null;
type CheckSnapshotValidCallback = (err?: WebpackError | null, result?: boolean) => void;
import type { ObjectSerializerContext } from "../serialization/ObjectMiddleware";
import type { ObjectDeserializerContext } from "../serialization/ObjectMiddleware";
/**
 * Defines the get maps function type used by this module.
 * @template T
 * @typedef {(snapshot: Snapshot) => T[]} GetMapsFunction
 */
/**
 * Represents SnapshotIterable.
 * @template {{ keys(): IterableIterator<string> } | undefined} T
 */
declare class SnapshotIterable<T extends {
    keys(): IterableIterator<string>;
} | undefined> {
    /**
     * Creates an instance of SnapshotIterable.
     * @param {Snapshot} snapshot snapshot
     * @param {GetMapsFunction<T>} getMaps get maps function
     */
    constructor(snapshot: Snapshot, getMaps: GetMapsFunction<T>);
    /** @type {Snapshot} */
    snapshot: Snapshot;
    /** @type {GetMapsFunction<T>} */
    getMaps: GetMapsFunction<T>;
    [Symbol.iterator](): SnapshotIterator;
}
declare class SnapshotIterator {
    /**
     * Creates an instance of SnapshotIterator.
     * @param {() => IteratorResult<string>} next next
     */
    constructor(next: () => IteratorResult<string>);
    next: () => IteratorResult<string>;
}
