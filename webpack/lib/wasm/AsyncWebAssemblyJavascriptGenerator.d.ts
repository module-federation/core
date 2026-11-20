export = AsyncWebAssemblyJavascriptGenerator;
/** @import WebAssemblyImportDependency from "../dependencies/wasm/WebAssemblyImportDependency" */
/** @import { Source } from "webpack-sources" */
/** @import AsyncWasmModule from "./AsyncWasmModule" */
/** @import { GenerateContext } from "../module/Generator" */
/** @import Module, { SourceType, SourceTypes } from "../module/Module" */
/** @import NormalModule from "../module/NormalModule" */
/**
 * Represents the async web assembly javascript generator runtime component.
 * @typedef {{ request: string, importVar: string, dependency: WebAssemblyImportDependency }} ImportObjRequestItem
 */
/**
 * The module type the JSDoc inherited from `Generator` names.
 * @typedef {NormalModule} TModule
 */
/**
 * @extends {Generator<TModule>}
 */
declare class AsyncWebAssemblyJavascriptGenerator extends Generator<NormalModule> {
    constructor();
    /**
     * Generate code for source phase import (returns WebAssembly.Module)
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source} generated code
     */
    _generateSourcePhase(module: TModule, generateContext: Generator.GenerateContext): Source;
    /**
     * Generates fallback output for the provided error condition.
     * @param {Error} error the error
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: TModule, generateContext: Generator.GenerateContext): Source | null;
}
declare namespace AsyncWebAssemblyJavascriptGenerator {
    export { ImportObjRequestItem, TModule };
}
import type NormalModule from "../module/NormalModule";
import Generator = require("../module/Generator");
import type { Source } from "webpack-sources";
/**
 * Represents the async web assembly javascript generator runtime component.
 */
type ImportObjRequestItem = {
    request: string;
    importVar: string;
    dependency: WebAssemblyImportDependency;
};
/**
 * The module type the JSDoc inherited from `Generator` names.
 */
type TModule = NormalModule;
import type WebAssemblyImportDependency from "../dependencies/wasm/WebAssemblyImportDependency";
