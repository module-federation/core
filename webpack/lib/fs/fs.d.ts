export type WatchOptions = import("../../declarations/WebpackOptions").WatchOptions;
/**
 * Defines the i stats base type used by this module.
 */
export type IStatsBase<T> = {
    isFile: () => boolean;
    isDirectory: () => boolean;
    isBlockDevice: () => boolean;
    isCharacterDevice: () => boolean;
    isSymbolicLink: () => boolean;
    isFIFO: () => boolean;
    isSocket: () => boolean;
    dev: T;
    ino: T;
    mode: T;
    nlink: T;
    uid: T;
    gid: T;
    rdev: T;
    size: T;
    blksize: T;
    blocks: T;
    atimeMs: T;
    mtimeMs: T;
    ctimeMs: T;
    birthtimeMs: T;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
};
/**
 * Defines the i stats type used by this module.
 */
export type IStats = IStatsBase<number>;
/**
 * Defines the i big int stats type used by this module.
 */
export type IBigIntStats = IStatsBase<bigint> & {
    atimeNs: bigint;
    mtimeNs: bigint;
    ctimeNs: bigint;
    birthtimeNs: bigint;
};
/**
 * Defines the dirent type used by this module.
 */
export type Dirent<T extends string | Buffer = string> = {
    /**
     * true when is file, otherwise false
     */
    isFile: () => boolean;
    /**
     * true when is directory, otherwise false
     */
    isDirectory: () => boolean;
    /**
     * true when is block device, otherwise false
     */
    isBlockDevice: () => boolean;
    /**
     * true when is character device, otherwise false
     */
    isCharacterDevice: () => boolean;
    /**
     * true when is symbolic link, otherwise false
     */
    isSymbolicLink: () => boolean;
    /**
     * true when is FIFO, otherwise false
     */
    isFIFO: () => boolean;
    /**
     * true when is socket, otherwise false
     */
    isSocket: () => boolean;
    /**
     * name
     */
    name: T;
    /**
     * path
     */
    parentPath: string;
    /**
     * path
     */
    path?: string | undefined;
};
export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type JsonObject = { [Key in string]?: JsonValue; };
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type NoParamCallback = (err: NodeJS.ErrnoException | null) => void;
export type StringCallback = (err: NodeJS.ErrnoException | null, result?: string) => void;
export type BufferCallback = (err: NodeJS.ErrnoException | null, result?: Buffer) => void;
export type StringOrBufferCallback = (err: NodeJS.ErrnoException | null, result?: string | Buffer) => void;
export type ReaddirStringCallback = (err: NodeJS.ErrnoException | null, result?: string[]) => void;
export type ReaddirBufferCallback = (err: NodeJS.ErrnoException | null, result?: Buffer[]) => void;
export type ReaddirStringOrBufferCallback = (err: NodeJS.ErrnoException | null, result?: string[] | Buffer[]) => void;
export type ReaddirDirentCallback = (err: NodeJS.ErrnoException | null, result?: Dirent[]) => void;
export type ReaddirDirentBufferCallback = (err: NodeJS.ErrnoException | null, result?: Dirent<Buffer>[]) => void;
export type StatsCallback = (err: NodeJS.ErrnoException | null, result?: IStats) => void;
export type BigIntStatsCallback = (err: NodeJS.ErrnoException | null, result?: IBigIntStats) => void;
export type StatsOrBigIntStatsCallback = (err: NodeJS.ErrnoException | null, result?: IStats | IBigIntStats) => void;
export type NumberCallback = (err: NodeJS.ErrnoException | null, result?: number) => void;
export type ReadJsonCallback = (err: NodeJS.ErrnoException | Error | null, result?: JsonObject) => void;
export type TimeInfoEntries = Map<string, Entry | OnlySafeTimeEntry | ExistenceOnlyTimeEntry | null | "ignore">;
export type Changes = Set<string>;
export type Removals = Set<string>;
/**
 * Defines the watcher info type used by this module.
 */
export type WatcherInfo = {
    /**
     * get current aggregated changes that have not yet send to callback
     */
    changes: Changes | null;
    /**
     * get current aggregated removals that have not yet send to callback
     */
    removals: Removals | null;
    /**
     * get info about files
     */
    fileTimeInfoEntries: TimeInfoEntries;
    /**
     * get info about directories
     */
    contextTimeInfoEntries: TimeInfoEntries;
};
/**
 * Defines the watcher type used by this module.
 */
export type Watcher = {
    /**
     * closes the watcher and all underlying file watchers
     */
    close: () => void;
    /**
     * closes the watcher, but keeps underlying file watchers alive until the next watch call
     */
    pause: () => void;
    /**
     * get current aggregated changes that have not yet send to callback
     */
    getAggregatedChanges?: (() => Changes | null) | undefined;
    /**
     * get current aggregated removals that have not yet send to callback
     */
    getAggregatedRemovals?: (() => Removals | null) | undefined;
    /**
     * get info about files
     */
    getFileTimeInfoEntries: () => TimeInfoEntries;
    /**
     * get info about directories
     */
    getContextTimeInfoEntries: () => TimeInfoEntries;
    /**
     * get info about timestamps and changes
     */
    getInfo?: (() => WatcherInfo) | undefined;
};
/**
 * Defines the watch method callback.
 */
export type WatchMethod = (files: Iterable<string>, directories: Iterable<string>, missing: Iterable<string>, startTime: number, options: WatchOptions, callback: (err: Error | null, timeInfoEntries1?: TimeInfoEntries, timeInfoEntries2?: TimeInfoEntries, changes?: Changes, removals?: Removals) => void, callbackUndelayed: (value: string, num: number) => void) => Watcher;
/**
 * Defines the path like type used by this module.
 */
export type PathLike = string | Buffer | URL;
/**
 * Defines the path or file descriptor type used by this module.
 */
export type PathOrFileDescriptor = PathLike | number;
/**
 * Defines the object encoding options type used by this module.
 */
export type ObjectEncodingOptions = {
    encoding?: (BufferEncoding | null | undefined) | undefined;
};
/**
 * Describes the read file shape.
 */
export type ReadFile = {
    (path: PathOrFileDescriptor, options: ({
        encoding?: null | undefined;
        flag?: string | undefined;
    } & import("events").Abortable) | undefined | null, callback: BufferCallback): void;
    (path: PathOrFileDescriptor, options: ({
        encoding: BufferEncoding;
        flag?: string | undefined;
    } & import("events").Abortable) | BufferEncoding, callback: StringCallback): void;
    (path: PathOrFileDescriptor, options: (ObjectEncodingOptions & {
        flag?: string | undefined;
    } & import("events").Abortable) | BufferEncoding | undefined | null, callback: StringOrBufferCallback): void;
    (path: PathOrFileDescriptor, callback: BufferCallback): void;
};
/**
 * Describes the read file sync shape.
 */
