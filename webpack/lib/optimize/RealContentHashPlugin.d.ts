export = RealContentHashPlugin;
declare class RealContentHashPlugin {
    /**
     * Creates an instance of RealContentHashPlugin.
     * @param {RealContentHashPluginOptions} options options
     */
    constructor({ hashFunction, hashDigest, onDemand }: RealContentHashPluginOptions);
    /** @type {HashFunction} */
    _hashFunction: HashFunction;
    /** @type {HashDigest} */
    _hashDigest: HashDigest;
    /** @type {boolean} */
    _onDemand: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace RealContentHashPlugin {
    export { getCompilationHooks, Hash, Comparator, Hashes, AssetInfoForRealContentHash, CompilationHooks, RealContentHashPluginOptions };
}
import type { HashFunction } from "../../declarations/WebpackOptions";
import type { HashDigest } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
declare var getCompilationHooks: (compilation: import("../Compilation")) => {
    /**
     * @type {SyncBailHook<[Buffer[], string], string | void>}
     * @since 5.8.0
     */
    updateHash: SyncBailHook<[Buffer[], string], string | void>;
};
type Hash = typeof import("../util/Hash");
/**
 * Defines the comparator type used by this module.
 */
type Comparator<T> = import("../util/comparators").Comparator<T>;
type Hashes = Set<string>;
/**
 * Defines the asset info for real content hash type used by this module.
 */
type AssetInfoForRealContentHash = {
    name: string;
    info: Compilation.AssetInfo;
    source: Source;
    newSource: RawSource | undefined;
    newSourceWithoutOwn: RawSource | undefined;
    content: string;
    ownHashes: Hashes | undefined;
    contentComputePromise: Promise<void> | undefined;
    contentComputeWithoutOwnPromise: Promise<void> | undefined;
    referencedHashes: Hashes | undefined;
    hashes: Hashes;
};
type CompilationHooks = ReturnType<typeof createCompilationHooks>;
/**
 * Defines the real content hash plugin options type used by this module.
 */
type RealContentHashPluginOptions = {
    /**
     * the hash function to use
     */
    hashFunction: HashFunction;
    /**
     * the hash digest to use
     */
    hashDigest: HashDigest;
    /**
     * run only where analyzable output marked a name for repair
     */
    onDemand?: boolean | undefined;
};
import Compilation = require("../Compilation");
import { SyncBailHook } from "tapable";
import type { Source } from "webpack-sources";
import { RawSource } from "webpack-sources";
/** @typedef {Set<string>} Hashes */
/**
 * Defines the asset info for real content hash type used by this module.
 * @typedef {object} AssetInfoForRealContentHash
 * @property {string} name
 * @property {AssetInfo} info
 * @property {Source} source
 * @property {RawSource | undefined} newSource
 * @property {RawSource | undefined} newSourceWithoutOwn
 * @property {string} content
 * @property {Hashes | undefined} ownHashes
 * @property {Promise<void> | undefined} contentComputePromise
 * @property {Promise<void> | undefined} contentComputeWithoutOwnPromise
 * @property {Hashes | undefined} referencedHashes
 * @property {Hashes} hashes
 */
declare function createCompilationHooks(): {
    /**
     * @type {SyncBailHook<[Buffer[], string], string | void>}
     * @since 5.8.0
     */
    updateHash: SyncBailHook<[Buffer[], string], string | void>;
};
