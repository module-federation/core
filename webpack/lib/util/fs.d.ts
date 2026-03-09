export type WatchOptions =
  import('../../declarations/WebpackOptions').WatchOptions;
export type FileSystemInfoEntry =
  import('../FileSystemInfo').FileSystemInfoEntry;
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
export type IStats = IStatsBase<number>;
export type IBigIntStats = IStatsBase<bigint> & {
  atimeNs: bigint;
  mtimeNs: bigint;
  ctimeNs: bigint;
  birthtimeNs: bigint;
};
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
export type JsonObject = { [Key in string]?: JsonValue };
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type NoParamCallback = (err: NodeJS.ErrnoException | null) => void;
export type StringCallback = (
  err: NodeJS.ErrnoException | null,
  result?: string,
) => void;
export type BufferCallback = (
  err: NodeJS.ErrnoException | null,
  result?: Buffer,
) => void;
export type StringOrBufferCallback = (
  err: NodeJS.ErrnoException | null,
  result?: string | Buffer,
) => void;
export type ReaddirStringCallback = (
  err: NodeJS.ErrnoException | null,
  result?: string[],
) => void;
export type ReaddirBufferCallback = (
  err: NodeJS.ErrnoException | null,
  result?: Buffer[],
) => void;
export type ReaddirStringOrBufferCallback = (
  err: NodeJS.ErrnoException | null,
  result?: string[] | Buffer[],
) => void;
export type ReaddirDirentCallback = (
  err: NodeJS.ErrnoException | null,
  result?: Dirent[],
) => void;
export type ReaddirDirentBufferCallback = (
  err: NodeJS.ErrnoException | null,
  result?: Dirent<Buffer>[],
) => void;
export type StatsCallback = (
  err: NodeJS.ErrnoException | null,
  result?: IStats,
) => void;
export type BigIntStatsCallback = (
  err: NodeJS.ErrnoException | null,
  result?: IBigIntStats,
) => void;
export type StatsOrBigIntStatsCallback = (
  err: NodeJS.ErrnoException | null,
  result?: IStats | IBigIntStats,
) => void;
export type NumberCallback = (
  err: NodeJS.ErrnoException | null,
  result?: number,
) => void;
export type ReadJsonCallback = (
  err: NodeJS.ErrnoException | Error | null,
  result?: JsonObject,
) => void;
export type TimeInfoEntries = Map<string, FileSystemInfoEntry | 'ignore'>;
export type Changes = Set<string>;
export type Removals = Set<string>;
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
export type WatchMethod = (
  files: Iterable<string>,
  directories: Iterable<string>,
  missing: Iterable<string>,
  startTime: number,
  options: WatchOptions,
  callback: (
    err: Error | null,
    timeInfoEntries1?: TimeInfoEntries,
    timeInfoEntries2?: TimeInfoEntries,
    changes?: Changes,
    removals?: Removals,
  ) => void,
  callbackUndelayed: (value: string, num: number) => void,
) => Watcher;
export type PathLike = string | Buffer | URL;
export type PathOrFileDescriptor = PathLike | number;
export type ObjectEncodingOptions = {
  encoding?: (BufferEncoding | null | undefined) | undefined;
};
export type ReadFile = {
  (
    path: PathOrFileDescriptor,
    options:
      | ({
          encoding?: null | undefined;
          flag?: string | undefined;
        } & import('events').Abortable)
      | undefined
      | null,
    callback: BufferCallback,
  ): void;
  (
    path: PathOrFileDescriptor,
    options:
      | ({
          encoding: BufferEncoding;
          flag?: string | undefined;
        } & import('events').Abortable)
      | BufferEncoding,
    callback: StringCallback,
  ): void;
  (
    path: PathOrFileDescriptor,
    options:
      | (ObjectEncodingOptions & {
          flag?: string | undefined;
        } & import('events').Abortable)
      | BufferEncoding
      | undefined
      | null,
    callback: StringOrBufferCallback,
  ): void;
  (path: PathOrFileDescriptor, callback: BufferCallback): void;
};
export type ReadFileSync = {
  (
    path: PathOrFileDescriptor,
    options?: {
      encoding?: null | undefined;
      flag?: string | undefined;
    } | null,
  ): Buffer;
  (
    path: PathOrFileDescriptor,
    options:
      | {
          encoding: BufferEncoding;
          flag?: string | undefined;
        }
      | BufferEncoding,
  ): string;
  (
    path: PathOrFileDescriptor,
    options?:
      | (ObjectEncodingOptions & {
          flag?: string | undefined;
        })
      | BufferEncoding
      | null,
  ): string | Buffer;
};
export type EncodingOption =
  | ObjectEncodingOptions
  | BufferEncoding
  | undefined
  | null;
