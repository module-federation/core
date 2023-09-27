export = PackFileCacheStrategy;
declare class PackFileCacheStrategy {
  /**
   * @param {Object} options options
   * @param {Compiler} options.compiler the compiler
   * @param {IntermediateFileSystem} options.fs the filesystem
   * @param {string} options.context the context directory
   * @param {string} options.cacheLocation the location of the cache data
   * @param {string} options.version version identifier
   * @param {Logger} options.logger a logger
   * @param {SnapshotOptions} options.snapshot options regarding snapshotting
   * @param {number} options.maxAge max age of cache items
   * @param {boolean | undefined} options.profile track and log detailed timing information for individual cache items
   * @param {boolean | undefined} options.allowCollectingMemory allow to collect unused memory created during deserialization
   * @param {false | "gzip" | "brotli" | undefined} options.compression compression used
   * @param {boolean | undefined} options.readonly disable storing cache into filesystem
   */
  constructor({
    compiler,
    fs,
    context,
    cacheLocation,
    version,
    logger,
    snapshot,
    maxAge,
    profile,
    allowCollectingMemory,
    compression,
    readonly,
  }: {
    compiler: Compiler;
    fs: IntermediateFileSystem;
    context: string;
    cacheLocation: string;
    version: string;
    logger: Logger;
    snapshot: SnapshotOptions;
    maxAge: number;
    profile: boolean | undefined;
    allowCollectingMemory: boolean | undefined;
    compression: false | 'gzip' | 'brotli' | undefined;
    readonly: boolean | undefined;
  });
  fileSerializer: import('../serialization/Serializer');
  fileSystemInfo: FileSystemInfo;
  compiler: import('../Compiler');
  context: string;
  cacheLocation: string;
  version: string;
  logger: import('../logging/Logger').Logger;
  maxAge: number;
  profile: boolean;
  readonly: boolean;
  allowCollectingMemory: boolean;
  compression: false | 'gzip' | 'brotli';
  _extension: string;
  snapshot: import('../../declarations/WebpackOptions').SnapshotOptions;
  /** @type {Set<string>} */
  buildDependencies: Set<string>;
  /** @type {LazySet<string>} */
  newBuildDependencies: LazySet<string>;
  /** @type {Snapshot | undefined} */
  resolveBuildDependenciesSnapshot: Snapshot | undefined;
  /** @type {ResolveResults | undefined} */
  resolveResults: ResolveResults | undefined;
  /** @type {Snapshot | undefined} */
  buildSnapshot: Snapshot | undefined;
  /** @type {Promise<Pack> | undefined} */
  packPromise: Promise<Pack> | undefined;
  storePromise: Promise<void>;
  /**
   * @returns {Promise<Pack>} pack
   */
  _getPack(): Promise<Pack>;
  /**
   * @returns {Promise<Pack>} the pack
   */
  _openPack(): Promise<Pack>;
  /**
   * @param {string} identifier unique name for the resource
   * @param {Etag | null} etag etag of the resource
   * @param {any} data cached content
   * @returns {Promise<void>} promise
   */
  store(identifier: string, etag: Etag | null, data: any): Promise<void>;
  /**
   * @param {string} identifier unique name for the resource
   * @param {Etag | null} etag etag of the resource
   * @returns {Promise<any>} promise to the cached content
   */
  restore(identifier: string, etag: Etag | null): Promise<any>;
  /**
   * @param {LazySet<string>} dependencies dependencies to store
   */
  storeBuildDependencies(dependencies: LazySet<string>): void;
  afterAllStored(): Promise<any>;
  clear(): void;
}
declare namespace PackFileCacheStrategy {
  export {
    SnapshotOptions,
    Etag,
    Compiler,
    ResolveBuildDependenciesResult,
    Snapshot,
    Logger,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    IntermediateFileSystem,
    ResolveResults,
  };
}
import FileSystemInfo = require('../FileSystemInfo');
import LazySet = require('../util/LazySet');
type Snapshot = import('../FileSystemInfo').Snapshot;
type ResolveResults = Map<string, string | false>;
declare class Pack {
  constructor(logger: any, maxAge: any);
  /** @type {Map<string, PackItemInfo>} */
  itemInfo: Map<string, PackItemInfo>;
  /** @type {(string | undefined)[]} */
  requests: (string | undefined)[];
  requestsTimeout: any;
  /** @type {Map<string, PackItemInfo>} */
  freshContent: Map<string, PackItemInfo>;
  /** @type {(undefined | PackContent)[]} */
  content: (undefined | PackContent)[];
  invalid: boolean;
  logger: any;
  maxAge: any;
  /**
   * @param {string} identifier identifier
   */
  _addRequest(identifier: string): void;
  stopCapturingRequests(): void;
  /**
   * @param {string} identifier unique name for the resource
   * @param {string | null} etag etag of the resource
   * @returns {any} cached content
   */
  get(identifier: string, etag: string | null): any;
  /**
   * @param {string} identifier unique name for the resource
   * @param {string | null} etag etag of the resource
   * @param {any} data cached content
   * @returns {void}
   */
  set(identifier: string, etag: string | null, data: any): void;
  getContentStats(): {
    count: number;
    size: number;
  };
  /**
   * @returns {number} new location of data entries
   */
  _findLocation(): number;
  _gcAndUpdateLocation(items: any, usedItems: any, newLoc: any): void;
  _persistFreshContent(): void;
  /**
   * Merges small content files to a single content file
   */
  _optimizeSmallContent(): void;
  /**
   * Split large content files with used and unused items
   * into two parts to separate used from unused items
   */
  _optimizeUnusedContent(): void;
  /**
   * Find the content with the oldest item and run GC on that.
   * Only runs for one content to avoid large invalidation.
   */
  _gcOldestContent(): void;
  serialize({ write, writeSeparate }: { write: any; writeSeparate: any }): void;
  deserialize({ read, logger }: { read: any; logger: any }): void;
}
type Etag = import('../Cache').Etag;
type Compiler = import('../Compiler');
type IntermediateFileSystem = import('../util/fs').IntermediateFileSystem;
type Logger = import('../logging/Logger').Logger;
type SnapshotOptions =
  import('../../declarations/WebpackOptions').SnapshotOptions;
