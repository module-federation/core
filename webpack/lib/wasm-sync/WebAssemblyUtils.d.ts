/**
 * Defines the used wasm dependency type used by this module.
 */
export type UsedWasmDependency = {
    /**
     * the dependency
     */
    dependency: WebAssemblyImportDependency;
    /**
     * the export name
     */
    name: string;
    /**
     * the module name
     */
    module: string;
};
/** @import WebAssemblyImportDependency from "../dependencies/wasm/WebAssemblyImportDependency" */
/** @import Module from "../module/Module" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/**
 * Defines the used wasm dependency type used by this module.
 * @typedef {object} UsedWasmDependency
 * @property {WebAssemblyImportDependency} dependency the dependency
 * @property {string} name the export name
 * @property {string} module the module name
 */
export const MANGLED_MODULE: "a";
/**
 * Gets used dependencies.
 * @param {ModuleGraph} moduleGraph the module graph
 * @param {Module} module the module
 * @param {boolean | undefined} mangle mangle module and export names
 * @returns {UsedWasmDependency[]} used dependencies and (mangled) name
 */
export function getUsedDependencies(moduleGraph: ModuleGraph, module: Module, mangle: boolean | undefined): UsedWasmDependency[];
import type WebAssemblyImportDependency from "../dependencies/wasm/WebAssemblyImportDependency";
import type ModuleGraph from "../graph/ModuleGraph";
import type Module from "../module/Module";
