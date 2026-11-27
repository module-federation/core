export = ESMImportSpecifierDependency;
declare class ESMImportSpecifierDependency extends ESMImportDependency {
    /**
     * Creates an instance of ESMImportSpecifierDependency.
     * @param {string} request request
     * @param {number} sourceOrder source order
     * @param {Ids} ids ids
     * @param {string} name name
     * @param {Range} range range
     * @param {ExportPresenceMode} exportPresenceMode export presence mode
     * @param {ImportPhaseType} phase import phase
     * @param {ImportAttributes | undefined} attributes import attributes
     * @param {IdRanges | undefined} idRanges ranges for members of ids; the two arrays are right-aligned
     */
    constructor(request: string, sourceOrder: number, ids: Ids, name: string, range: Range, exportPresenceMode: ESMImportDependency.ExportPresenceMode, phase: ImportPhaseType, attributes: ImportAttributes | undefined, idRanges: IdRanges | undefined);
    /** @type {Ids} */
    ids: Ids;
    /** @type {string} */
    name: string;
    /** @type {IdRanges | undefined} */
    idRanges: IdRanges | undefined;
    /** @type {ExportPresenceMode} */
    exportPresenceMode: ESMImportDependency.ExportPresenceMode;
    /** @type {undefined | boolean} */
    namespaceObjectAsContext: undefined | boolean;
    /** @type {undefined | boolean} */
    call: undefined | boolean;
    /** @type {undefined | boolean} */
    directImport: undefined | boolean;
    /** @type {undefined | boolean | string} */
    shorthand: undefined | boolean | string;
    /** @type {undefined | boolean} */
    asiSafe: undefined | boolean;
    /** @type {UsedByExports | undefined} */
    usedByExports: UsedByExports | undefined;
    /** @type {DestructuringAssignmentProperties | undefined} */
    referencedPropertiesInDestructuring: DestructuringAssignmentProperties | undefined;
    /** @type {DependencyGuard[] | undefined} */
    branchGuards: ESMImportGuard.DependencyGuard[] | undefined;
    /** @type {undefined | boolean} this reference is an assignment target */
    assignment: undefined | boolean;
    /**
     * Returns id.
     * @deprecated
     */
    get id(): void;
    /**
     * Returns id.
     * @deprecated
     */
    getId(): void;
    /**
     * Updates id.
     * @deprecated
     */
    setId(): void;
    /**
     * Returns the imported ids.
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {Ids} the imported ids
     */
    getIds(moduleGraph: ModuleGraph): Ids;
    /**
     * Updates ids using the provided module graph.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {Ids} ids the imported ids
     * @returns {void}
     */
    setIds(moduleGraph: ModuleGraph, ids: Ids): void;
    /**
     * Get referenced exports in destructuring.
     * @param {Ids=} ids ids
     * @returns {ReferencedExports} referenced exports
     */
    _getReferencedExportsInDestructuring(ids?: Ids | undefined): Dependency.ReferencedExports;
    /**
     * Get effective export presence level.
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {ExportPresenceMode} effective mode
     */
    _getEffectiveExportPresenceLevel(moduleGraph: ModuleGraph): ESMImportDependency.ExportPresenceMode;
    /**
     * Returns errors.
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {WebpackError[] | undefined} errors
     */
    _getErrors(moduleGraph: ModuleGraph): WebpackError[] | undefined;
}
declare namespace ESMImportSpecifierDependency {
    export { ESMImportSpecifierDependencyTemplate as Template, idsSymbol, KINDS, Ids };
}
import ESMImportDependency = require("./ESMImportDependency");
import type { IdRanges } from "../helpers/chainedImports";
import type { UsedByExports } from "../../optimize/InnerGraph";
import type { DestructuringAssignmentProperties } from "../../javascript/JavascriptParser";
import ESMImportGuard = require("./ESMImportGuard");
import type ModuleGraph from "../../graph/ModuleGraph";
import Dependency = require("../../graph/Dependency");
import type WebpackError from "../../errors/WebpackError";
import type { Range } from "../../javascript/JavascriptParser";
import type { ImportPhaseType } from "../core/ImportPhase";
import type { ImportAttributes } from "../../javascript/JavascriptParser";
declare const ESMImportSpecifierDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
        _recordImportBinding(templateContext: DependencyTemplateContext, name: string, value: string): void;
    };
    getImportEmittedRuntime(module: Module, referencedModule: Module): RuntimeSpec | boolean;
};
declare class ESMImportSpecifierDependencyTemplate extends ESMImportSpecifierDependencyTemplate_base {
    /**
     * Returns generated code.
     * @param {ESMImportSpecifierDependency} dep dependency
     * @param {ReplaceSource} source source
     * @param {DependencyTemplateContext} templateContext context
     * @param {Ids} ids ids
     * @param {ModuleGraphConnection | undefined} connection the resolved connection for dep
     * @returns {string} generated code
     */
    _getCodeForIds(dep: ESMImportSpecifierDependency, source: ReplaceSource, templateContext: DependencyTemplateContext, ids: Ids, connection: ModuleGraphConnection | undefined): string;
}
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { GetConditionFn, ReferencedExports, UpdateHashContext, DependencyKinds } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import Module, { BuildMeta } from "../../module/Module" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import Hash from "../../util/Hash" */
/**
 * @import ModuleGraphConnection, {
 * 	ConnectionState
 * } from "../../graph/ModuleGraphConnection"
 */
/** @import WebpackError from "../../errors/WebpackError" */
/**
 * @import {
 * 	DestructuringAssignmentProperties,
 * 	ImportAttributes,
 * 	Range
 * } from "../../javascript/JavascriptParser"
 */
/** @import { UsedByExports } from "../../optimize/InnerGraph" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../../serialization/ObjectMiddleware"
 */
/** @import { RuntimeSpec } from "../../util/runtime" */
/** @import { IdRanges } from "../helpers/chainedImports" */
/** @import { ExportPresenceMode } from "./ESMImportDependency" */
/** @typedef {ESMImportDependency.Ids} Ids */
/** @import { ImportPhaseType } from "../core/ImportPhase" */
/** @import { DependencyGuard } from "./ESMImportGuard" */
/**
 * @import {
 * 	JavascriptModuleBuildMeta
 * } from "../../javascript/JavascriptModule"
 */
declare const idsSymbol: symbol;
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type Ids = ESMImportDependency.Ids;
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
import type Module from "../../module/Module";
import type { RuntimeSpec } from "../../util/runtime";
import type ModuleGraphConnection from "../../graph/ModuleGraphConnection";
