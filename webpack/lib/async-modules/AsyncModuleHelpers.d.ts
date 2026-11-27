export type Modules = Set<Module>;
/** @import ModuleGraph from "../graph/ModuleGraph" */
/** @import Module from "../module/Module" */
/** @typedef {Set<Module>} Modules */
/**
 * Gets outgoing async modules.
 * @param {ModuleGraph} moduleGraph module graph
 * @param {Module} module module
 * @returns {Modules} set of modules
 */
export function getOutgoingAsyncModules(moduleGraph: ModuleGraph, module: Module): Modules;
import type Module from "../module/Module";
import type ModuleGraph from "../graph/ModuleGraph";
