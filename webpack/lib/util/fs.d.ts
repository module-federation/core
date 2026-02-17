export type WatchOptions =
  import('../../declarations/WebpackOptions').WatchOptions;
export type FileSystemInfoEntry =
  import('../FileSystemInfo').FileSystemInfoEntry;
export type IStats = {
  isFile: () => boolean;
  isDirectory: () => boolean;
  isBlockDevice: () => boolean;
  isCharacterDevice: () => boolean;
  isSymbolicLink: () => boolean;
  isFIFO: () => boolean;
  isSocket: () => boolean;
  dev: number | bigint;
  ino: number | bigint;
  mode: number | bigint;
  nlink: number | bigint;
  uid: number | bigint;
  gid: number | bigint;
  rdev: number | bigint;
  size: number | bigint;
  blksize: number | bigint;
  blocks: number | bigint;
  atimeMs: number | bigint;
  mtimeMs: number | bigint;
  ctimeMs: number | bigint;
  birthtimeMs: number | bigint;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
};
export type IDirent = {
  isFile: () => boolean;
  isDirectory: () => boolean;
  isBlockDevice: () => boolean;
  isCharacterDevice: () => boolean;
  isSymbolicLink: () => boolean;
  isFIFO: () => boolean;
  isSocket: () => boolean;
  name: string | Buffer;
};
export type Callback = (
  arg0: (NodeJS.ErrnoException | null) | undefined,
) => void;
export type BufferCallback = (
  arg0: (NodeJS.ErrnoException | null) | undefined,
  arg1: Buffer | undefined,
) => void;
export type BufferOrStringCallback = (
  arg0: (NodeJS.ErrnoException | null) | undefined,
  arg1: (Buffer | string) | undefined,
) => void;
export type DirentArrayCallback = (
  arg0: (NodeJS.ErrnoException | null) | undefined,
  arg1: ((string | Buffer)[] | IDirent[]) | undefined,
) => void;
export type StringCallback = (
  arg0: (NodeJS.ErrnoException | null) | undefined,
  arg1: string | undefined,
) => void;
export type NumberCallback = (
  arg0: (NodeJS.ErrnoException | null) | undefined,
  arg1: number | undefined,
) => void;
export type StatsCallback = (
  arg0: (NodeJS.ErrnoException | null) | undefined,
  arg1: IStats | undefined,
) => void;
export type ReadJsonCallback = (
  arg0: (NodeJS.ErrnoException | Error | null) | undefined,
  arg1: any | undefined,
) => void;
export type LstatReadlinkAbsoluteCallback = (
  arg0: (NodeJS.ErrnoException | Error | null) | undefined,
  arg1: (IStats | string) | undefined,
) => void;
export type WatcherInfo = {
  /**
   * get current aggregated changes that have not yet send to callback
   */
  changes: Set<string>;
  /**
   * get current aggregated removals that have not yet send to callback
   */
  removals: Set<string>;
  /**
   * get info about files
   */
  fileTimeInfoEntries: Map<string, FileSystemInfoEntry | 'ignore'>;
  /**
   * get info about directories
   */
  contextTimeInfoEntries: Map<string, FileSystemInfoEntry | 'ignore'>;
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
  getAggregatedChanges?: (() => Set<string>) | undefined;
  /**
   * get current aggregated removals that have not yet send to callback
   */
  getAggregatedRemovals?: (() => Set<string>) | undefined;
  /**
   * get info about files
   */
  getFileTimeInfoEntries: () => Map<string, FileSystemInfoEntry | 'ignore'>;
  /**
   * get info about directories
   */
  getContextTimeInfoEntries: () => Map<string, FileSystemInfoEntry | 'ignore'>;
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
    arg0: Error | undefined,
    arg1: Map<string, FileSystemInfoEntry | 'ignore'>,
    arg2: Map<string, FileSystemInfoEntry | 'ignore'>,
    arg3: Set<string>,
    arg4: Set<string>,
  ) => void,
  callbackUndelayed: (arg0: string, arg1: number) => void,
) => Watcher;
export type OutputFileSystem = {
  writeFile: (arg0: string, arg1: Buffer | string, arg2: Callback) => void;
  mkdir: (arg0: string, arg1: Callback) => void;
  readdir?: ((arg0: string, arg1: DirentArrayCallback) => void) | undefined;
  rmdir?: ((arg0: string, arg1: Callback) => void) | undefined;
  unlink?: ((arg0: string, arg1: Callback) => void) | undefined;
  stat: (arg0: string, arg1: StatsCallback) => void;
  lstat?: ((arg0: string, arg1: StatsCallback) => void) | undefined;
  readFile: (arg0: string, arg1: BufferOrStringCallback) => void;
  join?: ((arg0: string, arg1: string) => string) | undefined;
  relative?: ((arg0: string, arg1: string) => string) | undefined;
  dirname?: ((arg0: string) => string) | undefined;
};
export type InputFileSystem = {
  readFile: (arg0: string, arg1: BufferOrStringCallback) => void;
  readJson?: ((arg0: string, arg1: ReadJsonCallback) => void) | undefined;
  readlink: (arg0: string, arg1: BufferOrStringCallback) => void;
  readdir: (arg0: string, arg1: DirentArrayCallback) => void;
  stat: (arg0: string, arg1: StatsCallback) => void;
  lstat?: ((arg0: string, arg1: StatsCallback) => void) | undefined;
  realpath?: ((arg0: string, arg1: BufferOrStringCallback) => void) | undefined;
  purge?: ((arg0: string | undefined) => void) | undefined;
  join?: ((arg0: string, arg1: string) => string) | undefined;
  relative?: ((arg0: string, arg1: string) => string) | undefined;
  dirname?: ((arg0: string) => string) | undefined;
};
export type WatchFileSystem = {
  watch: WatchMethod;
};
export type IntermediateFileSystemExtras = {
  mkdirSync: (arg0: string) => void;
  createWriteStream: (arg0: string) => NodeJS.WritableStream;
  open: (arg0: string, arg1: string, arg2: NumberCallback) => void;
  read: (
    arg0: number,
    arg1: Buffer,
    arg2: number,
    arg3: number,
    arg4: number,
    arg5: NumberCallback,
  ) => void;
  close: (arg0: number, arg1: Callback) => void;
  rename: (arg0: string, arg1: string, arg2: Callback) => void;
};
export type IntermediateFileSystem = InputFileSystem &
  OutputFileSystem &
  IntermediateFileSystemExtras;
