export = BulkUpdateHash;
declare class BulkUpdateHash extends Hash {
    /**
     * @param {Hash | HashFactory} hashOrFactory function to create a hash
     * @param {string=} hashKey key for caching
     */
    constructor(hashOrFactory: Hash | HashFactory, hashKey?: string | undefined);
    hashKey: string;
    hashFactory: HashFactory;
    hash: Hash;
    buffer: string;
}
declare namespace BulkUpdateHash {
    export { Encoding, HashFactory };
}
import Hash = require("../Hash");
type Encoding = import("../../../declarations/WebpackOptions").HashDigest;
type HashFactory = () => Hash;
