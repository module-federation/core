export = HarmonyImportSpecifierDependency;
declare class HarmonyImportSpecifierDependency extends HarmonyImportDependency {
    /**
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
    constructor(request: string, sourceOrder: number, ids: Ids, name: string, range: Range, exportPresenceMode: ExportPresenceMode, phase: ImportPhaseType, attributes: ImportAttributes | undefined, idRanges: IdRanges | undefined);
    ids: HarmonyImportDependency.Ids;
    name: string;
    idRanges: import("../util/chainedImports").IdRanges;
    exportPresenceMode: HarmonyImportDependency.ExportPresenceMode;
    namespaceObjectAsContext: boolean;
    call: any;
    directImport: any;
    shorthand: any;
    asiSafe: any;
    /** @type {UsedByExports | undefined} */
    usedByExports: UsedByExports | undefined;
    /** @type {DestructuringAssignmentProperties | undefined} */
    referencedPropertiesInDestructuring: DestructuringAssignmentProperties | undefined;
    get id(): void;
    getId(): void;
    setId(): void;
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {Ids} the imported ids
     */
    getIds(moduleGraph: ModuleGraph): Ids;
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {Ids} ids the imported ids
     * @returns {void}
     */
    setIds(moduleGraph: ModuleGraph, ids: Ids): void;
    /**
     * @param {Ids=} ids ids
     * @returns {RawReferencedExports} referenced exports
     */
    _getReferencedExportsInDestructuring(ids?: Ids | undefined): RawReferencedExports;
    /**
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {ExportPresenceMode} effective mode
     */
    _getEffectiveExportPresenceLevel(moduleGraph: ModuleGraph): ExportPresenceMode;
    /**
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {WebpackError[] | undefined} errors
     */
    _getErrors(moduleGraph: ModuleGraph): WebpackError[] | undefined;
}
declare namespace HarmonyImportSpecifierDependency {
    export { HarmonyImportSpecifierDependencyTemplate as Template, idsSymbol, ReplaceSource, GetConditionFn, RawReferencedExports, ReferencedExports, DependencyTemplateContext, Module, BuildMeta, ModuleGraph, ConnectionState, WebpackError, DestructuringAssignmentProperties, ImportAttributes, Range, UsedByExports, ObjectDeserializerContext, ObjectSerializerContext, RuntimeSpec, IdRanges, ExportPresenceMode, Ids, ImportPhaseType };
}
import HarmonyImportDependency = require("./HarmonyImportDependency");
declare const HarmonyImportSpecifierDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: HarmonyImportDependency.ReplaceSource, templateContext: HarmonyImportDependency.DependencyTemplateContext): void;
    };
    getImportEmittedRuntime(module: HarmonyImportDependency.Module, referencedModule: HarmonyImportDependency.Module): HarmonyImportDependency.RuntimeSpec | boolean;
};
declare class HarmonyImportSpecifierDependencyTemplate extends HarmonyImportSpecifierDependencyTemplate_base {
    /**
     * @param {HarmonyImportSpecifierDependency} dep dependency
     * @param {ReplaceSource} source source
     * @param {DependencyTemplateContext} templateContext context
     * @param {Ids} ids ids
     * @returns {string} generated code
     */
    _getCodeForIds(dep: HarmonyImportSpecifierDependency, source: ReplaceSource, templateContext: DependencyTemplateContext, ids: Ids): string;
}
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency").GetConditionFn} GetConditionFn */
/** @typedef {import("../Dependency").RawReferencedExports} RawReferencedExports */
/** @typedef {import("../Dependency").ReferencedExports} ReferencedExports */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../ModuleGraphConnection").ConnectionState} ConnectionState */
/** @typedef {import("../WebpackError")} WebpackError */
/** @typedef {import("../javascript/JavascriptParser").DestructuringAssignmentProperties} DestructuringAssignmentProperties */
/** @typedef {import("../javascript/JavascriptParser").ImportAttributes} ImportAttributes */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../optimize/InnerGraph").UsedByExports} UsedByExports */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
/** @typedef {import("../util/chainedImports").IdRanges} IdRanges */
/** @typedef {import("./HarmonyImportDependency").ExportPresenceMode} ExportPresenceMode */
/** @typedef {HarmonyImportDependency.Ids} Ids */
/** @typedef {import("./ImportPhase").ImportPhaseType} ImportPhaseType */
declare const idsSymbol: unique symbol;
type ReplaceSource = import("webpack-sources").ReplaceSource;
type GetConditionFn = import("../Dependency").GetConditionFn;
type RawReferencedExports = import("../Dependency").RawReferencedExports;
type ReferencedExports = import("../Dependency").ReferencedExports;
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type Module = import("../Module");
type BuildMeta = import("../Module").BuildMeta;
type ModuleGraph = import("../ModuleGraph");
type ConnectionState = import("../ModuleGraphConnection").ConnectionState;
type WebpackError = import("../WebpackError");
type DestructuringAssignmentProperties = import("../javascript/JavascriptParser").DestructuringAssignmentProperties;
type ImportAttributes = import("../javascript/JavascriptParser").ImportAttributes;
type Range = import("../javascript/JavascriptParser").Range;
type UsedByExports = import("../optimize/InnerGraph").UsedByExports;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type RuntimeSpec = import("../util/runtime").RuntimeSpec;
type IdRanges = import("../util/chainedImports").IdRanges;
type ExportPresenceMode = import("./HarmonyImportDependency").ExportPresenceMode;
type Ids = HarmonyImportDependency.Ids;
type ImportPhaseType = import("./ImportPhase").ImportPhaseType;
import Dependency = require("../Dependency");
