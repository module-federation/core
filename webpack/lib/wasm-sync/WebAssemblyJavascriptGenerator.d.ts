export = WebAssemblyJavascriptGenerator;
/** @import { SyncWasmNormalModule } from "./SyncWasmModule" */
/** @import { Source } from "webpack-sources" */
/** @import { GenerateContext } from "../module/Generator" */
/** @import ModuleDependency from "../dependencies/core/ModuleDependency" */
/** @import Module, { SourceType, SourceTypes } from "../module/Module" */
/**
 * The module type the JSDoc inherited from `Generator` names.
 * @typedef {SyncWasmNormalModule} TModule
 */
/**
 * @extends {Generator<TModule>}
 */
declare class WebAssemblyJavascriptGenerator extends Generator<SyncWasmNormalModule> {
    constructor();
    /**
     * Generates fallback output for the provided error condition.
     * @param {Error} error the error
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: TModule, generateContext: Generator.GenerateContext): Source | null;
}
declare namespace WebAssemblyJavascriptGenerator {
    export { TModule };
}
import type { SyncWasmNormalModule } from "./SyncWasmModule";
import Generator = require("../module/Generator");
import type { Source } from "webpack-sources";
/**
 * The module type the JSDoc inherited from `Generator` names.
 */
type TModule = SyncWasmNormalModule;
