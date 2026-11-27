export = HttpUriPlugin;
declare class HttpUriPlugin {
    /**
     * Creates an instance of HttpUriPlugin.
     * @param {HttpUriPluginOptions} options options
     */
    constructor(options: HttpUriPluginOptions);
    /** @type {HttpUriPluginOptions} */
    options: HttpUriPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace HttpUriPlugin {
    export { AbsolutePath, HttpUrl, HttpUriOptionsAllowedUrisItemBranch1, HttpUriOptionsAllowedUrisItemBranch2, HttpUriOptionsAllowedUrisItemBranch3, HttpUriOptionsAllowedUrisItem, HttpUriOptions, HttpUriOptionsAllowedUris, HttpUriPluginOptions, Fetch, EventsMap, InProgressWriteItem, LockfileEntry, FnWithoutKeyCallback, FnWithoutKey, FnWithKeyCallback, FnWithKey, LockfileCache, ResolveContentResult, FetchResultMeta, RedirectFetchResult, ContentFetchResult, FetchResult, AllowedUriFn };
}
import type Compiler from "../Compiler";
type AbsolutePath = string;
type HttpUrl = string;
/**
 * Allowed URI pattern.
 */
type HttpUriOptionsAllowedUrisItemBranch1 = RegExp;
/**
 * Allowed URI (resp. the beginning of it).
 */
type HttpUriOptionsAllowedUrisItemBranch2 = HttpUrl;
/**
 * Allowed URI filter function.
 */
type HttpUriOptionsAllowedUrisItemBranch3 = import("./HttpUriPlugin").AllowedUriFn;
/**
 * List of allowed URIs (resp. the beginning of them).
 */
type HttpUriOptionsAllowedUrisItem = HttpUriOptionsAllowedUrisItemBranch1 | HttpUriOptionsAllowedUrisItemBranch2 | HttpUriOptionsAllowedUrisItemBranch3;
/**
 * Options for building http resources.
 */
type HttpUriOptions = {
    allowedUris: HttpUriOptionsAllowedUris;
    /**
     * Location where resource content is stored for lockfile entries. It's also possible to disable storing by passing false.
     */
    cacheLocation?: (false | AbsolutePath) | undefined;
    /**
     * When set, anything that would lead to a modification of the lockfile or any resource content, will result in an error.
     */
    frozen?: boolean | undefined;
    /**
     * Location of the lockfile.
     */
    lockfileLocation?: AbsolutePath | undefined;
    /**
     * Proxy configuration, which can be used to specify a proxy server to use for HTTP requests.
     */
    proxy?: string | undefined;
    /**
     * When set, resources of existing lockfile entries will be fetched and entries will be upgraded when resource content has changed.
     */
    upgrade?: boolean | undefined;
};
/**
 * List of allowed URIs (resp. the beginning of them).
 */
type HttpUriOptionsAllowedUris = HttpUriOptionsAllowedUrisItem[];
type HttpUriPluginOptions = HttpUriOptions;
type Fetch = (url: URL, requestOptions: RequestOptions, callback: (incomingMessage: IncomingMessage) => void) => EventEmitter;
/**
 * Defines the events map type used by this module.
 */
type EventsMap = {
    error: [Error];
};
type InProgressWriteItem = () => void;
/**
 * Defines the lockfile entry type used by this module.
 */
type LockfileEntry = {
    resolved: string;
    integrity: string;
    contentType: string;
};
/**
 * Defines the fn without key callback type used by this module.
 */
type FnWithoutKeyCallback<R> = (err: Error | null, result?: R) => void;
/**
 * Defines the fn without key type used by this module.
 */
type FnWithoutKey<R> = (callback: FnWithoutKeyCallback<R>) => void;
/**
 * Defines the fn with key callback type used by this module.
 */
type FnWithKeyCallback<R> = (err: Error | null, result?: R) => void;
/**
 * Defines the fn with key type used by this module.
 */
type FnWithKey<T, R> = (item: T, callback: FnWithKeyCallback<R>) => void;
/**
 * Defines the lockfile cache type used by this module.
 */
type LockfileCache = {
    /**
     * lockfile
     */
    lockfile: Lockfile;
    /**
     * snapshot
     */
    snapshot: InstanceType<{
        new (): {
            _flags: number;
            _cachedFileIterable: Iterable<string> | undefined;
            _cachedContextIterable: Iterable<string> | undefined;
            _cachedMissingIterable: Iterable<string> | undefined;
            startTime: number | undefined;
            fileTimestamps: import("../fs/FileSystemInfo").FileTimestamps | undefined;
            fileHashes: import("../fs/FileSystemInfo").FileHashes | undefined;
            fileTshs: import("../fs/FileSystemInfo").FileTshs | undefined;
            contextTimestamps: import("../fs/FileSystemInfo").ContextTimestamps | undefined;
            contextHashes: import("../fs/FileSystemInfo").ContextHashes | undefined;
            contextTshs: import("../fs/FileSystemInfo").ContextTshs | undefined;
            missingExistence: import("../fs/FileSystemInfo").MissingExistence | undefined;
            managedItemInfo: import("../fs/FileSystemInfo").ManagedItemInfo | undefined;
            managedFiles: import("../fs/FileSystemInfo").ManagedFiles | undefined;
            managedContexts: import("../fs/FileSystemInfo").ManagedContexts | undefined;
            managedMissing: import("../fs/FileSystemInfo").ManagedMissing | undefined;
            children: import("../fs/FileSystemInfo").Children | undefined;
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
            serialize({ write }: import("../serialization/ObjectMiddleware").ObjectSerializerContext): void;
            deserialize({ read }: import("../serialization/ObjectMiddleware").ObjectDeserializerContext): void;
            _createIterable<T extends {
                keys(): IterableIterator<string>;
            } | undefined>(getMaps: import("../fs/FileSystemInfo").GetMapsFunction<T>): {
                snapshot: /*elided*/ any;
                getMaps: import("../fs/FileSystemInfo").GetMapsFunction<T>;
                [Symbol.iterator](): {
                    next: () => IteratorResult<string>;
                };
            };
            getFileIterable(): Iterable<string>;
            getContextIterable(): Iterable<string>;
            getMissingIterable(): Iterable<string>;
        };
    }>;
};
/**
 * Defines the resolve content result type used by this module.
 */
type ResolveContentResult = {
    /**
     * lockfile entry
     */
    entry: LockfileEntry;
    /**
     * content
     */
    content: Buffer;
    /**
     * need store lockfile
     */
    storeLock: boolean;
};
type FetchResultMeta = {
    storeCache: boolean;
    storeLock: boolean;
    validUntil: number;
    etag: string | undefined;
    fresh: boolean;
};
type RedirectFetchResult = FetchResultMeta & {
    location: string;
};
type ContentFetchResult = FetchResultMeta & {
    entry: LockfileEntry;
    content: Buffer;
};
type FetchResult = RedirectFetchResult | ContentFetchResult;
type AllowedUriFn = (uri: string) => boolean;
import type { RequestOptions } from "http";
import type { IncomingMessage } from "http";
import EventEmitter = require("node:events");
declare class Lockfile {
    /**
     * Parses the provided source and updates the parser state.
     * @param {string} content content of the lockfile
     * @returns {Lockfile} lockfile
     */
    static parse(content: string): Lockfile;
    /** @type {number} */
    version: number;
    /** @type {Map<string, LockfileEntry | "ignore" | "no-cache">} */
    entries: Map<string, LockfileEntry | "ignore" | "no-cache">;
    /**
     * Returns a string representation.
     * @returns {string} stringified lockfile
     */
    toString(): string;
}