export type ReadFileSync = {
    (path: PathOrFileDescriptor, options?: {
        encoding?: null | undefined;
        flag?: string | undefined;
    } | null): Buffer;
    (path: PathOrFileDescriptor, options: {
        encoding: BufferEncoding;
        flag?: string | undefined;
    } | BufferEncoding): string;
    (path: PathOrFileDescriptor, options: ObjectEncodingOptions & {
        flag?: string | undefined;
    }): string | Buffer;
};
/**
 * Defines the encoding option type used by this module.
 */
export type EncodingOption = ObjectEncodingOptions | BufferEncoding | undefined | null;
/**
 * Defines the buffer encoding option type used by this module.
 */
export type BufferEncodingOption = "buffer" | {
    encoding: "buffer";
};
/**
 * Defines the stat options type used by this module.
 */
export type StatOptions = {
    bigint?: (boolean | undefined) | undefined;
};
/**
 * Defines the stat sync options type used by this module.
 */
export type StatSyncOptions = {
    bigint?: (boolean | undefined) | undefined;
    throwIfNoEntry?: (boolean | undefined) | undefined;
};
/**
 * Describes the readlink shape.
 */
export type Readlink = {
    (path: PathLike, options: EncodingOption, callback: StringCallback): void;
    (path: PathLike, options: BufferEncodingOption, callback: BufferCallback): void;
    (path: PathLike, options: EncodingOption, callback: StringOrBufferCallback): void;
    (path: PathLike, callback: StringCallback): void;
};
/**
 * Describes the readlink sync shape.
 */
export type ReadlinkSync = {
    (path: PathLike, options?: EncodingOption): string;
    (path: PathLike, options: BufferEncodingOption): Buffer;
    (path: PathLike, options?: EncodingOption): string | Buffer;
};
/**
 * Describes the readdir shape.
 */
export type Readdir = {
    (path: PathLike, options: {
        encoding: BufferEncoding | null;
        withFileTypes?: false | undefined;
        recursive?: boolean | undefined;
    } | BufferEncoding | undefined | null, callback: (err: NodeJS.ErrnoException | null, files?: string[]) => void): void;
    (path: PathLike, options: {
        encoding: "buffer";
        withFileTypes?: false | undefined;
        recursive?: boolean | undefined;
    } | "buffer", callback: (err: NodeJS.ErrnoException | null, files?: Buffer[]) => void): void;
    (path: PathLike, options: (ObjectEncodingOptions & {
        withFileTypes?: false | undefined;
        recursive?: boolean | undefined;
    }) | BufferEncoding | undefined | null, callback: (err: NodeJS.ErrnoException | null, files?: string[] | Buffer[]) => void): void;
    (path: PathLike, callback: (err: NodeJS.ErrnoException | null, files?: string[]) => void): void;
    (path: PathLike, options: ObjectEncodingOptions & {
        withFileTypes: true;
        recursive?: boolean | undefined;
    }, callback: (err: NodeJS.ErrnoException | null, files?: Dirent<string>[]) => void): void;
    (path: PathLike, options: {
        encoding: "buffer";
        withFileTypes: true;
        recursive?: boolean | undefined;
    }, callback: (err: NodeJS.ErrnoException | null, files: Dirent<Buffer>[]) => void): void;
};
/**
 * Describes the readdir sync shape.
 */
export type ReaddirSync = {
    (path: PathLike, options?: {
        encoding: BufferEncoding | null;
        withFileTypes?: false | undefined;
        recursive?: boolean | undefined;
    } | BufferEncoding | null): string[];
    (path: PathLike, options: {
        encoding: "buffer";
        withFileTypes?: false | undefined;
        recursive?: boolean | undefined;
    } | "buffer"): Buffer[];
    (path: PathLike, options?: (ObjectEncodingOptions & {
        withFileTypes?: false | undefined;
        recursive?: boolean | undefined;
    }) | BufferEncoding | null): string[] | Buffer[];
    (path: PathLike, options: ObjectEncodingOptions & {
        withFileTypes: true;
        recursive?: boolean | undefined;
    }): Dirent[];
    (path: PathLike, options: {
        encoding: "buffer";
        withFileTypes: true;
        recursive?: boolean | undefined;
    }): Dirent<Buffer>[];
};
/**
 * Describes the stat shape.
 */
export type Stat = {
    (path: PathLike, callback: StatsCallback): void;
    (path: PathLike, options: (StatOptions & {
        bigint?: false | undefined;
    }) | undefined, callback: StatsCallback): void;
    (path: PathLike, options: StatOptions & {
        bigint: true;
    }, callback: BigIntStatsCallback): void;
    (path: PathLike, options: StatOptions | undefined, callback: StatsOrBigIntStatsCallback): void;
};
/**
 * Describes the stat sync shape.
 */
export type StatSync = {
    (path: PathLike): IStats;
    (path: PathLike, options?: StatSyncOptions & {
        bigint?: false | undefined;
        throwIfNoEntry?: true | undefined;
    }): IStats;
    (path: PathLike, options: StatSyncOptions & {
        bigint: true;
        throwIfNoEntry?: true | undefined;
    }): IBigIntStats;
    (path: PathLike, options?: StatSyncOptions & {
        bigint?: false | undefined;
        throwIfNoEntry: false;
    }): IStats | undefined;
    (path: PathLike, options: StatSyncOptions & {
        bigint: true;
        throwIfNoEntry: false;
    }): IBigIntStats | undefined;
    (path: PathLike, options: StatSyncOptions & {
        bigint: boolean;
        throwIfNoEntry?: true | undefined;
    }): IStats | IBigIntStats;
    (path: PathLike, options?: StatSyncOptions): IStats | IBigIntStats | undefined;
};
/**
 * Describes the l stat shape.
 */
export type LStat = {
    (path: PathLike, callback: StatsCallback): void;
    (path: PathLike, options: (StatOptions & {
        bigint?: false | undefined;
    }) | undefined, callback: StatsCallback): void;
    (path: PathLike, options: StatOptions & {
        bigint: true;
    }, callback: BigIntStatsCallback): void;
    (path: PathLike, options: StatOptions | undefined, callback: StatsOrBigIntStatsCallback): void;
};
/**
 * Describes the l stat sync shape.
 */
