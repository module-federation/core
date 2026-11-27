export = WasmChunkLoadingRuntimeModule;
/**
 * @typedef {object} WasmChunkLoadingRuntimeModuleOptions
 * @property {(path: string) => string} generateLoadBinaryCode
 * @property {boolean=} supportsStreaming
 * @property {boolean=} mangleImports
 * @property {ReadOnlyRuntimeRequirements} runtimeRequirements
 * @property {boolean=} fullHashDigest the binary's name inlines a re-encoded compilation hash
 */
declare class WasmChunkLoadingRuntimeModule extends RuntimeModule {
    /**
     * @param {WasmChunkLoadingRuntimeModuleOptions} options options
     */
    constructor({ generateLoadBinaryCode, supportsStreaming, mangleImports, runtimeRequirements, fullHashDigest }: WasmChunkLoadingRuntimeModuleOptions);
    generateLoadBinaryCode: (path: string) => string;
    /** @type {boolean | undefined} */
    supportsStreaming: boolean | undefined;
    /** @type {boolean | undefined} */
    mangleImports: boolean | undefined;
    /** @type {ReadOnlyRuntimeRequirements} */
    _runtimeRequirements: Module.ReadOnlyRuntimeRequirements;
}
declare namespace WasmChunkLoadingRuntimeModule {
    export { Declarations, WasmChunkLoadingRuntimeModuleOptions };
}
import RuntimeModule = require("../runtime/RuntimeModule");
import type Module from "../module/Module";
type Declarations = string[];
type WasmChunkLoadingRuntimeModuleOptions = {
    generateLoadBinaryCode: (path: string) => string;
    supportsStreaming?: boolean | undefined;
    mangleImports?: boolean | undefined;
    runtimeRequirements: Module.ReadOnlyRuntimeRequirements;
    /**
     * the binary's name inlines a re-encoded compilation hash
     */
    fullHashDigest?: boolean | undefined;
};
