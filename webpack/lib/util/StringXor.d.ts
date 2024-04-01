export = StringXor;
/** @typedef {import("../util/Hash")} Hash */
/**
 * StringXor class provides methods for performing
 * [XOR operations](https://en.wikipedia.org/wiki/Exclusive_or) on strings. In this context
 * we operating on the character codes of two strings, which are represented as
 * [Buffer](https://nodejs.org/api/buffer.html) objects.
 *
 * We use [StringXor in webpack](https://github.com/webpack/webpack/commit/41a8e2ea483a544c4ccd3e6217bdfb80daffca39)
 * to create a hash of the current state of the compilation. By XOR'ing the Module hashes, it
 * doesn't matter if the Module hashes are sorted or not. This is useful because it allows us to avoid sorting the
 * Module hashes.
 *
 * @example
 * ```js
 * const xor = new StringXor();
 * xor.add('hello');
 * xor.add('world');
 * console.log(xor.toString());
 * ```
 *
 * @example
 * ```js
 * const xor = new StringXor();
 * xor.add('foo');
 * xor.add('bar');
 * const hash = createHash('sha256');
 * hash.update(xor.toString());
 * console.log(hash.digest('hex'));
 * ```
 */
declare class StringXor {
  /** @type {Buffer|undefined} */
  _value: Buffer | undefined;
  /**
   * Adds a string to the current StringXor object.
   *
   * @param {string} str string
   * @returns {void}
   */
  add(str: string): void;
  /**
   * Returns a string that represents the current state of the StringXor object. We chose to use "latin1" encoding
   * here because "latin1" encoding is a single-byte encoding that can represent all characters in the
   * [ISO-8859-1 character set](https://en.wikipedia.org/wiki/ISO/IEC_8859-1). This is useful when working
   * with binary data that needs to be represented as a string.
   *
   * @returns {string} Returns a string that represents the current state of the StringXor object.
   */
  toString(): string;
  /**
   * Updates the hash with the current state of the StringXor object.
   *
   * @param {Hash} hash Hash instance
   */
  updateHash(hash: Hash): void;
}
declare namespace StringXor {
  export { Hash };
}
type Hash = import('../util/Hash');
