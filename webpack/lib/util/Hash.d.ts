export = Hash;
/** @typedef {import("../../declarations/WebpackOptions").HashDigest} Encoding */
declare class Hash {
  /**
   * Update hash {@link https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding}
   * @abstract
   * @overload
   * @param {string | Buffer} data data
   * @returns {Hash} updated hash
   */
  update(data: string | Buffer): Hash;
  /**
   * Update hash {@link https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding}
   * @abstract
   * @overload
   * @param {string} data data
   * @param {Encoding} inputEncoding data encoding
   * @returns {Hash} updated hash
   */
  update(data: string, inputEncoding: Encoding): Hash;
  /**
   * Calculates the digest {@link https://nodejs.org/api/crypto.html#crypto_hash_digest_encoding}
   * @abstract
   * @overload
   * @returns {Buffer} digest
   */
  digest(): Buffer;
  /**
   * Calculates the digest {@link https://nodejs.org/api/crypto.html#crypto_hash_digest_encoding}
   * @abstract
   * @overload
   * @param {Encoding} encoding encoding of the return value
   * @returns {string} digest
   */
  digest(encoding: Encoding): string;
}
declare namespace Hash {
  export { Encoding };
}
type Encoding = import('../../declarations/WebpackOptions').HashDigest;