export type BufferEncodingOption =
  | 'buffer'
  | {
      encoding: 'buffer';
    };
export type StatOptions = {
  bigint?: (boolean | undefined) | undefined;
};
export type StatSyncOptions = {
  bigint?: (boolean | undefined) | undefined;
  throwIfNoEntry?: (boolean | undefined) | undefined;
};
export type Readlink = {
  (path: PathLike, options: EncodingOption, callback: StringCallback): void;
  (
    path: PathLike,
    options: BufferEncodingOption,
    callback: BufferCallback,
  ): void;
  (
    path: PathLike,
    options: EncodingOption,
    callback: StringOrBufferCallback,
  ): void;
  (path: PathLike, callback: StringCallback): void;
};
export type ReadlinkSync = {
  (path: PathLike, options?: EncodingOption): string;
  (path: PathLike, options: BufferEncodingOption): Buffer;
  (path: PathLike, options?: EncodingOption): string | Buffer;
};
export type Readdir = {
  (
    path: PathLike,
    options:
      | {
          encoding: BufferEncoding | null;
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        }
      | BufferEncoding
      | undefined
      | null,
    callback: (err: NodeJS.ErrnoException | null, files?: string[]) => void,
  ): void;
  (
    path: PathLike,
    options:
      | {
          encoding: 'buffer';
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        }
      | 'buffer',
    callback: (err: NodeJS.ErrnoException | null, files?: Buffer[]) => void,
  ): void;
  (
    path: PathLike,
    options:
      | (ObjectEncodingOptions & {
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        })
      | BufferEncoding
      | undefined
      | null,
    callback: (
      err: NodeJS.ErrnoException | null,
      files?: string[] | Buffer[],
    ) => void,
  ): void;
  (
    path: PathLike,
    callback: (err: NodeJS.ErrnoException | null, files?: string[]) => void,
  ): void;
  (
    path: PathLike,
    options: ObjectEncodingOptions & {
      withFileTypes: true;
      recursive?: boolean | undefined;
    },
    callback: (
      err: NodeJS.ErrnoException | null,
      files?: Dirent<string>[],
    ) => void,
  ): void;
  (
    path: PathLike,
    options: {
      encoding: 'buffer';
      withFileTypes: true;
      recursive?: boolean | undefined;
    },
    callback: (
      err: NodeJS.ErrnoException | null,
      files: Dirent<Buffer>[],
    ) => void,
  ): void;
};
export type ReaddirSync = {
  (
    path: PathLike,
    options?:
      | {
          encoding: BufferEncoding | null;
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        }
      | BufferEncoding
      | null,
  ): string[];
  (
    path: PathLike,
    options:
      | {
          encoding: 'buffer';
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        }
      | 'buffer',
  ): Buffer[];
  (
    path: PathLike,
    options?:
      | (ObjectEncodingOptions & {
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        })
      | BufferEncoding
      | null,
  ): string[] | Buffer[];
  (
    path: PathLike,
    options: ObjectEncodingOptions & {
      withFileTypes: true;
      recursive?: boolean | undefined;
    },
  ): Dirent[];
  (
    path: PathLike,
    options: {
      encoding: 'buffer';
      withFileTypes: true;
      recursive?: boolean | undefined;
    },
  ): Dirent<Buffer>[];
};
export type Stat = {
  (path: PathLike, callback: StatsCallback): void;
  (
    path: PathLike,
    options:
      | (StatOptions & {
          bigint?: false | undefined;
        })
      | undefined,
    callback: StatsCallback,
  ): void;
  (
    path: PathLike,
    options: StatOptions & {
      bigint: true;
    },
    callback: BigIntStatsCallback,
  ): void;
  (
    path: PathLike,
    options: StatOptions | undefined,
    callback: StatsOrBigIntStatsCallback,
  ): void;
};
export type StatSync = {
  (path: PathLike, options?: undefined): IStats;
  (
    path: PathLike,
    options?: StatSyncOptions & {
      bigint?: false | undefined;
      throwIfNoEntry: false;
    },
  ): IStats | undefined;
  (
    path: PathLike,
    options: StatSyncOptions & {
      bigint: true;
      throwIfNoEntry: false;
    },
  ): IBigIntStats | undefined;
  (
    path: PathLike,
    options?: StatSyncOptions & {
      bigint?: false | undefined;
    },
  ): IStats;
  (
    path: PathLike,
    options: StatSyncOptions & {
      bigint: true;
    },
  ): IBigIntStats;
  (
    path: PathLike,
    options: StatSyncOptions & {
      bigint: boolean;
      throwIfNoEntry?: false | undefined;
    },
  ): IStats | IBigIntStats;
  (
    path: PathLike,
    options?: StatSyncOptions,
  ): IStats | IBigIntStats | undefined;
};
export type LStat = {
  (path: PathLike, callback: StatsCallback): void;
  (
    path: PathLike,
    options:
      | (StatOptions & {
          bigint?: false | undefined;
        })
      | undefined,
    callback: StatsCallback,
  ): void;
  (
    path: PathLike,
    options: StatOptions & {
      bigint: true;
    },
    callback: BigIntStatsCallback,
  ): void;
  (
    path: PathLike,
    options: StatOptions | undefined,
    callback: StatsOrBigIntStatsCallback,
  ): void;
};
export type LStatSync = {
  (path: PathLike, options?: undefined): IStats;
  (
    path: PathLike,
    options?: StatSyncOptions & {
      bigint?: false | undefined;
      throwIfNoEntry: false;
    },
  ): IStats | undefined;
  (
    path: PathLike,
    options: StatSyncOptions & {
      bigint: true;
      throwIfNoEntry: false;
    },
  ): IBigIntStats | undefined;
  (
    path: PathLike,
    options?: StatSyncOptions & {
      bigint?: false | undefined;
    },
  ): IStats;
  (
    path: PathLike,
    options: StatSyncOptions & {
      bigint: true;
    },
  ): IBigIntStats;
  (
    path: PathLike,
    options: StatSyncOptions & {
      bigint: boolean;
      throwIfNoEntry?: false | undefined;
    },
  ): IStats | IBigIntStats;
  (
    path: PathLike,
    options?: StatSyncOptions,
  ): IStats | IBigIntStats | undefined;
};
export type RealPath = {
  (path: PathLike, options: EncodingOption, callback: StringCallback): void;
  (
    path: PathLike,
    options: BufferEncodingOption,
    callback: BufferCallback,
  ): void;
  (
    path: PathLike,
    options: EncodingOption,
    callback: StringOrBufferCallback,
  ): void;
  (path: PathLike, callback: StringCallback): void;
};
export type RealPathSync = {
  (path: PathLike, options?: EncodingOption): string;
  (path: PathLike, options: BufferEncodingOption): Buffer;
  (path: PathLike, options?: EncodingOption): string | Buffer;
};
export type ReadJson = (
  pathOrFileDescriptor: PathOrFileDescriptor,
  callback: ReadJsonCallback,
) => void;
export type ReadJsonSync = (
  pathOrFileDescriptor: PathOrFileDescriptor,
) => JsonObject;
export type Purge = (value?: string | string[] | Set<string>) => void;
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
export type Mode = number | string;
export type WriteFileOptions =
  | (ObjectEncodingOptions &
      import('events').Abortable & {
        mode?: Mode | undefined;
        flag?: string | undefined;
        flush?: boolean | undefined;
      })
  | BufferEncoding
  | null;
