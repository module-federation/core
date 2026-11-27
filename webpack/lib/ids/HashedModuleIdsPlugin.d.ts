export = HashedModuleIdsPlugin;
declare class HashedModuleIdsPlugin {
    /**
     * Creates an instance of HashedModuleIdsPlugin.
     * @param {HashedModuleIdsPluginOptions=} options options object
     */
    constructor(options?: HashedModuleIdsPluginOptions | undefined);
    /** @type {HashedModuleIdsPluginOptions} */
    options: HashedModuleIdsPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace HashedModuleIdsPlugin {
    export { PositiveNumber, NonEmptyString, AbsolutePath, HashFunction, HashedModuleIdsPluginOptions };
}
import type Compiler from "../Compiler";
type PositiveNumber = number;
type NonEmptyString = string;
type AbsolutePath = string;
/**
 * Algorithm used for generation the hash (see node.js crypto package).
 */
type HashFunction = NonEmptyString | typeof import("../util/Hash");
type HashedModuleIdsPluginOptions = {
    /**
     * The context directory for creating names.
     */
    context?: AbsolutePath | undefined;
    /**
     * The encoding to use when generating the hash, defaults to 'base64'. All encodings from Node.JS' hash.digest are supported.
     */
    hashDigest?: ("base64" | "base64url" | "hex" | "binary" | "utf8" | "utf-8" | "utf16le" | "utf-16le" | "latin1" | "ascii" | "ucs2" | "ucs-2") | undefined;
    /**
     * The prefix length of the hash digest to use, defaults to 4.
     */
    hashDigestLength?: PositiveNumber | undefined;
    /**
     * The hashing algorithm to use, defaults to 'md4'. All functions from Node.JS' crypto.createHash are supported.
     */
    hashFunction?: HashFunction | undefined;
};
