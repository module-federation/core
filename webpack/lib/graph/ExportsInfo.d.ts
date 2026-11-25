export = ExportsInfo;
declare class ExportsInfo {
    /** @type {Exports} */
    _exports: Exports;
    /** @type {ExportInfo} */
    _otherExportsInfo: ExportInfo;
    /** @type {ExportInfo} */
    _sideEffectsOnlyInfo: ExportInfo;
    /** @type {boolean} */
    _exportsAreOrdered: boolean;
    /** @type {ExportsInfo=} */
    _redirectTo: ExportsInfo | undefined;
    /** @type {boolean} */
    _hasInlinedExports: boolean;
    /**
     * Records that an owned export got an inlined used name.
     * @returns {void}
     */
    markInlinedExports(): void;
    /**
     * Gets owned exports.
     * @returns {Iterable<ExportInfo>} all owned exports in any order
     */
    get ownedExports(): Iterable<ExportInfo>;
    /**
     * Gets ordered owned exports.
     * @returns {Iterable<ExportInfo>} all owned exports in order
     */
    get orderedOwnedExports(): Iterable<ExportInfo>;
    /**
     * Returns all exports in any order.
     * @returns {Iterable<ExportInfo>} all exports in any order
     */
    get exports(): Iterable<ExportInfo>;
    /**
     * Gets ordered exports.
     * @returns {Iterable<ExportInfo>} all exports in order
     */
    get orderedExports(): Iterable<ExportInfo>;
    /**
     * Gets other exports info.
     * @returns {ExportInfo} the export info of unlisted exports
     */
    get otherExportsInfo(): ExportInfo;
    /**
     * Processes the provided export.
     * @param {Exports} exports exports
     * @private
     */
    private _sortExportsMap;
    _sortExports(): void;
    /**
     * Sets redirect named to.
     * @param {ExportsInfo | undefined} exportsInfo exports info
     * @returns {boolean} result
     */
    setRedirectNamedTo(exportsInfo: ExportsInfo | undefined): boolean;
    setHasProvideInfo(): void;
    /**
     * Resets provide-side info so FlagDependencyExports can recompute it on an
     * incremental rebuild against the persisted module graph (which otherwise
     * keeps exports removed by the rebuild, since the plugin only merges).
     * @returns {void}
     */
    _resetProvidedExports(): void;
    /**
     * Resets the use-side info to the undetermined state so FlagDependencyUsage
     * can re-trace usage on an incremental rebuild. The persisted graph keeps a
     * module marked "used", which stops the trace re-queuing it, so exports newly
     * used by a changed importer would never be flagged.
     * @returns {void}
     */
    _resetUsedExports(): void;
    setHasUseInfo(): void;
    /**
     * Gets own export info.
     * @param {ExportInfoName} name export name
     * @returns {ExportInfo} export info for this name
     */
    getOwnExportInfo(name: Dependency.ExportInfoName): ExportInfo;
    /**
     * Adds an export info this exportsInfo owns, allocating its map for the first.
     * @param {ExportInfoName} name export name
     * @returns {ExportInfo} the new export info
     * @private
     */
    private _createOwnExportInfo;
    /**
     * Returns export info for this name.
     * @param {ExportInfoName} name export name
     * @returns {ExportInfo} export info for this name
     */
    getExportInfo(name: Dependency.ExportInfoName): ExportInfo;
    /**
     * Gets read only export info.
     * @param {ExportInfoName} name export name
     * @returns {InstanceType<ExportInfo>} export info for this name
     */
    getReadOnlyExportInfo(name: Dependency.ExportInfoName): InstanceType<ExportInfo>;
    /**
     * Gets read only export info recursive.
     * @param {ExportInfoName[]} name export name
     * @returns {ExportInfo | undefined} export info for this name
     */
    getReadOnlyExportInfoRecursive(name: Dependency.ExportInfoName[]): ExportInfo | undefined;
    /**
     * Gets nested exports info.
     * @param {ExportInfoName[]=} name the export name
     * @returns {ExportsInfo | undefined} the nested exports info
     */
    getNestedExportsInfo(name?: Dependency.ExportInfoName[] | undefined): ExportsInfo | undefined;
    /**
     * Sets unknown exports provided.
     * @param {boolean=} canMangle true, if exports can still be mangled (defaults to false)
     * @param {ExportsSpecExcludeExports=} excludeExports list of unaffected exports
     * @param {Dependency=} targetKey use this as key for the target
     * @param {ModuleGraphConnection=} targetModule set this module as target
     * @param {number=} priority priority
     * @returns {boolean} true, if this call changed something
     */
    setUnknownExportsProvided(canMangle?: boolean | undefined, excludeExports?: Dependency.ExportsSpecExcludeExports | undefined, targetKey?: Dependency | undefined, targetModule?: ModuleGraphConnection | undefined, priority?: number | undefined): boolean;
    /**
     * Sets used in unknown way.
     * @param {RuntimeSpec} runtime the runtime
     * @returns {boolean} true, when something changed
     */
    setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
    /**
     * Sets used without info.
     * @param {RuntimeSpec} runtime the runtime
     * @returns {boolean} true, when something changed
     */
    setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
    /**
     * Sets all known exports used.
     * @param {RuntimeSpec} runtime the runtime
     * @returns {boolean} true, when something changed
     */
    setAllKnownExportsUsed(runtime: RuntimeSpec): boolean;
    /**
     * Sets used for side effects only.
     * @param {RuntimeSpec} runtime the runtime
     * @returns {boolean} true, when something changed
     */
    setUsedForSideEffectsOnly(runtime: RuntimeSpec): boolean;
    /**
     * Checks whether this exports info is used.
     * @param {RuntimeSpec} runtime the runtime
     * @returns {boolean} true, when the module exports are used in any way
     */
    isUsed(runtime: RuntimeSpec): boolean;
    /**
     * Checks whether this exports info is module used.
     * @param {RuntimeSpec} runtime the runtime
     * @returns {boolean} true, when the module is used in any way
     */
    isModuleUsed(runtime: RuntimeSpec): boolean;
    /**
     * Returns set of used exports, or true (when namespace object is used), or false (when unused), or null (when unknown).
     * @param {RuntimeSpec} runtime the runtime
     * @returns {SortableSet<ExportInfoName> | boolean | null} set of used exports, or true (when namespace object is used), or false (when unused), or null (when unknown)
     */
    getUsedExports(runtime: RuntimeSpec): SortableSet<Dependency.ExportInfoName> | boolean | null;
    /**
     * Gets provided exports.
     * @returns {null | true | ExportInfoName[]} list of exports when known
     */
    getProvidedExports(): null | true | Dependency.ExportInfoName[];
    /**
     * Gets relevant exports.
     * @param {RuntimeSpec} runtime the runtime
     * @returns {ExportInfo[]} exports that are relevant (not unused and potential provided)
     */
    getRelevantExports(runtime: RuntimeSpec): ExportInfo[];
    /**
     * Checks whether this exports info is export provided.
     * @param {ExportInfoName | ExportInfoName[]} name the name of the export
     * @returns {boolean | undefined | null} if the export is provided
     */
    isExportProvided(name: Dependency.ExportInfoName | Dependency.ExportInfoName[]): boolean | undefined | null;
    /**
     * Returns key representing the usage.
     * @param {RuntimeSpec} runtime runtime
     * @returns {string} key representing the usage
     */
    getUsageKey(runtime: RuntimeSpec): string;
    /**
     * Checks whether this exports info is equally used.
     * @param {RuntimeSpec} runtimeA first runtime
     * @param {RuntimeSpec} runtimeB second runtime
     * @returns {boolean} true, when equally used
     */
    isEquallyUsed(runtimeA: RuntimeSpec, runtimeB: RuntimeSpec): boolean;
    /**
     * Returns usage status.
     * @param {ExportInfoName | ExportInfoName[]} name export name
     * @param {RuntimeSpec} runtime check usage for this runtime only
     * @returns {UsageStateType} usage status
     */
    getUsed(name: Dependency.ExportInfoName | Dependency.ExportInfoName[], runtime: RuntimeSpec): UsageStateType;
    /**
     * Returns the used name.
     * @param {ExportInfoName | ExportInfoName[]} name the export name
     * @param {RuntimeSpec} runtime check usage for this runtime only
     * @returns {UsedName} the used name
     */
    getUsedName(name: Dependency.ExportInfoName | Dependency.ExportInfoName[], runtime: RuntimeSpec): UsedName;
    /**
     * Checks whether `getUsedName(name, runtime)` would return an `InlinedUsedName`,
     * without allocating intermediate used-name arrays (hot path for connection conditions).
     * @param {ExportInfoName[]} name the export name path
     * @param {RuntimeSpec} runtime check usage for this runtime only
     * @returns {boolean} true when the used name resolves to an inlined value
     */
    hasInlinedUsedName(name: Dependency.ExportInfoName[], runtime: RuntimeSpec): boolean;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash the hash
     * @param {RuntimeSpec} runtime the runtime
     * @returns {void}
     */
    updateHash(hash: Hash, runtime: RuntimeSpec): void;
    /**
     * Updates hash using the provided hash.
     * @param {Hash} hash the hash
     * @param {RuntimeSpec} runtime the runtime
     * @param {Set<ExportsInfo>} alreadyVisitedExportsInfo for circular references
     * @returns {void}
     */
    _updateHash(hash: Hash, runtime: RuntimeSpec, alreadyVisitedExportsInfo: Set<ExportsInfo>): void;
    /**
     * Gets restore provided data.
     * @returns {RestoreProvidedData} restore provided data
     */
    getRestoreProvidedData(): RestoreProvidedData;
    /**
     * Processes the provided data.
     * @param {RestoreProvidedData} data data
     */
    restoreProvided({ otherProvided, otherCanMangleProvide, otherTerminalBinding, exports }: RestoreProvidedData): void;
}
declare namespace ExportsInfo {
    export { ExportInfo, RestoreProvidedData, UsageState, RestoreProvidedDataTuple, ObjectDeserializerContext, ObjectSerializerContext, RuntimeUsageStateType, UsageStateType, UsedInRuntime, FoundTargetItem, TargetItemWithConnection, ResolveTargetFilter, ValidTargetModuleFilter, TargetItem, Target, ExportInfoUsedName, ExportInfoProvided, Exports, UsedName, AlreadyVisitedExportInfo, RestoreProvidedDataExports };
}
declare class ExportInfo {
    /**
     * Creates an instance of ExportInfo.
     * @param {ExportInfoName | null} name the original name of the export
     * @param {ExportInfo=} initFrom init values from this ExportInfo
     */
    constructor(name: Dependency.ExportInfoName | null, initFrom?: ExportInfo | undefined);
    /** @type {ExportInfoName} */
    name: Dependency.ExportInfoName;
    /**
     * @private
     * @type {ExportInfoUsedName}
     */
    private _usedName;
    /**
     * @private
     * @type {UsageStateType | undefined}
     */
    private _globalUsed;
    /**
     * @private
     * @type {UsedInRuntime | undefined}
     */
    private _usedInRuntime;
    /**
     * @private
     * @type {boolean}
     */
    private _hasUseInRuntimeInfo;
    /**
     * true: it is provided
     * false: it is not provided
     * null: only the runtime knows if it is provided
     * undefined: it was not determined if it is provided
     * @type {ExportInfoProvided | undefined}
     */
    provided: ExportInfoProvided | undefined;
    /**
     * is the export a terminal binding that should be checked for export star conflicts
     * @type {boolean}
     */
    terminalBinding: boolean;
    /**
     * true: it can be mangled
     * false: is can not be mangled
     * undefined: it was not determined if it can be mangled
     * @type {boolean | undefined}
     */
    canMangleProvide: boolean | undefined;
    /**
     * value slot for `canInlineProvide`
     * @private
     * @type {InlinedValue | undefined}
     */
    private _inlinedValue;
    /**
     * true: it can be mangled
     * false: is can not be mangled
     * undefined: it was not determined if it can be mangled
     * @type {boolean | undefined}
     */
    canMangleUse: boolean | undefined;
    /**
     * bitfield backing `canInlineUse` and `pureProvide`
     * @private
     * @type {number}
     */
    private _inlineFlags;
    /** @type {boolean} */
    exportsInfoOwned: boolean;
    /** @type {ExportsInfo | undefined} */
    exportsInfo: ExportsInfo | undefined;
    /** @type {Target | undefined} */
    _target: Target | undefined;
    /** @type {Target | undefined} */
    _maxTarget: Target | undefined;
    set canInlineProvide(value: InlinedValue | undefined);
    /**
     * defined: the export binds to a small primitive constant and may be inlined
     * undefined: not an inlined constant export
     * @returns {InlinedValue | undefined} inlined value
     */
    get canInlineProvide(): InlinedValue | undefined;
    set canInlineUse(value: boolean | undefined);
    /**
     * true: at least one consumer accepts inlining, none rejected
     * false: at least one consumer rejected inlining
     * undefined: collecting; no consumer has decided yet
     * @returns {boolean | undefined} can inline use
     */
    get canInlineUse(): boolean | undefined;
    set pureProvide(value: boolean | undefined);
    /**
     * Only specific export info can be pure, so other_export_info.pure is always undefined.
     * true: calling the export has no observable side effects
     * undefined: it was not determined whether the export is pure
     * @returns {boolean | undefined} pure provide
     */
    get pureProvide(): boolean | undefined;
    get canMangle(): boolean;
    /**
     * @returns {InlinedValue | undefined} the inlined value when both provide and use sides agree, otherwise undefined
     */
    canInline(): InlinedValue | undefined;
    /**
     * Sets used in unknown way.
     * @param {RuntimeSpec} runtime only apply to this runtime
     * @returns {boolean} true, when something changed
     */
    setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
    /**
     * Sets used without info.
     * @param {RuntimeSpec} runtime only apply to this runtime
     * @returns {boolean} true, when something changed
     */
    setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
    setHasProvideInfo(): void;
    /**
     * Resets provide-side info to the undetermined state (use info untouched).
     * @returns {void}
     */
    _resetProvideInfo(): void;
    /**
     * Resets the use-side info to the undetermined state (provide info untouched,
     * incl. the pure-provide bit) so FlagDependencyUsage can re-trace it.
     * @returns {void}
     */
    _resetUseInfo(): void;
    setHasUseInfo(): void;
    /**
     * Sets used conditionally.
     * @param {(condition: UsageStateType) => boolean} condition compare with old value
     * @param {UsageStateType} newValue set when condition is true
     * @param {RuntimeSpec} runtime only apply to this runtime
     * @returns {boolean} true when something has changed
     */
    setUsedConditionally(condition: (condition: UsageStateType) => boolean, newValue: UsageStateType, runtime: RuntimeSpec): boolean;
    /**
     * Updates used using the provided new value.
     * @param {UsageStateType} newValue new value of the used state
     * @param {RuntimeSpec} runtime only apply to this runtime
     * @returns {boolean} true when something has changed
     */
    setUsed(newValue: UsageStateType, runtime: RuntimeSpec): boolean;
    /**
     * Returns true, if something has changed.
     * @param {Dependency} key the key
     * @returns {boolean} true, if something has changed
     */
    unsetTarget(key: Dependency): boolean;
    /**
     * Updates target using the provided key.
     * @param {Dependency} key the key
     * @param {ModuleGraphConnection} connection the target module if a single one
     * @param {ExportInfoName[] | null=} exportName the exported name
     * @param {number=} priority priority
     * @returns {boolean} true, if something has changed
     */
    setTarget(key: Dependency, connection: ModuleGraphConnection, exportName?: (Dependency.ExportInfoName[] | null) | undefined, priority?: number | undefined): boolean;
    /**
     * Returns usage state.
     * @param {RuntimeSpec} runtime for this runtime
     * @returns {UsageStateType} usage state
     */
    getUsed(runtime: RuntimeSpec): UsageStateType;
    /**
     * Returns used name. May return InlinedUsedName when the export is inlined to a primitive.
     * @param {string | undefined} fallbackName fallback name for used exports with no name
     * @param {RuntimeSpec} runtime check usage for this runtime only
     * @returns {string | InlinedUsedName | false} used name
     */
    getUsedName(fallbackName: string | undefined, runtime: RuntimeSpec): string | InlinedUsedName | false;
    /**
     * Checks whether this export info has used name.
     * @returns {boolean} true, when a mangled name of this export is set
     */
    hasUsedName(): boolean;
    /**
     * Updates used name using the provided name.
     * @param {string | InlinedUsedName} name the new name
     * @returns {void}
     */
    setUsedName(name: string | InlinedUsedName): void;
    /**
     * Gets terminal binding.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ResolveTargetFilter} resolveTargetFilter filter function to further resolve target
     * @returns {ExportInfo | ExportsInfo | undefined} the terminal binding export(s) info if known
     */
    getTerminalBinding(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): ExportInfo | ExportsInfo | undefined;
    isReexport(): boolean;
    _getMaxTarget(): Target;
    /**
     * Walks the reexport chain and returns the first target whose module passes
     * `validTargetModuleFilter`. Returns undefined when there is no target, false
     * when the chain ends without a valid module.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ValidTargetModuleFilter} validTargetModuleFilter a valid target module
     * @returns {FoundTargetItem | null | undefined | false} the target, undefined when there is no target, false when no target is valid
     */
    findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter): FoundTargetItem | null | undefined | false;
    /**
     * Returns the target, undefined when there is no target, false when no target is valid.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ValidTargetModuleFilter} validTargetModuleFilter a valid target module
     * @param {AlreadyVisitedExportInfo} alreadyVisited set of already visited export info to avoid circular references
     * @returns {FoundTargetItem | null | undefined | false} the target, undefined when there is no target, false when no target is valid
     */
    _findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter, alreadyVisited: AlreadyVisitedExportInfo): FoundTargetItem | null | undefined | false;
    /**
     * Resolves the reexport chain as far as `resolveTargetFilter` allows and
     * returns where it ends. Returns undefined when there is no target, the
     * targets disagree, or the chain is circular.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ResolveTargetFilter} resolveTargetFilter filter function to further resolve target
     * @returns {TargetItemWithConnection | undefined} the target
     */
    getTarget(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): TargetItemWithConnection | undefined;
    /**
     * Returns whether resolving the target leads back to this export, which
     * `getTarget` cannot express as it reports a cycle as "no target".
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {boolean} true, when the reexport chain is circular
     */
    hasCircularTarget(moduleGraph: ModuleGraph): boolean;
    /**
     * Returns the target.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ResolveTargetFilter} resolveTargetFilter filter function to further resolve target
     * @param {AlreadyVisitedExportInfo | undefined} alreadyVisited set of already visited export info to avoid circular references
     * @returns {TargetItemWithConnection | CIRCULAR | undefined} the target
     */
    _getTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, alreadyVisited: AlreadyVisitedExportInfo | undefined): TargetItemWithConnection | typeof CIRCULAR | undefined;
    /**
     * Move the target forward as long resolveTargetFilter is fulfilled
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ResolveTargetFilter} resolveTargetFilter filter function to further resolve target
     * @param {((target: TargetItemWithConnection) => ModuleGraphConnection | undefined)=} updateOriginalConnection updates the original connection instead of using the target connection
     * @returns {TargetItemWithConnection | undefined} the resolved target when moved
     */
    moveTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, updateOriginalConnection?: ((target: TargetItemWithConnection) => ModuleGraphConnection | undefined) | undefined): TargetItemWithConnection | undefined;
    /**
     * Creates a nested exports info.
     * @returns {ExportsInfo} an exports info
     */
    createNestedExportsInfo(): ExportsInfo;
    getNestedExportsInfo(): ExportsInfo;
    /**
     * Checks whether this export info contains the base info.
     * @param {ExportInfo} baseInfo base info
     * @param {RuntimeSpec} runtime runtime
     * @returns {boolean} true when has info, otherwise false
     */
    hasInfo(baseInfo: ExportInfo, runtime: RuntimeSpec): boolean;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash the hash
     * @param {RuntimeSpec} runtime the runtime
     * @returns {void}
     */
    updateHash(hash: Hash, runtime: RuntimeSpec): void;
    /**
     * Updates hash using the provided hash.
     * @param {Hash} hash the hash
     * @param {RuntimeSpec} runtime the runtime
     * @param {Set<ExportsInfo>} alreadyVisitedExportsInfo for circular references
     */
    _updateHash(hash: Hash, runtime: RuntimeSpec, alreadyVisitedExportsInfo: Set<ExportsInfo>): void;
    getUsedInfo(): string;
    getProvidedInfo(): "no provided info" | "maybe provided (runtime-defined)" | "provided" | "not provided";
    getRenameInfo(): string;
}
import type Dependency from "./Dependency";
import type ModuleGraphConnection from "./ModuleGraphConnection";
import type { RuntimeSpec } from "../util/runtime";
import SortableSet = require("../util/SortableSet");
import type Hash from "../util/Hash";
declare class RestoreProvidedData {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {RestoreProvidedData} RestoreProvidedData
     */
    static deserialize(context: ObjectDeserializerContext): RestoreProvidedData;
    /**
     * Creates an instance of RestoreProvidedData.
     * @param {RestoreProvidedDataExports[]} exports exports
     * @param {ExportInfo["provided"]} otherProvided other provided
     * @param {ExportInfo["canMangleProvide"]} otherCanMangleProvide other can mangle provide
     * @param {ExportInfo["terminalBinding"]} otherTerminalBinding other terminal binding
     */
    constructor(exports: RestoreProvidedDataExports[], otherProvided: ExportInfo["provided"], otherCanMangleProvide: ExportInfo["canMangleProvide"], otherTerminalBinding: ExportInfo["terminalBinding"]);
    /** @type {RestoreProvidedDataExports[]} */
    exports: RestoreProvidedDataExports[];
    /** @type {ExportInfoProvided | undefined} */
    otherProvided: ExportInfoProvided | undefined;
    /** @type {boolean | undefined} */
    otherCanMangleProvide: boolean | undefined;
    /** @type {boolean} */
    otherTerminalBinding: boolean;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
/**
 * @import Dependency, {
 * 	ExportInfoName,
 * 	ExportsSpecExcludeExports
 * } from "./Dependency"
 */
/** @import ESMImportDependency from "../dependencies/esm/ESMImportDependency" */
/** @import Module from "../module/Module" */
/** @import ModuleGraph from "./ModuleGraph" */
/** @import ModuleGraphConnection from "./ModuleGraphConnection" */
/** @import { InlinedValue } from "../optimize/InlineExports" */
/** @typedef {[RestoreProvidedDataExports[], ExportInfo["provided"], ExportInfo["canMangleProvide"], ExportInfo["terminalBinding"]]} RestoreProvidedDataTuple */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<RestoreProvidedDataTuple>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<RestoreProvidedDataTuple>} ObjectSerializerContext */
/** @import Hash from "../util/Hash" */
/** @import { RuntimeSpec } from "../util/runtime" */
/** @typedef {typeof UsageState.OnlyPropertiesUsed | typeof UsageState.NoInfo | typeof UsageState.Unknown | typeof UsageState.Used} RuntimeUsageStateType */
/** @typedef {typeof UsageState.Unused | RuntimeUsageStateType} UsageStateType */
/** @typedef {Map<string, RuntimeUsageStateType>} UsedInRuntime */
/** @typedef {{ module: Module, connection: ModuleGraphConnection, export: ExportInfoName[], deferred: boolean }} FoundTargetItem */
/** @typedef {{ module: Module, connection: ModuleGraphConnection, export: ExportInfoName[] | undefined }} TargetItemWithConnection */
/** @typedef {(target: TargetItemWithConnection) => boolean} ResolveTargetFilter */
/** @typedef {(module: Module) => boolean} ValidTargetModuleFilter */
/** @typedef {{ connection: ModuleGraphConnection, export: ExportInfoName[], priority: number }} TargetItem */
/** @typedef {Map<Dependency | undefined, TargetItem>} Target */
/** @typedef {string | InlinedUsedName | null} ExportInfoUsedName */
/** @typedef {boolean | null} ExportInfoProvided */
/** @typedef {Map<ExportInfoName, ExportInfo>} Exports */
/** @typedef {string | string[] | InlinedUsedName | false} UsedName */
/** @typedef {Set<ExportInfo>} AlreadyVisitedExportInfo */
/**
 * Defines the restore provided data exports type used by this module.
 * @typedef {object} RestoreProvidedDataExports
 * @property {ExportInfoName} name
 * @property {ExportInfo["provided"]} provided
 * @property {ExportInfo["canMangleProvide"]} canMangleProvide
 * @property {ExportInfo["canInlineProvide"]=} canInlineProvide
 * @property {ExportInfo["terminalBinding"]} terminalBinding
 * @property {ExportInfo["pureProvide"]=} pureProvide
 * @property {RestoreProvidedData | undefined} exportsInfo
 */