export type WriteFile = {
  (
    file: PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView,
    options: WriteFileOptions,
    callback: NoParamCallback,
  ): void;
  (
    file: PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView,
    callback: NoParamCallback,
  ): void;
};
export type MakeDirectoryOptions = {
  recursive?: boolean | undefined;
  mode?: Mode | undefined;
};
export type Mkdir = {
  (
    file: PathLike,
    options: MakeDirectoryOptions & {
      recursive: true;
    },
    callback: StringCallback,
  ): void;
  (
    file: PathLike,
    options:
      | Mode
      | (MakeDirectoryOptions & {
          recursive?: false | undefined;
        })
      | null
      | undefined,
    callback: NoParamCallback,
  ): void;
  (
    file: PathLike,
    options: Mode | MakeDirectoryOptions | null | undefined,
    callback: StringCallback,
  ): void;
  (file: PathLike, callback: NoParamCallback): void;
};
export type RmDirOptions = {
  maxRetries?: number | undefined;
  recursive?: boolean | undefined;
  retryDelay?: number | undefined;
};
export type Rmdir = {
  (file: PathLike, callback: NoParamCallback): void;
  (file: PathLike, options: RmDirOptions, callback: NoParamCallback): void;
};
export type Unlink = (pathLike: PathLike, callback: NoParamCallback) => void;
export type CreateReadStreamFSImplementation = FSImplementation & {
  read: (...args: EXPECTED_ANY[]) => EXPECTED_ANY;
};
export type ReadStreamOptions = StreamOptions & {
  fs?: CreateReadStreamFSImplementation | null | undefined;
  end?: number | undefined;
};
export type CreateReadStream = (
  path: PathLike,
  options?: BufferEncoding | ReadStreamOptions,
) => NodeJS.ReadableStream;
export type OutputFileSystem = {
  mkdir: Mkdir;
  readdir?: Readdir | undefined;
  rmdir?: Rmdir | undefined;
  writeFile: WriteFile;
  unlink?: Unlink | undefined;
  stat: Stat;
  lstat?: LStat | undefined;
  readFile: ReadFile;
  createReadStream?: CreateReadStream | undefined;
  join?: ((path1: string, path2: string) => string) | undefined;
  relative?: ((from: string, to: string) => string) | undefined;
  dirname?: ((dirname: string) => string) | undefined;
};
export type WatchFileSystem = {
  watch: WatchMethod;
};
export type MkdirSync = {
  (
    path: PathLike,
    options: MakeDirectoryOptions & {
      recursive: true;
    },
  ): string | undefined;
  (
    path: PathLike,
    options?:
      | Mode
      | (MakeDirectoryOptions & {
          recursive?: false | undefined;
        })
      | null,
  ): void;
  (
    path: PathLike,
    options?: Mode | MakeDirectoryOptions | null,
  ): string | undefined;
};
export type StreamOptions = {
  flags?: (string | undefined) | undefined;
  encoding: BufferEncoding | undefined;
  fd?: (number | EXPECTED_ANY | undefined) | undefined;
  mode?: (number | undefined) | undefined;
  autoClose?: (boolean | undefined) | undefined;
  emitClose?: (boolean | undefined) | undefined;
  start?: (number | undefined) | undefined;
  signal?: (AbortSignal | null | undefined) | undefined;
};
export type FSImplementation = {
  open?: ((...args: EXPECTED_ANY[]) => EXPECTED_ANY) | undefined;
  close?: ((...args: EXPECTED_ANY[]) => EXPECTED_ANY) | undefined;
};
export type CreateWriteStreamFSImplementation = FSImplementation & {
  write: (...args: EXPECTED_ANY[]) => EXPECTED_ANY;
  close?: (...args: EXPECTED_ANY[]) => EXPECTED_ANY;
};
export type WriteStreamOptions = StreamOptions & {
  fs?: CreateWriteStreamFSImplementation | null | undefined;
  flush?: boolean | undefined;
};
export type CreateWriteStream = (
  pathLike: PathLike,
  result?: BufferEncoding | WriteStreamOptions,
) => NodeJS.WritableStream;
export type OpenMode = number | string;
export type Open = {
  (
    file: PathLike,
    flags: OpenMode | undefined,
    mode: Mode | undefined | null,
    callback: NumberCallback,
  ): void;
  (file: PathLike, flags: OpenMode | undefined, callback: NumberCallback): void;
  (file: PathLike, callback: NumberCallback): void;
};
export type ReadPosition = number | bigint;
export type ReadSyncOptions = {
  offset?: (number | undefined) | undefined;
  length?: (number | undefined) | undefined;
  position?: (ReadPosition | null | undefined) | undefined;
};
export type ReadAsyncOptions<TBuffer extends NodeJS.ArrayBufferView> = {
  offset?: (number | undefined) | undefined;
  length?: (number | undefined) | undefined;
  position?: (ReadPosition | null | undefined) | undefined;
  buffer?: TBuffer | undefined;
};
export type Read<
  TBuffer extends
    NodeJS.ArrayBufferView = NodeJS.ArrayBufferView<ArrayBufferLike>,
