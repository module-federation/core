export = CopyPlugin;
declare class CopyPlugin {
    /**
     * @param {CopyOptions} options options of the copying
     */
    constructor(options: CopyOptions);
    patterns: import("../../declarations/WebpackOptions").CopyPatterns;
    concurrency: number;
    stage: number;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * @private
     * @param {Compiler} compiler the compiler
     * @param {Compilation} compilation the compilation
     * @param {Logger} logger the logger
     * @param {CacheFacade} cache the cache
     * @returns {Promise<void>}
     */
    private _copy;
    /**
     * @private
     * @param {Compiler} compiler the compiler
     * @param {Compilation} compilation the compilation
     * @param {Logger} logger the logger
     * @param {CacheFacade} cache the cache
     * @param {CopyPattern} item the pattern
     * @param {number} index index of the pattern
     * @returns {Promise<CopiedPattern>} the copied files and the diagnostics
     */
    private _copyPattern;
    /**
     * @private
     * @param {Compiler} compiler the compiler
     * @param {Compilation} compilation the compilation
     * @param {Logger} logger the logger
     * @param {object} options what the `from` is resolved with
     * @param {string} options.from the `from`
     * @param {string} options.context directory a relative `from` is resolved against
     * @param {CopyGlobOptions} options.globOptions options of the glob
     * @param {GlobMatchOptions} options.matchOptions options the glob is matched with
     * @param {IgnoreMatcher} options.ignore what is not copied
     * @param {Set<string>} options.links absolute paths of the symlinks copied as links, filled by the walk
     * @returns {Promise<ResolvedFrom>} the files it reaches
     */
    private _resolveFrom;
    /**
     * @private
     * @param {string} context directory the globs are resolved from
     * @param {string[] | undefined} ignore globs of the files which are not copied
     * @param {GlobMatchOptions} matchOptions options the globs are matched with
     * @returns {IgnoreMatcher} what is not copied
     */
    private _createIgnoreMatcher;
    /**
     * @private
     * @param {string} context context the pattern is resolved from
     * @param {string} pattern glob or path
     * @returns {string} absolute glob with `/` separators
     */
    private _resolveGlob;
    /**
     * @private
     * @param {InputFileSystem} fs input file system
     * @param {Compilation} compilation the compilation
     * @param {TypeOfFrom} typeOfFrom what `from` names
     * @param {string} absoluteFrom absolute path of `from`
     * @param {string} base native base directory of the glob
     * @param {boolean} checkExistence whether a missing directory is watched for its creation
     * @returns {Promise<void>}
     */
    private _addPatternDependency;
    /**
     * @private
     * @param {Compiler} compiler the compiler
     * @param {Compilation} compilation the compilation
     * @param {Logger} logger the logger
     * @param {CacheFacade} cache the cache
     * @param {NormalizedPattern} normalizedPattern the pattern the file belongs to
     * @param {string} absoluteFilename absolute path of the file
     * @returns {Promise<CopiedFile>} the copied file
     */
    private _copyFile;
    /**
     * @private
     * @param {CacheFacade} cache the cache
     * @param {NonNullable<CopyObjectPattern["transform"]>} transform the transform
     * @param {Source} source content of the file
     * @param {string} sourceFilename path of the file, relative to the compiler context
     * @param {string} absoluteFilename absolute path of the file
     * @param {number} index index of the pattern
     * @returns {Promise<Source>} transformed content
     */
    private _transform;
    /**
     * @private
     * @param {Compilation} compilation the compilation
     * @param {Buffer} content content of the asset
     * @returns {string} content hash of the asset
     */
    private _getContentHash;
    /**
     * @private
     * @param {Compilation} compilation the compilation
     * @param {number} startTime time the file was read at
     * @param {string} absoluteFilename absolute path of the file
     * @returns {Promise<InstanceType<Snapshot> | undefined>} snapshot of the file
     */
    private _createSnapshot;
    /**
     * @private
     * @param {Compilation} compilation the compilation
     * @param {InstanceType<Snapshot>} snapshot the snapshot
     * @returns {Promise<boolean>} true, when the snapshot is still valid
     */
    private _checkSnapshotValid;
}
declare namespace CopyPlugin {
    export { getCompilationHooks, CopyPluginCompilationHooks, CopyFilenameFunction, CopyTransform, CopyTransformCacheKeys, CopyTransformCacheKeysFunction, CopiedFileData, CopyToFunction, CopyInfoFunction, TypeOfFrom, CacheEntry, CopiedFile, CopiedPattern, IgnoreMatcher, WalkOptions, ResolvedFrom, NormalizedPattern };
}
import type Compiler from "../Compiler";
import type { CopyOptions } from "../../declarations/WebpackOptions";
declare var getCompilationHooks: (compilation: import("../Compilation")) => {
    /**
     * Answers whether a path is copied, ahead of `globOptions.ignore`: true never copies it, false copies it whatever `globOptions.ignore` says, and nothing leaves the decision to webpack. A directory has to be answered as well as the files below it, because one that is ignored is never walked.
     * @type {SyncBailHook<[string], boolean | void>}
     * @since 5.112.0
     */
    ignore: SyncBailHook<[string], boolean | void>;
};
type CopyPluginCompilationHooks = ReturnType<typeof createCompilationHooks>;
type CopyFilenameFunction = (pathData: Compilation.PathData, assetInfo?: Compilation.AssetInfo | undefined) => string;
type CopyTransform = (content: Buffer, absoluteFilename: string) => string | Buffer | Promise<string | Buffer>;
type CopyTransformCacheKeys = JsonObject;
type CopyTransformCacheKeysFunction = (defaultKeys: CopyTransformCacheKeys, absoluteFilename: string) => CopyTransformCacheKeys | Promise<CopyTransformCacheKeys>;
/**
 * What every callback of a pattern other than `filename` and `transform` reads
 * the file from. `filename` takes webpack's own `(pathData, assetInfo)` instead,
 * as it is a filename template like any other in the configuration.
 */
