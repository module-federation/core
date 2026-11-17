export = BulkUpdateHash;
declare class BulkUpdateHash extends Hash {
    /**
     * Creates an instance of BulkUpdateHash.
     * @param {Hash | HashFactory} hashOrFactory function to create a hash
     * @param {string=} hashKey key for caching
     */
    constructor(hashOrFactory: Hash | HashFactory, hashKey?: string | undefined);
    /** @type {undefined | string} */
    hashKey: undefined | string;
    /** @type {undefined | HashFactory} */
    hashFactory: undefined | HashFactory;
    /** @type {undefined | Hash} */
    hash: undefined | Hash;
    /** @type {string} */
    buffer: string;
}
declare namespace BulkUpdateHash {
    export { HashFactory };
}
import Hash = require("../Hash");
type HashFactory = () => Hash;
