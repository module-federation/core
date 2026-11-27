export = isOnlyReexported;
/** @import Module from "../module/Module" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/**
 * Tells whether every module pulling this one in does so by re-exporting it.
 * One an importer wants for its side effects alone is deliberate, not a
 * barrel's leftover.
 * @param {Module} module the module to look up
 * @param {ModuleGraph} moduleGraph the module graph
 * @returns {boolean} true when only re-exports pull it in
 */
declare function isOnlyReexported(module: Module, moduleGraph: ModuleGraph): boolean;
import type Module from "../module/Module";
import type ModuleGraph from "../graph/ModuleGraph";
