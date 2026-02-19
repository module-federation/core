export = PackFileCacheStrategy;
declare class PackFileCacheStrategy {
    /**
     * @param {object} options options
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
    constructor({ compiler, fs, context, cacheLocation, version, logger, snapshot, maxAge, profile, allowCollectingMemory, compression, readonly }: {
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
        compression: false | "gzip" | "brotli" | undefined;
        readonly: boolean | undefined;
    });
    /** @type {import("../serialization/Serializer")<PackContainer, null, EXPECTED_OBJECT>} */
    fileSerializer: import("../serialization/Serializer")<PackContainer, null, EXPECTED_OBJECT>;
    fileSystemInfo: FileSystemInfo;
    compiler: import("../Compiler");
    context: string;
    cacheLocation: string;
    version: string;
    logger: import("../logging/Logger").Logger;
    maxAge: number;
    profile: boolean;
    readonly: boolean;
    allowCollectingMemory: boolean;
    compression: false | "gzip" | "brotli";
    _extension: string;
    snapshot: import("../../declarations/WebpackOptions").SnapshotOptions;
    /** @type {BuildDependencies} */
    buildDependencies: BuildDependencies;
    /** @type {FileSystemDependencies} */
    newBuildDependencies: FileSystemDependencies;
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
     * @param {Data} data cached content
     * @returns {Promise<void>} promise
     */
    store(identifier: string, etag: Etag | null, data: Data): Promise<void>;
    /**
     * @param {string} identifier unique name for the resource
     * @param {Etag | null} etag etag of the resource
     * @returns {Promise<Data>} promise to the cached content
     */
    restore(identifier: string, etag: Etag | null): Promise<Data>;
    /**
     * @param {FileSystemDependencies | Iterable<string>} dependencies dependencies to store
     */
    storeBuildDependencies(dependencies: FileSystemDependencies | Iterable<string>): void;
    afterAllStored(): Promise<void>;
    clear(): void;
}
declare namespace PackFileCacheStrategy {
    export { SnapshotOptions, FileSystemDependencies, Data, Etag, Compiler, ResolveBuildDependenciesResult, ResolveResults, Snapshot, Logger, ObjectDeserializerContext, ObjectSerializerContext, Hash, IntermediateFileSystem, Items, BuildDependencies, ItemInfo, Content, LazyFunction };
}
/** @typedef {import("../../declarations/WebpackOptions").SnapshotOptions} SnapshotOptions */
/** @typedef {import("../Compilation").FileSystemDependencies} FileSystemDependencies */
/** @typedef {import("../Cache").Data} Data */
/** @typedef {import("../Cache").Etag} Etag */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../FileSystemInfo").ResolveBuildDependenciesResult} ResolveBuildDependenciesResult */
/** @typedef {import("../FileSystemInfo").ResolveResults} ResolveResults */
/** @typedef {import("../FileSystemInfo").Snapshot} Snapshot */
/** @typedef {import("../logging/Logger").Logger} Logger */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {typeof import("../util/Hash")} Hash */
/** @typedef {import("../util/fs").IntermediateFileSystem} IntermediateFileSystem */
/** @typedef {Set<string>} Items */
/** @typedef {Set<string>} BuildDependencies */
/** @typedef {Map<string, PackItemInfo>} ItemInfo */
declare class PackContainer {
    /**
     * @param {Pack} data stored data
     * @param {string} version version identifier
     * @param {Snapshot} buildSnapshot snapshot of all build dependencies
     * @param {BuildDependencies} buildDependencies list of all unresolved build dependencies captured
     * @param {ResolveResults} resolveResults result of the resolved build dependencies
     * @param {Snapshot} resolveBuildDependenciesSnapshot snapshot of the dependencies of the build dependencies resolving
     */
    constructor(data: Pack, version: string, buildSnapshot: Snapshot, buildDependencies: BuildDependencies, resolveResults: ResolveResults, resolveBuildDependenciesSnapshot: Snapshot);
    /** @type {Pack | (() => Pack)} */
    data: Pack | (() => Pack);
    /** @type {string} */
    version: string;
    /** @type {Snapshot} */
    buildSnapshot: Snapshot;
    /** @type {BuildDependencies} */
    buildDependencies: BuildDependencies;
    /** @type {ResolveResults} */
    resolveResults: ResolveResults;
    /** @type {Snapshot} */
    resolveBuildDependenciesSnapshot: Snapshot;
    /**
     * @param {ObjectSerializerContext} context context
     */
    serialize({ write, writeLazy }: ObjectSerializerContext): void;
    /**
     * @param {ObjectDeserializerContext} context context
     */
    deserialize({ read }: ObjectDeserializerContext): void;
}
import FileSystemInfo = require("../FileSystemInfo");
declare class Pack {
    /**
     * @param {Logger} logger a logger
     * @param {number} maxAge max age of cache items
     */
    constructor(logger: Logger, maxAge: number);
    /** @type {ItemInfo} */
    itemInfo: ItemInfo;
    /** @type {(string | undefined)[]} */
    requests: (string | undefined)[];
    requestsTimeout: any;
    /** @type {ItemInfo} */
    freshContent: ItemInfo;
    /** @type {(undefined | PackContent)[]} */
    content: (undefined | PackContent)[];
    invalid: boolean;
    logger: import("../logging/Logger").Logger;
    maxAge: number;
    /**
     * @param {string} identifier identifier
     */
    _addRequest(identifier: string): void;
    stopCapturingRequests(): void;
    /**
     * @param {string} identifier unique name for the resource
     * @param {string | null} etag etag of the resource
     * @returns {Data} cached content
     */
    get(identifier: string, etag: string | null): Data;
    /**
     * @param {string} identifier unique name for the resource
     * @param {string | null} etag etag of the resource
     * @param {Data} data cached content
     * @returns {void}
     */
    set(identifier: string, etag: string | null, data: Data): void;
    getContentStats(): {
        count: number;
        size: number;
    };
    /**
     * @returns {number} new location of data entries
     */
    _findLocation(): number;
    /**
     * @private
     * @param {Items} items items
     * @param {Items} usedItems used items
     * @param {number} newLoc new location
     */
    private _gcAndUpdateLocation;
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
    /**
     * @param {ObjectSerializerContext} context context
     */
    serialize({ write, writeSeparate }: ObjectSerializerContext): void;
    /**
     * @param {ObjectDeserializerContext & { logger: Logger }} context context
     */
    deserialize({ read, logger }: ObjectDeserializerContext & {
        logger: Logger;
    }): void;
}
type SnapshotOptions = import("../../declarations/WebpackOptions").SnapshotOptions;
type FileSystemDependencies = import("../Compilation").FileSystemDependencies;
type Data = import("../Cache").Data;
type Etag = import("../Cache").Etag;
type Compiler = import("../Compiler");
type ResolveBuildDependenciesResult = import("../FileSystemInfo").ResolveBuildDependenciesResult;
type ResolveResults = import("../FileSystemInfo").ResolveResults;
type Snapshot = import("../FileSystemInfo").Snapshot;
type Logger = import("../logging/Logger").Logger;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type Hash = typeof import("../util/Hash");
type IntermediateFileSystem = import("../util/fs").IntermediateFileSystem;
type Items = Set<string>;
type BuildDependencies = Set<string>;
type ItemInfo = Map<string, PackItemInfo>;
type Content = Map<string, Data>;
type LazyFunction = (() => Promise<PackContentItems> | PackContentItems) & Partial<{
    options: {
        size?: number;
    };
}>;
/** @typedef {(() => Promise<PackContentItems> | PackContentItems) & Partial<{ options: { size?: number }}>} LazyFunction */
declare class PackContent {
    /**
     * @param {Items} items keys
     * @param {Items} usedItems used keys
     * @param {PackContentItems | (() => Promise<PackContentItems>)} dataOrFn sync or async content
     * @param {Logger=} logger logger for logging
     * @param {string=} lazyName name of dataOrFn for logging
     */
    constructor(items: Items, usedItems: Items, dataOrFn: PackContentItems | (() => Promise<PackContentItems>), logger?: Logger | undefined, lazyName?: string | undefined);
    items: Items;
    /** @type {LazyFunction | undefined} */
    lazy: LazyFunction | undefined;
    /** @type {Content | undefined} */
    content: Content | undefined;
    outdated: boolean;
    used: Items;
    logger: import("../logging/Logger").Logger;
    lazyName: string;
    /**
     * @param {string} identifier identifier
     * @returns {string | Promise<string>} result
     */
    get(identifier: string): string | Promise<string>;
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
     * @param {(lazy: LazyFunction) => (() => PackContentItems | Promise<PackContentItems>)} write write function
     * @returns {void}
     */
    writeLazy(write: (lazy: LazyFunction) => (() => PackContentItems | Promise<PackContentItems>)): void;
}
declare class PackItemInfo {
    /**
     * @param {string} identifier identifier of item
     * @param {string | null | undefined} etag etag of item
     * @param {Data} value fresh value of item
     */
    constructor(identifier: string, etag: string | null | undefined, value: Data);
    /** @type {string} */
    identifier: string;
    /** @type {string | null | undefined} */
    etag: string | null | undefined;
    /** @type {number} */
    location: number;
    /** @type {number} */
    lastAccess: number;
    /** @type {Data} */
    freshValue: Data;
}
/** @typedef {Map<string, Data>} Content */
declare class PackContentItems {
    /**
     * @param {Content} map items
     */
    constructor(map: Content);
    map: Content;
    /**
     * @param {ObjectSerializerContext & { logger: Logger, profile: boolean | undefined  }} context context
     */
    serialize({ write, snapshot, rollback, logger, profile }: ObjectSerializerContext & {
        logger: Logger;
        profile: boolean | undefined;
    }): void;
    /**
     * @param {ObjectDeserializerContext & { logger: Logger, profile: boolean | undefined }} context context
     */
    deserialize({ read, logger, profile }: ObjectDeserializerContext & {
        logger: Logger;
        profile: boolean | undefined;
    }): void;
}
