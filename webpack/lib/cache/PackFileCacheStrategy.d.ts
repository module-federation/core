export = PackFileCacheStrategy;
declare class PackFileCacheStrategy {
    /**
     * Creates an instance of PackFileCacheStrategy.
     * @param {object} options options
     * @param {Compiler} options.compiler the compiler
     * @param {IntermediateFileSystem} options.fs the filesystem
     * @param {string} options.context the context directory
     * @param {string} options.cacheLocation the location of the cache data
     * @param {string} options.version version identifier
     * @param {Logger} options.logger a logger
     * @param {SnapshotOptions} options.snapshot options regarding snapshotting
     * @param {number} options.maxAge max age of cache items
     * @param {boolean=} options.profile track and log detailed timing information for individual cache items
     * @param {boolean=} options.allowCollectingMemory allow to collect unused memory created during deserialization
     * @param {false | "gzip" | "brotli" | "zstd"=} options.compression compression used
     * @param {boolean=} options.readonly disable storing cache into filesystem
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
        profile?: boolean | undefined;
        allowCollectingMemory?: boolean | undefined;
        compression?: (false | "gzip" | "brotli" | "zstd") | undefined;
        readonly?: boolean | undefined;
    });
    /** @type {import("../serialization/Serializer")<PackContainer, null, import("../serialization/FileMiddleware").Context>} */
    fileSerializer: import("../serialization/Serializer")<PackContainer, null, import("../serialization/FileMiddleware").Context>;
    /** @type {FileSystemInfo} */
    fileSystemInfo: FileSystemInfo;
    /** @type {Compiler} */
    compiler: Compiler;
    /** @type {IntermediateFileSystem} */
    fs: IntermediateFileSystem;
    /** @type {string} */
    context: string;
    /** @type {string} */
    cacheLocation: string;
    /** @type {string} */
    version: string;
    /** @type {Logger} */
    logger: Logger;
    /** @type {number} */
    maxAge: number;
    /** @type {boolean | undefined} */
    profile: boolean | undefined;
    /** @type {boolean | undefined} */
    readonly: boolean | undefined;
    /** @type {boolean | undefined} */
    allowCollectingMemory: boolean | undefined;
    /** @type {Map<string, { mtimeMs: number, referenced: string[] }>} */
    _referencedFilesCache: Map<string, {
        mtimeMs: number;
        referenced: string[];
    }>;
    /** @type {false | "gzip" | "brotli" | "zstd" | undefined} */
    compression: false | "gzip" | "brotli" | "zstd" | undefined;
    /** @type {string} */
    _extension: string;
    /** @type {SnapshotOptions} */
    snapshot: SnapshotOptions;
    /** @type {BuildDependencies} */
    buildDependencies: BuildDependencies;
    /** @type {FileSystemDependencies} */
    newBuildDependencies: FileSystemDependencies;
    /** @type {FileSystemDependencies} */
    newOptionalBuildDependencies: FileSystemDependencies;
    /** @type {InstanceType<Snapshot> | undefined} */
    resolveBuildDependenciesSnapshot: InstanceType<{
        new (): {
            _flags: number;
            _cachedFileIterable: Iterable<string> | undefined;
            _cachedContextIterable: Iterable<string> | undefined;
            _cachedMissingIterable: Iterable<string> | undefined;
            startTime: number | undefined;
            fileTimestamps: FileSystemInfo.FileTimestamps | undefined;
            fileHashes: FileSystemInfo.FileHashes | undefined;
            fileTshs: FileSystemInfo.FileTshs | undefined;
            contextTimestamps: FileSystemInfo.ContextTimestamps | undefined;
            contextHashes: FileSystemInfo.ContextHashes | undefined;
            contextTshs: FileSystemInfo.ContextTshs | undefined;
            missingExistence: FileSystemInfo.MissingExistence | undefined;
            managedItemInfo: FileSystemInfo.ManagedItemInfo | undefined;
            managedFiles: FileSystemInfo.ManagedFiles | undefined;
            managedContexts: FileSystemInfo.ManagedContexts | undefined;
            managedMissing: FileSystemInfo.ManagedMissing | undefined;
            children: FileSystemInfo.Children | undefined;
            hasStartTime(): boolean;
            setStartTime(value: number): void;
            setMergedStartTime(value: number | undefined, snapshot: /*elided*/ any): void;
            hasFileTimestamps(): boolean;
            setFileTimestamps(value: FileTimestamps): void;
            hasFileHashes(): boolean;
            setFileHashes(value: FileHashes): void;
            hasFileTshs(): boolean;
            setFileTshs(value: FileTshs): void;
            hasContextTimestamps(): boolean;
            setContextTimestamps(value: ContextTimestamps): void;
            hasContextHashes(): boolean;
            setContextHashes(value: ContextHashes): void;
            hasContextTshs(): boolean;
            setContextTshs(value: ContextTshs): void;
            hasMissingExistence(): boolean;
            setMissingExistence(value: MissingExistence): void;
            hasManagedItemInfo(): boolean;
            setManagedItemInfo(value: ManagedItemInfo): void;
            hasManagedFiles(): boolean;
            setManagedFiles(value: ManagedFiles): void;
            hasManagedContexts(): boolean;
            setManagedContexts(value: ManagedContexts): void;
            hasManagedMissing(): boolean;
            setManagedMissing(value: ManagedMissing): void;
            hasChildren(): boolean;
            setChildren(value: Children): void;
            addChild(child: /*elided*/ any): void;
            serialize({ write }: ObjectSerializerContext): void;
            deserialize({ read }: ObjectDeserializerContext): void;
            _createIterable<T extends {
                keys(): IterableIterator<string>;
            } | undefined>(getMaps: FileSystemInfo.GetMapsFunction<T>): {
                snapshot: /*elided*/ any;
                getMaps: FileSystemInfo.GetMapsFunction<T>;
                [Symbol.iterator](): {
                    next: () => IteratorResult<string>;
                };
            };
            getFileIterable(): Iterable<string>;
            getContextIterable(): Iterable<string>;
            getMissingIterable(): Iterable<string>;
        };
    }> | undefined;
    /** @type {ResolveResults | undefined} */
    resolveResults: FileSystemInfo.ResolveResults | undefined;
    /** @type {InstanceType<Snapshot> | undefined} */
    buildSnapshot: InstanceType<{
        new (): {
            _flags: number;
            _cachedFileIterable: Iterable<string> | undefined;
            _cachedContextIterable: Iterable<string> | undefined;
            _cachedMissingIterable: Iterable<string> | undefined;
            startTime: number | undefined;
            fileTimestamps: FileSystemInfo.FileTimestamps | undefined;
            fileHashes: FileSystemInfo.FileHashes | undefined;
            fileTshs: FileSystemInfo.FileTshs | undefined;
            contextTimestamps: FileSystemInfo.ContextTimestamps | undefined;
            contextHashes: FileSystemInfo.ContextHashes | undefined;
            contextTshs: FileSystemInfo.ContextTshs | undefined;
            missingExistence: FileSystemInfo.MissingExistence | undefined;
            managedItemInfo: FileSystemInfo.ManagedItemInfo | undefined;
            managedFiles: FileSystemInfo.ManagedFiles | undefined;
            managedContexts: FileSystemInfo.ManagedContexts | undefined;
            managedMissing: FileSystemInfo.ManagedMissing | undefined;
            children: FileSystemInfo.Children | undefined;
            hasStartTime(): boolean;
            setStartTime(value: number): void;
            setMergedStartTime(value: number | undefined, snapshot: /*elided*/ any): void;
            hasFileTimestamps(): boolean;
            setFileTimestamps(value: FileTimestamps): void;
            hasFileHashes(): boolean;
            setFileHashes(value: FileHashes): void;
            hasFileTshs(): boolean;
            setFileTshs(value: FileTshs): void;
            hasContextTimestamps(): boolean;
            setContextTimestamps(value: ContextTimestamps): void;
            hasContextHashes(): boolean;
            setContextHashes(value: ContextHashes): void;
            hasContextTshs(): boolean;
            setContextTshs(value: ContextTshs): void;
            hasMissingExistence(): boolean;
            setMissingExistence(value: MissingExistence): void;
            hasManagedItemInfo(): boolean;
            setManagedItemInfo(value: ManagedItemInfo): void;
            hasManagedFiles(): boolean;
            setManagedFiles(value: ManagedFiles): void;
            hasManagedContexts(): boolean;
            setManagedContexts(value: ManagedContexts): void;
            hasManagedMissing(): boolean;
            setManagedMissing(value: ManagedMissing): void;
            hasChildren(): boolean;
            setChildren(value: Children): void;
            addChild(child: /*elided*/ any): void;
            serialize({ write }: ObjectSerializerContext): void;
            deserialize({ read }: ObjectDeserializerContext): void;
            _createIterable<T extends {
                keys(): IterableIterator<string>;
            } | undefined>(getMaps: FileSystemInfo.GetMapsFunction<T>): {
                snapshot: /*elided*/ any;
                getMaps: FileSystemInfo.GetMapsFunction<T>;
                [Symbol.iterator](): {
                    next: () => IteratorResult<string>;
                };
            };
            getFileIterable(): Iterable<string>;
            getContextIterable(): Iterable<string>;
            getMissingIterable(): Iterable<string>;
        };
    }> | undefined;
    /** @type {Promise<Pack> | undefined} */
    packPromise: Promise<Pack> | undefined;
    /** @type {Promise<void>} */
    storePromise: Promise<void>;
    /**
     * Returns pack.
     * @returns {Promise<Pack>} pack
     */
    _getPack(): Promise<Pack>;
    /**
     * Returns the pack.
     * @returns {Promise<Pack>} the pack
     */
    _openPack(): Promise<Pack>;
    /**
     * Returns promise.
     * @param {string} identifier unique name for the resource
     * @param {Etag | null} etag etag of the resource
     * @param {Data} data cached content
     * @returns {Promise<void>} promise
     */
    store(identifier: string, etag: Etag | null, data: Data): Promise<void>;
    /**
     * Returns promise to the cached content.
     * @param {string} identifier unique name for the resource
     * @param {Etag | null} etag etag of the resource
     * @returns {Promise<Data>} promise to the cached content
     */
    restore(identifier: string, etag: Etag | null): Promise<Data>;
    /**
     * Stores build dependencies.
     * @param {FileSystemDependencies | Iterable<string>} dependencies dependencies to store
     * @param {FileSystemDependencies | Iterable<string>} optionalDependencies optional dependencies to store
     * @returns {void}
     */
    storeBuildDependencies(dependencies: FileSystemDependencies | Iterable<string>, optionalDependencies: FileSystemDependencies | Iterable<string>): void;
    afterAllStored(): Promise<void>;
    /**
     * Reads when the currently unreferenced files were first seen. A missing or
     * unreadable file just restarts the grace period for every orphan.
     * @returns {Promise<UnreferencedFiles>} first seen time and size per file name
     */
    _readUnreferencedFiles(): Promise<UnreferencedFiles>;
    /**
     * Persists when the still unreferenced files were first seen. Failing to write
     * only costs the orphans another grace period, so errors are ignored.
     * @param {UnreferencedFiles} unreferenced first seen time and size per file name
     * @param {boolean} hadEntries whether a previous state exists that must be replaced
     * @returns {Promise<void>} promise
     */
    _writeUnreferencedFiles(unreferenced: UnreferencedFiles, hadEntries: boolean): Promise<void>;
    /**
     * Deletes files from the cache directory that are no longer referenced by the
     * stored pack. Retained files are walked on disk since nested lazy segments
     * reference files not visible during serialization. Errors only log a warning.
     * @param {Set<string>} writtenNames names (without extension) written by this store
     * @param {Set<string>} retainedNames names (without extension) referenced but not rewritten
     * @returns {Promise<void>} promise
     */
    _cleanupUnusedFiles(writtenNames: Set<string>, retainedNames: Set<string>): Promise<void>;
    clear(): void;
}
declare namespace PackFileCacheStrategy {
    export { Items, BuildDependencies, ItemInfo, UnreferencedFile, UnreferencedFiles, Content, LazyFunction };
}
declare class PackContainer {
    /**
     * Creates an instance of PackContainer.
     * @param {Pack} data stored data
     * @param {string} version version identifier
     * @param {InstanceType<Snapshot>} buildSnapshot snapshot of all build dependencies
     * @param {BuildDependencies} buildDependencies list of all unresolved build dependencies captured
     * @param {ResolveResults} resolveResults result of the resolved build dependencies
     * @param {InstanceType<Snapshot>} resolveBuildDependenciesSnapshot snapshot of the dependencies of the build dependencies resolving
     */
    constructor(data: Pack, version: string, buildSnapshot: InstanceType<{
        new (): {
            _flags: number;
            _cachedFileIterable: Iterable<string> | undefined;
            _cachedContextIterable: Iterable<string> | undefined;
            _cachedMissingIterable: Iterable<string> | undefined;
            startTime: number | undefined;
            fileTimestamps: FileSystemInfo.FileTimestamps | undefined;
            fileHashes: FileSystemInfo.FileHashes | undefined;
            fileTshs: FileSystemInfo.FileTshs | undefined;
            contextTimestamps: FileSystemInfo.ContextTimestamps | undefined;
            contextHashes: FileSystemInfo.ContextHashes | undefined;
            contextTshs: FileSystemInfo.ContextTshs | undefined;
            missingExistence: FileSystemInfo.MissingExistence | undefined;
            managedItemInfo: FileSystemInfo.ManagedItemInfo | undefined;
            managedFiles: FileSystemInfo.ManagedFiles | undefined;
            managedContexts: FileSystemInfo.ManagedContexts | undefined;
            managedMissing: FileSystemInfo.ManagedMissing | undefined;
            children: FileSystemInfo.Children | undefined;
            hasStartTime(): boolean;
            setStartTime(value: number): void;
            setMergedStartTime(value: number | undefined, snapshot: /*elided*/ any): void;
            hasFileTimestamps(): boolean;
            setFileTimestamps(value: FileTimestamps): void;
            hasFileHashes(): boolean;
            setFileHashes(value: FileHashes): void;
            hasFileTshs(): boolean;
            setFileTshs(value: FileTshs): void;
            hasContextTimestamps(): boolean;
            setContextTimestamps(value: ContextTimestamps): void;
            hasContextHashes(): boolean;
            setContextHashes(value: ContextHashes): void;
            hasContextTshs(): boolean;
            setContextTshs(value: ContextTshs): void;
            hasMissingExistence(): boolean;
            setMissingExistence(value: MissingExistence): void;
            hasManagedItemInfo(): boolean;
            setManagedItemInfo(value: ManagedItemInfo): void;
            hasManagedFiles(): boolean;
            setManagedFiles(value: ManagedFiles): void;
            hasManagedContexts(): boolean;
            setManagedContexts(value: ManagedContexts): void;
            hasManagedMissing(): boolean;
            setManagedMissing(value: ManagedMissing): void;
            hasChildren(): boolean;
            setChildren(value: Children): void;
            addChild(child: /*elided*/ any): void;
            serialize({ write }: ObjectSerializerContext): void;
            deserialize({ read }: ObjectDeserializerContext): void;
            _createIterable<T extends {
                keys(): IterableIterator<string>;
            } | undefined>(getMaps: FileSystemInfo.GetMapsFunction<T>): {
                snapshot: /*elided*/ any;
                getMaps: FileSystemInfo.GetMapsFunction<T>;
                [Symbol.iterator](): {
                    next: () => IteratorResult<string>;
                };
            };
            getFileIterable(): Iterable<string>;
            getContextIterable(): Iterable<string>;
            getMissingIterable(): Iterable<string>;
        };
    }>, buildDependencies: BuildDependencies, resolveResults: FileSystemInfo.ResolveResults, resolveBuildDependenciesSnapshot: InstanceType<{
        new (): {
            _flags: number;
            _cachedFileIterable: Iterable<string> | undefined;
            _cachedContextIterable: Iterable<string> | undefined;
            _cachedMissingIterable: Iterable<string> | undefined;
            startTime: number | undefined;
            fileTimestamps: FileSystemInfo.FileTimestamps | undefined;
            fileHashes: FileSystemInfo.FileHashes | undefined;
            fileTshs: FileSystemInfo.FileTshs | undefined;
            contextTimestamps: FileSystemInfo.ContextTimestamps | undefined;
            contextHashes: FileSystemInfo.ContextHashes | undefined;
            contextTshs: FileSystemInfo.ContextTshs | undefined;
            missingExistence: FileSystemInfo.MissingExistence | undefined;
            managedItemInfo: FileSystemInfo.ManagedItemInfo | undefined;
            managedFiles: FileSystemInfo.ManagedFiles | undefined;
            managedContexts: FileSystemInfo.ManagedContexts | undefined;
            managedMissing: FileSystemInfo.ManagedMissing | undefined;
            children: FileSystemInfo.Children | undefined;
            hasStartTime(): boolean;
            setStartTime(value: number): void;
            setMergedStartTime(value: number | undefined, snapshot: /*elided*/ any): void;
            hasFileTimestamps(): boolean;
            setFileTimestamps(value: FileTimestamps): void;
            hasFileHashes(): boolean;
            setFileHashes(value: FileHashes): void;
            hasFileTshs(): boolean;
            setFileTshs(value: FileTshs): void;
            hasContextTimestamps(): boolean;
            setContextTimestamps(value: ContextTimestamps): void;
            hasContextHashes(): boolean;
            setContextHashes(value: ContextHashes): void;
            hasContextTshs(): boolean;
            setContextTshs(value: ContextTshs): void;
            hasMissingExistence(): boolean;
            setMissingExistence(value: MissingExistence): void;
            hasManagedItemInfo(): boolean;
            setManagedItemInfo(value: ManagedItemInfo): void;
            hasManagedFiles(): boolean;
            setManagedFiles(value: ManagedFiles): void;
            hasManagedContexts(): boolean;
            setManagedContexts(value: ManagedContexts): void;
            hasManagedMissing(): boolean;
            setManagedMissing(value: ManagedMissing): void;
            hasChildren(): boolean;
            setChildren(value: Children): void;
            addChild(child: /*elided*/ any): void;
            serialize({ write }: ObjectSerializerContext): void;
            deserialize({ read }: ObjectDeserializerContext): void;
            _createIterable<T extends {
                keys(): IterableIterator<string>;
            } | undefined>(getMaps: FileSystemInfo.GetMapsFunction<T>): {
                snapshot: /*elided*/ any;
                getMaps: FileSystemInfo.GetMapsFunction<T>;
                [Symbol.iterator](): {
                    next: () => IteratorResult<string>;
                };
            };
            getFileIterable(): Iterable<string>;
            getContextIterable(): Iterable<string>;
            getMissingIterable(): Iterable<string>;
        };
    }>);
    /** @type {Pack | (() => Pack)} */
    data: Pack | (() => Pack);
    /** @type {string} */
    version: string;
    /** @type {InstanceType<Snapshot>} */
    buildSnapshot: InstanceType<{
        new (): {
            _flags: number;
            _cachedFileIterable: Iterable<string> | undefined;
            _cachedContextIterable: Iterable<string> | undefined;
            _cachedMissingIterable: Iterable<string> | undefined;
            startTime: number | undefined;
            fileTimestamps: FileSystemInfo.FileTimestamps | undefined;
            fileHashes: FileSystemInfo.FileHashes | undefined;
            fileTshs: FileSystemInfo.FileTshs | undefined;
            contextTimestamps: FileSystemInfo.ContextTimestamps | undefined;
            contextHashes: FileSystemInfo.ContextHashes | undefined;
            contextTshs: FileSystemInfo.ContextTshs | undefined;
            missingExistence: FileSystemInfo.MissingExistence | undefined;
            managedItemInfo: FileSystemInfo.ManagedItemInfo | undefined;
            managedFiles: FileSystemInfo.ManagedFiles | undefined;
            managedContexts: FileSystemInfo.ManagedContexts | undefined;
            managedMissing: FileSystemInfo.ManagedMissing | undefined;
            children: FileSystemInfo.Children | undefined;
            hasStartTime(): boolean;
            setStartTime(value: number): void;
            setMergedStartTime(value: number | undefined, snapshot: /*elided*/ any): void;
            hasFileTimestamps(): boolean;
            setFileTimestamps(value: FileTimestamps): void;
            hasFileHashes(): boolean;
            setFileHashes(value: FileHashes): void;
            hasFileTshs(): boolean;
            setFileTshs(value: FileTshs): void;
            hasContextTimestamps(): boolean;
            setContextTimestamps(value: ContextTimestamps): void;
            hasContextHashes(): boolean;
            setContextHashes(value: ContextHashes): void;
            hasContextTshs(): boolean;
            setContextTshs(value: ContextTshs): void;
            hasMissingExistence(): boolean;
            setMissingExistence(value: MissingExistence): void;
            hasManagedItemInfo(): boolean;
            setManagedItemInfo(value: ManagedItemInfo): void;
            hasManagedFiles(): boolean;
            setManagedFiles(value: ManagedFiles): void;
            hasManagedContexts(): boolean;
            setManagedContexts(value: ManagedContexts): void;
            hasManagedMissing(): boolean;
            setManagedMissing(value: ManagedMissing): void;
            hasChildren(): boolean;
            setChildren(value: Children): void;
            addChild(child: /*elided*/ any): void;
            serialize({ write }: ObjectSerializerContext): void;
            deserialize({ read }: ObjectDeserializerContext): void;
            _createIterable<T extends {
                keys(): IterableIterator<string>;
            } | undefined>(getMaps: FileSystemInfo.GetMapsFunction<T>): {
                snapshot: /*elided*/ any;
                getMaps: FileSystemInfo.GetMapsFunction<T>;
                [Symbol.iterator](): {
                    next: () => IteratorResult<string>;
                };
            };
            getFileIterable(): Iterable<string>;
            getContextIterable(): Iterable<string>;
            getMissingIterable(): Iterable<string>;
        };
    }>;
    /** @type {BuildDependencies} */
    buildDependencies: BuildDependencies;
    /** @type {ResolveResults} */
    resolveResults: FileSystemInfo.ResolveResults;
    /** @type {InstanceType<Snapshot>} */
    resolveBuildDependenciesSnapshot: InstanceType<{
        new (): {
            _flags: number;
            _cachedFileIterable: Iterable<string> | undefined;
            _cachedContextIterable: Iterable<string> | undefined;
            _cachedMissingIterable: Iterable<string> | undefined;
            startTime: number | undefined;
            fileTimestamps: FileSystemInfo.FileTimestamps | undefined;
            fileHashes: FileSystemInfo.FileHashes | undefined;
            fileTshs: FileSystemInfo.FileTshs | undefined;
            contextTimestamps: FileSystemInfo.ContextTimestamps | undefined;
            contextHashes: FileSystemInfo.ContextHashes | undefined;
            contextTshs: FileSystemInfo.ContextTshs | undefined;
            missingExistence: FileSystemInfo.MissingExistence | undefined;
            managedItemInfo: FileSystemInfo.ManagedItemInfo | undefined;
            managedFiles: FileSystemInfo.ManagedFiles | undefined;
            managedContexts: FileSystemInfo.ManagedContexts | undefined;
            managedMissing: FileSystemInfo.ManagedMissing | undefined;
            children: FileSystemInfo.Children | undefined;
            hasStartTime(): boolean;
            setStartTime(value: number): void;
            setMergedStartTime(value: number | undefined, snapshot: /*elided*/ any): void;
            hasFileTimestamps(): boolean;
            setFileTimestamps(value: FileTimestamps): void;
            hasFileHashes(): boolean;
            setFileHashes(value: FileHashes): void;
            hasFileTshs(): boolean;
            setFileTshs(value: FileTshs): void;
            hasContextTimestamps(): boolean;
            setContextTimestamps(value: ContextTimestamps): void;
            hasContextHashes(): boolean;
            setContextHashes(value: ContextHashes): void;
            hasContextTshs(): boolean;
            setContextTshs(value: ContextTshs): void;
            hasMissingExistence(): boolean;
            setMissingExistence(value: MissingExistence): void;
            hasManagedItemInfo(): boolean;
            setManagedItemInfo(value: ManagedItemInfo): void;
            hasManagedFiles(): boolean;
            setManagedFiles(value: ManagedFiles): void;
            hasManagedContexts(): boolean;
            setManagedContexts(value: ManagedContexts): void;
            hasManagedMissing(): boolean;
            setManagedMissing(value: ManagedMissing): void;
            hasChildren(): boolean;
            setChildren(value: Children): void;
            addChild(child: /*elided*/ any): void;
            serialize({ write }: ObjectSerializerContext): void;
            deserialize({ read }: ObjectDeserializerContext): void;
            _createIterable<T extends {
                keys(): IterableIterator<string>;
            } | undefined>(getMaps: FileSystemInfo.GetMapsFunction<T>): {
                snapshot: /*elided*/ any;
                getMaps: FileSystemInfo.GetMapsFunction<T>;
                [Symbol.iterator](): {
                    next: () => IteratorResult<string>;
                };
            };
            getFileIterable(): Iterable<string>;
            getContextIterable(): Iterable<string>;
            getMissingIterable(): Iterable<string>;
        };
    }>;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize({ write, writeLazy }: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize({ read }: ObjectDeserializerContext): void;
}
import FileSystemInfo = require("../fs/FileSystemInfo");
import type Compiler from "../Compiler";
import type { IntermediateFileSystem } from "../fs/fs";
import type { Logger } from "../logging/Logger";
import type { SnapshotOptions } from "../../declarations/WebpackOptions";
import type { FileSystemDependencies } from "../Compilation";
import type { ObjectSerializerContext } from "../serialization/ObjectMiddleware";
import type { ObjectDeserializerContext } from "../serialization/ObjectMiddleware";
declare class Pack {
    /**
     * Creates an instance of Pack.
     * @param {Logger} logger a logger
     * @param {number} maxAge max age of cache items
     */
    constructor(logger: Logger, maxAge: number);
    /** @type {ItemInfo} */
    itemInfo: ItemInfo;
    /** @type {(string | undefined)[]} */
    requests: (string | undefined)[];
    /** @type {undefined | NodeJS.Timeout} */
    requestsTimeout: undefined | NodeJS.Timeout;
    /** @type {ItemInfo} */
    freshContent: ItemInfo;
    /** @type {(undefined | PackContent)[]} */
    content: (undefined | PackContent)[];
    /** @type {boolean} */
    invalid: boolean;
    /** @type {Logger} */
    logger: Logger;
    /** @type {number} */
    maxAge: number;
    /**
     * Adds the provided identifier to the pack.
     * @param {string} identifier identifier
     */
    _addRequest(identifier: string): void;
    stopCapturingRequests(): void;
    /**
     * Returns cached content.
     * @param {string} identifier unique name for the resource
     * @param {string | null} etag etag of the resource
     * @returns {Data} cached content
     */
    get(identifier: string, etag: string | null): Data;
    /**
     * Updates value using the provided identifier.
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
     * Returns new location of data entries.
     * @returns {number} new location of data entries
     */
    _findLocation(): number;
    /**
     * Gc and update location.
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
     * Drops every content whose items all expired. Unlike a partial collection this
     * never unpacks, so it is not limited to a single content per store and lets a
     * long unused cache shrink in one go instead of one pack per build.
     */
    _gcExpiredContent(): void;
    /**
     * Find the content with the oldest item and run GC on that.
     * Only runs for one content to avoid large invalidation.
     */
    _gcOldestContent(): void;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize({ write, writeSeparate }: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext & { logger: Logger }} context context
     */
    deserialize({ read, logger }: ObjectDeserializerContext & {
        logger: Logger;
    }): void;
}
import type { Etag } from "./Cache";
import type { Data } from "./Cache";
type Items = Set<string>;
type BuildDependencies = Set<string>;
type ItemInfo = Map<string, PackItemInfo>;
type UnreferencedFile = {
    firstSeen: number;
    size: number;
};
type UnreferencedFiles = Map<string, UnreferencedFile>;
type Content = Map<string, Data>;
type LazyFunction = (() => Promise<PackContentItems> | PackContentItems) & Partial<{
    options: {
        size?: number;
    };
}>;
/** @typedef {(() => Promise<PackContentItems> | PackContentItems) & Partial<{ options: { size?: number } }>} LazyFunction */
declare class PackContent {
    /**
     * Creates an instance of PackContent.
     * @param {Items} items keys
     * @param {Items} usedItems used keys
     * @param {PackContentItems | (() => Promise<PackContentItems>)} dataOrFn sync or async content
     * @param {Logger=} logger logger for logging
     * @param {string=} lazyName name of dataOrFn for logging
     */
    constructor(items: Items, usedItems: Items, dataOrFn: PackContentItems | (() => Promise<PackContentItems>), logger?: Logger | undefined, lazyName?: string | undefined);
    /** @type {Items} */
    items: Items;
    /** @type {LazyFunction | undefined} */
    lazy: LazyFunction | undefined;
    /** @type {Content | undefined} */
    content: Content | undefined;
    /** @type {boolean} */
    outdated: boolean;
    /** @type {Items} */
    used: Items;
    /** @type {Logger | undefined} */
    logger: Logger | undefined;
    /** @type {string | undefined} */
    lazyName: string | undefined;
    /**
     * Returns result.
     * @param {string} identifier identifier
     * @returns {string | Promise<string>} result
     */
    get(identifier: string): string | Promise<string>;
    /**
     * Returns maybe a promise if lazy.
     * @param {string} reason explanation why unpack is necessary
     * @returns {void | Promise<void>} maybe a promise if lazy
     */
    unpack(reason: string): void | Promise<void>;
    /**
     * Returns the estimated size for the requested source type.
     * @returns {number} size of the content or -1 if not known
     */
    getSize(): number;
    /**
     * Processes the provided identifier.
     * @param {string} identifier identifier
     */
    delete(identifier: string): void;
    /**
     * Processes the provided write.
     * @param {(lazy: LazyFunction) => (() => PackContentItems | Promise<PackContentItems>)} write write function
     * @returns {void}
     */
    writeLazy(write: (lazy: LazyFunction) => (() => PackContentItems | Promise<PackContentItems>)): void;
}
declare class PackItemInfo {
    /**
     * Creates an instance of PackItemInfo.
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
     * Creates an instance of PackContentItems.
     * @param {Content} map items
     */
    constructor(map: Content);
    /** @type {Content} */
    map: Content;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext & { logger: Logger, profile: boolean | undefined }} context context
     */
    serialize({ write, snapshot, rollback, logger, profile }: ObjectSerializerContext & {
        logger: Logger;
        profile: boolean | undefined;
    }): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext & { logger: Logger, profile: boolean | undefined }} context context
     */
    deserialize({ read, logger, profile }: ObjectDeserializerContext & {
        logger: Logger;
        profile: boolean | undefined;
    }): void;
}
