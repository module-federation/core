export = FileSystemInfo;
/** @typedef {Set<string>} LoggedPaths */
/** @typedef {FileSystemInfoEntry | "ignore" | null} FileTimestamp */
/** @typedef {ContextFileSystemInfoEntry | "ignore" | null} ContextTimestamp */
/** @typedef {ResolvedContextFileSystemInfoEntry | "ignore" | null} ResolvedContextTimestamp */
/** @typedef {(err?: WebpackError | null, result?: boolean) => void} CheckSnapshotValidCallback */
/**
 * Used to access information about the filesystem in a cached way
 */
declare class FileSystemInfo {
  /**
   * @param {InputFileSystem} fs file system
   * @param {object} options options
   * @param {Iterable<string | RegExp>=} options.unmanagedPaths paths that are not managed by a package manager and the contents are subject to change
   * @param {Iterable<string | RegExp>=} options.managedPaths paths that are only managed by a package manager
   * @param {Iterable<string | RegExp>=} options.immutablePaths paths that are immutable
   * @param {Logger=} options.logger logger used to log invalid snapshots
   * @param {HashFunction=} options.hashFunction the hash function to use
   */
  constructor(
    fs: InputFileSystem,
    {
      unmanagedPaths,
      managedPaths,
      immutablePaths,
      logger,
      hashFunction,
    }?: {
      unmanagedPaths?: Iterable<string | RegExp> | undefined;
      managedPaths?: Iterable<string | RegExp> | undefined;
      immutablePaths?: Iterable<string | RegExp> | undefined;
      logger?: Logger | undefined;
      hashFunction?: HashFunction | undefined;
    },
  );
  fs: import('./util/fs').InputFileSystem;
  logger: import('./logging/Logger').Logger;
  _remainingLogs: number;
  /** @type {LoggedPaths | undefined} */
  _loggedPaths: LoggedPaths | undefined;
  _hashFunction: import('../declarations/WebpackOptions').HashFunction;
  /** @type {WeakMap<Snapshot, boolean | CheckSnapshotValidCallback[]>} */
  _snapshotCache: WeakMap<Snapshot, boolean | CheckSnapshotValidCallback[]>;
  _fileTimestampsOptimization: SnapshotOptimization<FileSystemInfoEntry, false>;
  _fileHashesOptimization: SnapshotOptimization<string, false>;
  _fileTshsOptimization: SnapshotOptimization<string | TimestampAndHash, false>;
  _contextTimestampsOptimization: SnapshotOptimization<
    ResolvedContextFileSystemInfoEntry,
    false
  >;
  _contextHashesOptimization: SnapshotOptimization<string, false>;
  _contextTshsOptimization: SnapshotOptimization<
    ResolvedContextTimestampAndHash,
    false
  >;
  _missingExistenceOptimization: SnapshotOptimization<boolean, false>;
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
  _cachedDeprecatedFileTimestamps: Map<string, number>;
  _cachedDeprecatedContextTimestamps: Map<string, number>;
  _warnAboutExperimentalEsmTracking: boolean;
  _statCreatedSnapshots: number;
  _statTestedSnapshotsCached: number;
  _statTestedSnapshotsNotCached: number;
  _statTestedChildrenCached: number;
  _statTestedChildrenNotCached: number;
  _statTestedEntries: number;
  logStatistics(): void;
  /**
   * @private
   * @param {string} path path
   * @param {string} reason reason
   * @param {EXPECTED_ANY[]} args arguments
   */
  private _log;
  clear(): void;
  /**
   * @param {ReadonlyMap<string, FileTimestamp>} map timestamps
   * @param {boolean=} immutable if 'map' is immutable and FileSystemInfo can keep referencing it
   * @returns {void}
   */
  addFileTimestamps(
    map: ReadonlyMap<string, FileTimestamp>,
    immutable?: boolean | undefined,
  ): void;
  /**
   * @param {ReadonlyMap<string, ContextTimestamp>} map timestamps
   * @param {boolean=} immutable if 'map' is immutable and FileSystemInfo can keep referencing it
   * @returns {void}
   */
  addContextTimestamps(
    map: ReadonlyMap<string, ContextTimestamp>,
    immutable?: boolean | undefined,
  ): void;
  /**
   * @param {string} path file path
   * @param {(err?: WebpackError | null, fileTimestamp?: FileTimestamp) => void} callback callback function
   * @returns {void}
   */
  getFileTimestamp(
    path: string,
    callback: (
      err?: WebpackError | null,
      fileTimestamp?: FileTimestamp,
    ) => void,
  ): void;
  /**
   * @param {string} path context path
   * @param {(err?: WebpackError | null, resolvedContextTimestamp?: ResolvedContextTimestamp) => void} callback callback function
   * @returns {void}
   */
  getContextTimestamp(
    path: string,
    callback: (
      err?: WebpackError | null,
      resolvedContextTimestamp?: ResolvedContextTimestamp,
    ) => void,
  ): void;
  /**
   * @private
   * @param {string} path context path
   * @param {(err?: WebpackError | null, contextTimestamp?: ContextTimestamp) => void} callback callback function
   * @returns {void}
   */
  private _getUnresolvedContextTimestamp;
  /**
   * @param {string} path file path
   * @param {(err?: WebpackError | null, hash?: string | null) => void} callback callback function
   * @returns {void}
   */
  getFileHash(
    path: string,
    callback: (err?: WebpackError | null, hash?: string | null) => void,
  ): void;
  /**
   * @param {string} path context path
   * @param {(err?: WebpackError | null, contextHash?: string) => void} callback callback function
   * @returns {void}
   */
  getContextHash(
    path: string,
    callback: (err?: WebpackError | null, contextHash?: string) => void,
  ): void;
  /**
   * @private
   * @param {string} path context path
   * @param {(err?: WebpackError | null, contextHash?: ContextHash | null) => void} callback callback function
   * @returns {void}
   */
  private _getUnresolvedContextHash;
  /**
   * @param {string} path context path
   * @param {(err?: WebpackError | null, resolvedContextTimestampAndHash?: ResolvedContextTimestampAndHash | null) => void} callback callback function
   * @returns {void}
   */
  getContextTsh(
    path: string,
    callback: (
      err?: WebpackError | null,
      resolvedContextTimestampAndHash?: ResolvedContextTimestampAndHash | null,
    ) => void,
  ): void;
  /**
   * @private
   * @param {string} path context path
   * @param {(err?: WebpackError | null, contextTimestampAndHash?: ContextTimestampAndHash | null) => void} callback callback function
   * @returns {void}
   */
  private _getUnresolvedContextTsh;
  _createBuildDependenciesResolvers(): {
    resolveContext: import('enhanced-resolve').ResolveFunctionAsync;
    resolveEsm: import('enhanced-resolve').ResolveFunctionAsync;
    resolveCjs: import('enhanced-resolve').ResolveFunctionAsync;
    resolveCjsAsChild: import('enhanced-resolve').ResolveFunctionAsync;
  };
  /**
   * @param {string} context context directory
   * @param {Iterable<string>} deps dependencies
   * @param {(err?: Error | null, resolveBuildDependenciesResult?: ResolveBuildDependenciesResult) => void} callback callback function
   * @returns {void}
   */
  resolveBuildDependencies(
    context: string,
    deps: Iterable<string>,
    callback: (
      err?: Error | null,
      resolveBuildDependenciesResult?: ResolveBuildDependenciesResult,
    ) => void,
  ): void;
  /**
   * @param {ResolveResults} resolveResults results from resolving
   * @param {(err?: Error | null, result?: boolean) => void} callback callback with true when resolveResults resolve the same way
   * @returns {void}
   */
  checkResolveResultsValid(
    resolveResults: ResolveResults,
    callback: (err?: Error | null, result?: boolean) => void,
  ): void;
  /**
   * @param {number | null | undefined} startTime when processing the files has started
   * @param {Iterable<string> | null | undefined} files all files
   * @param {Iterable<string> | null | undefined} directories all directories
   * @param {Iterable<string> | null | undefined} missing all missing files or directories
   * @param {SnapshotOptions | null | undefined} options options object (for future extensions)
   * @param {(err: WebpackError | null, snapshot: Snapshot | null) => void} callback callback function
   * @returns {void}
   */
  createSnapshot(
    startTime: number | null | undefined,
    files: Iterable<string> | null | undefined,
    directories: Iterable<string> | null | undefined,
    missing: Iterable<string> | null | undefined,
    options: SnapshotOptions | null | undefined,
    callback: (err: WebpackError | null, snapshot: Snapshot | null) => void,
  ): void;
  /**
   * @param {Snapshot} snapshot1 a snapshot
   * @param {Snapshot} snapshot2 a snapshot
   * @returns {Snapshot} merged snapshot
   */
  mergeSnapshots(snapshot1: Snapshot, snapshot2: Snapshot): Snapshot;
  /**
   * @param {Snapshot} snapshot the snapshot made
   * @param {CheckSnapshotValidCallback} callback callback function
   * @returns {void}
   */
  checkSnapshotValid(
    snapshot: Snapshot,
    callback: CheckSnapshotValidCallback,
  ): void;
  /**
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
   * @private
   * @param {string} path path
   * @param {(err: WebpackError | null, timestampAndHash?: TimestampAndHash | string) => void} callback callback
   */
  private _getFileTimestampAndHash;
  /**
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
  export {
    Snapshot,
    ResolveRequest,
    ResolveFunctionAsync,
    WebpackError,
    Logger,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    HashFunction,
    IStats,
    InputFileSystem,
    ProcessorCallback,
    Processor,
    JobType,
    FileSystemInfoEntry,
    ResolvedContextFileSystemInfoEntry,
    Symlinks,
    ContextFileSystemInfoEntry,
    TimestampAndHash,
    ResolvedContextTimestampAndHash,
    ContextTimestampAndHash,
    ContextHash,
    SnapshotContent,
    SnapshotOptimizationEntry,
    ResolveResults,
    Files,
    Directories,
    Missing,
    ResolveDependencies,
    ResolveBuildDependenciesResult,
    SnapshotOptions,
    GetMapsFunction,
    FileTimestamps,
    FileHashes,
    FileTshs,
    ContextTimestamps,
    ContextHashes,
    ContextTshs,
    MissingExistence,
    ManagedItemInfo,
    ManagedFiles,
    ManagedContexts,
    ManagedMissing,
    Children,
    SnapshotOptimizationValue,
    LoggedPaths,
    FileTimestamp,
    ContextTimestamp,
    ResolvedContextTimestamp,
    CheckSnapshotValidCallback,
  };
}
/** @typedef {Map<string, FileSystemInfoEntry | null>} FileTimestamps */
/** @typedef {Map<string, string | null>} FileHashes */
/** @typedef {Map<string, TimestampAndHash | string | null>} FileTshs */
/** @typedef {Map<string, ResolvedContextFileSystemInfoEntry | null>} ContextTimestamps */
/** @typedef {Map<string, string | null>} ContextHashes */
/** @typedef {Map<string, ResolvedContextTimestampAndHash | null>} ContextTshs */
/** @typedef {Map<string, boolean>} MissingExistence */
/** @typedef {Map<string, string>} ManagedItemInfo */
/** @typedef {Set<string>} ManagedFiles */
/** @typedef {Set<string>} ManagedContexts */
/** @typedef {Set<string>} ManagedMissing */
/** @typedef {Set<Snapshot>} Children */
declare class Snapshot {
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
   * @param {number} value start value
   */
  setStartTime(value: number): void;
  /**
   * @param {number | undefined} value value
   * @param {Snapshot} snapshot snapshot
   */
  setMergedStartTime(value: number | undefined, snapshot: Snapshot): void;
  hasFileTimestamps(): boolean;
  /**
   * @param {FileTimestamps} value file timestamps
   */
  setFileTimestamps(value: FileTimestamps): void;
  hasFileHashes(): boolean;
  /**
   * @param {FileHashes} value file hashes
   */
  setFileHashes(value: FileHashes): void;
  hasFileTshs(): boolean;
  /**
   * @param {FileTshs} value file tshs
   */
  setFileTshs(value: FileTshs): void;
  hasContextTimestamps(): boolean;
  /**
   * @param {ContextTimestamps} value context timestamps
   */
  setContextTimestamps(value: ContextTimestamps): void;
  hasContextHashes(): boolean;
  /**
   * @param {ContextHashes} value context hashes
   */
  setContextHashes(value: ContextHashes): void;
  hasContextTshs(): boolean;
  /**
   * @param {ContextTshs} value context tshs
   */
  setContextTshs(value: ContextTshs): void;
  hasMissingExistence(): boolean;
  /**
   * @param {MissingExistence} value context tshs
   */
  setMissingExistence(value: MissingExistence): void;
  hasManagedItemInfo(): boolean;
  /**
   * @param {ManagedItemInfo} value managed item info
   */
  setManagedItemInfo(value: ManagedItemInfo): void;
  hasManagedFiles(): boolean;
  /**
   * @param {ManagedFiles} value managed files
   */
  setManagedFiles(value: ManagedFiles): void;
  hasManagedContexts(): boolean;
  /**
   * @param {ManagedContexts} value managed contexts
   */
  setManagedContexts(value: ManagedContexts): void;
  hasManagedMissing(): boolean;
  /**
   * @param {ManagedMissing} value managed missing
   */
  setManagedMissing(value: ManagedMissing): void;
  hasChildren(): boolean;
  /**
   * @param {Children} value children
   */
  setChildren(value: Children): void;
  /**
   * @param {Snapshot} child children
   */
  addChild(child: Snapshot): void;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize({ write }: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize({ read }: ObjectDeserializerContext): void;
  /**
   * @template T
   * @param {GetMapsFunction<T>} getMaps first
   * @returns {SnapshotIterable<T>} iterable
   */
  _createIterable<T>(getMaps: GetMapsFunction<T>): SnapshotIterable<T>;
  /**
   * @returns {Iterable<string>} iterable
   */
  getFileIterable(): Iterable<string>;
  /**
   * @returns {Iterable<string>} iterable
   */
  getContextIterable(): Iterable<string>;
  /**
   * @returns {Iterable<string>} iterable
   */
  getMissingIterable(): Iterable<string>;
}
/**
 * @template U, T
 * @typedef {U extends true ? Set<string> : Map<string, T>} SnapshotOptimizationValue
 */
/**
 * @template T
 * @template {boolean} [U=false]
 */
declare class SnapshotOptimization<T, U extends boolean = false> {
  /**
   * @param {(snapshot: Snapshot) => boolean} has has value
   * @param {(snapshot: Snapshot) => SnapshotOptimizationValue<U, T> | undefined} get get value
   * @param {(snapshot: Snapshot, value: SnapshotOptimizationValue<U, T>) => void} set set value
   * @param {boolean=} useStartTime use the start time of snapshots
   * @param {U=} isSet value is an Set instead of a Map
   */
  constructor(
    has: (snapshot: Snapshot) => boolean,
    get: (snapshot: Snapshot) => SnapshotOptimizationValue<U, T> | undefined,
    set: (snapshot: Snapshot, value: SnapshotOptimizationValue<U, T>) => void,
    useStartTime?: boolean | undefined,
    isSet?: U | undefined,
  );
  _has: (snapshot: Snapshot) => boolean;
  _get: (snapshot: Snapshot) => SnapshotOptimizationValue<U, T> | undefined;
  _set: (snapshot: Snapshot, value: SnapshotOptimizationValue<U, T>) => void;
  _useStartTime: boolean;
  /** @type {U} */
  _isSet: U;
  /** @type {Map<string, SnapshotOptimizationEntry>} */
  _map: Map<string, SnapshotOptimizationEntry>;
  _statItemsShared: number;
  _statItemsUnshared: number;
  _statSharedSnapshots: number;
  _statReusedSharedSnapshots: number;
  getStatisticMessage(): string;
  clear(): void;
  /**
   * @param {Snapshot} newSnapshot snapshot
   * @param {Set<string>} capturedFiles files to snapshot/share
   * @returns {void}
   */
  optimize(newSnapshot: Snapshot, capturedFiles: Set<string>): void;
}
import StackedCacheMap = require('./util/StackedCacheMap');
import AsyncQueue = require('./util/AsyncQueue');
type ResolveRequest = import('enhanced-resolve').ResolveRequest;
type ResolveFunctionAsync = import('enhanced-resolve').ResolveFunctionAsync;
type WebpackError = import('./WebpackError');
type Logger = import('./logging/Logger').Logger;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type HashFunction = import('../declarations/WebpackOptions').HashFunction;
type IStats = import('./util/fs').IStats;
type InputFileSystem = import('./util/fs').InputFileSystem;
type ProcessorCallback<T> = import('./util/AsyncQueue').Callback<T>;
type Processor<T, R> = import('./util/AsyncQueue').Processor<T, R>;
type JobType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type FileSystemInfoEntry = {
  safeTime: number;
  timestamp?: number | undefined;
};
type ResolvedContextFileSystemInfoEntry = {
  safeTime: number;
  timestampHash?: string | undefined;
};
type Symlinks = Set<string>;
type ContextFileSystemInfoEntry = {
  safeTime: number;
  timestampHash?: string | undefined;
  resolved?: ResolvedContextFileSystemInfoEntry | undefined;
  symlinks?: Symlinks | undefined;
};
type TimestampAndHash = {
  safeTime: number;
  timestamp?: number | undefined;
  hash: string;
};
type ResolvedContextTimestampAndHash = {
  safeTime: number;
  timestampHash?: string | undefined;
  hash: string;
};
type ContextTimestampAndHash = {
  safeTime: number;
  timestampHash?: string | undefined;
  hash: string;
  resolved?: ResolvedContextTimestampAndHash | undefined;
  symlinks?: Symlinks | undefined;
};
type ContextHash = {
  hash: string;
  resolved?: string | undefined;
  symlinks?: Symlinks | undefined;
};
type SnapshotContent = Set<string>;
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
type SnapshotOptimizationValue<U, T> = U extends true
  ? Set<string>
  : Map<string, T>;
type LoggedPaths = Set<string>;
type FileTimestamp = FileSystemInfoEntry | 'ignore' | null;
type ContextTimestamp = ContextFileSystemInfoEntry | 'ignore' | null;
type ResolvedContextTimestamp =
  | ResolvedContextFileSystemInfoEntry
  | 'ignore'
  | null;
type CheckSnapshotValidCallback = (
  err?: WebpackError | null,
  result?: boolean,
) => void;
/**
 * @template T
 * @typedef {(snapshot: Snapshot) => T[]} GetMapsFunction
 */
/**
 * @template T
 */
declare class SnapshotIterable<T> {
  /**
   * @param {Snapshot} snapshot snapshot
   * @param {GetMapsFunction<T>} getMaps get maps function
   */
  constructor(snapshot: Snapshot, getMaps: GetMapsFunction<T>);
  snapshot: Snapshot;
  getMaps: GetMapsFunction<T>;
  [Symbol.iterator](): SnapshotIterator;
}
declare class SnapshotIterator {
  /**
   * @param {() => IteratorResult<string>} next next
   */
  constructor(next: () => IteratorResult<string>);
  next: () => IteratorResult<string>;
}
