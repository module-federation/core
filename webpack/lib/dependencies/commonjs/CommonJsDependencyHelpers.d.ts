export function handleDependencyBase(depBase: CommonJSDependencyBaseKeywords, module: Module, runtimeRequirements: Module.RuntimeRequirements, isWorkerEntry?: boolean | undefined): [string, string];
export type CommonJSDependencyBaseKeywords = "exports" | "module.exports" | "this" | "Object.defineProperty(exports)" | "Object.defineProperty(module.exports)" | "Object.defineProperty(this)";
/** @import ChunkGraph from "../../graph/ChunkGraph" */
/** @import Module, { RuntimeRequirements } from "../../module/Module" */
/** @import RuntimeTemplate from "../../template/RuntimeTemplate" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { RuntimeSpec } from "../../util/runtime" */
/** @typedef {"exports" | "module.exports" | "this" | "Object.defineProperty(exports)" | "Object.defineProperty(module.exports)" | "Object.defineProperty(this)"} CommonJSDependencyBaseKeywords */
/**
 * The well-known name of the ESM named export that, when present, is unwrapped
 * by CommonJS `require()` to match Node.js v23+ `require(esm)` semantics:
 * https://nodejs.org/docs/latest/api/modules.html#loading-ecmascript-modules-using-require
 */
export const ESM_MODULE_EXPORTS_NAME: "module.exports";
/**
 * When CommonJS `require()` resolves to an ES module that has a named export
 * with the literal string name `"module.exports"`, Node.js returns the value of
 * that export instead of the namespace object. Returns the property-access
 * expression to apply to the require result for that unwrapping, or `null` if
 * the imported module is not eligible (not strictly ESM, or no such export,
 * or the export was tree-shaken away).
 * @param {Module} importedModule the imported module
 * @param {ModuleGraph} moduleGraph the module graph
 * @param {RuntimeSpec} runtime the runtime for which the module is analysed
 * @returns {string | null} property-access expression (e.g. `["module.exports"]`), or `null`
 */
export function getRequireEsmModuleExportsAccess(importedModule: Module, moduleGraph: ModuleGraph, runtime: RuntimeSpec): string | null;
import type Module from "../../module/Module";
/**
 * Whether `require()` of `importedModule` would trigger Node.js's
 * `require(esm)` `"module.exports"` named-export unwrap. This is the
 * usage-independent eligibility check: it only looks at module type and
 * whether the export is declared, so it can be safely used from
 * `getReferencedExports` before usage info is finalized (otherwise the
 * check would be circular — we'd need `"module.exports"` to already be
 * marked used in order to ask whether to mark it used).
 * @param {Module} importedModule the imported module
 * @param {ModuleGraph} moduleGraph the module graph
 * @returns {boolean} true if `require()` should unwrap `"module.exports"`
 */
export function isRequireEsmModuleExportsModule(importedModule: Module, moduleGraph: ModuleGraph): boolean;
/**
 * Whether the base keyword reads the module's top-level `this`.
 * @param {CommonJSDependencyBaseKeywords} depBase commonjs dependency base
 * @returns {boolean} true when the base is `this`
 */
export function isThisBase(depBase: CommonJSDependencyBaseKeywords): boolean;
/**
 * A classic worker script's top-level `this` is its global scope, not the
 * module's exports. True only for a runtime every entry of which is a worker,
 * so a module imported elsewhere keeps exports semantics in that runtime.
 * @param {Module} module the module
 * @param {ChunkGraph} chunkGraph the chunk graph
 * @param {RuntimeSpec} runtime the runtime code is generated for
 * @param {RuntimeTemplate=} runtimeTemplate the runtime template
 * @returns {boolean} true when `this` is the worker's global scope
 */
export function isWorkerEntryThis(module: Module, chunkGraph: ChunkGraph, runtime: RuntimeSpec, runtimeTemplate?: RuntimeTemplate | undefined): boolean;
import type ModuleGraph from "../../graph/ModuleGraph";
import type { RuntimeSpec } from "../../util/runtime";
import type ChunkGraph from "../../graph/ChunkGraph";
import type RuntimeTemplate from "../../template/RuntimeTemplate";
