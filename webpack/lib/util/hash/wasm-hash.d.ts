export = create;
/**
 * Returns wasm hash.
 * @param {WebAssembly.Module} wasmModule wasm module
 * @param {WasmHash[]} instancesPool pool of instances
 * @param {number} chunkSize size of data chunks passed to wasm
 * @param {number} digestSize size of digest returned by wasm
 * @returns {WasmHash} wasm hash
 */
declare function create(wasmModule: WebAssembly.Module, instancesPool: WasmHash[], chunkSize: number, digestSize: number): WasmHash;
declare namespace create {
    export { MAX_SHORT_STRING, WasmExports };
}
/**
 * Represents the wasm hash runtime component.
 * @typedef {object} WasmExports
 * @property {WebAssembly.Memory} memory
 * @property {() => void} init
 * @property {(length: number) => void} update
 * @property {(length: number) => void} final
 */
declare class WasmHash extends Hash {
    /**
     * Creates an instance of WasmHash.
     * @param {WebAssembly.Instance} instance wasm instance
     * @param {WebAssembly.Instance[]} instancesPool pool of instances
     * @param {number} chunkSize size of data chunks passed to wasm
     * @param {number} digestSize size of digest returned by wasm
     */
    constructor(instance: WebAssembly.Instance, instancesPool: WebAssembly.Instance[], chunkSize: number, digestSize: number);
    /** @type {WasmExports} */
    exports: WasmExports;
    /** @type {Buffer} */
    mem: Buffer;
    /** @type {number} */
    buffered: number;
    /** @type {WebAssembly.Instance[]} */
    instancesPool: WebAssembly.Instance[];
    /** @type {number} */
    chunkSize: number;
    /** @type {number} */
    digestSize: number;
    reset(): void;
    /**
     * Update hash {@link https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding}
     * @overload
     * @param {string | Buffer} data data
     * @returns {Hash} updated hash
     */
    update(data: string | Buffer): Hash;
    /**
     * Update hash {@link https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding}
     * @overload
     * @param {string} data data
     * @param {string=} inputEncoding data encoding
     * @returns {this} updated hash
     */
    update(data: string, inputEncoding?: string | undefined): this;
    /**
     * Update with short string.
     * @param {string} data data
     * @param {BufferEncoding=} encoding encoding
     * @returns {void}
     */
    _updateWithShortString(data: string, encoding?: BufferEncoding | undefined): void;
    /**
     * Update with buffer.
     * @param {Buffer} data data
     * @returns {void}
     */
    _updateWithBuffer(data: Buffer): void;
    /**
     * Calculates the digest {@link https://nodejs.org/api/crypto.html#crypto_hash_digest_encoding}
     * @overload
     * @returns {Buffer} digest
     */
    digest(): Buffer;
    /**
     * Calculates the digest {@link https://nodejs.org/api/crypto.html#crypto_hash_digest_encoding}
     * @overload
     * @param {string=} encoding encoding of the return value
     * @returns {string} digest
     */
    digest(encoding?: string | undefined): string;
}
declare const MAX_SHORT_STRING: number;
/**
 * Represents the wasm hash runtime component.
 */
type WasmExports = {
    memory: WebAssembly.Memory;
    init: () => void;
    update: (length: number) => void;
    final: (length: number) => void;
};
import Hash = require("../Hash");
