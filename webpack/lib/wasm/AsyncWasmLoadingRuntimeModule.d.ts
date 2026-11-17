export = AsyncWasmLoadingRuntimeModule;
/** @import Chunk from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import Compilation from "../Compilation" */
/** @import { RuntimeSpec } from "../util/runtime" */
/** @typedef {(wasmModuleSrcPath: string) => string} GenerateBeforeLoadBinaryCode */
/** @typedef {(wasmModuleSrcPath: string, runtime: RuntimeSpec, analyzable: boolean) => string} GenerateLoadBinaryCode */
/** @typedef {() => string} GenerateBeforeInstantiateStreaming */
/**
 * @typedef {object} AsyncWasmLoadingRuntimeModuleOptions
 * @property {GenerateLoadBinaryCode} generateLoadBinaryCode
 * @property {GenerateBeforeLoadBinaryCode=} generateBeforeLoadBinaryCode
 * @property {GenerateBeforeInstantiateStreaming=} generateBeforeInstantiateStreaming
 * @property {boolean} supportsStreaming
 * @property {boolean=} fullHashDigest the binary's name inlines a re-encoded compilation hash
 */
declare class AsyncWasmLoadingRuntimeModule extends RuntimeModule {
    /**
     * @param {AsyncWasmLoadingRuntimeModuleOptions} options options
     */
    constructor({ generateLoadBinaryCode, generateBeforeLoadBinaryCode, generateBeforeInstantiateStreaming, supportsStreaming, fullHashDigest }: AsyncWasmLoadingRuntimeModuleOptions);
    /** @type {GenerateLoadBinaryCode} */
    generateLoadBinaryCode: GenerateLoadBinaryCode;
    /** @type {generateBeforeLoadBinaryCode | undefined} */
    generateBeforeLoadBinaryCode: GenerateBeforeLoadBinaryCode | undefined;
    /** @type {generateBeforeInstantiateStreaming | undefined} */
    generateBeforeInstantiateStreaming: GenerateBeforeInstantiateStreaming | undefined;
    /** @type {boolean} */
    supportsStreaming: boolean;
}
declare namespace AsyncWasmLoadingRuntimeModule {
    export { GenerateBeforeLoadBinaryCode, GenerateLoadBinaryCode, GenerateBeforeInstantiateStreaming, AsyncWasmLoadingRuntimeModuleOptions };
}
import RuntimeModule = require("../runtime/RuntimeModule");
type GenerateBeforeLoadBinaryCode = (wasmModuleSrcPath: string) => string;
type GenerateLoadBinaryCode = (wasmModuleSrcPath: string, runtime: RuntimeSpec, analyzable: boolean) => string;
type GenerateBeforeInstantiateStreaming = () => string;
type AsyncWasmLoadingRuntimeModuleOptions = {
    generateLoadBinaryCode: GenerateLoadBinaryCode;
    generateBeforeLoadBinaryCode?: GenerateBeforeLoadBinaryCode | undefined;
    generateBeforeInstantiateStreaming?: GenerateBeforeInstantiateStreaming | undefined;
    supportsStreaming: boolean;
    /**
     * the binary's name inlines a re-encoded compilation hash
     */
    fullHashDigest?: boolean | undefined;
};
import type { RuntimeSpec } from "../util/runtime";
