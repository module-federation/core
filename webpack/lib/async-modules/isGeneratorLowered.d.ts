export = isGeneratorLowered;
/** @import Module from "../module/Module" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/** @import RuntimeTemplate from "../template/RuntimeTemplate" */
/**
 * Whether an async module is lowered to a generator: the target has no
 * `async`/`await` but supports generators, and the module contains no
 * top-level `for await…of` or `await using` (which generators can't express).
 * @param {Module} module module
 * @param {ModuleGraph} moduleGraph module graph
 * @param {RuntimeTemplate} runtimeTemplate runtime template
 * @returns {boolean} true when the module should be emitted as a generator
 */
declare function isGeneratorLowered(module: Module, moduleGraph: ModuleGraph, runtimeTemplate: RuntimeTemplate): boolean;
import type Module from "../module/Module";
import type ModuleGraph from "../graph/ModuleGraph";
import type RuntimeTemplate from "../template/RuntimeTemplate";
