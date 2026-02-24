export type ModuleGraph = import('../ModuleGraph');
export type Module = import('../Module');
export type Modules = Set<Module>;
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../Module")} Module */
/** @typedef {Set<Module>} Modules */
/**
 * @param {ModuleGraph} moduleGraph module graph
 * @param {Module} module module
 * @returns {Modules} set of modules
 */
export function getOutgoingAsyncModules(
  moduleGraph: ModuleGraph,
  module: Module,
): Modules;