type ResolveBuildDependenciesResult =
  import('../FileSystemInfo').ResolveBuildDependenciesResult;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
declare class PackItemInfo {
  /**
   * @param {string} identifier identifier of item
   * @param {string | null} etag etag of item
   * @param {any} value fresh value of item
   */
  constructor(identifier: string, etag: string | null, value: any);
  identifier: string;
  etag: string;
  location: number;
  lastAccess: number;
  freshValue: any;
}
declare class PackContent {
  /**
   * @param {Set<string>} items keys
   * @param {Set<string>} usedItems used keys
   * @param {PackContentItems | function(): Promise<PackContentItems>} dataOrFn sync or async content
   * @param {Logger=} logger logger for logging
   * @param {string=} lazyName name of dataOrFn for logging
   */
  constructor(
    items: Set<string>,
    usedItems: Set<string>,
    dataOrFn: PackContentItems | (() => Promise<PackContentItems>),
    logger?: Logger | undefined,
    lazyName?: string | undefined,
  );
  items: Set<string>;
  /** @type {function(): Promise<PackContentItems> | PackContentItems} */
  lazy: () => Promise<PackContentItems> | PackContentItems;
  /** @type {Map<string, any>} */
  content: Map<string, any>;
  outdated: boolean;
  used: Set<string>;
  logger: import('../logging/Logger').Logger;
  lazyName: string;
  get(identifier: any): any;
  /**
   * @param {string} reason explanation why unpack is necessary
   * @returns {void | Promise<void>} maybe a promise if lazy
   */
  unpack(reason: string): void | Promise<void>;
  /**
   * @returns {number} size of the content or -1 if not known
   */
  getSize(): number;
  /**
   * @param {string} identifier identifier
   */
  delete(identifier: string): void;
  /**
   * @template T
   * @param {function(any): function(): Promise<PackContentItems> | PackContentItems} write write function
   * @returns {void}
   */
  writeLazy<T>(
    write: (arg0: any) => () => Promise<PackContentItems> | PackContentItems,
  ): void;
}
declare class PackContentItems {
  /**
   * @param {Map<string, any>} map items
   */
  constructor(map: Map<string, any>);
  map: Map<string, any>;
  serialize({
    write,
    snapshot,
    rollback,
    logger,
    profile,
  }: {
    write: any;
    snapshot: any;
    rollback: any;
    logger: any;
    profile: any;
  }): void;
  deserialize({
    read,
    logger,
    profile,
  }: {
    read: any;
    logger: any;
    profile: any;
  }): void;
}
