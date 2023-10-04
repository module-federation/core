export = BatchedHash;
declare class BatchedHash extends Hash {
  constructor(hash: any);
  string: string;
  encoding: string;
  hash: any;
  /**
   * Update hash {@link https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding}
   * @param {string|Buffer} data data
   * @param {string=} inputEncoding data encoding
   * @returns {this} updated hash
   */
  update(data: string | Buffer, inputEncoding?: string | undefined): this;
}
import Hash = require('../Hash');
