export = BatchedHash;
/**
 * @import {
 * 	HashDigest as Encoding
 * } from "../../../declarations/WebpackOptions"
 */
declare class BatchedHash extends Hash {
    /**
     * Creates an instance of BatchedHash.
     * @param {Hash} hash hash
     */
    constructor(hash: Hash);
    /** @type {undefined | string} */
    string: undefined | string;
    /** @type {undefined | Encoding} */
    encoding: undefined | Encoding;
    /** @type {Hash} */
    hash: Hash;
}
import Hash = require("../Hash");
import type { HashDigest as Encoding } from "../../../declarations/WebpackOptions";
