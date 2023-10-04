export type Module = import('../Module');
export type ModuleGraph = import('../ModuleGraph');
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
/**
 * @param {ModuleGraph} moduleGraph the module graph
 * @param {Module} module the module
 * @param {boolean | undefined} mangle mangle module and export names
 * @returns {UsedWasmDependency[]} used dependencies and (mangled) name
 */
export function getUsedDependencies(
  moduleGraph: ModuleGraph,
  module: Module,
  mangle: boolean | undefined,
): UsedWasmDependency[];
/** @typedef {import("../Module")} Module */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {Object} UsedWasmDependency
 * @property {WebAssemblyImportDependency} dependency the dependency
 * @property {string} name the export name
 * @property {string} module the module name
 */
export const MANGLED_MODULE: 'a';
import WebAssemblyImportDependency = require('../dependencies/WebAssemblyImportDependency');
