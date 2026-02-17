export = AsyncWasmLoadingRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compilation")} Compilation */
/**
 * @typedef {object} AsyncWasmLoadingRuntimeModuleOptions
 * @property {((wasmModuleSrcPath: string) => string)=} generateBeforeLoadBinaryCode
 * @property {(wasmModuleSrcPath: string) => string} generateLoadBinaryCode
 * @property {(() => string)=} generateBeforeInstantiateStreaming
 * @property {boolean} supportsStreaming
 */
declare class AsyncWasmLoadingRuntimeModule extends RuntimeModule {
    /**
     * @param {AsyncWasmLoadingRuntimeModuleOptions} options options
     */
    constructor({ generateLoadBinaryCode, generateBeforeLoadBinaryCode, generateBeforeInstantiateStreaming, supportsStreaming }: AsyncWasmLoadingRuntimeModuleOptions);
    generateLoadBinaryCode: (wasmModuleSrcPath: string) => string;
    generateBeforeLoadBinaryCode: (wasmModuleSrcPath: string) => string;
    generateBeforeInstantiateStreaming: () => string;
    supportsStreaming: boolean;
}
declare namespace AsyncWasmLoadingRuntimeModule {
    export { Chunk, Compilation, AsyncWasmLoadingRuntimeModuleOptions };
}
import RuntimeModule = require("../RuntimeModule");
type Chunk = import("../Chunk");
type Compilation = import("../Compilation");
type AsyncWasmLoadingRuntimeModuleOptions = {
    generateBeforeLoadBinaryCode?: ((wasmModuleSrcPath: string) => string) | undefined;
    generateLoadBinaryCode: (wasmModuleSrcPath: string) => string;
    generateBeforeInstantiateStreaming?: (() => string) | undefined;
    supportsStreaming: boolean;
};