/** @typedef {import("../../declarations/WebpackOptions").WatchOptions} WatchOptions */
/** @typedef {import("../FileSystemInfo").FileSystemInfoEntry} FileSystemInfoEntry */
/**
 * @typedef {Object} IStats
 * @property {() => boolean} isFile
 * @property {() => boolean} isDirectory
 * @property {() => boolean} isBlockDevice
 * @property {() => boolean} isCharacterDevice
 * @property {() => boolean} isSymbolicLink
 * @property {() => boolean} isFIFO
 * @property {() => boolean} isSocket
 * @property {number | bigint} dev
 * @property {number | bigint} ino
 * @property {number | bigint} mode
 * @property {number | bigint} nlink
 * @property {number | bigint} uid
 * @property {number | bigint} gid
 * @property {number | bigint} rdev
 * @property {number | bigint} size
 * @property {number | bigint} blksize
 * @property {number | bigint} blocks
 * @property {number | bigint} atimeMs
 * @property {number | bigint} mtimeMs
 * @property {number | bigint} ctimeMs
 * @property {number | bigint} birthtimeMs
 * @property {Date} atime
 * @property {Date} mtime
 * @property {Date} ctime
 * @property {Date} birthtime
 */
/**
 * @typedef {Object} IDirent
 * @property {() => boolean} isFile
 * @property {() => boolean} isDirectory
 * @property {() => boolean} isBlockDevice
 * @property {() => boolean} isCharacterDevice
 * @property {() => boolean} isSymbolicLink
 * @property {() => boolean} isFIFO
 * @property {() => boolean} isSocket
 * @property {string | Buffer} name
 */
/** @typedef {function((NodeJS.ErrnoException | null)=): void} Callback */
/** @typedef {function((NodeJS.ErrnoException | null)=, Buffer=): void} BufferCallback */
/** @typedef {function((NodeJS.ErrnoException | null)=, Buffer|string=): void} BufferOrStringCallback */
/** @typedef {function((NodeJS.ErrnoException | null)=, (string | Buffer)[] | IDirent[]=): void} DirentArrayCallback */
/** @typedef {function((NodeJS.ErrnoException | null)=, string=): void} StringCallback */
/** @typedef {function((NodeJS.ErrnoException | null)=, number=): void} NumberCallback */
/** @typedef {function((NodeJS.ErrnoException | null)=, IStats=): void} StatsCallback */
/** @typedef {function((NodeJS.ErrnoException | Error | null)=, any=): void} ReadJsonCallback */
/** @typedef {function((NodeJS.ErrnoException | Error | null)=, IStats|string=): void} LstatReadlinkAbsoluteCallback */
/**
 * @typedef {Object} WatcherInfo
 * @property {Set<string>} changes get current aggregated changes that have not yet send to callback
 * @property {Set<string>} removals get current aggregated removals that have not yet send to callback
 * @property {Map<string, FileSystemInfoEntry | "ignore">} fileTimeInfoEntries get info about files
 * @property {Map<string, FileSystemInfoEntry | "ignore">} contextTimeInfoEntries get info about directories
 */
