export = Hash;
declare class Hash {
  /**
   * Update hash {@link https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding}
   * @abstract
   * @param {string|Buffer} data data
   * @param {string=} inputEncoding data encoding
   * @returns {this} updated hash
   */
  update(data: string | Buffer, inputEncoding?: string | undefined): this;
  /**
   * Calculates the digest {@link https://nodejs.org/api/crypto.html#crypto_hash_digest_encoding}
   * @abstract
   * @param {string=} encoding encoding of the return value
   * @returns {string|Buffer} digest
   */
  digest(encoding?: string | undefined): string | Buffer;
}
