export = ESMImportDependency;
declare class ESMImportDependency extends ModuleDependency {
    /**
     * Creates an instance of ESMImportDependency.
     * @param {string} request request string
     * @param {number} sourceOrder source order
     * @param {ImportPhaseType=} phase import phase
     * @param {ImportAttributes=} attributes import attributes
     */
    constructor(request: string, sourceOrder: number, phase?: ImportPhaseType | undefined, attributes?: ImportAttributes | undefined);
    /** @type {ImportPhaseType} */
    phase: ImportPhaseType;
    /** @type {ImportAttributes | undefined} */
    attributes: ImportAttributes | undefined;
    /**
     * Returns name of the variable for the import.
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {string} name of the variable for the import
     */
    getImportVar(moduleGraph: ModuleGraph): string;
    /**
     * Gets module exports.
     * @param {DependencyTemplateContext} context the template context
     * @returns {string} the expression
     */
    getModuleExports({ runtimeTemplate, moduleGraph, chunkGraph, runtimeRequirements }: DependencyTemplateContext): string;
    /**
     * Gets import statement.
     * @param {boolean} update create new variables or update existing one
     * @param {DependencyTemplateContext} templateContext the template context
     * @returns {[string, string]} the import statement and the compat statement
     */
    getImportStatement(update: boolean, { runtimeTemplate, module, moduleGraph, chunkGraph, runtimeRequirements }: DependencyTemplateContext): [string, string];
    /**
     * Gets linking errors.
     * @param {ModuleGraph} moduleGraph module graph
     * @param {Ids} ids imported ids
     * @param {string} additionalMessage extra info included in the error message
     * @returns {WebpackError[] | undefined} errors
     */
    getLinkingErrors(moduleGraph: ModuleGraph, ids: Ids, additionalMessage: string): WebpackError[] | undefined;
}
declare namespace ESMImportDependency {
    export { ESMImportDependencyTemplate as Template, ExportPresenceModes, getNonOptionalPart, KINDS, ExportPresenceMode, Ids };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { ImportPhaseType } from "../core/ImportPhase";
import type { ImportAttributes } from "../../javascript/JavascriptParser";
import type ModuleGraph from "../../graph/ModuleGraph";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
import type WebpackError from "../../errors/WebpackError";
declare const ESMImportDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class ESMImportDependencyTemplate extends ESMImportDependencyTemplate_base {
    /**
     * Gets import emitted runtime.
     * @param {Module} module the module
     * @param {Module} referencedModule the referenced module
     * @returns {RuntimeSpec | boolean} runtimeCondition in which this import has been emitted
     */
    static getImportEmittedRuntime(module: Module, referencedModule: Module): RuntimeSpec | boolean;
    /**
     * Records what a binding the import declares reads in the generated code, so
     * a source map's `scopes` field can name it. Only called while
     * `dependencyTemplates.importBindingScopes` asks for it.
     * @param {DependencyTemplateContext} templateContext the context object
     * @param {string} name the binding's name in the source
     * @param {string} value the expression it reads
     * @returns {void}
     */
    _recordImportBinding(templateContext: DependencyTemplateContext, name: string, value: string): void;
}
declare namespace ExportPresenceModes {
    let NONE: ExportPresenceMode;
    let WARN: ExportPresenceMode;
    let AUTO: ExportPresenceMode;
    let ERROR: ExportPresenceMode;
    /**
     * Returns result.
     * @param {string | false} str param
     * @returns {ExportPresenceMode} result
     */
    function fromUserOption(str: string | false): ExportPresenceMode;
    /**
     * Resolve export presence mode from parser options with a specific key and shared fallbacks.
     * @param {string | false | undefined} specificValue the type-specific option value (e.g. importExportsPresence or reexportExportsPresence)
     * @param {JavascriptParserOptions} options parser options
     * @returns {ExportPresenceMode} resolved mode
     */
    function resolveFromOptions(specificValue: string | false | undefined, options: JavascriptParserOptions): ExportPresenceMode;
}
/**
 * Get the non-optional leading part of a member chain.
 * @param {string[]} members members
 * @param {boolean[]} membersOptionals optionality for each member
 * @returns {string[]} the non-optional prefix
 */
declare function getNonOptionalPart(members: string[], membersOptionals: boolean[]): string[];
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ExportPresenceMode = 0 | 1 | 2 | 3;
type Ids = string[];
import type Module from "../../module/Module";
import type { RuntimeSpec } from "../../util/runtime";
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
import Dependency = require("../../graph/Dependency");