declare const UsageState: Readonly<{
    Unused: 0;
    OnlyPropertiesUsed: 1;
    NoInfo: 2;
    Unknown: 3;
    Used: 4;
}>;
type RestoreProvidedDataTuple = [RestoreProvidedDataExports[], ExportInfo["provided"], ExportInfo["canMangleProvide"], ExportInfo["terminalBinding"]];
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<RestoreProvidedDataTuple>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<RestoreProvidedDataTuple>;
type RuntimeUsageStateType = typeof UsageState.OnlyPropertiesUsed | typeof UsageState.NoInfo | typeof UsageState.Unknown | typeof UsageState.Used;
type UsageStateType = typeof UsageState.Unused | RuntimeUsageStateType;
type UsedInRuntime = Map<string, RuntimeUsageStateType>;
type FoundTargetItem = {
    module: Module;
    connection: ModuleGraphConnection;
    export: Dependency.ExportInfoName[];
    deferred: boolean;
};
type TargetItemWithConnection = {
    module: Module;
    connection: ModuleGraphConnection;
    export: Dependency.ExportInfoName[] | undefined;
};
type ResolveTargetFilter = (target: TargetItemWithConnection) => boolean;
type ValidTargetModuleFilter = (module: Module) => boolean;
type TargetItem = {
    connection: ModuleGraphConnection;
    export: Dependency.ExportInfoName[];
    priority: number;
};
type Target = Map<Dependency | undefined, TargetItem>;
type ExportInfoUsedName = string | InlinedUsedName | null;
type ExportInfoProvided = boolean | null;
type Exports = Map<Dependency.ExportInfoName, ExportInfo>;
type UsedName = string | string[] | InlinedUsedName | false;
type AlreadyVisitedExportInfo = Set<ExportInfo>;
/**
 * Defines the restore provided data exports type used by this module.
 */
type RestoreProvidedDataExports = {
    name: Dependency.ExportInfoName;
    provided: ExportInfo["provided"];
    canMangleProvide: ExportInfo["canMangleProvide"];
    canInlineProvide?: ExportInfo["canInlineProvide"] | undefined;
    terminalBinding: ExportInfo["terminalBinding"];
    pureProvide?: ExportInfo["pureProvide"] | undefined;
    exportsInfo: RestoreProvidedData | undefined;
};
import type { InlinedValue } from "../optimize/InlineExports";
import { InlinedUsedName } from "../optimize/InlineExports";
import type ModuleGraph from "./ModuleGraph";
declare const CIRCULAR: unique symbol;
import type Module from "../module/Module";