type CopiedFileData = {
    /**
     * absolute path of the source file
     */
    absoluteFilename: string;
    /**
     * path of the source file, relative to the compiler context
     */
    sourceFilename: string;
    /**
     * path of the copied file, relative to `to`
     */
    filename: string;
};
type CopyToFunction = (file: CopiedFileData) => string;
type CopyInfoFunction = (file: CopiedFileData) => Compilation.AssetInfo;
type TypeOfFrom = "dir" | "file" | "glob";
type CacheEntry = {
    source: Source;
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
type CopiedFile = {
    /**
     * absolute path of the source file
     */
    absoluteFilename: string;
    /**
     * path of the source file, relative to the compiler context
     */
    sourceFilename: string;
    /**
     * path of the asset, relative to `output.path`
     */
    filename: string;
    /**
     * content of the asset
     */
    source: Source;
    /**
     * asset info
     */
    info: Compilation.AssetInfo;
};
type CopiedPattern = {
    files: CopiedFile[];
    errors: WebpackError[];
    warnings: WebpackError[];
};
type IgnoreMatcher = {
    /**
     * whether a file is not copied
     */
    file: (normalizedPath: string) => boolean;
    /**
     * whether a directory is not walked at all
     */
    directory: (normalizedPath: string) => boolean;
};
type WalkOptions = {
    /**
     * input file system
     */
    fs: InputFileSystem;
    /**
     * whether a symlink is resolved rather than copied as a link
     */
    followSymlinks: boolean;
    /**
     * what is not copied
     */
    ignore: IgnoreMatcher;
    /**
     * absolute paths of the symlinks copied as links, filled by the walk
     */
    links: Set<string>;
};
type ResolvedFrom = {
    /**
     * the `from` as the user wrote it
     */
    from: string;
    /**
     * what it names
     */
    typeOfFrom: TypeOfFrom;
    /**
     * absolute glob it resolved to
     */
    glob: string;
    /**
     * directory the glob is anchored on
     */
    base: string;
    /**
     * absolute paths of the files it reaches
     */
    entries: string[];
};
type NormalizedPattern = {
    /**
     * the pattern as the user wrote it
     */
    pattern: CopyObjectPattern;
    /**
     * directory the copied paths are relative to
     */
    base: string;
    /**
     * index of the pattern
     */
    index: number;
    /**
     * absolute paths of the files copied as symbolic links
     */
    links: Set<string>;
};
import Compilation = require("../Compilation");
import { SyncBailHook } from "tapable";
declare function createCompilationHooks(): {
    /**
     * Answers whether a path is copied, ahead of `globOptions.ignore`: true never copies it, false copies it whatever `globOptions.ignore` says, and nothing leaves the decision to webpack. A directory has to be answered as well as the files below it, because one that is ignored is never walked.
     * @type {SyncBailHook<[string], boolean | void>}
     * @since 5.112.0
     */
    ignore: SyncBailHook<[string], boolean | void>;
};
import type { JsonObject } from "../fs/fs";
import type { Source } from "webpack-sources";
import WebpackError = require("../errors/WebpackError");
import type { InputFileSystem } from "../fs/fs";
import type { CopyObjectPattern } from "../../declarations/WebpackOptions";