> = {
  (
    fd: number,
    buffer: TBuffer,
    offset: number,
    length: number,
    position: ReadPosition | null,
    callback: (
      err: NodeJS.ErrnoException | null,
      bytesRead: number,
      buffer: TBuffer,
    ) => void,
  ): void;
  (
    fd: number,
    options: ReadAsyncOptions<TBuffer>,
    callback: (
      err: NodeJS.ErrnoException | null,
      bytesRead: number,
      buffer: TBuffer,
    ) => void,
  ): void;
  (
    fd: number,
    callback: (
      err: NodeJS.ErrnoException | null,
      bytesRead: number,
      buffer: NodeJS.ArrayBufferView,
    ) => void,
  ): void;
};
export type Close = (df: number, callback: NoParamCallback) => void;
export type Rename = (
  a: PathLike,
  b: PathLike,
  callback: NoParamCallback,
) => void;
export type IntermediateFileSystemExtras = {
  mkdirSync: MkdirSync;
  createWriteStream: CreateWriteStream;
  open: Open;
  read: Read;
  close: Close;
  rename: Rename;
};
export type IntermediateFileSystem = InputFileSystem &
  OutputFileSystem &
  IntermediateFileSystemExtras;
/**
 * @param {InputFileSystem | OutputFileSystem | undefined} fs a file system
 * @param {string} absPath an absolute path
 * @returns {string} the parent directory of the absolute path
 */
