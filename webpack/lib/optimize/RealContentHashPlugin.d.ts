export = RealContentHashPlugin;
declare class RealContentHashPlugin {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {CompilationHooks} the attached hooks
   */
  static getCompilationHooks(compilation: Compilation): CompilationHooks;
  /**
   * @param {Object} options options object
   * @param {string | Hash} options.hashFunction the hash function to use
   * @param {string} options.hashDigest the hash digest to use
   */
  constructor({
    hashFunction,
    hashDigest,
  }: {
    hashFunction: string | Hash;
    hashDigest: string;
  });
  _hashFunction: string | typeof import('../util/Hash');
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
  };
}
type Compiler = import('../Compiler');
import Compilation = require('../Compilation');
type CompilationHooks = {
  updateHash: SyncBailHook<[Buffer[], string], string>;
};
type Hash = typeof import('../util/Hash');
type Source = any;
type Etag = import('../Cache').Etag;
type AssetInfo = import('../Compilation').AssetInfo;
type OwnHashes = Set<string>;
type ReferencedHashes = Set<string>;
type Hashes = Set<string>;
type AssetInfoForRealContentHash = {
  name: string;
  info: AssetInfo;
  source: any;
  newSource: RawSource | undefined;
  newSourceWithoutOwn: RawSource | undefined;
  content: string;
  ownHashes: OwnHashes | undefined;
  contentComputePromise: Promise<void> | undefined;
  contentComputeWithoutOwnPromise: Promise<void> | undefined;
  referencedHashes: ReferencedHashes | undefined;
  hashes: Hashes;
};
import { SyncBailHook } from 'tapable';
