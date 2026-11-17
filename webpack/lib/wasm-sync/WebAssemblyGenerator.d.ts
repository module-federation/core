export = WebAssemblyGenerator;
/**
 * Represents the web assembly generator runtime component.
 * @typedef {object} WebAssemblyGeneratorOptions
 * @property {boolean=} mangleImports mangle imports
 */
/**
 * The module type the JSDoc inherited from `Generator` names.
 * @typedef {SyncWasmNormalModule} TModule
 */
/**
 * @extends {Generator<TModule>}
 */
declare class WebAssemblyGenerator extends Generator<SyncWasmNormalModule> {
    /**
     * Creates an instance of WebAssemblyGenerator.
     * @param {WebAssemblyGeneratorOptions} options options
     */
    constructor(options: WebAssemblyGeneratorOptions);
    /** @type {WebAssemblyGeneratorOptions} */
    options: WebAssemblyGeneratorOptions;
    /**
     * Generates fallback output for the provided error condition.
     * @param {Error} error the error
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: TModule, generateContext: Generator.GenerateContext): Source | null;
}
declare namespace WebAssemblyGenerator {
    export { NodePath, ArrayBufferTransform, Mapping, WebAssemblyGeneratorOptions, TModule };
}
import type { SyncWasmNormalModule } from "./SyncWasmModule";
import Generator = require("../module/Generator");
import type { Source } from "webpack-sources";
/**
 * Defines the node path type used by this module.
 */
type NodePath<T> = any;
/**
 * Defines the array buffer transform type used by this module.
 */
type ArrayBufferTransform = (buf: ArrayBuffer) => ArrayBuffer;
type Mapping = Map<string, WebAssemblyUtils.UsedWasmDependency>;
/**
 * Represents the web assembly generator runtime component.
 */
type WebAssemblyGeneratorOptions = {
    /**
     * mangle imports
     */
    mangleImports?: boolean | undefined;
};
/**
 * The module type the JSDoc inherited from `Generator` names.
 */
type TModule = SyncWasmNormalModule;
import WebAssemblyUtils = require("./WebAssemblyUtils");
