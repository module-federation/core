export = ESMImportSideEffectDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { GetConditionFn, DependencyKinds } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { ConnectionState } from "../../graph/ModuleGraphConnection" */
/** @import { ImportAttributes } from "../../javascript/JavascriptParser" */
/** @import { ImportPhaseType } from "../core/ImportPhase" */
/** @import { Ids, ExportPresenceMode } from "./ESMImportDependency" */
/** @import { JavascriptModuleBuildMeta } from "../../javascript/JavascriptModule" */
/** @import WebpackError from "../../errors/WebpackError" */
/** @import { ObjectSerializerContext, ObjectDeserializerContext } from "../../serialization/ObjectMiddleware" */
/**
 * Specifiers the module declares but never reads, with the presence level to
 * report them at. Allocated only for a module that has one, so the common
 * import pays a single empty slot.
 * @typedef {object} UnusedSpecifiers
 * @property {ExportPresenceMode} exportPresenceMode
 * @property {[Ids, string][]} specifiers
 */
declare class ESMImportSideEffectDependency extends ESMImportDependency {
    /**
     * Creates an instance of ESMImportSideEffectDependency.
     * @param {string} request the request string
     * @param {number} sourceOrder source order
     * @param {ImportPhaseType} phase import phase
     * @param {ImportAttributes=} attributes import attributes
     */
    constructor(request: string, sourceOrder: number, phase: ImportPhaseType, attributes?: ImportAttributes | undefined);
    /** @type {UnusedSpecifiers | undefined} */
    unusedSpecifiers: UnusedSpecifiers | undefined;
    /** @type {string[] | undefined} */
    namespaceSpecifiers: string[] | undefined;
    /**
     * Get effective export presence level.
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {ExportPresenceMode} effective mode
     */
    _getEffectiveExportPresenceLevel(moduleGraph: ModuleGraph): ESMImportDependency.ExportPresenceMode;
    /**
     * Linking errors for specifiers the module declares but never references.
     * The spec resolves every import entry, so a name that does not exist is a
     * link error whether or not the binding is read.
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {WebpackError[] | undefined} errors
     */
    _getUnusedSpecifierErrors(moduleGraph: ModuleGraph): WebpackError[] | undefined;
}
declare namespace ESMImportSideEffectDependency {
    export { ESMImportSideEffectDependencyTemplate as Template, KINDS, UnusedSpecifiers };
}
import ESMImportDependency = require("./ESMImportDependency");
import type ModuleGraph from "../../graph/ModuleGraph";
import type WebpackError from "../../errors/WebpackError";
import type { ImportPhaseType } from "../core/ImportPhase";
import type { ImportAttributes } from "../../javascript/JavascriptParser";
declare const ESMImportSideEffectDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
        _recordImportBinding(templateContext: DependencyTemplateContext, name: string, value: string): void;
    };
    getImportEmittedRuntime(module: Module, referencedModule: Module): import("../../util/runtime").RuntimeSpec | boolean;
};
declare class ESMImportSideEffectDependencyTemplate extends ESMImportSideEffectDependencyTemplate_base {
    /**
     * Records what each namespace this import declares reads in the generated
     * code, for the source map `scopes` field; every other binding is named by its
     * reference sites. Only a module whose exports are a namespace is answered by
     * the import variable, so every interop shape is left to them.
     * @param {ESMImportSideEffectDependency} dep dependency
     * @param {DependencyTemplateContext} templateContext the context object
     * @param {Module} importedModule the imported module
     * @returns {void}
     */
    _recordNamespaceBindings(dep: ESMImportSideEffectDependency, templateContext: DependencyTemplateContext, importedModule: Module): void;
}
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
/**
 * Specifiers the module declares but never reads, with the presence level to
 * report them at. Allocated only for a module that has one, so the common
 * import pays a single empty slot.
 */
type UnusedSpecifiers = {
    exportPresenceMode: ESMImportDependency.ExportPresenceMode;
    specifiers: [ESMImportDependency.Ids, string][];
};
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
import Module = require("../../module/Module");
