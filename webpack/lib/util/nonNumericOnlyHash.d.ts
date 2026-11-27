export = nonNumericOnlyHash;
/**
 * Returns hash that has at least one non numeric char.
 * @param {string} hash hash
 * @param {number} hashLength hash length
 * @returns {string} returns hash that has at least one non numeric char
 */
declare function nonNumericOnlyHash(hash: string, hashLength: number): string;
declare namespace nonNumericOnlyHash {
    export { digestNonNumericOnly };
    export { digestNonNumericOnlyWithFull };
}
/**
 * Digests a hash and truncates it to a content-hash string (non-numeric first char).
 * @param {Hash} hash hash
 * @param {string} hashDigest digest encoding
 * @param {number} hashDigestLength hash length
 * @returns {string} content hash string
 */
declare function digestNonNumericOnly(hash: Hash, hashDigest: string, hashDigestLength: number): string;
/**
 * Digests a hash, returning both the truncated content-hash string and the full
 * (untruncated) digest, so `[contenthash:<digest>]` can re-encode from full entropy.
 * @param {Hash} hash hash
 * @param {string} hashDigest digest encoding
 * @param {number} hashDigestLength hash length
 * @returns {[string, string]} content hash string and full digest
 */
declare function digestNonNumericOnlyWithFull(hash: Hash, hashDigest: string, hashDigestLength: number): [string, string];
import type Hash from "./Hash";
