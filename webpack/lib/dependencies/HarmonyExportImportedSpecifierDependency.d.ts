export = HarmonyExportImportedSpecifierDependency;
/** @typedef {Set<string>} Exports */
/** @typedef {Set<string>} Checked */
/** @typedef {Set<string>} Hidden */
/** @typedef {Set<string>} IgnoredExports */
declare class HarmonyExportImportedSpecifierDependency extends HarmonyImportDependency {
    /**
     * @param {string} request the request string
     * @param {number} sourceOrder the order in the original source file
     * @param {Ids} ids the requested export name of the imported module
     * @param {string | null} name the export name of for this module
     * @param {Set<string>} activeExports other named exports in the module
     * @param {ReadonlyArray<HarmonyExportImportedSpecifierDependency> | null} otherStarExports other star exports in the module before this import
     * @param {ExportPresenceMode} exportPresenceMode mode of checking export names
     * @param {HarmonyStarExportsList | null} allStarExports all star exports in the module
     * @param {ImportPhaseType} phase import phase
     * @param {ImportAttributes=} attributes import attributes
     */
    constructor(request: string, sourceOrder: number, ids: Ids, name: string | null, activeExports: Set<string>, otherStarExports: ReadonlyArray<HarmonyExportImportedSpecifierDependency> | null, exportPresenceMode: ExportPresenceMode, allStarExports: HarmonyStarExportsList | null, phase: ImportPhaseType, attributes?: ImportAttributes | undefined);
    ids: HarmonyImportDependency.Ids;
    name: string;
    activeExports: Set<string>;
    otherStarExports: readonly HarmonyExportImportedSpecifierDependency[];
    exportPresenceMode: HarmonyImportDependency.ExportPresenceMode;
    allStarExports: HarmonyStarExportsList;
    get id(): void;
    getId(): void;
    setId(): void;
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {Ids} the imported id
     */
    getIds(moduleGraph: ModuleGraph): Ids;
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {Ids} ids the imported ids
     * @returns {void}
     */
    setIds(moduleGraph: ModuleGraph, ids: Ids): void;
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {RuntimeSpec} runtime the runtime
     * @returns {ExportMode} the export mode
     */
    getMode(moduleGraph: ModuleGraph, runtime: RuntimeSpec): ExportMode;
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {RuntimeSpec} runtime the runtime
     * @param {ExportsInfo} exportsInfo exports info about the current module (optional)
     * @param {Module} importedModule the imported module (optional)
     * @returns {{exports?: Exports, checked?: Checked, ignoredExports: IgnoredExports, hidden?: Hidden}} information
     */
    getStarReexports(moduleGraph: ModuleGraph, runtime: RuntimeSpec, exportsInfo?: ExportsInfo, importedModule?: Module): {
        exports?: Exports;
        checked?: Checked;
        ignoredExports: IgnoredExports;
        hidden?: Hidden;
    };
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {{ names: ExportInfoName[], namesSlice: number, dependencyIndices: DependencyIndices, dependencyIndex: number } | undefined} exported names and their origin dependency
     */
    _discoverActiveExportsFromOtherStarExports(moduleGraph: ModuleGraph): {
        names: ExportInfoName[];
        namesSlice: number;
        dependencyIndices: DependencyIndices;
        dependencyIndex: number;
    } | undefined;
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
declare namespace HarmonyExportImportedSpecifierDependency {
    export { HarmonyExportImportedSpecifierDependencyTemplate as Template, HarmonyStarExportsList, idsSymbol, ReplaceSource, ChunkGraph, ExportsSpec, GetConditionFn, RawReferencedExports, ReferencedExports, TRANSITIVE, DependencyTemplateContext, ExportsInfo, ExportInfo, ExportInfoName, UsedName, GenerateContext, Module, BuildMeta, RuntimeRequirements, ExportsType, ModuleGraph, ModuleGraphConnection, ConnectionState, RuntimeTemplate, WebpackError, ImportAttributes, ObjectDeserializerContext, ObjectSerializerContext, RuntimeSpec, Ids, ExportPresenceMode, ImportPhaseType, ExportModeType, ExportModeIgnored, ExportModeHidden, DependencyIndices, Exports, Checked, Hidden, IgnoredExports };
}
import HarmonyImportDependency = require("./HarmonyImportDependency");
declare class HarmonyStarExportsList {
    /** @type {HarmonyExportImportedSpecifierDependency[]} */
    dependencies: HarmonyExportImportedSpecifierDependency[];
    /**
     * @param {HarmonyExportImportedSpecifierDependency} dep dependency
     * @returns {void}
     */
    push(dep: HarmonyExportImportedSpecifierDependency): void;
    slice(): HarmonyExportImportedSpecifierDependency[];
    /**
     * @param {ObjectSerializerContext} context context
     */
    serialize({ write, setCircularReference }: ObjectSerializerContext): void;
    /**
     * @param {ObjectDeserializerContext} context context
     */
    deserialize({ read, setCircularReference }: ObjectDeserializerContext): void;
}
/** @typedef {Set<string>} ExportModeIgnored */
/** @typedef {Set<string>} ExportModeHidden */
declare class ExportMode {
    /**
     * @param {ExportModeType} type type of the mode
     */
    constructor(type: ExportModeType);
    /** @type {ExportModeType} */
    type: ExportModeType;
    /** @type {NormalReexportItem[] | null} */
    items: NormalReexportItem[] | null;
    /** @type {string | null} */
    name: string | null;
    /** @type {ExportInfo | null} */
    partialNamespaceExportInfo: ExportInfo | null;
    /** @type {ExportModeIgnored | null} */
    ignored: ExportModeIgnored | null;
    /** @type {ExportModeHidden | undefined | null} */
    hidden: ExportModeHidden | undefined | null;
    /** @type {string | null} */
    userRequest: string | null;
    /** @type {number} */
    fakeType: number;
}
declare const HarmonyExportImportedSpecifierDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: HarmonyImportDependency.ReplaceSource, templateContext: HarmonyImportDependency.DependencyTemplateContext): void;
    };
    getImportEmittedRuntime(module: HarmonyImportDependency.Module, referencedModule: HarmonyImportDependency.Module): HarmonyImportDependency.RuntimeSpec | boolean;
};
declare class HarmonyExportImportedSpecifierDependencyTemplate extends HarmonyExportImportedSpecifierDependencyTemplate_base {
    /**
     * @param {InitFragment<GenerateContext>[]} initFragments target array for init fragments
     * @param {HarmonyExportImportedSpecifierDependency} dep dependency
     * @param {ExportMode} mode the export mode
     * @param {Module} module the current module
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {RuntimeSpec} runtime the runtime
     * @param {RuntimeTemplate} runtimeTemplate the runtime template
     * @param {RuntimeRequirements} runtimeRequirements runtime requirements
     * @returns {void}
     */
    _addExportFragments(initFragments: InitFragment<GenerateContext>[], dep: HarmonyExportImportedSpecifierDependency, mode: ExportMode, module: Module, moduleGraph: ModuleGraph, chunkGraph: ChunkGraph, runtime: RuntimeSpec, runtimeTemplate: RuntimeTemplate, runtimeRequirements: RuntimeRequirements): void;
    /**
     * @param {Module} module the current module
     * @param {string} comment comment
     * @param {UsedName} key key
     * @param {string} name name
     * @param {UsedName | null} valueKey value key
     * @param {RuntimeRequirements} runtimeRequirements runtime requirements
     * @returns {HarmonyExportInitFragment} harmony export init fragment
     */
    getReexportFragment(module: Module, comment: string, key: UsedName, name: string, valueKey: UsedName | null, runtimeRequirements: RuntimeRequirements): HarmonyExportInitFragment;
    /**
     * @param {Module} module module
     * @param {UsedName} key key
     * @param {string} name name
     * @param {number} fakeType fake type
     * @param {RuntimeRequirements} runtimeRequirements runtime requirements
     * @returns {[InitFragment<GenerateContext>, HarmonyExportInitFragment]} init fragments
     */
    getReexportFakeNamespaceObjectFragments(module: Module, key: UsedName, name: string, fakeType: number, runtimeRequirements: RuntimeRequirements): [InitFragment<GenerateContext>, HarmonyExportInitFragment];
    /**
     * @param {Module} module module
     * @param {ChunkGraph} chunkGraph chunkGraph
     * @param {UsedName} key key
     * @param {string} name name
     * @param {ExportsType} exportsType exportsType
     * @param {RuntimeRequirements} runtimeRequirements runtimeRequirements
     * @returns {InitFragment<GenerateContext>[]} fragments
     */
    getReexportDeferredNamespaceObjectFragments(module: Module, chunkGraph: ChunkGraph, key: UsedName, name: string, exportsType: ExportsType, runtimeRequirements: RuntimeRequirements): InitFragment<GenerateContext>[];
    /**
     * @param {Module} module module
     * @param {string} key key
     * @param {string} name name
     * @param {string | string[] | false} valueKey value key
     * @param {RuntimeRequirements} runtimeRequirements runtime requirements
     * @returns {string} result
     */
    getConditionalReexportStatement(module: Module, key: string, name: string, valueKey: string | string[] | false, runtimeRequirements: RuntimeRequirements): string;
    /**
     * @param {string} name name
     * @param {null | false | string | string[]} valueKey value key
     * @returns {string | undefined} value
     */
    getReturnValue(name: string, valueKey: null | false | string | string[]): string | undefined;
}
declare const idsSymbol: unique symbol;
type ReplaceSource = import("webpack-sources").ReplaceSource;
type ChunkGraph = import("../ChunkGraph");
type ExportsSpec = import("../Dependency").ExportsSpec;
type GetConditionFn = import("../Dependency").GetConditionFn;
type RawReferencedExports = import("../Dependency").RawReferencedExports;
type ReferencedExports = import("../Dependency").ReferencedExports;
type TRANSITIVE = unique symbol;
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type ExportsInfo = import("../ExportsInfo");
type ExportInfo = import("../ExportsInfo").ExportInfo;
type ExportInfoName = import("../ExportsInfo").ExportInfoName;
type UsedName = import("../ExportsInfo").UsedName;
type GenerateContext = import("../Generator").GenerateContext;
type Module = import("../Module");
type BuildMeta = import("../Module").BuildMeta;
type RuntimeRequirements = import("../Module").RuntimeRequirements;
type ExportsType = import("../Module").ExportsType;
type ModuleGraph = import("../ModuleGraph");
type ModuleGraphConnection = import("../ModuleGraphConnection");
type ConnectionState = import("../ModuleGraphConnection").ConnectionState;
type RuntimeTemplate = import("../RuntimeTemplate");
type WebpackError = import("../WebpackError");
type ImportAttributes = import("../javascript/JavascriptParser").ImportAttributes;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type RuntimeSpec = import("../util/runtime").RuntimeSpec;
type Ids = import("./HarmonyImportDependency").Ids;
type ExportPresenceMode = import("./HarmonyImportDependency").ExportPresenceMode;
type ImportPhaseType = import("../dependencies/ImportPhase").ImportPhaseType;
type ExportModeType = "missing" | "unused" | "empty-star" | "reexport-dynamic-default" | "reexport-named-default" | "reexport-namespace-object" | "reexport-fake-namespace-object" | "reexport-undefined" | "normal-reexport" | "dynamic-reexport";
type ExportModeIgnored = Set<string>;
type ExportModeHidden = Set<string>;
type DependencyIndices = number[];
type Exports = Set<string>;
type Checked = Set<string>;
type Hidden = Set<string>;
type IgnoredExports = Set<string>;
declare class NormalReexportItem {
    /**
     * @param {string} name export name
     * @param {Ids} ids reexported ids from other module
     * @param {ExportInfo} exportInfo export info from other module
     * @param {boolean} checked true, if it should be checked at runtime if this export exists
     * @param {boolean} hidden true, if it is hidden behind another active export in the same module
     */
    constructor(name: string, ids: Ids, exportInfo: ExportInfo, checked: boolean, hidden: boolean);
    name: string;
    ids: HarmonyImportDependency.Ids;
    exportInfo: import("../ExportsInfo").ExportInfo;
    checked: boolean;
    hidden: boolean;
}
import Dependency = require("../Dependency");
import InitFragment = require("../InitFragment");
import HarmonyExportInitFragment = require("./HarmonyExportInitFragment");