export type LStatSync = {
    (path: PathLike): IStats;
    (path: PathLike, options?: StatSyncOptions & {
        bigint?: false | undefined;
        throwIfNoEntry?: true | undefined;
    }): IStats;
    (path: PathLike, options: StatSyncOptions & {
        bigint: true;
        throwIfNoEntry?: true | undefined;
    }): IBigIntStats;
    (path: PathLike, options?: StatSyncOptions & {
        bigint?: false | undefined;
        throwIfNoEntry: false;
    }): IStats | undefined;
    (path: PathLike, options: StatSyncOptions & {
        bigint: true;
        throwIfNoEntry: false;
    }): IBigIntStats | undefined;
    (path: PathLike, options: StatSyncOptions & {
        bigint: boolean;
        throwIfNoEntry?: true | undefined;
    }): IStats | IBigIntStats;
    (path: PathLike, options?: StatSyncOptions): IStats | IBigIntStats | undefined;
};
/**
 * Describes the real path shape.
 */
export type RealPath = {
    (path: PathLike, options: EncodingOption, callback: StringCallback): void;
    (path: PathLike, options: BufferEncodingOption, callback: BufferCallback): void;
    (path: PathLike, options: EncodingOption, callback: StringOrBufferCallback): void;
    (path: PathLike, callback: StringCallback): void;
};
/**
 * Describes the real path sync shape.
 */
export type RealPathSync = {
    (path: PathLike, options?: EncodingOption): string;
    (path: PathLike, options: BufferEncodingOption): Buffer;
    (path: PathLike, options?: EncodingOption): string | Buffer;
};
/**
 * Defines the read json type used by this module.
 */
export type ReadJson = (pathOrFileDescriptor: PathOrFileDescriptor, callback: ReadJsonCallback) => void;
/**
 * Defines the read json sync type used by this module.
 */
export type ReadJsonSync = (pathOrFileDescriptor: PathOrFileDescriptor) => JsonObject;
/**
 * Defines the purge type used by this module.
 *
 * `options.exact` (supported by enhanced-resolve's `CachedInputFileSystem`
 * from v5.22.0): when true, only entries whose key exactly matches `value`
 * are invalidated; cached entries for descendants are preserved. Default
 * is false (legacy prefix-match behavior).
 */
export type Purge = (value?: string | string[] | Set<string>, options?: {
    exact?: boolean;
}) => void;
/**
 * Defines the input file system type used by this module.
 */
export type InputFileSystem = {
    readFile: ReadFile;
    readFileSync?: ReadFileSync | undefined;
    readlink: Readlink;
    readlinkSync?: ReadlinkSync | undefined;
    readdir: Readdir;
    readdirSync?: ReaddirSync | undefined;
    stat: Stat;
    statSync?: StatSync | undefined;
    lstat?: LStat | undefined;
    lstatSync?: LStatSync | undefined;
    realpath?: RealPath | undefined;
    realpathSync?: RealPathSync | undefined;
    readJson?: ReadJson | undefined;
    readJsonSync?: ReadJsonSync | undefined;
    purge?: Purge | undefined;
    join?: ((path1: string, path2: string) => string) | undefined;
    relative?: ((from: string, to: string) => string) | undefined;
    dirname?: ((dirname: string) => string) | undefined;
};
/**
 * Defines the mode type used by this module.
 */
export type Mode = number | string;
/**
 * Defines the write file options type used by this module.
 */
export type WriteFileOptions = (ObjectEncodingOptions & import("events").Abortable & {
    mode?: Mode | undefined;
    flag?: string | undefined;
    flush?: boolean | undefined;
}) | BufferEncoding | null;
/**
 * Describes the write file shape.
 */
export type WriteFile = {
    (file: PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, options: WriteFileOptions, callback: NoParamCallback): void;
    (file: PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, callback: NoParamCallback): void;
};
/**
 * Defines the make directory options type used by this module.
 */
export type MakeDirectoryOptions = {
    recursive?: boolean | undefined;
    mode?: Mode | undefined;
};
/**
 * Describes the mkdir shape.
 */
export type Mkdir = {
    (file: PathLike, options: MakeDirectoryOptions & {
        recursive: true;
    }, callback: StringCallback): void;
    (file: PathLike, options: Mode | (MakeDirectoryOptions & {
        recursive?: false | undefined;
    }) | null | undefined, callback: NoParamCallback): void;
    (file: PathLike, options: Mode | MakeDirectoryOptions | null | undefined, callback: StringCallback): void;
    (file: PathLike, callback: NoParamCallback): void;
};
/**
 * Defines the rmdir type used by this module.
 */
export type Rmdir = {
    (file: PathLike, callback: NoParamCallback): void;
};
/**
 * Defines the unlink type used by this module.
 */
export type Unlink = (pathLike: PathLike, callback: NoParamCallback) => void;
export type NodeReadStreamFSImplementation = NonNullable<Exclude<Parameters<typeof import("fs").createReadStream>[1], BufferEncoding | undefined>["fs"]>;
/**
 * Defines the create read stream fs implementation type used by this module.
 */
export type CreateReadStreamFSImplementation = {
    open?: NodeReadStreamFSImplementation["open"] | undefined;
    close?: NodeReadStreamFSImplementation["close"] | undefined;
    read: NodeReadStreamFSImplementation["read"];
};
/**
 * Defines the read stream options type used by this module.
 */
export type ReadStreamOptions = StreamOptions & {
    fs?: CreateReadStreamFSImplementation | null | undefined;
    end?: number | undefined;
};
/**
 * Defines the create read stream type used by this module.
 */
export type CreateReadStream = (path: PathLike, options?: BufferEncoding | ReadStreamOptions) => NodeJS.ReadableStream;
/**
 * Defines the symlink type used by this module.
 */
export type Symlink = (target: PathLike, path: PathLike, type: "dir" | "file" | "junction" | null | undefined, callback: NoParamCallback) => void;
/**
 * Defines the chmod type used by this module.
 */
export type Chmod = (path: PathLike, mode: number | string, callback: NoParamCallback) => void;
/**
 * Defines the utimes type used by this module.
 */
export type Utimes = (path: PathLike, atime: number | string | Date, mtime: number | string | Date, callback: NoParamCallback) => void;
/**
 * Defines the output file system type used by this module.
 */
