export = ESMExportImportedSpecifierDependency;
/** @typedef {Set<string>} Exports */
/** @typedef {Set<string>} Checked */
/** @typedef {Set<string>} Hidden */
/** @typedef {Set<string>} IgnoredExports */
declare class ESMExportImportedSpecifierDependency extends ESMImportDependency {
    /**
     * Creates an instance of ESMExportImportedSpecifierDependency.
     * @param {string} request the request string
     * @param {number} sourceOrder the order in the original source file
     * @param {Ids} ids the requested export name of the imported module
     * @param {string | null} name the export name of for this module
     * @param {Set<string>} activeExports other named exports in the module
     * @param {ReadonlyArray<ESMExportImportedSpecifierDependency> | null} otherStarExports other star exports in the module before this import
     * @param {ExportPresenceMode} exportPresenceMode mode of checking export names
     * @param {ESMStarExportsList | null} allStarExports all star exports in the module
     * @param {ImportPhaseType} phase import phase
     * @param {ImportAttributes=} attributes import attributes
     */
    constructor(request: string, sourceOrder: number, ids: ESMImportDependency.Ids, name: string | null, activeExports: Set<string>, otherStarExports: ReadonlyArray<ESMExportImportedSpecifierDependency> | null, exportPresenceMode: ESMImportDependency.ExportPresenceMode, allStarExports: ESMStarExportsList | null, phase: ImportPhaseType, attributes?: ImportAttributes | undefined);
    /** @type {Ids} */
    ids: ESMImportDependency.Ids;
    /** @type {string | null} */
    name: string | null;
    /** @type {Set<string>} */
    activeExports: Set<string>;
    otherStarExports: readonly ESMExportImportedSpecifierDependency[];
    /** @type {ExportPresenceMode} */
    exportPresenceMode: ESMImportDependency.ExportPresenceMode;
    /** @type {ESMStarExportsList | null} */
    allStarExports: ESMStarExportsList | null;
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
     * Returns the imported id.
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {Ids} the imported id
     */
    getIds(moduleGraph: ModuleGraph): ESMImportDependency.Ids;
    /**
     * Updates ids using the provided module graph.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {Ids} ids the imported ids
     * @returns {void}
     */
    setIds(moduleGraph: ModuleGraph, ids: ESMImportDependency.Ids): void;
    /**
     * Returns the export mode.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {RuntimeSpec} runtime the runtime
     * @returns {ExportMode} the export mode
     */
    getMode(moduleGraph: ModuleGraph, runtime: RuntimeSpec): ExportMode;
    /**
     * Gets star reexports.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {RuntimeSpec} runtime the runtime
     * @param {ExportsInfo} exportsInfo exports info about the current module (optional)
     * @param {Module} importedModule the imported module (optional)
     * @returns {{ exports?: Exports, checked?: Checked, ignoredExports: IgnoredExports, hidden?: Hidden }} information
     */
    getStarReexports(moduleGraph: ModuleGraph, runtime: RuntimeSpec, exportsInfo?: ExportsInfo, importedModule?: Module): {
        exports?: Exports;
        checked?: Checked;
        ignoredExports: IgnoredExports;
        hidden?: Hidden;
    };
    /**
     * Names this module's `export *` sources provide with conflicting bindings.
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {Set<ExportInfoName> | undefined} ambiguous names, or nothing when there are none
     */
    _getConflictingStarExportNames(moduleGraph: ModuleGraph): Set<Dependency.ExportInfoName> | undefined;
    /**
     * Discover active exports from other star exports.
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {{ names: ExportInfoName[], namesSlice: number, dependencyIndices: DependencyIndices, dependencyIndex: number } | undefined} exported names and their origin dependency
     */
    _discoverActiveExportsFromOtherStarExports(moduleGraph: ModuleGraph): {
        names: Dependency.ExportInfoName[];
        namesSlice: number;
        dependencyIndices: DependencyIndices;
        dependencyIndex: number;
    } | undefined;
    /**
     * Get effective export presence level.
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {ExportPresenceMode} effective mode
     */
    _getEffectiveExportPresenceLevel(moduleGraph: ModuleGraph): ESMImportDependency.ExportPresenceMode;
    /**
     * Reporting level for a circular reexport chain. It skips the promotion to
     * an error that AUTO gives a strict harmony module — a cycle warns by
     * default — but an explicit setting still says whether and how to report.
     * @returns {ExportPresenceMode} effective mode
     */
    _getCircularReexportPresenceLevel(): ESMImportDependency.ExportPresenceMode;
    /**
     * Returns errors for a name resolving through a circular reexport chain.
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {WebpackError[] | undefined} errors
     */
    _getCircularReexportErrors(moduleGraph: ModuleGraph): WebpackError[] | undefined;
    /**
     * Returns errors.
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {WebpackError[] | undefined} errors
     */
    _getErrors(moduleGraph: ModuleGraph): WebpackError[] | undefined;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize(context: ObjectDeserializerContext): void;
}
declare namespace ESMExportImportedSpecifierDependency {
    export { ESMExportImportedSpecifierDependencyTemplate as Template, ESMStarExportsList, idsSymbol, KINDS, SerializedData, ObjectDeserializerContext, ObjectSerializerContext, StarListDeserializerContext, StarListSerializerContext, ExportModeType, ExportModeIgnored, ExportModeHidden, DependencyIndices, Exports, Checked, Hidden, IgnoredExports };
}
import ESMImportDependency = require("./ESMImportDependency");
declare class ESMStarExportsList {
    /** @type {ESMExportImportedSpecifierDependency[]} */
    dependencies: ESMExportImportedSpecifierDependency[];
    /**
     * Processes the provided dep.
     * @param {ESMExportImportedSpecifierDependency} dep dependency
     * @returns {void}
     */
    push(dep: ESMExportImportedSpecifierDependency): void;
    slice(): ESMExportImportedSpecifierDependency[];
    /**
     * Serializes this instance into the provided serializer context.
     * @param {StarListSerializerContext} context context
     */
    serialize({ write, setCircularReference }: StarListSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {StarListDeserializerContext} context context
     */
    deserialize({ read, setCircularReference }: StarListDeserializerContext): void;
}
import type ModuleGraph from "../../graph/ModuleGraph";
import type { RuntimeSpec } from "../../util/runtime";
/** @typedef {Set<string>} ExportModeIgnored */
/** @typedef {Set<string>} ExportModeHidden */
declare class ExportMode {
    /**
     * Creates an instance of ExportMode.
     * @param {ExportModeType} type type of the mode
     */
    constructor(type: ExportModeType);
    /** @type {ExportModeType} */
    type: ExportModeType;
    /** @type {NormalReexportItem[] | null} */
    items: NormalReexportItem[] | null;
    /** @type {string | null} */
    name: string | null;
    /** @type {InstanceType<ExportInfo> | null} */
    partialNamespaceExportInfo: {
        name: Dependency.ExportInfoName;
        _usedName: ExportsInfo.ExportInfoUsedName;
        _globalUsed: ExportsInfo.UsageStateType | undefined;
        _usedInRuntime: ExportsInfo.UsedInRuntime | undefined;
        _hasUseInRuntimeInfo: boolean;
        provided: ExportsInfo.ExportInfoProvided | undefined;
        terminalBinding: boolean;
        canMangleProvide: boolean | undefined;
        _inlinedValue: import("../../optimize/InlineExports").InlinedValue | undefined;
        canMangleUse: boolean | undefined;
        _inlineFlags: number;
        exportsInfoOwned: boolean;
        exportsInfo: ExportsInfo | undefined;
        _target: ExportsInfo.Target | undefined;
        _maxTarget: ExportsInfo.Target | undefined;
        get canInlineProvide(): import("../../optimize/InlineExports").InlinedValue | undefined;
        set canInlineProvide(value: import("../../optimize/InlineExports").InlinedValue | undefined);
        get canInlineUse(): boolean | undefined;
        set canInlineUse(value: boolean | undefined);
        get pureProvide(): boolean | undefined;
        set pureProvide(value: boolean | undefined);
        get canMangle(): boolean;
        canInline(): import("../../optimize/InlineExports").InlinedValue | undefined;
        setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
        setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
        setHasProvideInfo(): void;
        _resetProvideInfo(): void;
        _resetUseInfo(): void;
        setHasUseInfo(): void;
        setUsedConditionally(condition: (condition: UsageStateType) => boolean, newValue: UsageStateType, runtime: RuntimeSpec): boolean;
        setUsed(newValue: UsageStateType, runtime: RuntimeSpec): boolean;
        unsetTarget(key: Dependency): boolean;
        setTarget(key: Dependency, connection: ModuleGraphConnection, exportName?: (Dependency.ExportInfoName[] | null) | undefined, priority?: number | undefined): boolean;
        getUsed(runtime: RuntimeSpec): UsageStateType;
        getUsedName(fallbackName: string | undefined, runtime: RuntimeSpec): string | import("../../optimize/InlineExports").InlinedUsedName | false;
        hasUsedName(): boolean;
        setUsedName(name: string | import("../../optimize/InlineExports").InlinedUsedName): void;
        getTerminalBinding(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): /*elided*/ any | ExportsInfo | undefined;
        isReexport(): boolean;
        _getMaxTarget(): ExportsInfo.Target;
        findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter): FoundTargetItem | null | undefined | false;
        _findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter, alreadyVisited: AlreadyVisitedExportInfo): FoundTargetItem | null | undefined | false;
        getTarget(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): TargetItemWithConnection | undefined;
        hasCircularTarget(moduleGraph: ModuleGraph): boolean;
        _getTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, alreadyVisited: AlreadyVisitedExportInfo | undefined): ExportsInfo.TargetItemWithConnection | unique symbol;
        moveTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, updateOriginalConnection?: ((target: TargetItemWithConnection) => ModuleGraphConnection | undefined) | undefined): TargetItemWithConnection | undefined;
        createNestedExportsInfo(): ExportsInfo;
        getNestedExportsInfo(): ExportsInfo;
        hasInfo(baseInfo: /*elided*/ any, runtime: RuntimeSpec): boolean;
        updateHash(hash: Hash, runtime: RuntimeSpec): void;
        _updateHash(hash: Hash, runtime: RuntimeSpec, alreadyVisitedExportsInfo: Set<ExportsInfo>): void;
        getUsedInfo(): string;
        getProvidedInfo(): "no provided info" | "maybe provided (runtime-defined)" | "provided" | "not provided";
        getRenameInfo(): string;
    };
    /** @type {boolean} */
    circular: boolean;
    /** @type {ExportModeIgnored | null} */
    ignored: ExportModeIgnored | null;
    /** @type {ExportModeHidden | undefined | null} */
    hidden: ExportModeHidden | undefined | null;
    /** @type {string | null} */
    userRequest: string | null;
    /** @type {number} */
    fakeType: number;
}
import type ExportsInfo from "../../graph/ExportsInfo";
import type Module from "../../module/Module";
import Dependency = require("../../graph/Dependency");
import type WebpackError from "../../errors/WebpackError";
import type { ImportPhaseType } from "../core/ImportPhase";
import type { ImportAttributes } from "../../javascript/JavascriptParser";
declare const ESMExportImportedSpecifierDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
        _recordImportBinding(templateContext: DependencyTemplateContext, name: string, value: string): void;
    };
    getImportEmittedRuntime(module: Module, referencedModule: Module): RuntimeSpec | boolean;
};
declare class ESMExportImportedSpecifierDependencyTemplate extends ESMExportImportedSpecifierDependencyTemplate_base {
    /**
     * Add export fragments.
     * @param {InitFragment<GenerateContext>[]} initFragments target array for init fragments
     * @param {ESMExportImportedSpecifierDependency} dep dependency
     * @param {ExportMode} mode the export mode
     * @param {Module} module the current module
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {RuntimeSpec} runtime the runtime
     * @param {RuntimeTemplate} runtimeTemplate the runtime template
     * @param {RuntimeRequirements} runtimeRequirements runtime requirements
     * @param {ConcatenationScope=} concatenationScope concatenation scope of a wrapped module
     * @returns {void}
     */
    _addExportFragments(initFragments: InitFragment<GenerateContext>[], dep: ESMExportImportedSpecifierDependency, mode: ExportMode, module: Module, moduleGraph: ModuleGraph, chunkGraph: ChunkGraph, runtime: RuntimeSpec, runtimeTemplate: RuntimeTemplate, runtimeRequirements: Module.RuntimeRequirements, concatenationScope?: ConcatenationScope | undefined): void;
    /**
     * Gets reexport fragment.
     * @param {Module} module the current module
     * @param {string} comment comment
     * @param {UsedName} key key
     * @param {string} name name
     * @param {UsedName | null} valueKey value key
     * @param {RuntimeRequirements} runtimeRequirements runtime requirements
     * @param {string[]=} ids original ids on the imported side (for inline-rendering comment)
     * @returns {ESMExportInitFragment} harmony export init fragment
     */
    getReexportFragment(module: Module, comment: string, key: ExportsInfo.UsedName, name: string, valueKey: ExportsInfo.UsedName | null, runtimeRequirements: Module.RuntimeRequirements, ids?: string[] | undefined): ESMExportInitFragment;
    /**
     * Gets reexport fake namespace object fragments.
     * @param {Module} module module
     * @param {UsedName} key key
     * @param {string} name name
     * @param {number} fakeType fake type
     * @param {RuntimeRequirements} runtimeRequirements runtime requirements
     * @returns {[InitFragment<GenerateContext>, ESMExportInitFragment]} init fragments
     */
    getReexportFakeNamespaceObjectFragments(module: Module, key: ExportsInfo.UsedName, name: string, fakeType: number, runtimeRequirements: Module.RuntimeRequirements): [InitFragment<GenerateContext>, ESMExportInitFragment];
    /**
     * Gets reexport deferred namespace object fragments.
     * @param {Module} module module
     * @param {ChunkGraph} chunkGraph chunkGraph
     * @param {UsedName} key key
     * @param {string} name name
     * @param {ExportsType} exportsType exportsType
     * @param {RuntimeRequirements} runtimeRequirements runtimeRequirements
     * @returns {InitFragment<GenerateContext>[]} fragments
     */
    getReexportDeferredNamespaceObjectFragments(module: Module, chunkGraph: ChunkGraph, key: ExportsInfo.UsedName, name: string, exportsType: Module.ExportsType, runtimeRequirements: Module.RuntimeRequirements): InitFragment<GenerateContext>[];
    /**
     * Gets conditional reexport statement.
     * @param {Module} module module
     * @param {string} key key
     * @param {string} name name
     * @param {string | string[] | false} valueKey value key
     * @param {RuntimeRequirements} runtimeRequirements runtime requirements
     * @returns {string} result
     */
    getConditionalReexportStatement(module: Module, key: string, name: string, valueKey: string | string[] | false, runtimeRequirements: Module.RuntimeRequirements): string;
    /**
     * Returns value.
     * @param {string} name name
     * @param {null | false | string | string[] | import("../../optimize/InlineExports").InlinedUsedName} valueKey value key
     * @param {string[]=} ids original imported ids (for inline-rendering comment)
     * @returns {string | undefined} value
     */
    getReturnValue(name: string, valueKey: null | false | string | string[] | import("../../optimize/InlineExports").InlinedUsedName, ids?: string[] | undefined): string | undefined;
}
declare const idsSymbol: symbol;
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type SerializedData = [ESMImportDependency.Ids, string | null, Set<string>, ReadonlyArray<ESMExportImportedSpecifierDependency> | null, ESMImportDependency.ExportPresenceMode, ESMStarExportsList | null];
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<SerializedData>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<SerializedData>;
type StarListDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[ESMExportImportedSpecifierDependency[]]>;
type StarListSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[ESMExportImportedSpecifierDependency[]]>;
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
     * Creates an instance of NormalReexportItem.
     * @param {string} name export name
     * @param {Ids} ids reexported ids from other module
     * @param {InstanceType<ExportInfo>} exportInfo export info from other module
     * @param {boolean} checked true, if it should be checked at runtime if this export exists
     * @param {boolean} hidden true, if it is hidden behind another active export in the same module
     */
    constructor(name: string, ids: ESMImportDependency.Ids, exportInfo: {
        name: Dependency.ExportInfoName;
        _usedName: ExportsInfo.ExportInfoUsedName;
        _globalUsed: ExportsInfo.UsageStateType | undefined;
        _usedInRuntime: ExportsInfo.UsedInRuntime | undefined;
        _hasUseInRuntimeInfo: boolean;
        provided: ExportsInfo.ExportInfoProvided | undefined;
        terminalBinding: boolean;
        canMangleProvide: boolean | undefined;
        _inlinedValue: import("../../optimize/InlineExports").InlinedValue | undefined;
        canMangleUse: boolean | undefined;
        _inlineFlags: number;
        exportsInfoOwned: boolean;
        exportsInfo: ExportsInfo | undefined;
        _target: ExportsInfo.Target | undefined;
        _maxTarget: ExportsInfo.Target | undefined;
        get canInlineProvide(): import("../../optimize/InlineExports").InlinedValue | undefined;
        set canInlineProvide(value: import("../../optimize/InlineExports").InlinedValue | undefined);
        get canInlineUse(): boolean | undefined;
        set canInlineUse(value: boolean | undefined);
        get pureProvide(): boolean | undefined;
        set pureProvide(value: boolean | undefined);
        get canMangle(): boolean;
        canInline(): import("../../optimize/InlineExports").InlinedValue | undefined;
        setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
        setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
        setHasProvideInfo(): void;
        _resetProvideInfo(): void;
        _resetUseInfo(): void;
        setHasUseInfo(): void;
        setUsedConditionally(condition: (condition: UsageStateType) => boolean, newValue: UsageStateType, runtime: RuntimeSpec): boolean;
        setUsed(newValue: UsageStateType, runtime: RuntimeSpec): boolean;
        unsetTarget(key: Dependency): boolean;
        setTarget(key: Dependency, connection: ModuleGraphConnection, exportName?: (Dependency.ExportInfoName[] | null) | undefined, priority?: number | undefined): boolean;
        getUsed(runtime: RuntimeSpec): UsageStateType;
        getUsedName(fallbackName: string | undefined, runtime: RuntimeSpec): string | import("../../optimize/InlineExports").InlinedUsedName | false;
        hasUsedName(): boolean;
        setUsedName(name: string | import("../../optimize/InlineExports").InlinedUsedName): void;
        getTerminalBinding(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): /*elided*/ any | ExportsInfo | undefined;
        isReexport(): boolean;
        _getMaxTarget(): ExportsInfo.Target;
        findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter): FoundTargetItem | null | undefined | false;
        _findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter, alreadyVisited: AlreadyVisitedExportInfo): FoundTargetItem | null | undefined | false;
        getTarget(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): TargetItemWithConnection | undefined;
        hasCircularTarget(moduleGraph: ModuleGraph): boolean;
        _getTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, alreadyVisited: AlreadyVisitedExportInfo | undefined): ExportsInfo.TargetItemWithConnection | unique symbol;
        moveTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, updateOriginalConnection?: ((target: TargetItemWithConnection) => ModuleGraphConnection | undefined) | undefined): TargetItemWithConnection | undefined;
        createNestedExportsInfo(): ExportsInfo;
        getNestedExportsInfo(): ExportsInfo;
        hasInfo(baseInfo: /*elided*/ any, runtime: RuntimeSpec): boolean;
        updateHash(hash: Hash, runtime: RuntimeSpec): void;
        _updateHash(hash: Hash, runtime: RuntimeSpec, alreadyVisitedExportsInfo: Set<ExportsInfo>): void;
        getUsedInfo(): string;
        getProvidedInfo(): "no provided info" | "maybe provided (runtime-defined)" | "provided" | "not provided";
        getRenameInfo(): string;
    }, checked: boolean, hidden: boolean);
    /** @type {string} */
    name: string;
    /** @type {Ids} */
    ids: ESMImportDependency.Ids;
    /** @type {InstanceType<ExportInfo>} */
    exportInfo: {
        name: Dependency.ExportInfoName;
        _usedName: ExportsInfo.ExportInfoUsedName;
        _globalUsed: ExportsInfo.UsageStateType | undefined;
        _usedInRuntime: ExportsInfo.UsedInRuntime | undefined;
        _hasUseInRuntimeInfo: boolean;
        provided: ExportsInfo.ExportInfoProvided | undefined;
        terminalBinding: boolean;
        canMangleProvide: boolean | undefined;
        _inlinedValue: import("../../optimize/InlineExports").InlinedValue | undefined;
        canMangleUse: boolean | undefined;
        _inlineFlags: number;
        exportsInfoOwned: boolean;
        exportsInfo: ExportsInfo | undefined;
        _target: ExportsInfo.Target | undefined;
        _maxTarget: ExportsInfo.Target | undefined;
        get canInlineProvide(): import("../../optimize/InlineExports").InlinedValue | undefined;
        set canInlineProvide(value: import("../../optimize/InlineExports").InlinedValue | undefined);
        get canInlineUse(): boolean | undefined;
        set canInlineUse(value: boolean | undefined);
        get pureProvide(): boolean | undefined;
        set pureProvide(value: boolean | undefined);
        get canMangle(): boolean;
        canInline(): import("../../optimize/InlineExports").InlinedValue | undefined;
        setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
        setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
        setHasProvideInfo(): void;
        _resetProvideInfo(): void;
        _resetUseInfo(): void;
        setHasUseInfo(): void;
        setUsedConditionally(condition: (condition: UsageStateType) => boolean, newValue: UsageStateType, runtime: RuntimeSpec): boolean;
        setUsed(newValue: UsageStateType, runtime: RuntimeSpec): boolean;
        unsetTarget(key: Dependency): boolean;
        setTarget(key: Dependency, connection: ModuleGraphConnection, exportName?: (Dependency.ExportInfoName[] | null) | undefined, priority?: number | undefined): boolean;
        getUsed(runtime: RuntimeSpec): UsageStateType;
        getUsedName(fallbackName: string | undefined, runtime: RuntimeSpec): string | import("../../optimize/InlineExports").InlinedUsedName | false;
        hasUsedName(): boolean;
        setUsedName(name: string | import("../../optimize/InlineExports").InlinedUsedName): void;
        getTerminalBinding(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): /*elided*/ any | ExportsInfo | undefined;
        isReexport(): boolean;
        _getMaxTarget(): ExportsInfo.Target;
        findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter): FoundTargetItem | null | undefined | false;
        _findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter, alreadyVisited: AlreadyVisitedExportInfo): FoundTargetItem | null | undefined | false;
        getTarget(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): TargetItemWithConnection | undefined;
        hasCircularTarget(moduleGraph: ModuleGraph): boolean;
        _getTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, alreadyVisited: AlreadyVisitedExportInfo | undefined): ExportsInfo.TargetItemWithConnection | unique symbol;
        moveTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, updateOriginalConnection?: ((target: TargetItemWithConnection) => ModuleGraphConnection | undefined) | undefined): TargetItemWithConnection | undefined;
        createNestedExportsInfo(): ExportsInfo;
        getNestedExportsInfo(): ExportsInfo;
        hasInfo(baseInfo: /*elided*/ any, runtime: RuntimeSpec): boolean;
        updateHash(hash: Hash, runtime: RuntimeSpec): void;
        _updateHash(hash: Hash, runtime: RuntimeSpec, alreadyVisitedExportsInfo: Set<ExportsInfo>): void;
        getUsedInfo(): string;
        getProvidedInfo(): "no provided info" | "maybe provided (runtime-defined)" | "provided" | "not provided";
        getRenameInfo(): string;
    };
    /** @type {boolean} */
    checked: boolean;
    /** @type {boolean} */
    hidden: boolean;
}
import type ModuleGraphConnection from "../../graph/ModuleGraphConnection";
import type Hash from "../../util/Hash";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
import InitFragment = require("../../template/InitFragment");
import type { GenerateContext } from "../../module/Generator";
import type ChunkGraph from "../../graph/ChunkGraph";
import type RuntimeTemplate from "../../template/RuntimeTemplate";
import type ConcatenationScope from "../../optimize/ConcatenationScope";
import ESMExportInitFragment = require("./ESMExportInitFragment");