export function dirname(
  fs: InputFileSystem | OutputFileSystem | undefined,
  absPath: string,
): string;
/**
 * @param {string} pathname a path
 * @returns {boolean} is absolute
 */
export function isAbsolute(pathname: string): boolean;
/**
 * @param {InputFileSystem | OutputFileSystem | undefined} fs a file system
 * @param {string} rootPath a path
 * @param {string} filename a filename
 * @returns {string} the joined path
 */
export function join(
  fs: InputFileSystem | OutputFileSystem | undefined,
  rootPath: string,
  filename: string,
): string;
/**
 * @param {InputFileSystem} fs a file system
 * @param {string} p an absolute path
 * @param {(err: NodeJS.ErrnoException | Error | null, stats?: IStats | string) => void} callback callback
 * @returns {void}
 */
export function lstatReadlinkAbsolute(
  fs: InputFileSystem,
  p: string,
  callback: (
    err: NodeJS.ErrnoException | Error | null,
    stats?: IStats | string,
  ) => void,
): void;
/**
 * @param {OutputFileSystem} fs a file system
 * @param {string} p an absolute path
 * @param {(err?: Error) => void} callback callback function for the error
 * @returns {void}
 */
export function mkdirp(
  fs: OutputFileSystem,
  p: string,
  callback: (err?: Error) => void,
): void;
/**
 * @param {IntermediateFileSystem} fs a file system
 * @param {string} p an absolute path
 * @returns {void}
 */
export function mkdirpSync(fs: IntermediateFileSystem, p: string): void;
/**
 * @param {InputFileSystem} fs a file system
 * @param {string} p an absolute path
 * @param {ReadJsonCallback} callback callback
 * @returns {void}
 */
export function readJson(
  fs: InputFileSystem,
  p: string,
  callback: ReadJsonCallback,
): void;
/** @typedef {import("../../declarations/WebpackOptions").WatchOptions} WatchOptions */
/** @typedef {import("../FileSystemInfo").FileSystemInfoEntry} FileSystemInfoEntry */
/**
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
 * @typedef {IStatsBase<number>} IStats
 */
/**
 * @typedef {IStatsBase<bigint> & { atimeNs: bigint, mtimeNs: bigint, ctimeNs: bigint, birthtimeNs: bigint }} IBigIntStats
 */
/**
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
/** @typedef {Map<string, FileSystemInfoEntry | "ignore">} TimeInfoEntries */
/** @typedef {Set<string>} Changes */
/** @typedef {Set<string>} Removals */
/**
 * @typedef {object} WatcherInfo
 * @property {Changes | null} changes get current aggregated changes that have not yet send to callback
 * @property {Removals | null} removals get current aggregated removals that have not yet send to callback
 * @property {TimeInfoEntries} fileTimeInfoEntries get info about files
 * @property {TimeInfoEntries} contextTimeInfoEntries get info about directories
 */