export type OutputFileSystem = {
    mkdir: Mkdir;
    readdir?: Readdir | undefined;
    rmdir?: Rmdir | undefined;
    writeFile: WriteFile;
    unlink?: Unlink | undefined;
    symlink?: Symlink | undefined;
    readlink?: Readlink | undefined;
    chmod?: Chmod | undefined;
    utimes?: Utimes | undefined;
    stat: Stat;
    lstat?: LStat | undefined;
    readFile: ReadFile;
    createReadStream?: CreateReadStream | undefined;
    join?: ((path1: string, path2: string) => string) | undefined;
    relative?: ((from: string, to: string) => string) | undefined;
    dirname?: ((dirname: string) => string) | undefined;
};
/**
 * Defines the watch file system type used by this module.
 */
export type WatchFileSystem = {
    watch: WatchMethod;
};
/**
 * Describes the mkdir sync shape.
 */
export type MkdirSync = {
    (path: PathLike, options: MakeDirectoryOptions & {
        recursive: true;
    }): string | undefined;
    (path: PathLike, options?: Mode | (MakeDirectoryOptions & {
        recursive?: false | undefined;
    }) | null): void;
    (path: PathLike, options?: Mode | MakeDirectoryOptions | null): string | undefined;
};
/**
 * Defines the stream options type used by this module.
 */
export type StreamOptions = {
    flags?: (string | undefined) | undefined;
    encoding: (BufferEncoding | undefined);
    fd?: (number | import("fs").promises.FileHandle | undefined) | undefined;
    mode?: (number | undefined) | undefined;
    autoClose?: (boolean | undefined) | undefined;
    emitClose?: (boolean | undefined) | undefined;
    start?: (number | undefined) | undefined;
    signal?: (AbortSignal | null | undefined) | undefined;
};
/**
 * Defines the fs implementation type used by this module.
 */
export type FSImplementation = import("fs").FSImplementation;
export type NodeWriteStreamFSImplementation = NonNullable<Exclude<Parameters<typeof import("fs").createWriteStream>[1], BufferEncoding | undefined>["fs"]>;
/**
 * Defines the create write stream fs implementation type used by this module.
 */
export type CreateWriteStreamFSImplementation = {
    open?: NodeWriteStreamFSImplementation["open"] | undefined;
    close?: NodeWriteStreamFSImplementation["close"] | undefined;
    write: NodeWriteStreamFSImplementation["write"];
    writev?: NodeWriteStreamFSImplementation["writev"] | undefined;
};
/**
 * Defines the write stream options type used by this module.
 */
export type WriteStreamOptions = StreamOptions & {
    fs?: CreateWriteStreamFSImplementation | null | undefined;
    flush?: boolean | undefined;
};
/**
 * Defines the create write stream type used by this module.
 */
export type CreateWriteStream = (pathLike: PathLike, result?: BufferEncoding | WriteStreamOptions) => NodeJS.WritableStream;
/**
 * Defines the open mode type used by this module.
 */
export type OpenMode = number | string;
/**
 * Describes the open shape.
 */
export type Open = {
    (file: PathLike, flags: OpenMode | undefined, mode: Mode | undefined | null, callback: NumberCallback): void;
    (file: PathLike, flags: OpenMode | undefined, callback: NumberCallback): void;
    (file: PathLike, callback: NumberCallback): void;
};
/**
 * Defines the read position type used by this module.
 */
export type ReadPosition = number | bigint;
/**
 * Defines the read sync options type used by this module.
 */
export type ReadSyncOptions = {
    offset?: (number | undefined) | undefined;
    length?: (number | undefined) | undefined;
    position?: (ReadPosition | null | undefined) | undefined;
};
/**
 * Defines the read async options type used by this module.
 */
export type ReadAsyncOptions<TBuffer extends NodeJS.ArrayBufferView> = {
    offset?: (number | undefined) | undefined;
    length?: (number | undefined) | undefined;
    position?: (ReadPosition | null | undefined) | undefined;
    buffer?: TBuffer | undefined;
};
/**
 * Defines the shared type used by this module.
 */
export type Read<TBuffer extends NodeJS.ArrayBufferView = NodeJS.ArrayBufferView<ArrayBufferLike>> = {
    (fd: number, buffer: TBuffer, offset: number, length: number, position: ReadPosition | null, callback: (err: NodeJS.ErrnoException | null, bytesRead: number, buffer: TBuffer) => void): void;
    (fd: number, options: ReadAsyncOptions<TBuffer>, callback: (err: NodeJS.ErrnoException | null, bytesRead: number, buffer: TBuffer) => void): void;
    (fd: number, callback: (err: NodeJS.ErrnoException | null, bytesRead: number, buffer: NodeJS.ArrayBufferView) => void): void;
};
export type Close = (df: number, callback: NoParamCallback) => void;
export type Rename = (a: PathLike, b: PathLike, callback: NoParamCallback) => void;
/**
 * Defines the intermediate file system extras type used by this module.
 */
export type IntermediateFileSystemExtras = {
    mkdirSync: MkdirSync;
    createWriteStream: CreateWriteStream;
    open: Open;
    read: Read;
    close: Close;
    rename: Rename;
};
export type IntermediateFileSystem = InputFileSystem & OutputFileSystem & IntermediateFileSystemExtras;
/**
 * What of a file's mode is its permissions — the type bits above them are not
 * settable, and the set-user-id and sticky bits are not carried over a copy.
 */
export const PERMISSIONS_MASK: 511;
/**
 * Returns the parent directory of the absolute path.
 * @param {InputFileSystem | OutputFileSystem | undefined} fs a file system
 * @param {string} absPath an absolute path
 * @returns {string} the parent directory of the absolute path
 */
export function dirname(fs: InputFileSystem | OutputFileSystem | undefined, absPath: string): string;
/**
 * Checks whether this object is absolute.
 * @param {string} pathname a path
 * @returns {boolean} is absolute
 */
export function isAbsolute(pathname: string): boolean;
/**
 * Returns the joined path.
 * @param {InputFileSystem | OutputFileSystem | undefined} fs a file system
 * @param {string} rootPath a path
 * @param {string} filename a filename
 * @returns {string} the joined path
 */
export function join(fs: InputFileSystem | OutputFileSystem | undefined, rootPath: string, filename: string): string;
/**
 * Lstat readlink absolute.
 * @param {InputFileSystem} fs a file system
 * @param {string} p an absolute path
 * @param {(err: NodeJS.ErrnoException | Error | null, stats?: IStats | string) => void} callback callback
 * @returns {void}
 */
