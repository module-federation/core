export = getter;
/**
 * Returns etag.
 * @param {HashableObject} obj object with updateHash method
 * @param {HashFunction=} hashFunction the hash function to use
 * @returns {LazyHashedEtag} etag
 */
declare function getter(obj: HashableObject, hashFunction?: Hash.HashFunction | undefined): LazyHashedEtag;
declare namespace getter {
    export { HashConstructor, HashableObject, InnerCache };
}
import type Hash from "../util/Hash";
/** @import Hash, { HashFunction } from "../util/Hash" */
/** @typedef {typeof import("../util/Hash")} HashConstructor */
/**
 * Represents the lazy hashed etag runtime component.
 * @typedef {object} HashableObject
 * @property {(hash: Hash) => void} updateHash
 */
declare class LazyHashedEtag {
    /**
     * Creates an instance of LazyHashedEtag.
     * @param {HashableObject} obj object with updateHash method
     * @param {HashFunction} hashFunction the hash function to use
     */
    constructor(obj: HashableObject, hashFunction?: Hash.HashFunction);
    /** @type {HashableObject | undefined} */
    _obj: HashableObject | undefined;
    /** @type {undefined | string} */
    _hash: undefined | string;
    /** @type {HashFunction} */
    _hashFunction: Hash.HashFunction;
    /**
     * Returns a string representation.
     * @returns {string} hash of object
     */
    toString(): string;
}
type HashConstructor = typeof import("../util/Hash");
/**
 * Represents the lazy hashed etag runtime component.
 */
type HashableObject = {
    updateHash: (hash: Hash) => void;
};
type InnerCache = WeakMap<HashableObject, LazyHashedEtag>;