/**
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
 * @typedef {string | Buffer | URL} PathLike
 */
/**
 * @typedef {PathLike | number} PathOrFileDescriptor
 */
/**
 * @typedef {object} ObjectEncodingOptions
 * @property {BufferEncoding | null | undefined=} encoding
 */
/**
 * @typedef {{
 * (path: PathOrFileDescriptor, options: ({ encoding?: null | undefined, flag?: string | undefined } & import("events").Abortable) | undefined | null, callback: BufferCallback): void,
 * (path: PathOrFileDescriptor, options: ({ encoding: BufferEncoding, flag?: string | undefined } & import("events").Abortable) | BufferEncoding, callback: StringCallback): void,
 * (path: PathOrFileDescriptor, options: (ObjectEncodingOptions & { flag?: string | undefined } & import("events").Abortable) | BufferEncoding | undefined | null, callback: StringOrBufferCallback): void,
 * (path: PathOrFileDescriptor, callback: BufferCallback): void,
 * }} ReadFile
 */
/**
 * @typedef {{
 * (path: PathOrFileDescriptor, options?: { encoding?: null | undefined, flag?: string | undefined } | null): Buffer,
 * (path: PathOrFileDescriptor, options: { encoding: BufferEncoding, flag?: string | undefined } | BufferEncoding): string,
 * (path: PathOrFileDescriptor, options?: (ObjectEncodingOptions & { flag?: string | undefined }) | BufferEncoding | null): string | Buffer,
 * }} ReadFileSync
 */
/**
 * @typedef {ObjectEncodingOptions | BufferEncoding | undefined | null} EncodingOption
 */
/**
 * @typedef {"buffer" | { encoding: "buffer" }} BufferEncodingOption
 */
/**
 * @typedef {object} StatOptions
 * @property {(boolean | undefined)=} bigint
 */
/**
 * @typedef {object} StatSyncOptions
 * @property {(boolean | undefined)=} bigint
 * @property {(boolean | undefined)=} throwIfNoEntry
 */
/**
 * @typedef {{
 * (path: PathLike, options: EncodingOption, callback: StringCallback): void,
 * (path: PathLike, options: BufferEncodingOption, callback: BufferCallback): void,
 * (path: PathLike, options: EncodingOption, callback: StringOrBufferCallback): void,
 * (path: PathLike, callback: StringCallback): void,
 * }} Readlink
 */
/**
 * @typedef {{
 * (path: PathLike, options?: EncodingOption): string,
 * (path: PathLike, options: BufferEncodingOption): Buffer,
 * (path: PathLike, options?: EncodingOption): string | Buffer,
 * }} ReadlinkSync
 */
/**
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
 * @typedef {{
 * (path: PathLike, options?: { encoding: BufferEncoding | null, withFileTypes?: false | undefined, recursive?: boolean | undefined; } | BufferEncoding | null): string[],
 * (path: PathLike, options: { encoding: "buffer", withFileTypes?: false | undefined, recursive?: boolean | undefined } | "buffer"): Buffer[],
 * (path: PathLike, options?: (ObjectEncodingOptions & { withFileTypes?: false | undefined, recursive?: boolean | undefined }) | BufferEncoding | null): string[] | Buffer[],
 * (path: PathLike, options: ObjectEncodingOptions & { withFileTypes: true, recursive?: boolean | undefined }): Dirent[],
 * (path: PathLike, options: { encoding: "buffer", withFileTypes: true, recursive?: boolean | undefined }): Dirent<Buffer>[],
 * }} ReaddirSync
 */
/**
 * @typedef {{
 * (path: PathLike, callback: StatsCallback): void,
 * (path: PathLike, options: (StatOptions & { bigint?: false | undefined }) | undefined, callback: StatsCallback): void,
 * (path: PathLike, options: StatOptions & { bigint: true }, callback: BigIntStatsCallback): void,
 * (path: PathLike, options: StatOptions | undefined, callback: StatsOrBigIntStatsCallback): void,
 * }} Stat
 */