export function lstatReadlinkAbsolute(fs: InputFileSystem, p: string, callback: (err: NodeJS.ErrnoException | Error | null, stats?: IStats | string) => void): void;
/**
 * Processes the provided f.
 * @param {OutputFileSystem} fs a file system
 * @param {string} p an absolute path
 * @param {(err?: Error) => void} callback callback function for the error
 * @returns {void}
 */
export function mkdirp(fs: OutputFileSystem, p: string, callback: (err?: Error) => void): void;
/**
 * Processes the provided f.
 * @param {IntermediateFileSystem} fs a file system
 * @param {string} p an absolute path
 * @returns {void}
 */
export function mkdirpSync(fs: IntermediateFileSystem, p: string): void;
/**
 * Processes the provided f.
 * @param {InputFileSystem} fs a file system
 * @param {string} p an absolute path
 * @param {ReadJsonCallback} callback callback
 * @returns {void}
 */
export function readJson(fs: InputFileSystem, p: string, callback: ReadJsonCallback): void;
/** @typedef {import("../../declarations/WebpackOptions").WatchOptions} WatchOptions */
/**
 * @import {
 * 	Entry,
 * 	OnlySafeTimeEntry,
 * 	ExistenceOnlyTimeEntry
 * } from "watchpack"
 */
/**
 * Defines the i stats base type used by this module.
 * @template T
 * @typedef {object} IStatsBase
 * @property {() => boolean} isFile
 * @property {() => boolean} isDirectory
 * @property {() => boolean} isBlockDevice
 * @property {() => boolean} isCharacterDevice
 * @property {() => boolean} isSymbolicLink
 * @property {() => boolean} isFIFO
 * @property {() => boolean} isSocket
 * @property {T} dev
 * @property {T} ino
 * @property {T} mode
 * @property {T} nlink
 * @property {T} uid
 * @property {T} gid
 * @property {T} rdev
 * @property {T} size
 * @property {T} blksize
 * @property {T} blocks
 * @property {T} atimeMs
 * @property {T} mtimeMs
 * @property {T} ctimeMs
 * @property {T} birthtimeMs
 * @property {Date} atime
 * @property {Date} mtime
 * @property {Date} ctime
 * @property {Date} birthtime
 */
/**
 * Defines the i stats type used by this module.
 * @typedef {IStatsBase<number>} IStats
 */
/**
 * Defines the i big int stats type used by this module.
 * @typedef {IStatsBase<bigint> & { atimeNs: bigint, mtimeNs: bigint, ctimeNs: bigint, birthtimeNs: bigint }} IBigIntStats
 */
/**
 * Defines the dirent type used by this module.
 * @template {string | Buffer} [T=string]
 * @typedef {object} Dirent
 * @property {() => boolean} isFile true when is file, otherwise false
 * @property {() => boolean} isDirectory true when is directory, otherwise false
 * @property {() => boolean} isBlockDevice true when is block device, otherwise false
 * @property {() => boolean} isCharacterDevice true when is character device, otherwise false
 * @property {() => boolean} isSymbolicLink true when is symbolic link, otherwise false
 * @property {() => boolean} isFIFO true when is FIFO, otherwise false
 * @property {() => boolean} isSocket true when is socket, otherwise false
 * @property {T} name name
 * @property {string} parentPath path
 * @property {string=} path path
 */
/** @typedef {string | number | boolean | null} JsonPrimitive */
/** @typedef {JsonValue[]} JsonArray */
/** @typedef {{ [Key in string]?: JsonValue }} JsonObject */
/** @typedef {JsonPrimitive | JsonObject | JsonArray} JsonValue */
/** @typedef {(err: NodeJS.ErrnoException | null) => void} NoParamCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: string) => void} StringCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: Buffer) => void} BufferCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: string | Buffer) => void} StringOrBufferCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: string[]) => void} ReaddirStringCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: Buffer[]) => void} ReaddirBufferCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: string[] | Buffer[]) => void} ReaddirStringOrBufferCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: Dirent[]) => void} ReaddirDirentCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: Dirent<Buffer>[]) => void} ReaddirDirentBufferCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: IStats) => void} StatsCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: IBigIntStats) => void} BigIntStatsCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: IStats | IBigIntStats) => void} StatsOrBigIntStatsCallback */
/** @typedef {(err: NodeJS.ErrnoException | null, result?: number) => void} NumberCallback */
/** @typedef {(err: NodeJS.ErrnoException | Error | null, result?: JsonObject) => void} ReadJsonCallback */
/** @typedef {Map<string, Entry | OnlySafeTimeEntry | ExistenceOnlyTimeEntry | null | "ignore">} TimeInfoEntries */
/** @typedef {Set<string>} Changes */
/** @typedef {Set<string>} Removals */
/**
 * Defines the watcher info type used by this module.
 * @typedef {object} WatcherInfo
 * @property {Changes | null} changes get current aggregated changes that have not yet send to callback
 * @property {Removals | null} removals get current aggregated removals that have not yet send to callback
 * @property {TimeInfoEntries} fileTimeInfoEntries get info about files
 * @property {TimeInfoEntries} contextTimeInfoEntries get info about directories
 */
/**
 * Defines the watcher type used by this module.
 * @typedef {object} Watcher
 * @property {() => void} close closes the watcher and all underlying file watchers
 * @property {() => void} pause closes the watcher, but keeps underlying file watchers alive until the next watch call
 * @property {(() => Changes | null)=} getAggregatedChanges get current aggregated changes that have not yet send to callback
 * @property {(() => Removals | null)=} getAggregatedRemovals get current aggregated removals that have not yet send to callback
 * @property {() => TimeInfoEntries} getFileTimeInfoEntries get info about files
 * @property {() => TimeInfoEntries} getContextTimeInfoEntries get info about directories
 * @property {() => WatcherInfo=} getInfo get info about timestamps and changes
 */
/**
 * Defines the watch method callback.
 * @callback WatchMethod
 * @param {Iterable<string>} files watched files
 * @param {Iterable<string>} directories watched directories
 * @param {Iterable<string>} missing watched existence entries
 * @param {number} startTime timestamp of start time
 * @param {WatchOptions} options options object
 * @param {(err: Error | null, timeInfoEntries1?: TimeInfoEntries, timeInfoEntries2?: TimeInfoEntries, changes?: Changes, removals?: Removals) => void} callback aggregated callback
 * @param {(value: string, num: number) => void} callbackUndelayed callback when the first change was detected
 * @returns {Watcher} a watcher
 */
/**
 * Defines the path like type used by this module.
 * @typedef {string | Buffer | URL} PathLike
 */
/**
 * Defines the path or file descriptor type used by this module.
 * @typedef {PathLike | number} PathOrFileDescriptor
 */
