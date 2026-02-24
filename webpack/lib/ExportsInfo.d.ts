export = ExportsInfo;
declare class ExportsInfo {
  /** @type {Exports} */
  _exports: Exports;
  _otherExportsInfo: ExportInfo;
  _sideEffectsOnlyInfo: ExportInfo;
  _exportsAreOrdered: boolean;
  /** @type {ExportsInfo=} */
  _redirectTo: ExportsInfo | undefined;
  /**
   * @returns {Iterable<ExportInfo>} all owned exports in any order
   */
  get ownedExports(): Iterable<ExportInfo>;
  /**
   * @returns {Iterable<ExportInfo>} all owned exports in order
   */
  get orderedOwnedExports(): Iterable<ExportInfo>;
  /**
   * @returns {Iterable<ExportInfo>} all exports in any order
   */
  get exports(): Iterable<ExportInfo>;
  /**
   * @returns {Iterable<ExportInfo>} all exports in order
   */
  get orderedExports(): Iterable<ExportInfo>;
  /**
   * @returns {ExportInfo} the export info of unlisted exports
   */
  get otherExportsInfo(): ExportInfo;
  /**
   * @param {Exports} exports exports
   * @private
   */
  private _sortExportsMap;
  _sortExports(): void;
  /**
   * @param {ExportsInfo | undefined} exportsInfo exports info
   * @returns {boolean} result
   */
  setRedirectNamedTo(exportsInfo: ExportsInfo | undefined): boolean;
  setHasProvideInfo(): void;
  setHasUseInfo(): void;
  /**
   * @param {ExportInfoName} name export name
   * @returns {ExportInfo} export info for this name
   */
  getOwnExportInfo(name: ExportInfoName): ExportInfo;
  /**
   * @param {ExportInfoName} name export name
   * @returns {ExportInfo} export info for this name
   */
  getExportInfo(name: ExportInfoName): ExportInfo;
  /**
   * @param {ExportInfoName} name export name
   * @returns {ExportInfo} export info for this name
   */
  getReadOnlyExportInfo(name: ExportInfoName): ExportInfo;
  /**
   * @param {ExportInfoName[]} name export name
   * @returns {ExportInfo | undefined} export info for this name
   */
  getReadOnlyExportInfoRecursive(
    name: ExportInfoName[],
  ): ExportInfo | undefined;
  /**
   * @param {ExportInfoName[]=} name the export name
   * @returns {ExportsInfo | undefined} the nested exports info
   */
  getNestedExportsInfo(
    name?: ExportInfoName[] | undefined,
  ): ExportsInfo | undefined;
  /**
   * @param {boolean=} canMangle true, if exports can still be mangled (defaults to false)
   * @param {ExportsSpecExcludeExports=} excludeExports list of unaffected exports
   * @param {Dependency=} targetKey use this as key for the target
   * @param {ModuleGraphConnection=} targetModule set this module as target
   * @param {number=} priority priority
   * @returns {boolean} true, if this call changed something
   */
  setUnknownExportsProvided(
    canMangle?: boolean | undefined,
    excludeExports?: ExportsSpecExcludeExports | undefined,
    targetKey?: Dependency | undefined,
    targetModule?: ModuleGraphConnection | undefined,
    priority?: number | undefined,
  ): boolean;
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {boolean} true, when something changed
   */
  setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {boolean} true, when something changed
   */
  setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {boolean} true, when something changed
   */
  setAllKnownExportsUsed(runtime: RuntimeSpec): boolean;
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {boolean} true, when something changed
   */
  setUsedForSideEffectsOnly(runtime: RuntimeSpec): boolean;
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {boolean} true, when the module exports are used in any way
   */
  isUsed(runtime: RuntimeSpec): boolean;
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {boolean} true, when the module is used in any way
   */
  isModuleUsed(runtime: RuntimeSpec): boolean;
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {SortableSet<ExportInfoName> | boolean | null} set of used exports, or true (when namespace object is used), or false (when unused), or null (when unknown)
   */
  getUsedExports(
    runtime: RuntimeSpec,
  ): SortableSet<ExportInfoName> | boolean | null;
  /**
   * @returns {null | true | ExportInfoName[]} list of exports when known
   */
  getProvidedExports(): null | true | ExportInfoName[];
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {ExportInfo[]} exports that are relevant (not unused and potential provided)
   */
  getRelevantExports(runtime: RuntimeSpec): ExportInfo[];
  /**
   * @param {ExportInfoName | ExportInfoName[]} name the name of the export
   * @returns {boolean | undefined | null} if the export is provided
   */
  isExportProvided(
    name: ExportInfoName | ExportInfoName[],
  ): boolean | undefined | null;
  /**
   * @param {RuntimeSpec} runtime runtime
   * @returns {string} key representing the usage
   */
  getUsageKey(runtime: RuntimeSpec): string;
  /**
   * @param {RuntimeSpec} runtimeA first runtime
   * @param {RuntimeSpec} runtimeB second runtime
   * @returns {boolean} true, when equally used
   */
  isEquallyUsed(runtimeA: RuntimeSpec, runtimeB: RuntimeSpec): boolean;
  /**
   * @param {ExportInfoName | ExportInfoName[]} name export name
   * @param {RuntimeSpec} runtime check usage for this runtime only
   * @returns {UsageStateType} usage status
   */
  getUsed(
    name: ExportInfoName | ExportInfoName[],
    runtime: RuntimeSpec,
  ): UsageStateType;
  /**
   * @param {ExportInfoName | ExportInfoName[]} name the export name
   * @param {RuntimeSpec} runtime check usage for this runtime only
   * @returns {UsedName} the used name
   */
  getUsedName(
    name: ExportInfoName | ExportInfoName[],
    runtime: RuntimeSpec,
  ): UsedName;
  /**
   * @param {Hash} hash the hash
   * @param {RuntimeSpec} runtime the runtime
   * @returns {void}
   */
  updateHash(hash: Hash, runtime: RuntimeSpec): void;
  /**
   * @param {Hash} hash the hash
   * @param {RuntimeSpec} runtime the runtime
   * @param {Set<ExportsInfo>} alreadyVisitedExportsInfo for circular references
   * @returns {void}
   */
  _updateHash(
    hash: Hash,
    runtime: RuntimeSpec,
    alreadyVisitedExportsInfo: Set<ExportsInfo>,
  ): void;
  /**
   * @returns {RestoreProvidedData} restore provided data
   */
  getRestoreProvidedData(): RestoreProvidedData;
  /**
   * @param {RestoreProvidedData} data data
   */
  restoreProvided({
    otherProvided,
    otherCanMangleProvide,
    otherTerminalBinding,
    exports,
  }: RestoreProvidedData): void;
}
declare namespace ExportsInfo {
  export {
    ExportInfo,
    RestoreProvidedData,
    UsageState,
    Dependency,
    RuntimeSpec,
    ExportsSpecExcludeExports,
    HarmonyImportDependency,
    Module,
    ModuleGraph,
    ModuleGraphConnection,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    RuntimeUsageStateType,
    UsageStateType,
    ExportInfoName,
    UsedInRuntime,
    TargetItemWithoutConnection,
    TargetItemWithConnection,
    ResolveTargetFilter,
    ValidTargetModuleFilter,
    TargetItem,
    Target,
    ExportInfoUsedName,
    ExportInfoProvided,
    Exports,
    UsedName,
    AlreadyVisitedExportInfo,
    RestoreProvidedDataExports,
  };
}
declare class ExportInfo {
  /**
   * @param {ExportInfoName | null} name the original name of the export
   * @param {ExportInfo=} initFrom init values from this ExportInfo
   */
  constructor(name: ExportInfoName | null, initFrom?: ExportInfo | undefined);
  /** @type {ExportInfoName} */
  name: ExportInfoName;
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
   * true: it can be mangled
   * false: is can not be mangled
   * undefined: it was not determined if it can be mangled
   * @type {boolean | undefined}
   */
  canMangleUse: boolean | undefined;
  /** @type {boolean} */
  exportsInfoOwned: boolean;
  /** @type {ExportsInfo | undefined} */
  exportsInfo: ExportsInfo | undefined;
  /** @type {Target | undefined} */
  _target: Target | undefined;
  /** @type {Target | undefined} */
  _maxTarget: Target | undefined;
  /**
   * @private
   * @param {EXPECTED_ANY} v v
   */
  private set used(v);
  /** @private */
  private get used();
  /**
   * @private
   * @param {EXPECTED_ANY} v v
   */
  private set usedName(v);
  /** @private */
  private get usedName();
  get canMangle(): boolean;
  /**
   * @param {RuntimeSpec} runtime only apply to this runtime
   * @returns {boolean} true, when something changed
   */
  setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
  /**
   * @param {RuntimeSpec} runtime only apply to this runtime
   * @returns {boolean} true, when something changed
   */
  setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
  setHasUseInfo(): void;
  /**
   * @param {(condition: UsageStateType) => boolean} condition compare with old value
   * @param {UsageStateType} newValue set when condition is true
   * @param {RuntimeSpec} runtime only apply to this runtime
   * @returns {boolean} true when something has changed
   */
  setUsedConditionally(
    condition: (condition: UsageStateType) => boolean,
    newValue: UsageStateType,
    runtime: RuntimeSpec,
  ): boolean;
  /**
   * @param {UsageStateType} newValue new value of the used state
   * @param {RuntimeSpec} runtime only apply to this runtime
   * @returns {boolean} true when something has changed
   */
  setUsed(newValue: UsageStateType, runtime: RuntimeSpec): boolean;
  /**
   * @param {Dependency} key the key
   * @returns {boolean} true, if something has changed
   */
  unsetTarget(key: Dependency): boolean;
  /**
   * @param {Dependency} key the key
   * @param {ModuleGraphConnection} connection the target module if a single one
   * @param {ExportInfoName[] | null=} exportName the exported name
   * @param {number=} priority priority
   * @returns {boolean} true, if something has changed
   */
  setTarget(
    key: Dependency,
    connection: ModuleGraphConnection,
    exportName?: (ExportInfoName[] | null) | undefined,
    priority?: number | undefined,
  ): boolean;
  /**
   * @param {RuntimeSpec} runtime for this runtime
   * @returns {UsageStateType} usage state
   */
  getUsed(runtime: RuntimeSpec): UsageStateType;
  /**
   * get used name
   * @param {string | undefined} fallbackName fallback name for used exports with no name
   * @param {RuntimeSpec} runtime check usage for this runtime only
   * @returns {string | false} used name
   */
  getUsedName(
    fallbackName: string | undefined,
    runtime: RuntimeSpec,
  ): string | false;
  /**
   * @returns {boolean} true, when a mangled name of this export is set
   */
  hasUsedName(): boolean;
  /**
   * Sets the mangled name of this export
   * @param {string} name the new name
   * @returns {void}
   */
  setUsedName(name: string): void;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {ResolveTargetFilter} resolveTargetFilter filter function to further resolve target
   * @returns {ExportInfo | ExportsInfo | undefined} the terminal binding export(s) info if known
   */
  getTerminalBinding(
    moduleGraph: ModuleGraph,
    resolveTargetFilter?: ResolveTargetFilter,
  ): ExportInfo | ExportsInfo | undefined;
  isReexport(): boolean;
  _getMaxTarget(): Target;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {ValidTargetModuleFilter} validTargetModuleFilter a valid target module
   * @returns {TargetItemWithoutConnection | null | undefined | false} the target, undefined when there is no target, false when no target is valid
   */
  findTarget(
    moduleGraph: ModuleGraph,
    validTargetModuleFilter: ValidTargetModuleFilter,
  ): TargetItemWithoutConnection | null | undefined | false;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {ValidTargetModuleFilter} validTargetModuleFilter a valid target module
   * @param {AlreadyVisitedExportInfo} alreadyVisited set of already visited export info to avoid circular references
   * @returns {TargetItemWithoutConnection | null | undefined | false} the target, undefined when there is no target, false when no target is valid
   */
  _findTarget(
    moduleGraph: ModuleGraph,
    validTargetModuleFilter: ValidTargetModuleFilter,
    alreadyVisited: AlreadyVisitedExportInfo,
  ): TargetItemWithoutConnection | null | undefined | false;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {ResolveTargetFilter} resolveTargetFilter filter function to further resolve target
   * @returns {TargetItemWithConnection | undefined} the target
   */
  getTarget(
    moduleGraph: ModuleGraph,
    resolveTargetFilter?: ResolveTargetFilter,
  ): TargetItemWithConnection | undefined;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {ResolveTargetFilter} resolveTargetFilter filter function to further resolve target
   * @param {AlreadyVisitedExportInfo | undefined} alreadyVisited set of already visited export info to avoid circular references
   * @returns {TargetItemWithConnection | CIRCULAR | undefined} the target
   */
  _getTarget(
    moduleGraph: ModuleGraph,
    resolveTargetFilter: ResolveTargetFilter,
    alreadyVisited: AlreadyVisitedExportInfo | undefined,
  ): TargetItemWithConnection | typeof CIRCULAR | undefined;
  /**
   * Move the target forward as long resolveTargetFilter is fulfilled
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {ResolveTargetFilter} resolveTargetFilter filter function to further resolve target
   * @param {(target: TargetItemWithConnection) => ModuleGraphConnection=} updateOriginalConnection updates the original connection instead of using the target connection
   * @returns {TargetItemWithConnection | undefined} the resolved target when moved
   */
  moveTarget(
    moduleGraph: ModuleGraph,
    resolveTargetFilter: ResolveTargetFilter,
    updateOriginalConnection?:
      | ((target: TargetItemWithConnection) => ModuleGraphConnection)
      | undefined,
  ): TargetItemWithConnection | undefined;
  /**
   * @returns {ExportsInfo} an exports info
   */
  createNestedExportsInfo(): ExportsInfo;
  getNestedExportsInfo(): ExportsInfo;
  /**
   * @param {ExportInfo} baseInfo base info
   * @param {RuntimeSpec} runtime runtime
   * @returns {boolean} true when has info, otherwise false
   */
  hasInfo(baseInfo: ExportInfo, runtime: RuntimeSpec): boolean;
  /**
   * @param {Hash} hash the hash
   * @param {RuntimeSpec} runtime the runtime
   * @returns {void}
   */
  updateHash(hash: Hash, runtime: RuntimeSpec): void;
  /**
   * @param {Hash} hash the hash
   * @param {RuntimeSpec} runtime the runtime
   * @param {Set<ExportsInfo>} alreadyVisitedExportsInfo for circular references
   */
  _updateHash(
    hash: Hash,
    runtime: RuntimeSpec,
    alreadyVisitedExportsInfo: Set<ExportsInfo>,
  ): void;
  getUsedInfo(): string;
  getProvidedInfo():
    | 'provided'
    | 'no provided info'
    | 'maybe provided (runtime-defined)'
    | 'not provided';
  getRenameInfo(): string;
}
import SortableSet = require('./util/SortableSet');
declare class RestoreProvidedData {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {RestoreProvidedData} RestoreProvidedData
   */
  static deserialize({ read }: ObjectDeserializerContext): RestoreProvidedData;
  /**
   * @param {RestoreProvidedDataExports[]} exports exports
   * @param {ExportInfo["provided"]} otherProvided other provided
   * @param {ExportInfo["canMangleProvide"]} otherCanMangleProvide other can mangle provide
   * @param {ExportInfo["terminalBinding"]} otherTerminalBinding other terminal binding
   */
  constructor(
    exports: RestoreProvidedDataExports[],
    otherProvided: ExportInfo['provided'],
    otherCanMangleProvide: ExportInfo['canMangleProvide'],
    otherTerminalBinding: ExportInfo['terminalBinding'],
  );
  exports: RestoreProvidedDataExports[];
  otherProvided: ExportInfoProvided;
  otherCanMangleProvide: boolean;
  otherTerminalBinding: boolean;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize({ write }: ObjectSerializerContext): void;
}
/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./Dependency").RuntimeSpec} RuntimeSpec */
/** @typedef {import("./Dependency").ExportsSpecExcludeExports} ExportsSpecExcludeExports */
/** @typedef {import("./dependencies/HarmonyImportDependency")} HarmonyImportDependency */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./ModuleGraph")} ModuleGraph */
/** @typedef {import("./ModuleGraphConnection")} ModuleGraphConnection */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./util/Hash")} Hash */
/** @typedef {typeof UsageState.OnlyPropertiesUsed | typeof UsageState.NoInfo | typeof UsageState.Unknown | typeof UsageState.Used} RuntimeUsageStateType */
/** @typedef {typeof UsageState.Unused | RuntimeUsageStateType} UsageStateType */
/** @typedef {string} ExportInfoName */
/** @typedef {Map<string, RuntimeUsageStateType>} UsedInRuntime */
/** @typedef {{ module: Module, export: ExportInfoName[], deferred: boolean }} TargetItemWithoutConnection */
/** @typedef {{ module: Module, connection: ModuleGraphConnection, export: ExportInfoName[] | undefined }} TargetItemWithConnection */
/** @typedef {(target: TargetItemWithConnection) => boolean} ResolveTargetFilter */
/** @typedef {(module: Module) => boolean} ValidTargetModuleFilter */
/** @typedef {{ connection: ModuleGraphConnection, export: ExportInfoName[], priority: number }} TargetItem */
/** @typedef {Map<Dependency | undefined, TargetItem>} Target */
/** @typedef {string | null} ExportInfoUsedName */
/** @typedef {boolean | null} ExportInfoProvided */
/** @typedef {Map<ExportInfoName, ExportInfo>} Exports */
/** @typedef {string | string[] | false} UsedName */
/** @typedef {Set<ExportInfo>} AlreadyVisitedExportInfo */
/**
 * @typedef {object} RestoreProvidedDataExports
 * @property {ExportInfoName} name
 * @property {ExportInfo["provided"]} provided
 * @property {ExportInfo["canMangleProvide"]} canMangleProvide
 * @property {ExportInfo["terminalBinding"]} terminalBinding
 * @property {RestoreProvidedData | undefined} exportsInfo
 */
