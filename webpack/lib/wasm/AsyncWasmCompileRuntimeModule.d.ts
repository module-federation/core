export = AsyncWasmCompileRuntimeModule;
/** @import Chunk from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import Compilation from "../Compilation" */
/** @import { RuntimeSpec } from "../util/runtime" */
/** @typedef {(wasmModuleSrcPath: string) => string} GenerateBeforeLoadBinaryCode */
/** @typedef {(wasmModuleSrcPath: string, runtime: RuntimeSpec, analyzable: boolean) => string} GenerateLoadBinaryCode */
/** @typedef {() => string} GenerateBeforeCompileStreaming */
/**
 * @typedef {object} AsyncWasmCompileRuntimeModuleOptions
 * @property {GenerateLoadBinaryCode} generateLoadBinaryCode
 * @property {GenerateBeforeLoadBinaryCode=} generateBeforeLoadBinaryCode
 * @property {GenerateBeforeCompileStreaming=} generateBeforeCompileStreaming
 * @property {boolean} supportsStreaming
 * @property {boolean=} fullHashDigest the binary's name inlines a re-encoded compilation hash
 */
declare class AsyncWasmCompileRuntimeModule extends RuntimeModule {
    /**
     * @param {AsyncWasmCompileRuntimeModuleOptions} options options
     */
    constructor({ generateLoadBinaryCode, generateBeforeLoadBinaryCode, generateBeforeCompileStreaming, supportsStreaming, fullHashDigest }: AsyncWasmCompileRuntimeModuleOptions);
    /** @type {GenerateLoadBinaryCode} */
    generateLoadBinaryCode: GenerateLoadBinaryCode;
    /** @type {GenerateBeforeLoadBinaryCode | undefined} */
    generateBeforeLoadBinaryCode: GenerateBeforeLoadBinaryCode | undefined;
    /** @type {GenerateBeforeCompileStreaming | undefined} */
    generateBeforeCompileStreaming: GenerateBeforeCompileStreaming | undefined;
    /** @type {boolean} */
    supportsStreaming: boolean;
}
declare namespace AsyncWasmCompileRuntimeModule {
    export { GenerateBeforeLoadBinaryCode, GenerateLoadBinaryCode, GenerateBeforeCompileStreaming, AsyncWasmCompileRuntimeModuleOptions };
}
import RuntimeModule = require("../runtime/RuntimeModule");
type GenerateBeforeLoadBinaryCode = (wasmModuleSrcPath: string) => string;
type GenerateLoadBinaryCode = (wasmModuleSrcPath: string, runtime: RuntimeSpec, analyzable: boolean) => string;
type GenerateBeforeCompileStreaming = () => string;
type AsyncWasmCompileRuntimeModuleOptions = {
    generateLoadBinaryCode: GenerateLoadBinaryCode;
    generateBeforeLoadBinaryCode?: GenerateBeforeLoadBinaryCode | undefined;
    generateBeforeCompileStreaming?: GenerateBeforeCompileStreaming | undefined;
    supportsStreaming: boolean;
    /**
     * the binary's name inlines a re-encoded compilation hash
     */
    fullHashDigest?: boolean | undefined;
};
import type { RuntimeSpec } from "../util/runtime";
