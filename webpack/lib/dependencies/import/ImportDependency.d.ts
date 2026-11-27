export = ImportDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import AsyncDependenciesBlock from "../../graph/AsyncDependenciesBlock" */
/**
 * @import {
 * 	GetConditionFn,
 * 	RawReferencedExports,
 * 	ReferencedExports,
 * 	DependencyKinds
 * } from "../../graph/Dependency"
 */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import Module, { BuildMeta } from "../../module/Module" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { ImportAttributes, Range } from "../../javascript/JavascriptParser" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../../serialization/ObjectMiddleware"
 */
/** @import { RuntimeSpec } from "../../util/runtime" */
/** @import { DependencyGuard } from "../esm/ESMImportGuard" */
/** @import { ImportPhaseType } from "../core/ImportPhase" */
declare class ImportDependency extends ModuleDependency {
    /**
     * Creates an instance of ImportDependency.
     * @param {string} request the request
     * @param {Range} range expression range
     * @param {RawReferencedExports | null} referencedExports list of referenced exports
     * @param {ImportPhaseType} phase import phase
     * @param {ImportAttributes=} attributes import attributes
     */
    constructor(request: string, range: Range, referencedExports: Dependency.RawReferencedExports | null, phase: ImportPhaseType, attributes?: ImportAttributes | undefined);
    /** @type {RawReferencedExports | null} */
    referencedExports: Dependency.RawReferencedExports | null;
    /** @type {ImportPhaseType} */
    phase: ImportPhaseType;
    /** @type {ImportAttributes | undefined} */
    attributes: ImportAttributes | undefined;
    /** @type {DependencyGuard[] | undefined} */
    branchGuards: ESMImportGuard.DependencyGuard[] | undefined;
    /** @type {Range | undefined} */
    optionsRange: Range | undefined;
}
declare namespace ImportDependency {
    export { ImportDependencyTemplate as Template };
    export let KINDS: Set<keyof Dependency.DependencyKinds>;
}
import ModuleDependency = require("../core/ModuleDependency");
import Dependency = require("../../graph/Dependency");
import type { ImportPhaseType } from "../core/ImportPhase";
import type { ImportAttributes } from "../../javascript/JavascriptParser";
import ESMImportGuard = require("../esm/ESMImportGuard");
import type { Range } from "../../javascript/JavascriptParser";
declare const ImportDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class ImportDependencyTemplate extends ImportDependencyTemplate_base {
}
