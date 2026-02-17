export = BatchedHash;
/** @typedef {import("../../../declarations/WebpackOptions").HashDigest} Encoding */
declare class BatchedHash extends Hash {
    /**
     * @param {Hash} hash hash
     */
    constructor(hash: Hash);
    string: string;
    encoding: string;
    hash: Hash;
}
declare namespace BatchedHash {
    export { Encoding };
}
import Hash = require("../Hash");
type Encoding = import("../../../declarations/WebpackOptions").HashDigest;