declare const UsageState: Readonly<{
  Unused: 0;
  OnlyPropertiesUsed: 1;
  NoInfo: 2;
  Unknown: 3;
  Used: 4;
}>;
type Dependency = import('./Dependency');
type RuntimeSpec = import('./Dependency').RuntimeSpec;
type ExportsSpecExcludeExports =
  import('./Dependency').ExportsSpecExcludeExports;
type HarmonyImportDependency = import('./dependencies/HarmonyImportDependency');
type Module = import('./Module');
type ModuleGraph = import('./ModuleGraph');
type ModuleGraphConnection = import('./ModuleGraphConnection');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('./util/Hash');
type RuntimeUsageStateType =
  | typeof UsageState.OnlyPropertiesUsed
  | typeof UsageState.NoInfo
  | typeof UsageState.Unknown
  | typeof UsageState.Used;
type UsageStateType = typeof UsageState.Unused | RuntimeUsageStateType;
type ExportInfoName = string;
type UsedInRuntime = Map<string, RuntimeUsageStateType>;
type TargetItemWithoutConnection = {
  module: Module;
  export: ExportInfoName[];
  deferred: boolean;
};
type TargetItemWithConnection = {
  module: Module;
  connection: ModuleGraphConnection;
  export: ExportInfoName[] | undefined;
};
type ResolveTargetFilter = (target: TargetItemWithConnection) => boolean;
type ValidTargetModuleFilter = (module: Module) => boolean;
type TargetItem = {
  connection: ModuleGraphConnection;
  export: ExportInfoName[];
  priority: number;
};
type Target = Map<Dependency | undefined, TargetItem>;
type ExportInfoUsedName = string | null;
type ExportInfoProvided = boolean | null;
type Exports = Map<ExportInfoName, ExportInfo>;
type UsedName = string | string[] | false;
type AlreadyVisitedExportInfo = Set<ExportInfo>;
type RestoreProvidedDataExports = {
  name: ExportInfoName;
  provided: ExportInfo['provided'];
  canMangleProvide: ExportInfo['canMangleProvide'];
  terminalBinding: ExportInfo['terminalBinding'];
  exportsInfo: RestoreProvidedData | undefined;
};
declare const CIRCULAR: unique symbol;
