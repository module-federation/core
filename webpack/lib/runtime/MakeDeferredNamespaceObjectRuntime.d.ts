export type DeferredCycleState = {
    /**
     * strongly-connected component per module (shared object per component)
     */
    sccOf: Map<Module, Set<Module>>;
    /**
     * memoized SCC peers (component minus the module) per deferred module
     */
    peers: Map<Module, Set<Module> | null>;
};
export class MakeDeferredNamespaceObjectRuntimeModule extends HelperRuntimeModule {
    /**
     * @param {boolean} hasAsyncRuntime if async module is used.
     * @param {boolean} sealed a call site builds a namespace from a known export list
     * @param {boolean} synthesized a call site builds one from the module's exports
     */
    constructor(hasAsyncRuntime: boolean, sealed: boolean, synthesized: boolean);
    /** @type {boolean} */
    hasAsyncRuntime: boolean;
    /** @type {boolean} */
    sealed: boolean;
    /** @type {boolean} */
    synthesized: boolean;
}
export class MakeOptimizedDeferredNamespaceObjectRuntimeModule extends HelperRuntimeModule {
    /**
     * @param {boolean} hasAsyncRuntime if async module is used.
     */
    constructor(hasAsyncRuntime: boolean);
    /** @type {boolean} */
    hasAsyncRuntime: boolean;
}
/**
 * Maps a defer-cycle closure to the runtime module ids whose `evaluating` flag
 * the deferred namespace must check. `resolveId` maps a closure module to the
 * runtime id that carries its evaluation state (its own id, or the id of the
 * concatenated module that absorbed it); unresolved (`null`) members are
 * dropped. Returns `null` when there is nothing to check.
 * @param {Set<Module> | null} closure closure modules, or null when not cyclic
 * @param {(module: Module) => ModuleId | null} resolveId maps a module to its runtime id
 * @returns {ModuleId[] | null} deduplicated runtime ids, or null
 */
export function getDeferredCycleModuleIds(closure: Set<Module> | null, resolveId: (module: Module) => ModuleId | null): ModuleId[] | null;
/**
 * Per the TC39 import-defer spec's `ReadyForSyncExecution`, forcing evaluation
 * of a deferred module must throw when any module in its transitive static
 * import closure is currently evaluating. Only a module in `module`'s own
 * strongly-connected component can be evaluating at that point (anything else it
 * imports is either already evaluated or not started), so we emit just the SCC
 * peers instead of the whole (potentially huge) forward closure.
 * @param {ModuleGraph} moduleGraph the module graph
 * @param {Module} module the deferred module
 * @returns {Set<Module> | null} the SCC peers when cyclic, otherwise null
 */
export function getDeferredCycleModules(moduleGraph: ModuleGraph, module: Module): Set<Module> | null;
/**
 * The module's export names, sorted, when the graph knows them exhaustively.
 * Only a `namespace` module takes the sealed path, and names are never mangled
 * here: materializing a namespace clears `canMangleUse` on every export.
 * @param {ModuleGraph} moduleGraph the module graph
 * @param {Module} module the deferred module
 * @param {ExportsType} exportsType the module's exports type
 * @returns {string[] | null} sorted export names, or null when unknown
 */
export function getKnownExportNames(moduleGraph: ModuleGraph, module: Module, exportsType: Module.ExportsType): string[] | null;
/**
 * @param {ExportsType} exportsType exports type
 * @returns {string} mode
 */
export function getMakeDeferredNamespaceModeFromExportsType(exportsType: Module.ExportsType): string;
/**
 * @param {string} moduleId moduleId
 * @param {ExportsType} exportsType exportsType
 * @param {(ModuleId | null)[]} asyncDepsIds asyncDepsIds
 * @param {ModuleId[] | null} syncCycleDepsIds transitive static closure ids when the module is part of a defer cycle
 * @param {RuntimeRequirements} runtimeRequirements runtime requirements
 * @returns {string} call make optimized deferred namespace object
 */
export function getOptimizedDeferredModule(moduleId: string, exportsType: Module.ExportsType, asyncDepsIds: (ModuleId | null)[], syncCycleDepsIds: ModuleId[] | null, runtimeRequirements: Module.RuntimeRequirements): string;
import type Module from "../module/Module";
import HelperRuntimeModule = require("./HelperRuntimeModule");
import type { ModuleId } from "../graph/ChunkGraph";
import type ModuleGraph from "../graph/ModuleGraph";
