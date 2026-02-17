export = RealContentHashPlugin;
declare class RealContentHashPlugin {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {CompilationHooks} the attached hooks
   */
  static getCompilationHooks(compilation: Compilation): CompilationHooks;
  /**
   * @param {RealContentHashPluginOptions} options options
   */
  constructor({ hashFunction, hashDigest }: RealContentHashPluginOptions);
  _hashFunction: import('../../declarations/WebpackOptions').HashFunction;
  _hashDigest: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace RealContentHashPlugin {
  export {
    HashFunction,
    HashDigest,
    Source,
    Etag,
    AssetInfo,
    Compiler,
    Hash,
    OwnHashes,
    ReferencedHashes,
    Hashes,
    AssetInfoForRealContentHash,
    CompilationHooks,
    RealContentHashPluginOptions,
  };
}
import Compilation = require('../Compilation');
type HashFunction = import('../../declarations/WebpackOptions').HashFunction;
type HashDigest = import('../../declarations/WebpackOptions').HashDigest;
type Source = import('webpack-sources').Source;
type Etag = import('../Cache').Etag;
type AssetInfo = import('../Compilation').AssetInfo;
type Compiler = import('../Compiler');
type Hash = typeof import('../util/Hash');
type OwnHashes = Set<string>;
type ReferencedHashes = Set<string>;
type Hashes = Set<string>;
type AssetInfoForRealContentHash = {
  name: string;
  info: AssetInfo;
  source: Source;
  newSource: RawSource | undefined;
  newSourceWithoutOwn: RawSource | undefined;
  content: string;
  ownHashes: OwnHashes | undefined;
  contentComputePromise: Promise<void> | undefined;
  contentComputeWithoutOwnPromise: Promise<void> | undefined;
  referencedHashes: ReferencedHashes | undefined;
  hashes: Hashes;
};
type CompilationHooks = {
  updateHash: SyncBailHook<[Buffer[], string], string | void>;
};
type RealContentHashPluginOptions = {
  /**
   * the hash function to use
   */
  hashFunction: HashFunction;
  /**
   * the hash digest to use
   */
  hashDigest: HashDigest;
};
import { RawSource } from 'webpack-sources';
import { SyncBailHook } from 'tapable';
