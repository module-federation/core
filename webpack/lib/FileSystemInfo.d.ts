export = FileSystemInfo;
/**
 * Used to access information about the filesystem in a cached way
 */
declare class FileSystemInfo {
  /**
   * @param {InputFileSystem} fs file system
   * @param {Object} options options
   * @param {Iterable<string | RegExp>=} options.managedPaths paths that are only managed by a package manager
   * @param {Iterable<string | RegExp>=} options.immutablePaths paths that are immutable
   * @param {Logger=} options.logger logger used to log invalid snapshots
   * @param {string | Hash=} options.hashFunction the hash function to use
   */
  constructor(
    fs: InputFileSystem,
    {
      managedPaths,
      immutablePaths,
      logger,
      hashFunction,
    }?: {
      managedPaths?: Iterable<string | RegExp> | undefined;
      immutablePaths?: Iterable<string | RegExp> | undefined;
      logger?: Logger | undefined;
      hashFunction?: (string | Hash) | undefined;
    },
  );
  fs: import('./util/fs').InputFileSystem;
  logger: import('./logging/Logger').Logger;
  _remainingLogs: number;
  _loggedPaths: Set<any>;
  _hashFunction: string | typeof import('./util/Hash');
  /** @type {WeakMap<Snapshot, boolean | (function(WebpackError=, boolean=): void)[]>} */
  _snapshotCache: WeakMap<
    Snapshot,
    | boolean
    | ((arg0?: WebpackError | undefined, arg1?: boolean | undefined) => void)[]
  >;
  _fileTimestampsOptimization: SnapshotOptimization<FileSystemInfoEntry>;
  _fileHashesOptimization: SnapshotOptimization<string>;
  _fileTshsOptimization: SnapshotOptimization<string | TimestampAndHash>;
  _contextTimestampsOptimization: SnapshotOptimization<ResolvedContextFileSystemInfoEntry>;
  _contextHashesOptimization: SnapshotOptimization<string>;
  _contextTshsOptimization: SnapshotOptimization<ResolvedContextTimestampAndHash>;
  _missingExistenceOptimization: SnapshotOptimization<boolean>;
  _managedItemInfoOptimization: SnapshotOptimization<string>;
  _managedFilesOptimization: SnapshotOptimization<any>;
  _managedContextsOptimization: SnapshotOptimization<any>;
  _managedMissingOptimization: SnapshotOptimization<any>;
  /** @type {StackedCacheMap<string, FileSystemInfoEntry | "ignore" | null>} */
  _fileTimestamps: StackedCacheMap<
    string,
    FileSystemInfoEntry | 'ignore' | null
  >;
  /** @type {Map<string, string>} */
  _fileHashes: Map<string, string>;
  /** @type {Map<string, TimestampAndHash | string>} */
  _fileTshs: Map<string, TimestampAndHash | string>;
  /** @type {StackedCacheMap<string, ContextFileSystemInfoEntry | "ignore" | null>} */
  _contextTimestamps: StackedCacheMap<
    string,
    ContextFileSystemInfoEntry | 'ignore' | null
  >;
  /** @type {Map<string, ContextHash>} */
  _contextHashes: Map<string, ContextHash>;
  /** @type {Map<string, ContextTimestampAndHash>} */
  _contextTshs: Map<string, ContextTimestampAndHash>;
  /** @type {Map<string, string>} */
  _managedItems: Map<string, string>;
  /** @type {AsyncQueue<string, string, FileSystemInfoEntry | null>} */
  fileTimestampQueue: AsyncQueue<string, string, FileSystemInfoEntry | null>;
  /** @type {AsyncQueue<string, string, string | null>} */
  fileHashQueue: AsyncQueue<string, string, string | null>;
  /** @type {AsyncQueue<string, string, ContextFileSystemInfoEntry | null>} */
  contextTimestampQueue: AsyncQueue<
    string,
    string,
    ContextFileSystemInfoEntry | null
  >;
  /** @type {AsyncQueue<string, string, ContextHash | null>} */
  contextHashQueue: AsyncQueue<string, string, ContextHash | null>;
  /** @type {AsyncQueue<string, string, ContextTimestampAndHash | null>} */
  contextTshQueue: AsyncQueue<string, string, ContextTimestampAndHash | null>;
  /** @type {AsyncQueue<string, string, string | null>} */
  managedItemQueue: AsyncQueue<string, string, string | null>;
  /** @type {AsyncQueue<string, string, Set<string>>} */
  managedItemDirectoryQueue: AsyncQueue<string, string, Set<string>>;
  managedPaths: (string | RegExp)[];
  managedPathsWithSlash: string[];
  managedPathsRegExps: RegExp[];
  immutablePaths: (string | RegExp)[];
  immutablePathsWithSlash: string[];
  immutablePathsRegExps: RegExp[];
  _cachedDeprecatedFileTimestamps: Map<any, any>;
  _cachedDeprecatedContextTimestamps: Map<any, any>;
  _warnAboutExperimentalEsmTracking: boolean;
  _statCreatedSnapshots: number;
  _statTestedSnapshotsCached: number;
  _statTestedSnapshotsNotCached: number;
  _statTestedChildrenCached: number;
  _statTestedChildrenNotCached: number;
  _statTestedEntries: number;
  logStatistics(): void;
  /**
   * @param {string} path path
   * @param {string} reason reason
   * @param {any[]} args arguments
   */
  _log(path: string, reason: string, ...args: any[]): void;
  clear(): void;
  /**
   * @param {ReadonlyMap<string, FileSystemInfoEntry | "ignore" | null>} map timestamps
   * @param {boolean=} immutable if 'map' is immutable and FileSystemInfo can keep referencing it
   * @returns {void}
   */
  addFileTimestamps(
    map: ReadonlyMap<string, FileSystemInfoEntry | 'ignore' | null>,
    immutable?: boolean | undefined,
  ): void;
  /**
   * @param {ReadonlyMap<string, FileSystemInfoEntry | "ignore" | null>} map timestamps
   * @param {boolean=} immutable if 'map' is immutable and FileSystemInfo can keep referencing it
   * @returns {void}
   */
  addContextTimestamps(
    map: ReadonlyMap<string, FileSystemInfoEntry | 'ignore' | null>,
    immutable?: boolean | undefined,
  ): void;
  /**
   * @param {string} path file path
   * @param {function((WebpackError | null)=, (FileSystemInfoEntry | "ignore" | null)=): void} callback callback function
   * @returns {void}
   */
  getFileTimestamp(
    path: string,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: (FileSystemInfoEntry | 'ignore' | null) | undefined,
    ) => void,
  ): void;
  /**
   * @param {string} path context path
   * @param {function((WebpackError | null)=, (ResolvedContextFileSystemInfoEntry | "ignore" | null)=): void} callback callback function
   * @returns {void}
   */
  getContextTimestamp(
    path: string,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: (ResolvedContextFileSystemInfoEntry | 'ignore' | null) | undefined,
    ) => void,
  ): void;
  /**
   * @param {string} path context path
   * @param {function((WebpackError | null)=, (ContextFileSystemInfoEntry | "ignore" | null)=): void} callback callback function
   * @returns {void}
   */
  _getUnresolvedContextTimestamp(
    path: string,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: (ContextFileSystemInfoEntry | 'ignore' | null) | undefined,
    ) => void,
  ): void;
  /**
   * @param {string} path file path
   * @param {function((WebpackError | null)=, (string | null)=): void} callback callback function
   * @returns {void}
   */
  getFileHash(
    path: string,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: (string | null) | undefined,
    ) => void,
  ): void;
  /**
   * @param {string} path context path
   * @param {function((WebpackError | null)=, string=): void} callback callback function
   * @returns {void}
   */
  getContextHash(
    path: string,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: string | undefined,
    ) => void,
  ): void;
  /**
   * @param {string} path context path
   * @param {function((WebpackError | null)=, (ContextHash | null)=): void} callback callback function
   * @returns {void}
   */
  _getUnresolvedContextHash(
    path: string,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: (ContextHash | null) | undefined,
    ) => void,
  ): void;
  /**
   * @param {string} path context path
   * @param {function((WebpackError | null)=, ResolvedContextTimestampAndHash=): void} callback callback function
   * @returns {void}
   */
  getContextTsh(
    path: string,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: ResolvedContextTimestampAndHash | undefined,
    ) => void,
  ): void;
  /**
   * @param {string} path context path
   * @param {function((WebpackError | null)=, (ContextTimestampAndHash | null)=): void} callback callback function
   * @returns {void}
   */
  _getUnresolvedContextTsh(
    path: string,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: (ContextTimestampAndHash | null) | undefined,
    ) => void,
  ): void;
  _createBuildDependenciesResolvers(): {
    resolveContext: import('enhanced-resolve').ResolveFunctionAsync;
    resolveEsm: import('enhanced-resolve').ResolveFunctionAsync;
    resolveCjs: import('enhanced-resolve').ResolveFunctionAsync;
    resolveCjsAsChild: import('enhanced-resolve').ResolveFunctionAsync;
  };
  /**
   * @param {string} context context directory
   * @param {Iterable<string>} deps dependencies
   * @param {function((Error | null)=, ResolveBuildDependenciesResult=): void} callback callback function
   * @returns {void}
   */
  resolveBuildDependencies(
    context: string,
    deps: Iterable<string>,
    callback: (
      arg0: (Error | null) | undefined,
      arg1: ResolveBuildDependenciesResult | undefined,
    ) => void,
  ): void;
  /**
   * @param {Map<string, string | false>} resolveResults results from resolving
   * @param {function((Error | null)=, boolean=): void} callback callback with true when resolveResults resolve the same way
   * @returns {void}
   */
  checkResolveResultsValid(
    resolveResults: Map<string, string | false>,
    callback: (
      arg0: (Error | null) | undefined,
      arg1: boolean | undefined,
    ) => void,
  ): void;
  /**
   *
   * @param {number | null | undefined} startTime when processing the files has started
   * @param {Iterable<string>} files all files
   * @param {Iterable<string>} directories all directories
   * @param {Iterable<string>} missing all missing files or directories
   * @param {SnapshotOptions | null | undefined} options options object (for future extensions)
   * @param {function((WebpackError | null)=, (Snapshot | null)=): void} callback callback function
   * @returns {void}
   */
  createSnapshot(
    startTime: number | null | undefined,
    files: Iterable<string>,
    directories: Iterable<string>,
    missing: Iterable<string>,
    options: SnapshotOptions | null | undefined,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: (Snapshot | null) | undefined,
    ) => void,
  ): void;
  /**
   * @param {Snapshot} snapshot1 a snapshot
   * @param {Snapshot} snapshot2 a snapshot
   * @returns {Snapshot} merged snapshot
   */
  mergeSnapshots(snapshot1: Snapshot, snapshot2: Snapshot): Snapshot;
  /**
   * @param {Snapshot} snapshot the snapshot made
   * @param {function((WebpackError | null)=, boolean=): void} callback callback function
   * @returns {void}
   */
  checkSnapshotValid(
    snapshot: Snapshot,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: boolean | undefined,
    ) => void,
  ): void;
  /**
   * @param {Snapshot} snapshot the snapshot made
   * @param {function((WebpackError | null)=, boolean=): void} callback callback function
   * @returns {void}
   */
  _checkSnapshotValidNoCache(
    snapshot: Snapshot,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: boolean | undefined,
    ) => void,
  ): void;
  _readFileTimestamp(path: any, callback: any): void;
  _readFileHash(path: any, callback: any): void;
  _getFileTimestampAndHash(path: any, callback: any): void;
  /**
   * @template T
   * @template ItemType
   * @param {Object} options options
   * @param {string} options.path path
   * @param {function(string): ItemType} options.fromImmutablePath called when context item is an immutable path
   * @param {function(string): ItemType} options.fromManagedItem called when context item is a managed path
   * @param {function(string, string, function(Error=, ItemType=): void): void} options.fromSymlink called when context item is a symlink
   * @param {function(string, IStats, function(Error=, ItemType=): void): void} options.fromFile called when context item is a file
   * @param {function(string, IStats, function(Error=, ItemType=): void): void} options.fromDirectory called when context item is a directory
   * @param {function(string[], ItemType[]): T} options.reduce called from all context items
   * @param {function((Error | null)=, (T | null)=): void} callback callback
   */
  _readContext<T, ItemType>(
    {
      path,
      fromImmutablePath,
      fromManagedItem,
      fromSymlink,
      fromFile,
      fromDirectory,
      reduce,
    }: {
      path: string;
      fromImmutablePath: (arg0: string) => ItemType;
      fromManagedItem: (arg0: string) => ItemType;
      fromSymlink: (
        arg0: string,
        arg1: string,
        arg2: (arg0?: Error | undefined, arg1?: ItemType) => void,
      ) => void;
      fromFile: (
        arg0: string,
        arg1: IStats,
        arg2: (arg0?: Error | undefined, arg1?: ItemType) => void,
      ) => void;
      fromDirectory: (
        arg0: string,
        arg1: IStats,
        arg2: (arg0?: Error | undefined, arg1?: ItemType) => void,
      ) => void;
      reduce: (arg0: string[], arg1: ItemType[]) => T;
    },
    callback: (arg0?: (Error | null) | undefined, arg1?: T) => void,
  ): void;
  _readContextTimestamp(path: any, callback: any): void;
  /**
   * @param {ContextFileSystemInfoEntry} entry entry
   * @param {function((Error | null)=, ResolvedContextFileSystemInfoEntry=): void} callback callback
   * @returns {void}
   */
  _resolveContextTimestamp(
    entry: ContextFileSystemInfoEntry,
    callback: (
      arg0: (Error | null) | undefined,
      arg1: ResolvedContextFileSystemInfoEntry | undefined,
    ) => void,
  ): void;
  _readContextHash(path: any, callback: any): void;
  /**
   * @param {ContextHash} entry context hash
   * @param {function((Error | null)=, string=): void} callback callback
   * @returns {void}
   */
  _resolveContextHash(
    entry: ContextHash,
    callback: (
      arg0: (Error | null) | undefined,
      arg1: string | undefined,
    ) => void,
  ): void;
  _readContextTimestampAndHash(path: any, callback: any): void;
  /**
   * @param {ContextTimestampAndHash} entry entry
   * @param {function((Error | null)=, ResolvedContextTimestampAndHash=): void} callback callback
   * @returns {void}
   */
  _resolveContextTsh(
    entry: ContextTimestampAndHash,
    callback: (
      arg0: (Error | null) | undefined,
      arg1: ResolvedContextTimestampAndHash | undefined,
    ) => void,
  ): void;
  _getManagedItemDirectoryInfo(path: any, callback: any): void;
  _getManagedItemInfo(path: any, callback: any): void;
  getDeprecatedFileTimestamps(): Map<any, any>;
  getDeprecatedContextTimestamps(): Map<any, any>;
}
declare namespace FileSystemInfo {
  export {
    Snapshot,
    WebpackError,
    Logger,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    IStats,
    InputFileSystem,
    FileSystemInfoEntry,
    ResolvedContextFileSystemInfoEntry,
    ContextFileSystemInfoEntry,
    TimestampAndHash,
    ResolvedContextTimestampAndHash,
    ContextTimestampAndHash,
    ContextHash,
    SnapshotOptimizationEntry,
    ResolveBuildDependenciesResult,
    SnapshotOptions,
  };
}
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
  /** @type {Map<string, FileSystemInfoEntry | null> | undefined} */
  fileTimestamps: Map<string, FileSystemInfoEntry | null> | undefined;
  /** @type {Map<string, string | null> | undefined} */
  fileHashes: Map<string, string | null> | undefined;
  /** @type {Map<string, TimestampAndHash | string | null> | undefined} */
  fileTshs: Map<string, TimestampAndHash | string | null> | undefined;
  /** @type {Map<string, ResolvedContextFileSystemInfoEntry | null> | undefined} */
  contextTimestamps:
    | Map<string, ResolvedContextFileSystemInfoEntry | null>
    | undefined;
  /** @type {Map<string, string | null> | undefined} */
  contextHashes: Map<string, string | null> | undefined;
  /** @type {Map<string, ResolvedContextTimestampAndHash | null> | undefined} */
  contextTshs: Map<string, ResolvedContextTimestampAndHash | null> | undefined;
  /** @type {Map<string, boolean> | undefined} */
  missingExistence: Map<string, boolean> | undefined;
  /** @type {Map<string, string> | undefined} */
  managedItemInfo: Map<string, string> | undefined;
  /** @type {Set<string> | undefined} */
  managedFiles: Set<string> | undefined;
  /** @type {Set<string> | undefined} */
  managedContexts: Set<string> | undefined;
  /** @type {Set<string> | undefined} */
  managedMissing: Set<string> | undefined;
  /** @type {Set<Snapshot> | undefined} */
  children: Set<Snapshot> | undefined;
  hasStartTime(): boolean;
  setStartTime(value: any): void;
  setMergedStartTime(value: any, snapshot: any): void;
  hasFileTimestamps(): boolean;
  setFileTimestamps(value: any): void;
  hasFileHashes(): boolean;
  setFileHashes(value: any): void;
  hasFileTshs(): boolean;
  setFileTshs(value: any): void;
  hasContextTimestamps(): boolean;
  setContextTimestamps(value: any): void;
  hasContextHashes(): boolean;
  setContextHashes(value: any): void;
  hasContextTshs(): boolean;
  setContextTshs(value: any): void;
  hasMissingExistence(): boolean;
  setMissingExistence(value: any): void;
  hasManagedItemInfo(): boolean;
  setManagedItemInfo(value: any): void;
  hasManagedFiles(): boolean;
  setManagedFiles(value: any): void;
  hasManagedContexts(): boolean;
  setManagedContexts(value: any): void;
  hasManagedMissing(): boolean;
  setManagedMissing(value: any): void;
  hasChildren(): boolean;
  setChildren(value: any): void;
  addChild(child: any): void;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize({ write }: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize({ read }: ObjectDeserializerContext): void;
  /**
   * @param {function(Snapshot): (ReadonlyMap<string, any> | ReadonlySet<string>)[]} getMaps first
   * @returns {Iterable<string>} iterable
   */
  _createIterable(
    getMaps: (
      arg0: Snapshot,
    ) => (ReadonlyMap<string, any> | ReadonlySet<string>)[],
  ): Iterable<string>;
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
type WebpackError = import('./WebpackError');
type FileSystemInfoEntry = {
  safeTime: number;
  timestamp?: number | undefined;
};
/**
 * @template T
 */
declare class SnapshotOptimization<T> {
  /**
   * @param {function(Snapshot): boolean} has has value
   * @param {function(Snapshot): Map<string, T> | Set<string>} get get value
   * @param {function(Snapshot, Map<string, T> | Set<string>): void} set set value
   * @param {boolean=} useStartTime use the start time of snapshots
   * @param {boolean=} isSet value is an Set instead of a Map
   */
  constructor(
    has: (arg0: Snapshot) => boolean,
    get: (arg0: Snapshot) => Map<string, T> | Set<string>,
    set: (arg0: Snapshot, arg1: Map<string, T> | Set<string>) => void,
    useStartTime?: boolean | undefined,
    isSet?: boolean | undefined,
  );
  _has: (arg0: Snapshot) => boolean;
  _get: (arg0: Snapshot) => Map<string, T> | Set<string>;
  _set: (arg0: Snapshot, arg1: Map<string, T> | Set<string>) => void;
  _useStartTime: boolean;
  _isSet: boolean;
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
type TimestampAndHash = {
  safeTime: number;
  timestamp?: number | undefined;
  hash: string;
};
type ResolvedContextFileSystemInfoEntry = {
  safeTime: number;
  timestampHash?: string | undefined;
};
type ResolvedContextTimestampAndHash = {
  safeTime: number;
  timestampHash?: string | undefined;
  hash: string;
};
import StackedCacheMap = require('./util/StackedCacheMap');
type ContextFileSystemInfoEntry = {
  safeTime: number;
  timestampHash?: string | undefined;
  resolved?: ResolvedContextFileSystemInfoEntry | undefined;
  symlinks?: Set<string> | undefined;
};
type ContextHash = {
  hash: string;
  resolved?: string | undefined;
  symlinks?: Set<string> | undefined;
};
type ContextTimestampAndHash = {
  safeTime: number;
  timestampHash?: string | undefined;
  hash: string;
  resolved?: ResolvedContextTimestampAndHash | undefined;
  symlinks?: Set<string> | undefined;
};
import AsyncQueue = require('./util/AsyncQueue');
type ResolveBuildDependenciesResult = {
  /**
   * list of files
   */
  files: Set<string>;
  /**
   * list of directories
   */
  directories: Set<string>;
  /**
   * list of missing entries
   */
  missing: Set<string>;
  /**
   * stored resolve results
   */
  resolveResults: Map<string, string | false>;
  /**
   * dependencies of the resolving
   */
  resolveDependencies: {
    files: Set<string>;
    directories: Set<string>;
    missing: Set<string>;
  };
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
type IStats = import('./util/fs').IStats;
type InputFileSystem = import('./util/fs').InputFileSystem;
type Logger = import('./logging/Logger').Logger;
type Hash = typeof import('./util/Hash');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type SnapshotOptimizationEntry = {
  snapshot: Snapshot;
  shared: number;
  snapshotContent: Set<string> | undefined;
  children: Set<SnapshotOptimizationEntry> | undefined;
};