/**
 * @typedef {{
 * (path: PathLike, options?: undefined): IStats,
 * (path: PathLike, options?: StatSyncOptions & { bigint?: false | undefined, throwIfNoEntry: false }): IStats | undefined,
 * (path: PathLike, options: StatSyncOptions & { bigint: true, throwIfNoEntry: false }): IBigIntStats | undefined,
 * (path: PathLike, options?: StatSyncOptions & { bigint?: false | undefined }): IStats,
 * (path: PathLike, options: StatSyncOptions & { bigint: true }): IBigIntStats,
 * (path: PathLike,  options: StatSyncOptions & { bigint: boolean, throwIfNoEntry?: false | undefined }): IStats | IBigIntStats,
 * (path: PathLike,  options?: StatSyncOptions): IStats | IBigIntStats | undefined,
 * }} StatSync
 */
/**
 * @typedef {{
 * (path: PathLike, callback: StatsCallback): void,
 * (path: PathLike, options: (StatOptions & { bigint?: false | undefined }) | undefined, callback: StatsCallback): void,
 * (path: PathLike, options: StatOptions & { bigint: true }, callback: BigIntStatsCallback): void,
 * (path: PathLike, options: StatOptions | undefined, callback: StatsOrBigIntStatsCallback): void,
 * }} LStat
 */
/**
 * @typedef {{
 * (path: PathLike, options?: undefined): IStats,
 * (path: PathLike, options?: StatSyncOptions & { bigint?: false | undefined, throwIfNoEntry: false }): IStats | undefined,
 * (path: PathLike, options: StatSyncOptions & { bigint: true, throwIfNoEntry: false }): IBigIntStats | undefined,
 * (path: PathLike, options?: StatSyncOptions & { bigint?: false | undefined }): IStats,
 * (path: PathLike, options: StatSyncOptions & { bigint: true }): IBigIntStats,
 * (path: PathLike,  options: StatSyncOptions & { bigint: boolean, throwIfNoEntry?: false | undefined }): IStats | IBigIntStats,
 * (path: PathLike,  options?: StatSyncOptions): IStats | IBigIntStats | undefined,
 * }} LStatSync
 */
/**
 * @typedef {{
 * (path: PathLike, options: EncodingOption, callback: StringCallback): void,
 * (path: PathLike, options: BufferEncodingOption, callback: BufferCallback): void,
 * (path: PathLike, options: EncodingOption, callback: StringOrBufferCallback): void,
 * (path: PathLike, callback: StringCallback): void;
 * }} RealPath
 */
/**
 * @typedef {{
 * (path: PathLike, options?: EncodingOption): string,
 * (path: PathLike, options: BufferEncodingOption): Buffer,
 * (path: PathLike, options?: EncodingOption): string | Buffer,
 * }} RealPathSync
 */
/**
 * @typedef {(pathOrFileDescriptor: PathOrFileDescriptor, callback: ReadJsonCallback) => void} ReadJson
 */
/**
 * @typedef {(pathOrFileDescriptor: PathOrFileDescriptor) => JsonObject} ReadJsonSync
 */
/**
 * @typedef {(value?: string | string[] | Set<string>) => void} Purge
 */
/**
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
 * @typedef {number | string} Mode
 */
/**
 * @typedef {(ObjectEncodingOptions & import("events").Abortable & { mode?: Mode | undefined, flag?: string | undefined, flush?: boolean | undefined }) | BufferEncoding | null} WriteFileOptions
 */
/**
 * @typedef {{
 * (file: PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, options: WriteFileOptions, callback: NoParamCallback): void,
 * (file: PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, callback: NoParamCallback): void,
 * }} WriteFile
 */
/**
 * @typedef {{ recursive?: boolean | undefined, mode?: Mode | undefined }} MakeDirectoryOptions
 */
/**
 * @typedef {{
 * (file: PathLike, options: MakeDirectoryOptions & { recursive: true }, callback: StringCallback): void,
 * (file: PathLike, options: Mode | (MakeDirectoryOptions & { recursive?: false | undefined; }) | null | undefined, callback: NoParamCallback): void,
 * (file: PathLike, options: Mode | MakeDirectoryOptions | null | undefined, callback: StringCallback): void,
 * (file: PathLike, callback: NoParamCallback): void,
 * }} Mkdir
 */
/**
 * @typedef {{ maxRetries?: number | undefined, recursive?: boolean | undefined, retryDelay?: number | undefined }} RmDirOptions
 */
/**
 * @typedef {{
 * (file: PathLike, callback: NoParamCallback): void,
 * (file: PathLike, options: RmDirOptions, callback: NoParamCallback): void,
 * }} Rmdir
 */