/**
 * @typedef {Object} Watcher
 * @property {function(): void} close closes the watcher and all underlying file watchers
 * @property {function(): void} pause closes the watcher, but keeps underlying file watchers alive until the next watch call
 * @property {function(): Set<string>=} getAggregatedChanges get current aggregated changes that have not yet send to callback
 * @property {function(): Set<string>=} getAggregatedRemovals get current aggregated removals that have not yet send to callback
 * @property {function(): Map<string, FileSystemInfoEntry | "ignore">} getFileTimeInfoEntries get info about files
 * @property {function(): Map<string, FileSystemInfoEntry | "ignore">} getContextTimeInfoEntries get info about directories
 * @property {function(): WatcherInfo=} getInfo get info about timestamps and changes
 */
/**
 * @callback WatchMethod
 * @param {Iterable<string>} files watched files
 * @param {Iterable<string>} directories watched directories
 * @param {Iterable<string>} missing watched exitance entries
 * @param {number} startTime timestamp of start time
 * @param {WatchOptions} options options object
 * @param {function(Error=, Map<string, FileSystemInfoEntry | "ignore">, Map<string, FileSystemInfoEntry | "ignore">, Set<string>, Set<string>): void} callback aggregated callback
 * @param {function(string, number): void} callbackUndelayed callback when the first change was detected
 * @returns {Watcher} a watcher
 */
/**
 * @typedef {Object} OutputFileSystem
 * @property {function(string, Buffer|string, Callback): void} writeFile
 * @property {function(string, Callback): void} mkdir
 * @property {function(string, DirentArrayCallback): void=} readdir
 * @property {function(string, Callback): void=} rmdir
 * @property {function(string, Callback): void=} unlink
 * @property {function(string, StatsCallback): void} stat
 * @property {function(string, StatsCallback): void=} lstat
 * @property {function(string, BufferOrStringCallback): void} readFile
 * @property {(function(string, string): string)=} join
 * @property {(function(string, string): string)=} relative
 * @property {(function(string): string)=} dirname
 */
/**
 * @typedef {Object} InputFileSystem
 * @property {function(string, BufferOrStringCallback): void} readFile
 * @property {(function(string, ReadJsonCallback): void)=} readJson
 * @property {function(string, BufferOrStringCallback): void} readlink
 * @property {function(string, DirentArrayCallback): void} readdir
 * @property {function(string, StatsCallback): void} stat
 * @property {function(string, StatsCallback): void=} lstat
 * @property {(function(string, BufferOrStringCallback): void)=} realpath
 * @property {(function(string=): void)=} purge
 * @property {(function(string, string): string)=} join
 * @property {(function(string, string): string)=} relative
 * @property {(function(string): string)=} dirname
 */
/**
 * @typedef {Object} WatchFileSystem
 * @property {WatchMethod} watch
 */
/**
 * @typedef {Object} IntermediateFileSystemExtras
 * @property {function(string): void} mkdirSync
 * @property {function(string): NodeJS.WritableStream} createWriteStream
 * @property {function(string, string, NumberCallback): void} open
 * @property {function(number, Buffer, number, number, number, NumberCallback): void} read
 * @property {function(number, Callback): void} close
 * @property {function(string, string, Callback): void} rename
 */
/** @typedef {InputFileSystem & OutputFileSystem & IntermediateFileSystemExtras} IntermediateFileSystem */
/**
 *
 * @param {InputFileSystem|OutputFileSystem|undefined} fs a file system
 * @param {string} rootPath the root path
 * @param {string} targetPath the target path
 * @returns {string} location of targetPath relative to rootPath
 */
export function relative(
  fs: InputFileSystem | OutputFileSystem | undefined,
  rootPath: string,
  targetPath: string,
): string;
/**
 * @param {InputFileSystem|OutputFileSystem|undefined} fs a file system
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
 * @param {InputFileSystem|OutputFileSystem|undefined} fs a file system
 * @param {string} absPath an absolute path
 * @returns {string} the parent directory of the absolute path
 */
export function dirname(
  fs: InputFileSystem | OutputFileSystem | undefined,
  absPath: string,
): string;
/**
 * @param {OutputFileSystem} fs a file system
 * @param {string} p an absolute path
 * @param {function(Error=): void} callback callback function for the error
 * @returns {void}
 */
export function mkdirp(
  fs: OutputFileSystem,
  p: string,
  callback: (arg0: Error | undefined) => void,
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
/**
 * @param {InputFileSystem} fs a file system
 * @param {string} p an absolute path
 * @param {ReadJsonCallback} callback callback
 * @returns {void}
 */
export function lstatReadlinkAbsolute(
  fs: InputFileSystem,
  p: string,
  callback: ReadJsonCallback,
): void;