/**
 * Defines the object encoding options type used by this module.
 * @typedef {object} ObjectEncodingOptions
 * @property {BufferEncoding | null | undefined=} encoding
 */
/**
 * Describes the read file shape.
 * @typedef {{
 * (path: PathOrFileDescriptor, options: ({ encoding?: null | undefined, flag?: string | undefined } & import("events").Abortable) | undefined | null, callback: BufferCallback): void,
 * (path: PathOrFileDescriptor, options: ({ encoding: BufferEncoding, flag?: string | undefined } & import("events").Abortable) | BufferEncoding, callback: StringCallback): void,
 * (path: PathOrFileDescriptor, options: (ObjectEncodingOptions & { flag?: string | undefined } & import("events").Abortable) | BufferEncoding | undefined | null, callback: StringOrBufferCallback): void,
 * (path: PathOrFileDescriptor, callback: BufferCallback): void,
 * }} ReadFile
 */
/**
 * Describes the read file sync shape.
 * @typedef {{
 * (path: PathOrFileDescriptor, options?: { encoding?: null | undefined, flag?: string | undefined } | null): Buffer,
 * (path: PathOrFileDescriptor, options: { encoding: BufferEncoding, flag?: string | undefined } | BufferEncoding): string,
 * (path: PathOrFileDescriptor, options: ObjectEncodingOptions & { flag?: string | undefined }): string | Buffer,
 * }} ReadFileSync
 */
/**
 * Defines the encoding option type used by this module.
 * @typedef {ObjectEncodingOptions | BufferEncoding | undefined | null} EncodingOption
 */
/**
 * Defines the buffer encoding option type used by this module.
 * @typedef {"buffer" | { encoding: "buffer" }} BufferEncodingOption
 */
/**
 * Defines the stat options type used by this module.
 * @typedef {object} StatOptions
 * @property {(boolean | undefined)=} bigint
 */
/**
 * Defines the stat sync options type used by this module.
 * @typedef {object} StatSyncOptions
 * @property {(boolean | undefined)=} bigint
 * @property {(boolean | undefined)=} throwIfNoEntry
 */
/**
 * Describes the readlink shape.
 * @typedef {{
 * (path: PathLike, options: EncodingOption, callback: StringCallback): void,
 * (path: PathLike, options: BufferEncodingOption, callback: BufferCallback): void,
 * (path: PathLike, options: EncodingOption, callback: StringOrBufferCallback): void,
 * (path: PathLike, callback: StringCallback): void,
 * }} Readlink
 */
/**
 * Describes the readlink sync shape.
 * @typedef {{
 * (path: PathLike, options?: EncodingOption): string,
 * (path: PathLike, options: BufferEncodingOption): Buffer,
 * (path: PathLike, options?: EncodingOption): string | Buffer,
 * }} ReadlinkSync
 */
/**
 * Describes the readdir shape.
 * @typedef {{
 * (path: PathLike, options: { encoding: BufferEncoding | null, withFileTypes?: false | undefined, recursive?: boolean | undefined } | BufferEncoding | undefined | null, callback: (err: NodeJS.ErrnoException | null, files?: string[]) => void): void,
 * (path: PathLike, options: { encoding: "buffer", withFileTypes?: false | undefined, recursive?: boolean | undefined } | "buffer", callback: (err: NodeJS.ErrnoException | null, files?: Buffer[]) => void): void,
 * (path: PathLike, options: (ObjectEncodingOptions & { withFileTypes?: false | undefined, recursive?: boolean | undefined }) | BufferEncoding | undefined | null, callback: (err: NodeJS.ErrnoException | null, files?: string[] | Buffer[]) => void): void,
 * (path: PathLike, callback: (err: NodeJS.ErrnoException | null, files?: string[]) => void): void,
 * (path: PathLike, options: ObjectEncodingOptions & { withFileTypes: true, recursive?: boolean | undefined }, callback: (err: NodeJS.ErrnoException | null, files?: Dirent<string>[]) => void): void,
 * (path: PathLike, options: { encoding: "buffer", withFileTypes: true, recursive?: boolean | undefined }, callback: (err: NodeJS.ErrnoException | null, files: Dirent<Buffer>[]) => void): void,
 * }} Readdir
 */
/**
 * Describes the readdir sync shape.
 * @typedef {{
 * (path: PathLike, options?: { encoding: BufferEncoding | null, withFileTypes?: false | undefined, recursive?: boolean | undefined } | BufferEncoding | null): string[],
 * (path: PathLike, options: { encoding: "buffer", withFileTypes?: false | undefined, recursive?: boolean | undefined } | "buffer"): Buffer[],
 * (path: PathLike, options?: (ObjectEncodingOptions & { withFileTypes?: false | undefined, recursive?: boolean | undefined }) | BufferEncoding | null): string[] | Buffer[],
 * (path: PathLike, options: ObjectEncodingOptions & { withFileTypes: true, recursive?: boolean | undefined }): Dirent[],
 * (path: PathLike, options: { encoding: "buffer", withFileTypes: true, recursive?: boolean | undefined }): Dirent<Buffer>[],
 * }} ReaddirSync
 */
/**
 * Describes the stat shape.
 * @typedef {{
 * (path: PathLike, callback: StatsCallback): void,
 * (path: PathLike, options: (StatOptions & { bigint?: false | undefined }) | undefined, callback: StatsCallback): void,
 * (path: PathLike, options: StatOptions & { bigint: true }, callback: BigIntStatsCallback): void,
 * (path: PathLike, options: StatOptions | undefined, callback: StatsOrBigIntStatsCallback): void,
 * }} Stat
 */
/**
 * Describes the stat sync shape.
 * @typedef {{
 * (path: PathLike): IStats,
 * (path: PathLike, options?: StatSyncOptions & { bigint?: false | undefined, throwIfNoEntry?: true | undefined }): IStats,
 * (path: PathLike, options: StatSyncOptions & { bigint: true, throwIfNoEntry?: true | undefined }): IBigIntStats,
 * (path: PathLike, options?: StatSyncOptions & { bigint?: false | undefined, throwIfNoEntry: false }): IStats | undefined,
 * (path: PathLike, options: StatSyncOptions & { bigint: true, throwIfNoEntry: false }): IBigIntStats | undefined,
 * (path: PathLike, options: StatSyncOptions & { bigint: boolean, throwIfNoEntry?: true | undefined }): IStats | IBigIntStats,
 * (path: PathLike, options?: StatSyncOptions): IStats | IBigIntStats | undefined,
 * }} StatSync
 */
