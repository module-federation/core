export = ExportsInfo;
declare class ExportsInfo {
  /** @type {Map<string, ExportInfo>} */
  _exports: Map<string, ExportInfo>;
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
  _sortExportsMap(exports: any): void;
  _sortExports(): void;
  setRedirectNamedTo(exportsInfo: any): boolean;
  setHasProvideInfo(): void;
  setHasUseInfo(): void;
  /**
   * @param {string} name export name
   * @returns {ExportInfo} export info for this name
   */
  getOwnExportInfo(name: string): ExportInfo;
  /**
   * @param {string} name export name
   * @returns {ExportInfo} export info for this name
   */
  getExportInfo(name: string): ExportInfo;
  /**
   * @param {string} name export name
   * @returns {ExportInfo} export info for this name
   */
  getReadOnlyExportInfo(name: string): ExportInfo;
  /**
   * @param {string[]} name export name
   * @returns {ExportInfo | undefined} export info for this name
   */
  getReadOnlyExportInfoRecursive(name: string[]): ExportInfo | undefined;
  /**
   * @param {string[]=} name the export name
   * @returns {ExportsInfo | undefined} the nested exports info
   */
  getNestedExportsInfo(name?: string[] | undefined): ExportsInfo | undefined;
  /**
   * @param {boolean=} canMangle true, if exports can still be mangled (defaults to false)
   * @param {Set<string>=} excludeExports list of unaffected exports
   * @param {any=} targetKey use this as key for the target
   * @param {ModuleGraphConnection=} targetModule set this module as target
   * @param {number=} priority priority
   * @returns {boolean} true, if this call changed something
   */
  setUnknownExportsProvided(
    canMangle?: boolean | undefined,
    excludeExports?: Set<string> | undefined,
    targetKey?: any | undefined,
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
   * @returns {SortableSet<string> | boolean | null} set of used exports, or true (when namespace object is used), or false (when unused), or null (when unknown)
   */
  getUsedExports(runtime: RuntimeSpec): SortableSet<string> | boolean | null;
  /**
   * @returns {null | true | string[]} list of exports when known
   */
  getProvidedExports(): null | true | string[];
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {ExportInfo[]} exports that are relevant (not unused and potential provided)
   */
  getRelevantExports(runtime: RuntimeSpec): ExportInfo[];
  /**
   * @param {string | string[]} name the name of the export
   * @returns {boolean | undefined | null} if the export is provided
   */
  isExportProvided(name: string | string[]): boolean | undefined | null;
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
   * @param {string | string[]} name export name
   * @param {RuntimeSpec} runtime check usage for this runtime only
   * @returns {UsageStateType} usage status
   */
  getUsed(name: string | string[], runtime: RuntimeSpec): UsageStateType;
  /**
   * @param {string | string[]} name the export name
   * @param {RuntimeSpec} runtime check usage for this runtime only
   * @returns {string | string[] | false} the used name
   */
  getUsedName(
    name: string | string[],
    runtime: RuntimeSpec,
  ): string | string[] | false;
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
  getRestoreProvidedData(): RestoreProvidedData;
  /**
   * @param {{ otherProvided: any, otherCanMangleProvide: any, otherTerminalBinding: any, exports: any }} data data
   */
  restoreProvided({
    otherProvided,
    otherCanMangleProvide,
    otherTerminalBinding,
    exports,
  }: {
    otherProvided: any;
    otherCanMangleProvide: any;
    otherTerminalBinding: any;
    exports: any;
  }): void;
}
declare namespace ExportsInfo {
  export {
    ExportInfo,
    UsageState,
    RuntimeSpec,
    Module,
    ModuleGraph,
    ModuleGraphConnection,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    RuntimeUsageStateType,
    UsageStateType,
  };
}
declare class ExportInfo {
  /**
   * @param {string} name the original name of the export
   * @param {ExportInfo=} initFrom init values from this ExportInfo
   */
  constructor(name: string, initFrom?: ExportInfo | undefined);
  /** @type {string} */
  name: string;
  /** @private @type {string | null} */
  private _usedName;
  /** @private @type {UsageStateType} */
  private _globalUsed;
  /** @private @type {Map<string, RuntimeUsageStateType>} */
  private _usedInRuntime;
  /** @private @type {boolean} */
  private _hasUseInRuntimeInfo;
  /**
   * true: it is provided
   * false: it is not provided
   * null: only the runtime knows if it is provided
   * undefined: it was not determined if it is provided
   * @type {boolean | null | undefined}
   */
  provided: boolean | null | undefined;
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
  /** @type {ExportsInfo=} */
  exportsInfo: ExportsInfo | undefined;
  /** @type {Map<any, { connection: ModuleGraphConnection | null, export: string[], priority: number }>=} */
  _target: Map<
    any,
    {
      connection: ModuleGraphConnection | null;
      export: string[];
      priority: number;
    }
  >;
  /** @type {Map<any, { connection: ModuleGraphConnection | null, export: string[], priority: number }>=} */
  _maxTarget: Map<
    any,
    {
      connection: ModuleGraphConnection | null;
      export: string[];
      priority: number;
    }
  >;
  /**
   * @private
   * @param {*} v v
   */
  private set used(arg);
  /** @private */
  private get used();
  /**
   * @private
   * @param {*} v v
   */
  private set usedName(arg);
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
   * @param {function(UsageStateType): boolean} condition compare with old value
   * @param {UsageStateType} newValue set when condition is true
   * @param {RuntimeSpec} runtime only apply to this runtime
   * @returns {boolean} true when something has changed
   */
  setUsedConditionally(
    condition: (arg0: UsageStateType) => boolean,
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
   * @param {any} key the key
   * @returns {boolean} true, if something has changed
   */
  unsetTarget(key: any): boolean;
  /**
   * @param {any} key the key
   * @param {ModuleGraphConnection} connection the target module if a single one
   * @param {string[]=} exportName the exported name
   * @param {number=} priority priority
   * @returns {boolean} true, if something has changed
   */
  setTarget(
    key: any,
    connection: ModuleGraphConnection,
    exportName?: string[] | undefined,
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
   * @param {function({ module: Module, export: string[] | undefined }): boolean} resolveTargetFilter filter function to further resolve target
   * @returns {ExportInfo | ExportsInfo | undefined} the terminal binding export(s) info if known
   */
  getTerminalBinding(
    moduleGraph: ModuleGraph,
    resolveTargetFilter?: (arg0: {
      module: Module;
      export: string[] | undefined;
    }) => boolean,
  ): ExportInfo | ExportsInfo | undefined;
  isReexport(): boolean;
  _getMaxTarget(): Map<any, any>;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {function(Module): boolean} validTargetModuleFilter a valid target module
   * @returns {{ module: Module, export: string[] | undefined } | undefined | false} the target, undefined when there is no target, false when no target is valid
   */
  findTarget(
    moduleGraph: ModuleGraph,
    validTargetModuleFilter: (arg0: Module) => boolean,
  ):
    | {
        module: Module;
        export: string[] | undefined;
      }
    | undefined
    | false;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {function(Module): boolean} validTargetModuleFilter a valid target module
   * @param {Set<ExportInfo>} alreadyVisited set of already visited export info to avoid circular references
   * @returns {{ module: Module, export: string[] | undefined } | undefined | false} the target, undefined when there is no target, false when no target is valid
   */
  _findTarget(
    moduleGraph: ModuleGraph,
    validTargetModuleFilter: (arg0: Module) => boolean,
    alreadyVisited: Set<ExportInfo>,
  ):
    | {
        module: Module;
        export: string[] | undefined;
      }
    | undefined
    | false;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {function({ module: Module, export: string[] | undefined }): boolean} resolveTargetFilter filter function to further resolve target
   * @returns {{ module: Module, export: string[] | undefined } | undefined} the target
   */
  getTarget(
    moduleGraph: ModuleGraph,
    resolveTargetFilter?: (arg0: {
      module: Module;
      export: string[] | undefined;
    }) => boolean,
  ):
    | {
        module: Module;
        export: string[] | undefined;
      }
    | undefined;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {function({ module: Module, connection: ModuleGraphConnection, export: string[] | undefined }): boolean} resolveTargetFilter filter function to further resolve target
   * @param {Set<ExportInfo> | undefined} alreadyVisited set of already visited export info to avoid circular references
   * @returns {{ module: Module, connection: ModuleGraphConnection, export: string[] | undefined } | CIRCULAR | undefined} the target
   */
  _getTarget(
    moduleGraph: ModuleGraph,
    resolveTargetFilter: (arg0: {
      module: Module;
      connection: ModuleGraphConnection;
      export: string[] | undefined;
    }) => boolean,
    alreadyVisited: Set<ExportInfo> | undefined,
  ):
    | {
        module: Module;
        connection: ModuleGraphConnection;
        export: string[] | undefined;
      }
    | typeof CIRCULAR
    | undefined;
  /**
   * Move the target forward as long resolveTargetFilter is fulfilled
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {function({ module: Module, export: string[] | undefined }): boolean} resolveTargetFilter filter function to further resolve target
   * @param {function({ module: Module, export: string[] | undefined }): ModuleGraphConnection=} updateOriginalConnection updates the original connection instead of using the target connection
   * @returns {{ module: Module, export: string[] | undefined } | undefined} the resolved target when moved
   */
  moveTarget(
    moduleGraph: ModuleGraph,
    resolveTargetFilter: (arg0: {
      module: Module;
      export: string[] | undefined;
    }) => boolean,
    updateOriginalConnection?:
      | ((arg0: {
          module: Module;
          export: string[] | undefined;
        }) => ModuleGraphConnection)
      | undefined,
  ):
    | {
        module: Module;
        export: string[] | undefined;
      }
    | undefined;
  createNestedExportsInfo(): ExportsInfo;
  getNestedExportsInfo(): ExportsInfo;
  hasInfo(baseInfo: any, runtime: any): boolean;
  updateHash(hash: any, runtime: any): void;
  _updateHash(hash: any, runtime: any, alreadyVisitedExportsInfo: any): void;
  getUsedInfo(): string;
  getProvidedInfo():
    | 'no provided info'
    | 'maybe provided (runtime-defined)'
    | 'provided'
    | 'not provided';
  getRenameInfo(): string;
}
type ModuleGraphConnection = import('./ModuleGraphConnection');
type RuntimeSpec = import('./Dependency').RuntimeSpec;
import SortableSet = require('./util/SortableSet');
type UsageStateType = typeof UsageState.Unused | RuntimeUsageStateType;
type Hash = import('./util/Hash');
declare class RestoreProvidedData {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {RestoreProvidedData} RestoreProvidedData
   */
  static deserialize({ read }: ObjectDeserializerContext): RestoreProvidedData;
  constructor(
    exports: any,
    otherProvided: any,
    otherCanMangleProvide: any,
    otherTerminalBinding: any,
  );
  exports: any;
  otherProvided: any;
  otherCanMangleProvide: any;
  otherTerminalBinding: any;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize({ write }: ObjectSerializerContext): void;
}
/** @typedef {import("./Dependency").RuntimeSpec} RuntimeSpec */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./ModuleGraph")} ModuleGraph */
/** @typedef {import("./ModuleGraphConnection")} ModuleGraphConnection */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./util/Hash")} Hash */
/** @typedef {typeof UsageState.OnlyPropertiesUsed | typeof UsageState.NoInfo | typeof UsageState.Unknown | typeof UsageState.Used} RuntimeUsageStateType */
/** @typedef {typeof UsageState.Unused | RuntimeUsageStateType} UsageStateType */
declare const UsageState: Readonly<{
  Unused: 0;
  OnlyPropertiesUsed: 1;
  NoInfo: 2;
  Unknown: 3;
  Used: 4;
}>;
type Module = import('./Module');
type ModuleGraph = import('./ModuleGraph');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeUsageStateType =
  | typeof UsageState.OnlyPropertiesUsed
  | typeof UsageState.NoInfo
  | typeof UsageState.Unknown
  | typeof UsageState.Used;
declare namespace module {
  namespace exports {
    export {
      ExportInfo,
      UsageState,
      RuntimeSpec,
      Module,
      ModuleGraph,
      ModuleGraphConnection,
      ObjectDeserializerContext,
      ObjectSerializerContext,
      Hash,
      RuntimeUsageStateType,
      UsageStateType,
    };
  }
}
declare const CIRCULAR: unique symbol;
