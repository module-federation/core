export type RuntimeRequirements = import("../Module").RuntimeRequirements;
export type ExportsType = import("../Module").ExportsType;
export type ModuleId = import("../ChunkGraph").ModuleId;
export class MakeDeferredNamespaceObjectRuntimeModule extends HelperRuntimeModule {
    /**
     * @param {boolean} hasAsyncRuntime if async module is used.
     */
    constructor(hasAsyncRuntime: boolean);
    hasAsyncRuntime: boolean;
}
export class MakeOptimizedDeferredNamespaceObjectRuntimeModule extends HelperRuntimeModule {
    /**
     * @param {boolean} hasAsyncRuntime if async module is used.
     */
    constructor(hasAsyncRuntime: boolean);
    hasAsyncRuntime: boolean;
}
/** @typedef {import("../Module").RuntimeRequirements} RuntimeRequirements */
/** @typedef {import("../Module").ExportsType} ExportsType */
/** @typedef {import("../ChunkGraph").ModuleId} ModuleId */
/**
 * @param {ExportsType} exportsType exports type
 * @returns {string} mode
 */
export function getMakeDeferredNamespaceModeFromExportsType(exportsType: ExportsType): string;
/**
 * @param {string} moduleId moduleId
 * @param {ExportsType} exportsType exportsType
 * @param {(ModuleId | null)[]} asyncDepsIds asyncDepsIds
 * @param {RuntimeRequirements} runtimeRequirements runtime requirements
 * @returns {string} call make optimized deferred namespace object
 */
export function getOptimizedDeferredModule(moduleId: string, exportsType: ExportsType, asyncDepsIds: (ModuleId | null)[], runtimeRequirements: RuntimeRequirements): string;
import HelperRuntimeModule = require("./HelperRuntimeModule");