/**
 * Describes the l stat shape.
 * @typedef {{
 * (path: PathLike, callback: StatsCallback): void,
 * (path: PathLike, options: (StatOptions & { bigint?: false | undefined }) | undefined, callback: StatsCallback): void,
 * (path: PathLike, options: StatOptions & { bigint: true }, callback: BigIntStatsCallback): void,
 * (path: PathLike, options: StatOptions | undefined, callback: StatsOrBigIntStatsCallback): void,
 * }} LStat
 */
/**
 * Describes the l stat sync shape.
 * @typedef {{
 * (path: PathLike): IStats,
 * (path: PathLike, options?: StatSyncOptions & { bigint?: false | undefined, throwIfNoEntry?: true | undefined }): IStats,
 * (path: PathLike, options: StatSyncOptions & { bigint: true, throwIfNoEntry?: true | undefined }): IBigIntStats,
 * (path: PathLike, options?: StatSyncOptions & { bigint?: false | undefined, throwIfNoEntry: false }): IStats | undefined,
 * (path: PathLike, options: StatSyncOptions & { bigint: true, throwIfNoEntry: false }): IBigIntStats | undefined,
 * (path: PathLike, options: StatSyncOptions & { bigint: boolean, throwIfNoEntry?: true | undefined }): IStats | IBigIntStats,
 * (path: PathLike, options?: StatSyncOptions): IStats | IBigIntStats | undefined,
 * }} LStatSync
 */
/**
 * Describes the real path shape.
 * @typedef {{
 * (path: PathLike, options: EncodingOption, callback: StringCallback): void,
 * (path: PathLike, options: BufferEncodingOption, callback: BufferCallback): void,
 * (path: PathLike, options: EncodingOption, callback: StringOrBufferCallback): void,
 * (path: PathLike, callback: StringCallback): void,
 * }} RealPath
 */
/**
 * Describes the real path sync shape.
 * @typedef {{
 * (path: PathLike, options?: EncodingOption): string,
 * (path: PathLike, options: BufferEncodingOption): Buffer,
 * (path: PathLike, options?: EncodingOption): string | Buffer,
 * }} RealPathSync
 */
/**
 * Defines the read json type used by this module.
 * @typedef {(pathOrFileDescriptor: PathOrFileDescriptor, callback: ReadJsonCallback) => void} ReadJson
 */
/**
 * Defines the read json sync type used by this module.
 * @typedef {(pathOrFileDescriptor: PathOrFileDescriptor) => JsonObject} ReadJsonSync
 */
/**
 * Defines the purge type used by this module.
 *
 * `options.exact` (supported by enhanced-resolve's `CachedInputFileSystem`
 * from v5.22.0): when true, only entries whose key exactly matches `value`
 * are invalidated; cached entries for descendants are preserved. Default
 * is false (legacy prefix-match behavior).
 * @typedef {(value?: string | string[] | Set<string>, options?: { exact?: boolean }) => void} Purge
 */
/**
 * Defines the input file system type used by this module.
 * @typedef {object} InputFileSystem
 * @property {ReadFile} readFile
 * @property {ReadFileSync=} readFileSync
 * @property {Readlink} readlink
 * @property {ReadlinkSync=} readlinkSync
 * @property {Readdir} readdir
 * @property {ReaddirSync=} readdirSync
 * @property {Stat} stat
 * @property {StatSync=} statSync
 * @property {LStat=} lstat
 * @property {LStatSync=} lstatSync
 * @property {RealPath=} realpath
 * @property {RealPathSync=} realpathSync
 * @property {ReadJson=} readJson
 * @property {ReadJsonSync=} readJsonSync
 * @property {Purge=} purge
 * @property {((path1: string, path2: string) => string)=} join
 * @property {((from: string, to: string) => string)=} relative
 * @property {((dirname: string) => string)=} dirname
 */
/**
 * Defines the mode type used by this module.
 * @typedef {number | string} Mode
 */
/**
 * Defines the write file options type used by this module.
 * @typedef {(ObjectEncodingOptions & import("events").Abortable & { mode?: Mode | undefined, flag?: string | undefined, flush?: boolean | undefined }) | BufferEncoding | null} WriteFileOptions
 */
/**
 * Describes the write file shape.
 * @typedef {{
 * (file: PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, options: WriteFileOptions, callback: NoParamCallback): void,
 * (file: PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, callback: NoParamCallback): void,
 * }} WriteFile
 */
/**
 * Defines the make directory options type used by this module.
 * @typedef {{ recursive?: boolean | undefined, mode?: Mode | undefined }} MakeDirectoryOptions
 */
/**
 * Describes the mkdir shape.
 * @typedef {{
 * (file: PathLike, options: MakeDirectoryOptions & { recursive: true }, callback: StringCallback): void,
 * (file: PathLike, options: Mode | (MakeDirectoryOptions & { recursive?: false | undefined }) | null | undefined, callback: NoParamCallback): void,
 * (file: PathLike, options: Mode | MakeDirectoryOptions | null | undefined, callback: StringCallback): void,
 * (file: PathLike, callback: NoParamCallback): void,
 * }} Mkdir
 */
/**
 * Defines the rmdir type used by this module.
 * @typedef {{ (file: PathLike, callback: NoParamCallback): void }} Rmdir
 */
/**
 * Defines the unlink type used by this module.
 * @typedef {(pathLike: PathLike, callback: NoParamCallback) => void} Unlink
 */
/**
 * @typedef {NonNullable<Exclude<Parameters<typeof import("fs").createReadStream>[1], BufferEncoding | undefined>["fs"]>} NodeReadStreamFSImplementation
 */
/**
 * Defines the create read stream fs implementation type used by this module.
 * @typedef {object} CreateReadStreamFSImplementation
 * @property {NodeReadStreamFSImplementation["open"]=} open
 * @property {NodeReadStreamFSImplementation["close"]=} close
 * @property {NodeReadStreamFSImplementation["read"]} read
 */
/**
 * Defines the read stream options type used by this module.
 * @typedef {StreamOptions & { fs?: CreateReadStreamFSImplementation | null | undefined, end?: number | undefined }} ReadStreamOptions
 */
/**
 * Defines the create read stream type used by this module.
 * @typedef {(path: PathLike, options?: BufferEncoding | ReadStreamOptions) => NodeJS.ReadableStream} CreateReadStream
 */
/**
 * Defines the symlink type used by this module.
 * @typedef {(target: PathLike, path: PathLike, type: "dir" | "file" | "junction" | null | undefined, callback: NoParamCallback) => void} Symlink
 */
