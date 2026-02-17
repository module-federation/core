export = getter;
/**
 * @param {HashableObject} obj object with updateHash method
 * @param {string | HashConstructor} hashFunction the hash function to use
 * @returns {LazyHashedEtag} etag
 */
declare function getter(
  obj: HashableObject,
  hashFunction?: string | HashConstructor,
): LazyHashedEtag;
declare namespace getter {
  export { Hash, HashConstructor, HashableObject };
}
type HashableObject = {
  updateHash: (arg0: Hash) => void;
};
type HashConstructor = typeof import('../util/Hash');
/** @typedef {import("../util/Hash")} Hash */
/** @typedef {typeof import("../util/Hash")} HashConstructor */
/**
 * @typedef {Object} HashableObject
 * @property {function(Hash): void} updateHash
 */
declare class LazyHashedEtag {
  /**
   * @param {HashableObject} obj object with updateHash method
   * @param {string | HashConstructor} hashFunction the hash function to use
   */
  constructor(obj: HashableObject, hashFunction?: string | HashConstructor);
  _obj: HashableObject;
  _hash: string;
  _hashFunction: string | typeof import('../util/Hash');
  /**
   * @returns {string} hash of object
   */
  toString(): string;
}
type Hash = import('../util/Hash');
