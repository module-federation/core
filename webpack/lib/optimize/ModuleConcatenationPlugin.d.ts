export = ModuleConcatenationPlugin;
declare class ModuleConcatenationPlugin {
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
    _getImports(compilation: Compilation, module: Module, runtime: RuntimeSpec): Set<Module>;
    /**
     * @param {Compilation} compilation webpack compilation
     * @param {ConcatConfiguration} config concat configuration (will be modified when added)
     * @param {Module} module the module to be added
     * @param {RuntimeSpec} runtime the runtime scope of the generated code
     * @param {RuntimeSpec} activeRuntime the runtime scope of the root module
     * @param {Set<Module>} possibleModules modules that are candidates
     * @param {Set<Module>} candidates list of potential candidates (will be added to)
     * @param {Map<Module, Module | ((requestShortener: RequestShortener) => string)>} failureCache cache for problematic modules to be more performant
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {boolean} avoidMutateOnFailure avoid mutating the config when adding fails
     * @param {Statistics} statistics gathering metrics
     * @returns {null | Module | ((requestShortener: RequestShortener) => string)} the problematic module
     */
    _tryToAdd(compilation: Compilation, config: ConcatConfiguration, module: Module, runtime: RuntimeSpec, activeRuntime: RuntimeSpec, possibleModules: Set<Module>, candidates: Set<Module>, failureCache: Map<Module, Module | ((requestShortener: RequestShortener) => string)>, chunkGraph: ChunkGraph, avoidMutateOnFailure: boolean, statistics: Statistics): null | Module | ((requestShortener: RequestShortener) => string);
}
declare namespace ModuleConcatenationPlugin {
    export { Compilation, Compiler, Module, BuildInfo, RequestShortener, RuntimeSpec, Statistics, Problem, Warnings };
}
/** @typedef {Module | ((requestShortener: RequestShortener) => string)} Problem */
/** @typedef {Map<Module, Problem>} Warnings */
declare class ConcatConfiguration {
    /**
     * @param {Module} rootModule the root module
     * @param {RuntimeSpec} runtime the runtime
     */
    constructor(rootModule: Module, runtime: RuntimeSpec);
    rootModule: import("../Module");
    runtime: import("../util/runtime").RuntimeSpec;
    /** @type {Set<Module>} */
    modules: Set<Module>;
    /** @type {Warnings} */
    warnings: Warnings;
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
     * @param {Problem} problem the problem
     */
    addWarning(module: Module, problem: Problem): void;
    /**
     * @returns {Warnings} warnings
     */
    getWarningsSorted(): Warnings;
    /**
     * @returns {Set<Module>} modules as set
     */
    getModules(): Set<Module>;
    snapshot(): number;
    /**
     * @param {number} snapshot snapshot
     */
    rollback(snapshot: number): void;
}
import ChunkGraph = require("../ChunkGraph");
type Compilation = import("../Compilation");
type Compiler = import("../Compiler");
type Module = import("../Module");
type BuildInfo = import("../Module").BuildInfo;
type RequestShortener = import("../RequestShortener");
type RuntimeSpec = import("../util/runtime").RuntimeSpec;
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
type Problem = Module | ((requestShortener: RequestShortener) => string);
type Warnings = Map<Module, Problem>;