/**
 * Defines the chmod type used by this module.
 * @typedef {(path: PathLike, mode: number | string, callback: NoParamCallback) => void} Chmod
 */
/**
 * Defines the utimes type used by this module.
 * @typedef {(path: PathLike, atime: number | string | Date, mtime: number | string | Date, callback: NoParamCallback) => void} Utimes
 */
/**
 * Defines the output file system type used by this module.
 * @typedef {object} OutputFileSystem
 * @property {Mkdir} mkdir
 * @property {Readdir=} readdir
 * @property {Rmdir=} rmdir
 * @property {WriteFile} writeFile
 * @property {Unlink=} unlink
 * @property {Symlink=} symlink
 * @property {Readlink=} readlink
 * @property {Chmod=} chmod
 * @property {Utimes=} utimes
 * @property {Stat} stat
 * @property {LStat=} lstat
 * @property {ReadFile} readFile
 * @property {CreateReadStream=} createReadStream
 * @property {((path1: string, path2: string) => string)=} join
 * @property {((from: string, to: string) => string)=} relative
 * @property {((dirname: string) => string)=} dirname
 */
/**
 * Defines the watch file system type used by this module.
 * @typedef {object} WatchFileSystem
 * @property {WatchMethod} watch
 */
/**
 * Describes the mkdir sync shape.
 * @typedef {{
 * (path: PathLike, options: MakeDirectoryOptions & { recursive: true }): string | undefined,
 * (path: PathLike, options?: Mode | (MakeDirectoryOptions & { recursive?: false | undefined }) | null): void,
 * (path: PathLike, options?: Mode | MakeDirectoryOptions | null): string | undefined,
 * }} MkdirSync
 */
/**
 * Defines the stream options type used by this module.
 * @typedef {object} StreamOptions
 * @property {(string | undefined)=} flags
 * @property {(BufferEncoding | undefined)} encoding
 * @property {(number | import("fs").promises.FileHandle | undefined)=} fd
 * @property {(number | undefined)=} mode
 * @property {(boolean | undefined)=} autoClose
 * @property {(boolean | undefined)=} emitClose
 * @property {(number | undefined)=} start
 * @property {(AbortSignal | null | undefined)=} signal
 */
/**
 * Defines the fs implementation type used by this module.
 * @typedef {import("fs").FSImplementation} FSImplementation
 */
/**
 * @typedef {NonNullable<Exclude<Parameters<typeof import("fs").createWriteStream>[1], BufferEncoding | undefined>["fs"]>} NodeWriteStreamFSImplementation
 */
/**
 * Defines the create write stream fs implementation type used by this module.
 * @typedef {object} CreateWriteStreamFSImplementation
 * @property {NodeWriteStreamFSImplementation["open"]=} open
 * @property {NodeWriteStreamFSImplementation["close"]=} close
 * @property {NodeWriteStreamFSImplementation["write"]} write
 * @property {NodeWriteStreamFSImplementation["writev"]=} writev
 */
/**
 * Defines the write stream options type used by this module.
 * @typedef {StreamOptions & { fs?: CreateWriteStreamFSImplementation | null | undefined, flush?: boolean | undefined }} WriteStreamOptions
 */
/**
 * Defines the create write stream type used by this module.
 * @typedef {(pathLike: PathLike, result?: BufferEncoding | WriteStreamOptions) => NodeJS.WritableStream} CreateWriteStream
 */
/**
 * Defines the open mode type used by this module.
 * @typedef {number | string} OpenMode
 */
/**
 * Describes the open shape.
 * @typedef {{
 * (file: PathLike, flags: OpenMode | undefined, mode: Mode | undefined | null, callback: NumberCallback): void,
 * (file: PathLike, flags: OpenMode | undefined, callback: NumberCallback): void,
 * (file: PathLike, callback: NumberCallback): void,
 * }} Open
 */
/**
 * Defines the read position type used by this module.
 * @typedef {number | bigint} ReadPosition
 */
/**
 * Defines the read sync options type used by this module.
 * @typedef {object} ReadSyncOptions
 * @property {(number | undefined)=} offset
 * @property {(number | undefined)=} length
 * @property {(ReadPosition | null | undefined)=} position
 */
/**
 * Defines the read async options type used by this module.
 * @template {NodeJS.ArrayBufferView} TBuffer
 * @typedef {object} ReadAsyncOptions
 * @property {(number | undefined)=} offset
 * @property {(number | undefined)=} length
 * @property {(ReadPosition | null | undefined)=} position
 * @property {TBuffer=} buffer
 */
/**
 * Defines the shared type used by this module.
 * @template {NodeJS.ArrayBufferView} [TBuffer=NodeJS.ArrayBufferView]
 * @typedef {{
 * (fd: number, buffer: TBuffer, offset: number, length: number, position: ReadPosition | null, callback: (err: NodeJS.ErrnoException | null, bytesRead: number, buffer: TBuffer) => void): void,
 * (fd: number, options: ReadAsyncOptions<TBuffer>, callback: (err: NodeJS.ErrnoException | null, bytesRead: number, buffer: TBuffer) => void): void,
 * (fd: number, callback: (err: NodeJS.ErrnoException | null, bytesRead: number, buffer: NodeJS.ArrayBufferView) => void): void,
 * }} Read
 */
/** @typedef {(df: number, callback: NoParamCallback) => void} Close */
/** @typedef {(a: PathLike, b: PathLike, callback: NoParamCallback) => void} Rename */
/**
 * Defines the intermediate file system extras type used by this module.
 * @typedef {object} IntermediateFileSystemExtras
 * @property {MkdirSync} mkdirSync
 * @property {CreateWriteStream} createWriteStream
 * @property {Open} open
 * @property {Read} read
 * @property {Close} close
 * @property {Rename} rename
 */
/** @typedef {InputFileSystem & OutputFileSystem & IntermediateFileSystemExtras} IntermediateFileSystem */
/**
 * Returns location of targetPath relative to rootPath.
 * @param {InputFileSystem | OutputFileSystem | undefined} fs a file system
 * @param {string} rootPath the root path
 * @param {string} targetPath the target path
 * @returns {string} location of targetPath relative to rootPath
 */
export function relative(fs: InputFileSystem | OutputFileSystem | undefined, rootPath: string, targetPath: string): string;
import type { Entry } from "watchpack";
import type { OnlySafeTimeEntry } from "watchpack";
import type { ExistenceOnlyTimeEntry } from "watchpack";
