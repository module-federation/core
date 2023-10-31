export = ModuleConcatenationPlugin;
declare class ModuleConcatenationPlugin {
  constructor(options: any);
  options: any;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   * @param {Compilation} compilation the compilation
   * @param {Module} module the module to be added
   * @param {RuntimeSpec} runtime the runtime scope
   * @returns {Set<Module>} the imported modules
   */
  _getImports(
    compilation: Compilation,
    module: Module,
    runtime: RuntimeSpec,
  ): Set<Module>;
  /**
   * @param {Compilation} compilation webpack compilation
   * @param {ConcatConfiguration} config concat configuration (will be modified when added)
   * @param {Module} module the module to be added
   * @param {RuntimeSpec} runtime the runtime scope of the generated code
   * @param {RuntimeSpec} activeRuntime the runtime scope of the root module
   * @param {Set<Module>} possibleModules modules that are candidates
   * @param {Set<Module>} candidates list of potential candidates (will be added to)
   * @param {Map<Module, Module | function(RequestShortener): string>} failureCache cache for problematic modules to be more performant
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {boolean} avoidMutateOnFailure avoid mutating the config when adding fails
   * @param {Statistics} statistics gathering metrics
   * @returns {null | Module | function(RequestShortener): string} the problematic module
   */
  _tryToAdd(
    compilation: Compilation,
    config: ConcatConfiguration,
    module: Module,
    runtime: RuntimeSpec,
    activeRuntime: RuntimeSpec,
    possibleModules: Set<Module>,
    candidates: Set<Module>,
    failureCache: Map<Module, Module | ((arg0: RequestShortener) => string)>,
    chunkGraph: ChunkGraph,
    avoidMutateOnFailure: boolean,
    statistics: Statistics,
  ): null | Module | ((arg0: RequestShortener) => string);
}
declare namespace ModuleConcatenationPlugin {
  export {
    Compilation,
    Compiler,
    Module,
    RequestShortener,
    RuntimeSpec,
    Statistics,
  };
}
type Compiler = import('../Compiler');
type Compilation = import('../Compilation');
type Module = import('../Module');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
declare class ConcatConfiguration {
  /**
   * @param {Module} rootModule the root module
   * @param {RuntimeSpec} runtime the runtime
   */
  constructor(rootModule: Module, runtime: RuntimeSpec);
  rootModule: import('../Module');
  runtime: import('../util/runtime').RuntimeSpec;
  /** @type {Set<Module>} */
  modules: Set<Module>;
  /** @type {Map<Module, Module | function(RequestShortener): string>} */
  warnings: Map<
    import('../Module'),
    import('../Module') | ((arg0: RequestShortener) => string)
  >;
  /**
   * @param {Module} module the module
   */
  add(module: Module): void;
  /**
   * @param {Module} module the module
   * @returns {boolean} true, when the module is in the module set
   */
  has(module: Module): boolean;
  isEmpty(): boolean;
  /**
   * @param {Module} module the module
   * @param {Module | function(RequestShortener): string} problem the problem
   */
  addWarning(
    module: Module,
    problem: Module | ((arg0: RequestShortener) => string),
  ): void;
  /**
   * @returns {Map<Module, Module | function(RequestShortener): string>} warnings
   */
  getWarningsSorted(): Map<
    Module,
    Module | ((arg0: RequestShortener) => string)
  >;
  /**
   * @returns {Set<Module>} modules as set
   */
  getModules(): Set<Module>;
  snapshot(): number;
  rollback(snapshot: any): void;
}
type RequestShortener = import('../RequestShortener');
import ChunkGraph = require('../ChunkGraph');
type Statistics = {
  cached: number;
  alreadyInConfig: number;
  invalidModule: number;
  incorrectChunks: number;
  incorrectDependency: number;
  incorrectModuleDependency: number;
  incorrectChunksOfImporter: number;
  incorrectRuntimeCondition: number;
  importerFailed: number;
  added: number;
};
