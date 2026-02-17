export = HttpUriPlugin;
declare class HttpUriPlugin {
    /**
     * @param {HttpUriPluginOptions} options options
     */
    constructor(options: HttpUriPluginOptions);
    _lockfileLocation: string;
    _cacheLocation: string | false;
    _upgrade: boolean;
    _frozen: boolean;
    _allowedUris: import("../../declarations/plugins/schemes/HttpUriPlugin").HttpUriOptionsAllowedUris;
    _proxy: string;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace HttpUriPlugin {
    export { IncomingMessage, OutgoingHttpHeaders, RequestOptions, Socket, Readable, HttpUriPluginOptions, Compiler, Snapshot, BuildInfo, ResourceDataWithData, IntermediateFileSystem, InProgressWriteItem, LockfileEntry, FnWithoutKeyCallback, FnWithoutKey, FnWithKeyCallback, FnWithKey, LockfileCache, ResolveContentResult, FetchResultMeta, RedirectFetchResult, ContentFetchResult, FetchResult };
}
type IncomingMessage = import("http").IncomingMessage;
type OutgoingHttpHeaders = import("http").OutgoingHttpHeaders;
type RequestOptions = import("http").RequestOptions;
type Socket = import("net").Socket;
type Readable = import("stream").Readable;
type HttpUriPluginOptions = import("../../declarations/plugins/schemes/HttpUriPlugin").HttpUriPluginOptions;
type Compiler = import("../Compiler");
type Snapshot = import("../FileSystemInfo").Snapshot;
type BuildInfo = import("../Module").BuildInfo;
type ResourceDataWithData = import("../NormalModuleFactory").ResourceDataWithData;
type IntermediateFileSystem = import("../util/fs").IntermediateFileSystem;
type InProgressWriteItem = () => void;
type LockfileEntry = {
    resolved: string;
    integrity: string;
    contentType: string;
};
type FnWithoutKeyCallback<R> = (err: Error | null, result?: R) => void;
type FnWithoutKey<R> = (callback: FnWithoutKeyCallback<R>) => void;
type FnWithKeyCallback<R> = (err: Error | null, result?: R) => void;
type FnWithKey<T, R> = (item: T, callback: FnWithKeyCallback<R>) => void;
type LockfileCache = {
    /**
     * lockfile
     */
    lockfile: Lockfile;
    /**
     * snapshot
     */
    snapshot: Snapshot;
};
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
declare class Lockfile {
    /**
     * @param {string} content content of the lockfile
     * @returns {Lockfile} lockfile
     */
    static parse(content: string): Lockfile;
    version: number;
    /** @type {Map<string, LockfileEntry | "ignore" | "no-cache">} */
    entries: Map<string, LockfileEntry | "ignore" | "no-cache">;
    /**
     * @returns {string} stringified lockfile
     */
    toString(): string;
}
