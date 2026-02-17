export = create;
/**
 * @param {WebAssembly.Module} wasmModule wasm module
 * @param {WasmHash[]} instancesPool pool of instances
 * @param {number} chunkSize size of data chunks passed to wasm
 * @param {number} digestSize size of digest returned by wasm
 * @returns {WasmHash} wasm hash
 */
declare function create(wasmModule: WebAssembly.Module, instancesPool: WasmHash[], chunkSize: number, digestSize: number): WasmHash;
declare namespace create {
    export { MAX_SHORT_STRING };
}
declare class WasmHash extends Hash {
    /**
     * @param {WebAssembly.Instance} instance wasm instance
     * @param {WebAssembly.Instance[]} instancesPool pool of instances
     * @param {number} chunkSize size of data chunks passed to wasm
     * @param {number} digestSize size of digest returned by wasm
     */
    constructor(instance: WebAssembly.Instance, instancesPool: WebAssembly.Instance[], chunkSize: number, digestSize: number);
    exports: EXPECTED_ANY;
    mem: Buffer<any>;
    buffered: number;
    instancesPool: WebAssembly.Instance[];
    chunkSize: number;
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
     * @param {string} data data
     * @param {BufferEncoding=} encoding encoding
     * @returns {void}
     */
    _updateWithShortString(data: string, encoding?: BufferEncoding | undefined): void;
    /**
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
import Hash = require("../Hash");
