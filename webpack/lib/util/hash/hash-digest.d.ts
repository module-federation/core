export type Hash = import("../Hash");
export type Encoding = import("../../../declarations/WebpackOptions").HashDigest;
export type Base = "26" | "32" | "36" | "49" | "52" | "58" | "62";
/**
 * @param {string} data string
 * @param {Base} base base
 * @returns {Buffer} buffer
 */
export function decode(data: string, base: Base): Buffer;
/**
 * @overload
 * @param {Hash} hash hash
 * @returns {Buffer} digest
 */
export function digest(hash: Hash): Buffer;
/**
 * @overload
 * @param {Hash} hash hash
 * @param {undefined} encoding encoding of the return value
 * @param {boolean=} isSafe true when we await right types from digest(), otherwise false
 * @returns {Buffer} digest
 */
export function digest(hash: Hash, encoding: undefined, isSafe?: boolean | undefined): Buffer;
/**
 * @overload
 * @param {Hash} hash hash
 * @param {Encoding} encoding encoding of the return value
 * @param {boolean=} isSafe true when we await right types from digest(), otherwise false
 * @returns {string} digest
 */
export function digest(hash: Hash, encoding: Encoding, isSafe?: boolean | undefined): string;
/**
 * It encodes octet arrays by doing long divisions on all significant digits in the array, creating a representation of that number in the new base.
 * Then for every leading zero in the input (not significant as a number) it will encode as a single leader character.
 * This is the first in the alphabet and will decode as 8 bits. The other characters depend upon the base.
 * For example, a base58 alphabet packs roughly 5.858 bits per character.
 * This means the encoded string 000f (using a base16, 0-f alphabet) will actually decode to 4 bytes unlike a canonical hex encoding which uniformly packs 4 bits into each character.
 * While unusual, this does mean that no padding is required, and it works for bases like 43.
 * @param {Buffer} buffer buffer
 * @param {Base} base base
 * @returns {string} encoded buffer
 */
export function encode(buffer: Buffer, base: Base): string;
/**
 * @param {Hash} hash hash
 * @param {string | Buffer} data data
 * @param {Encoding=} encoding encoding of the return value
 * @returns {void}
 */
export function update(hash: Hash, data: string | Buffer, encoding?: Encoding | undefined): void;