/**
 * @typedef {(pathLike: PathLike, callback: NoParamCallback) => void} Unlink
 */
/**
 * @typedef {FSImplementation & { read: (...args: EXPECTED_ANY[]) => EXPECTED_ANY }} CreateReadStreamFSImplementation
 */
/**
 * @typedef {StreamOptions & { fs?: CreateReadStreamFSImplementation | null | undefined, end?: number | undefined }} ReadStreamOptions
 */
/**
 * @typedef {(path: PathLike, options?: BufferEncoding | ReadStreamOptions) => NodeJS.ReadableStream} CreateReadStream
 */
/**
 * @typedef {object} OutputFileSystem
 * @property {Mkdir} mkdir
 * @property {Readdir=} readdir
 * @property {Rmdir=} rmdir
 * @property {WriteFile} writeFile
 * @property {Unlink=} unlink
 * @property {Stat} stat
 * @property {LStat=} lstat
 * @property {ReadFile} readFile
 * @property {CreateReadStream=} createReadStream
 * @property {((path1: string, path2: string) => string)=} join
 * @property {((from: string, to: string) => string)=} relative
 * @property {((dirname: string) => string)=} dirname
 */
/**
 * @typedef {object} WatchFileSystem
 * @property {WatchMethod} watch
 */
/**
 * @typedef {{
 * (path: PathLike, options: MakeDirectoryOptions & { recursive: true }): string | undefined,
 * (path: PathLike, options?: Mode | (MakeDirectoryOptions & { recursive?: false | undefined }) | null): void,
 * (path: PathLike, options?: Mode | MakeDirectoryOptions | null): string | undefined,
 * }} MkdirSync
 */
/**
 * @typedef {object} StreamOptions
 * @property {(string | undefined)=} flags
 * @property {(BufferEncoding | undefined)} encoding
 * @property {(number | EXPECTED_ANY | undefined)=} fd
 * @property {(number | undefined)=} mode
 * @property {(boolean | undefined)=} autoClose
 * @property {(boolean | undefined)=} emitClose
 * @property {(number | undefined)=} start
 * @property {(AbortSignal | null | undefined)=} signal
 */
/**
 * @typedef {object} FSImplementation
 * @property {((...args: EXPECTED_ANY[]) => EXPECTED_ANY)=} open
 * @property {((...args: EXPECTED_ANY[]) => EXPECTED_ANY)=} close
 */
/**
 * @typedef {FSImplementation & { write: (...args: EXPECTED_ANY[]) => EXPECTED_ANY; close?: (...args: EXPECTED_ANY[]) => EXPECTED_ANY }} CreateWriteStreamFSImplementation
 */
/**
 * @typedef {StreamOptions & { fs?: CreateWriteStreamFSImplementation | null | undefined, flush?: boolean | undefined }} WriteStreamOptions
 */
/**
 * @typedef {(pathLike: PathLike, result?: BufferEncoding | WriteStreamOptions) => NodeJS.WritableStream} CreateWriteStream
 */
/**
 * @typedef {number | string} OpenMode
 */
/**
 * @typedef {{
 * (file: PathLike, flags: OpenMode | undefined,  mode: Mode | undefined | null, callback: NumberCallback): void,
 * (file: PathLike, flags: OpenMode | undefined, callback: NumberCallback): void,
 * (file: PathLike, callback: NumberCallback): void,
 * }} Open
 */
/**
 * @typedef {number | bigint} ReadPosition
 */
/**
 * @typedef {object} ReadSyncOptions
 * @property {(number | undefined)=} offset
 * @property {(number | undefined)=} length
 * @property {(ReadPosition | null | undefined)=} position
 */
/**
 * @template {NodeJS.ArrayBufferView} TBuffer
 * @typedef {object} ReadAsyncOptions
 * @property {(number | undefined)=} offset
 * @property {(number | undefined)=} length
 * @property {(ReadPosition | null | undefined)=} position
 * @property {TBuffer=} buffer
 */
/**
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
 * @param {InputFileSystem | OutputFileSystem | undefined} fs a file system
 * @param {string} rootPath the root path
 * @param {string} targetPath the target path
 * @returns {string} location of targetPath relative to rootPath
 */
export function relative(
  fs: InputFileSystem | OutputFileSystem | undefined,
  rootPath: string,
  targetPath: string,
): string;
