export = HarmonyImportDependency;
/** @typedef {string[]} Ids */
declare class HarmonyImportDependency extends ModuleDependency {
    /**
     * @param {string} request request string
     * @param {number} sourceOrder source order
     * @param {ImportPhaseType=} phase import phase
     * @param {ImportAttributes=} attributes import attributes
     */
    constructor(request: string, sourceOrder: number, phase?: ImportPhaseType | undefined, attributes?: ImportAttributes | undefined);
    phase: import("./ImportPhase").ImportPhaseType;
    attributes: import("../javascript/JavascriptParser").ImportAttributes;
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {string} name of the variable for the import
     */
    getImportVar(moduleGraph: ModuleGraph): string;
    /**
     * @param {DependencyTemplateContext} context the template context
     * @returns {string} the expression
     */
    getModuleExports({ runtimeTemplate, moduleGraph, chunkGraph, runtimeRequirements }: DependencyTemplateContext): string;
    /**
     * @param {boolean} update create new variables or update existing one
     * @param {DependencyTemplateContext} templateContext the template context
     * @returns {[string, string]} the import statement and the compat statement
     */
    getImportStatement(update: boolean, { runtimeTemplate, module, moduleGraph, chunkGraph, runtimeRequirements }: DependencyTemplateContext): [string, string];
    /**
     * @param {ModuleGraph} moduleGraph module graph
     * @param {Ids} ids imported ids
     * @param {string} additionalMessage extra info included in the error message
     * @returns {WebpackError[] | undefined} errors
     */
    getLinkingErrors(moduleGraph: ModuleGraph, ids: Ids, additionalMessage: string): WebpackError[] | undefined;
}
declare namespace HarmonyImportDependency {
    export { HarmonyImportDependencyTemplate as Template, ExportPresenceModes, ReplaceSource, ReferencedExports, DependencyTemplateContext, ExportsInfo, Module, BuildMeta, ModuleGraph, WebpackError, ImportAttributes, ImportPhaseType, ObjectDeserializerContext, ObjectSerializerContext, RuntimeSpec, ExportPresenceMode, Ids };
}
import ModuleDependency = require("./ModuleDependency");
declare const HarmonyImportDependencyTemplate_base: typeof import("../DependencyTemplate");
declare class HarmonyImportDependencyTemplate extends HarmonyImportDependencyTemplate_base {
    /**
     * @param {Module} module the module
     * @param {Module} referencedModule the referenced module
     * @returns {RuntimeSpec | boolean} runtimeCondition in which this import has been emitted
     */
    static getImportEmittedRuntime(module: Module, referencedModule: Module): RuntimeSpec | boolean;
}
declare namespace ExportPresenceModes {
    let NONE: ExportPresenceMode;
    let WARN: ExportPresenceMode;
    let AUTO: ExportPresenceMode;
    let ERROR: ExportPresenceMode;
    /**
     * @param {string | false} str param
     * @returns {ExportPresenceMode} result
     */
    function fromUserOption(str: string | false): ExportPresenceMode;
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type ReferencedExports = import("../Dependency").ReferencedExports;
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type ExportsInfo = import("../ExportsInfo");
type Module = import("../Module");
type BuildMeta = import("../Module").BuildMeta;
type ModuleGraph = import("../ModuleGraph");
type WebpackError = import("../WebpackError");
type ImportAttributes = import("../javascript/JavascriptParser").ImportAttributes;
type ImportPhaseType = import("./ImportPhase").ImportPhaseType;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type RuntimeSpec = import("../util/runtime").RuntimeSpec;
type ExportPresenceMode = 0 | 1 | 2 | 3 | false;
type Ids = string[];
