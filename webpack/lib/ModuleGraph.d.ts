export = ModuleGraph;
declare class ModuleGraph {
  /**
   * @param {Module} module the module
   * @param {string} deprecateMessage message for the deprecation message
   * @param {string} deprecationCode code for the deprecation
   * @returns {ModuleGraph} the module graph
   */
  static getModuleGraphForModule(
    module: Module,
    deprecateMessage: string,
    deprecationCode: string,
  ): ModuleGraph;
  /**
   * @param {Module} module the module
   * @param {ModuleGraph} moduleGraph the module graph
   * @returns {void}
   */
  static setModuleGraphForModule(
    module: Module,
    moduleGraph: ModuleGraph,
  ): void;
  /**
   * @param {Module} module the module
   * @returns {void}
   */
  static clearModuleGraphForModule(module: Module): void;
  /** @type {WeakMap<Dependency, ModuleGraphConnection | null>} */
  _dependencyMap: WeakMap<Dependency, ModuleGraphConnection | null>;
  /** @type {Map<Module, ModuleGraphModule>} */
  _moduleMap: Map<Module, ModuleGraphModule>;
  /** @type {WeakMap<any, Object>} */
  _metaMap: WeakMap<any, any>;
  /** @type {WeakTupleMap<any[], any> | undefined} */
  _cache: WeakTupleMap<any[], any> | undefined;
  /** @type {Map<Module, WeakTupleMap<any, any>>} */
  _moduleMemCaches: Map<Module, WeakTupleMap<any, any>>;
  /** @type {string | undefined} */
  _cacheStage: string | undefined;
  /**
   * @param {Module} module the module
   * @returns {ModuleGraphModule} the internal module
   */
  _getModuleGraphModule(module: Module): ModuleGraphModule;
  /**
   * @param {Dependency} dependency the dependency
   * @param {DependenciesBlock} block parent block
   * @param {Module} module parent module
   * @param {number=} indexInBlock position in block
   * @returns {void}
   */
  setParents(
    dependency: Dependency,
    block: DependenciesBlock,
    module: Module,
    indexInBlock?: number | undefined,
  ): void;
  /**
   * @param {Dependency} dependency the dependency
   * @returns {Module} parent module
   */
  getParentModule(dependency: Dependency): Module;
  /**
   * @param {Dependency} dependency the dependency
   * @returns {DependenciesBlock} parent block
   */
  getParentBlock(dependency: Dependency): DependenciesBlock;
  /**
   * @param {Dependency} dependency the dependency
   * @returns {number} index
   */
  getParentBlockIndex(dependency: Dependency): number;
  /**
   * @param {Module} originModule the referencing module
   * @param {Dependency} dependency the referencing dependency
   * @param {Module} module the referenced module
   * @returns {void}
   */
  setResolvedModule(
    originModule: Module,
    dependency: Dependency,
    module: Module,
  ): void;
  /**
   * @param {Dependency} dependency the referencing dependency
   * @param {Module} module the referenced module
   * @returns {void}
   */
  updateModule(dependency: Dependency, module: Module): void;
  /**
   * @param {Dependency} dependency the referencing dependency
   * @returns {void}
   */
  removeConnection(dependency: Dependency): void;
  /**
   * @param {Dependency} dependency the referencing dependency
   * @param {string} explanation an explanation
   * @returns {void}
   */
  addExplanation(dependency: Dependency, explanation: string): void;
  /**
   * @param {Module} sourceModule the source module
   * @param {Module} targetModule the target module
   * @returns {void}
   */
  cloneModuleAttributes(sourceModule: Module, targetModule: Module): void;
  /**
   * @param {Module} module the module
   * @returns {void}
   */
  removeModuleAttributes(module: Module): void;
  /**
   * @returns {void}
   */
  removeAllModuleAttributes(): void;
  /**
   * @param {Module} oldModule the old referencing module
   * @param {Module} newModule the new referencing module
   * @param {function(ModuleGraphConnection): boolean} filterConnection filter predicate for replacement
   * @returns {void}
   */
  moveModuleConnections(
    oldModule: Module,
    newModule: Module,
    filterConnection: (arg0: ModuleGraphConnection) => boolean,
  ): void;
  /**
   * @param {Module} oldModule the old referencing module
   * @param {Module} newModule the new referencing module
   * @param {function(ModuleGraphConnection): boolean} filterConnection filter predicate for replacement
   * @returns {void}
   */
  copyOutgoingModuleConnections(
    oldModule: Module,
    newModule: Module,
    filterConnection: (arg0: ModuleGraphConnection) => boolean,
  ): void;
  /**
   * @param {Module} module the referenced module
   * @param {string} explanation an explanation why it's referenced
   * @returns {void}
   */
  addExtraReason(module: Module, explanation: string): void;
  /**
   * @param {Dependency} dependency the dependency to look for a referenced module
   * @returns {Module | null} the referenced module
   */
  getResolvedModule(dependency: Dependency): Module | null;
  /**
   * @param {Dependency} dependency the dependency to look for a referenced module
   * @returns {ModuleGraphConnection | undefined} the connection
   */
  getConnection(dependency: Dependency): ModuleGraphConnection | undefined;
  /**
   * @param {Dependency} dependency the dependency to look for a referenced module
   * @returns {Module | null} the referenced module
   */
  getModule(dependency: Dependency): Module | null;
  /**
   * @param {Dependency} dependency the dependency to look for a referencing module
   * @returns {Module | null} the referencing module
   */
  getOrigin(dependency: Dependency): Module | null;
  /**
   * @param {Dependency} dependency the dependency to look for a referencing module
   * @returns {Module | null} the original referencing module
   */
  getResolvedOrigin(dependency: Dependency): Module | null;
  /**
   * @param {Module} module the module
   * @returns {Iterable<ModuleGraphConnection>} reasons why a module is included
   */
  getIncomingConnections(module: Module): Iterable<ModuleGraphConnection>;
  /**
   * @param {Module} module the module
   * @returns {Iterable<ModuleGraphConnection>} list of outgoing connections
   */
  getOutgoingConnections(module: Module): Iterable<ModuleGraphConnection>;
  /**
   * @param {Module} module the module
   * @returns {readonly Map<Module | undefined, readonly ModuleGraphConnection[]>} reasons why a module is included, in a map by source module
   */
  getIncomingConnectionsByOriginModule(
    module: Module,
  ): readonly Map<Module | undefined, readonly ModuleGraphConnection[]>;
  /**
   * @param {Module} module the module
   * @returns {readonly Map<Module | undefined, readonly ModuleGraphConnection[]> | undefined} connections to modules, in a map by module
   */
  getOutgoingConnectionsByModule(
    module: Module,
  ):
    | readonly Map<Module | undefined, readonly ModuleGraphConnection[]>
    | undefined;
  /**
   * @param {Module} module the module
   * @returns {ModuleProfile | null} the module profile
   */
  getProfile(module: Module): ModuleProfile | null;
  /**
   * @param {Module} module the module
   * @param {ModuleProfile | null} profile the module profile
   * @returns {void}
   */
  setProfile(module: Module, profile: ModuleProfile | null): void;
  /**
   * @param {Module} module the module
   * @returns {Module | null} the issuer module
   */
  getIssuer(module: Module): Module | null;
  /**
   * @param {Module} module the module
   * @param {Module | null} issuer the issuer module
   * @returns {void}
   */
  setIssuer(module: Module, issuer: Module | null): void;
  /**
   * @param {Module} module the module
   * @param {Module | null} issuer the issuer module
   * @returns {void}
   */
  setIssuerIfUnset(module: Module, issuer: Module | null): void;
  /**
   * @param {Module} module the module
   * @returns {(string | OptimizationBailoutFunction)[]} optimization bailouts
   */
  getOptimizationBailout(
    module: Module,
  ): (string | OptimizationBailoutFunction)[];
  /**
   * @param {Module} module the module
   * @returns {true | string[] | null} the provided exports
   */
  getProvidedExports(module: Module): true | string[] | null;
  /**
   * @param {Module} module the module
   * @param {string | string[]} exportName a name of an export
   * @returns {boolean | null} true, if the export is provided by the module.
   * null, if it's unknown.
   * false, if it's not provided.
   */
  isExportProvided(
    module: Module,
    exportName: string | string[],
  ): boolean | null;
  /**
   * @param {Module} module the module
   * @returns {ExportsInfo} info about the exports
   */
  getExportsInfo(module: Module): ExportsInfo;
  /**
   * @param {Module} module the module
   * @param {string} exportName the export
   * @returns {ExportInfo} info about the export
   */
  getExportInfo(module: Module, exportName: string): ExportInfo;
  /**
   * @param {Module} module the module
   * @param {string} exportName the export
   * @returns {ExportInfo} info about the export (do not modify)
   */
  getReadOnlyExportInfo(module: Module, exportName: string): ExportInfo;
  /**
   * @param {Module} module the module
   * @param {RuntimeSpec} runtime the runtime
   * @returns {false | true | SortableSet<string> | null} the used exports
   * false: module is not used at all.
   * true: the module namespace/object export is used.
   * SortableSet<string>: these export names are used.
   * empty SortableSet<string>: module is used but no export.
   * null: unknown, worst case should be assumed.
   */
  getUsedExports(
    module: Module,
    runtime: RuntimeSpec,
  ): false | true | SortableSet<string> | null;
  /**
   * @param {Module} module the module
   * @returns {number | null} the index of the module
   */
  getPreOrderIndex(module: Module): number | null;
  /**
   * @param {Module} module the module
   * @returns {number | null} the index of the module
   */
  getPostOrderIndex(module: Module): number | null;
  /**
   * @param {Module} module the module
   * @param {number} index the index of the module
   * @returns {void}
   */
  setPreOrderIndex(module: Module, index: number): void;
  /**
   * @param {Module} module the module
   * @param {number} index the index of the module
   * @returns {boolean} true, if the index was set
   */
  setPreOrderIndexIfUnset(module: Module, index: number): boolean;
  /**
   * @param {Module} module the module
   * @param {number} index the index of the module
   * @returns {void}
   */
  setPostOrderIndex(module: Module, index: number): void;
  /**
   * @param {Module} module the module
   * @param {number} index the index of the module
   * @returns {boolean} true, if the index was set
   */
  setPostOrderIndexIfUnset(module: Module, index: number): boolean;
  /**
   * @param {Module} module the module
   * @returns {number | null} the depth of the module
   */
  getDepth(module: Module): number | null;
  /**
   * @param {Module} module the module
   * @param {number} depth the depth of the module
   * @returns {void}
   */
  setDepth(module: Module, depth: number): void;
  /**
   * @param {Module} module the module
   * @param {number} depth the depth of the module
   * @returns {boolean} true, if the depth was set
   */
  setDepthIfLower(module: Module, depth: number): boolean;
  /**
   * @param {Module} module the module
   * @returns {boolean} true, if the module is async
   */
  isAsync(module: Module): boolean;
  /**
   * @param {Module} module the module
   * @returns {void}
   */
  setAsync(module: Module): void;
  /**
   * @param {any} thing any thing
   * @returns {Object} metadata
   */
  getMeta(thing: any): any;
  /**
   * @param {any} thing any thing
   * @returns {Object | undefined} metadata
   */
  getMetaIfExisting(thing: any): any | undefined;
  /**
   * @param {string=} cacheStage a persistent stage name for caching
   */
  freeze(cacheStage?: string | undefined): void;
  unfreeze(): void;
  /**
   * @template {any[]} T
   * @template V
   * @param {(moduleGraph: ModuleGraph, ...args: T) => V} fn computer
   * @param {T} args arguments
   * @returns {V} computed value or cached
   */
  cached<T extends any[], V>(
    fn: (moduleGraph: ModuleGraph, ...args: T) => V,
    ...args: T
  ): V;
  /**
   * @param {Map<Module, WeakTupleMap<any, any>>} moduleMemCaches mem caches for modules for better caching
   */
  setModuleMemCaches(
    moduleMemCaches: Map<Module, WeakTupleMap<any, any>>,
  ): void;
  /**
   * @param {Dependency} dependency dependency
   * @param {...any} args arguments, last argument is a function called with moduleGraph, dependency, ...args
   * @returns {any} computed value or cached
   */
  dependencyCacheProvide(dependency: Dependency, ...args: any[]): any;
}
declare namespace ModuleGraph {
  export {
    ModuleGraphConnection,
    DependenciesBlock,
    Dependency,
    ExportInfo,
    Module,
    ModuleProfile,
    RequestShortener,
    RuntimeSpec,
    OptimizationBailoutFunction,
  };
}
type Dependency = import('./Dependency');
import ModuleGraphConnection = require('./ModuleGraphConnection');
type Module = import('./Module');
declare class ModuleGraphModule {
  /** @type {SortableSet<ModuleGraphConnection>} */
  incomingConnections: SortableSet<ModuleGraphConnection>;
  /** @type {SortableSet<ModuleGraphConnection> | undefined} */
  outgoingConnections: SortableSet<ModuleGraphConnection> | undefined;
  /** @type {Module | null} */
  issuer: Module | null;
  /** @type {(string | OptimizationBailoutFunction)[]} */
  optimizationBailout: (string | OptimizationBailoutFunction)[];
  /** @type {ExportsInfo} */
  exports: ExportsInfo;
  /** @type {number | null} */
  preOrderIndex: number | null;
  /** @type {number | null} */
  postOrderIndex: number | null;
  /** @type {number | null} */
  depth: number | null;
  /** @type {ModuleProfile | undefined | null} */
  profile: ModuleProfile | undefined | null;
  /** @type {boolean} */
  async: boolean;
  /** @type {ModuleGraphConnection[]} */
  _unassignedConnections: ModuleGraphConnection[];
}
import WeakTupleMap = require('./util/WeakTupleMap');
type DependenciesBlock = import('./DependenciesBlock');
type ModuleProfile = import('./ModuleProfile');
type OptimizationBailoutFunction = (
  requestShortener: RequestShortener,
) => string;
import ExportsInfo = require('./ExportsInfo');
type ExportInfo = import('./ExportsInfo').ExportInfo;
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
import SortableSet = require('./util/SortableSet');
type RequestShortener = import('./RequestShortener');
