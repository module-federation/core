export = ModuleConcatenationPlugin;
declare class ModuleConcatenationPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * Checks whether the module `import defer`s a module already in the config.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {Module} module the candidate module
     * @param {ConcatConfiguration} config the concat configuration
     * @returns {boolean} true when a deferred import targets a module in the config
     */
    _defersModuleIn(moduleGraph: ModuleGraph, module: Module, config: ConcatConfiguration): boolean;
    /**
     * Returns the imported modules.
     * @param {Compilation} compilation the compilation
     * @param {Module} module the module to be added
     * @param {RuntimeSpec} runtime the runtime scope
     * @returns {Set<Module>} the imported modules
     */
    _getImports(compilation: Compilation, module: Module, runtime: RuntimeSpec): Set<Module>;
    /**
     * Returns the problematic module.
     * @param {Compilation} compilation webpack compilation
     * @param {ConcatConfiguration} config concat configuration (will be modified when added)
     * @param {Module} module the module to be added
     * @param {RuntimeSpec} runtime the runtime scope of the generated code
     * @param {RuntimeSpec} activeRuntime the runtime scope of the root module
     * @param {Set<Module>} possibleModules modules that are candidates
     * @param {Set<Module>} candidates list of potential candidates (will be added to)
     * @param {Map<Module, Problem>} failureCache cache for problematic modules to be more performant
     * @param {Map<Module, RuntimeSpec>} moduleRuntimeCache memoized merged runtime per module, shared across roots
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {boolean} avoidMutateOnFailure avoid mutating the config when adding fails
     * @param {Statistics} statistics gathering metrics
     * @returns {null | Problem} the problematic module
     */
    _tryToAdd(compilation: Compilation, config: ConcatConfiguration, module: Module, runtime: RuntimeSpec, activeRuntime: RuntimeSpec, possibleModules: Set<Module>, candidates: Set<Module>, failureCache: Map<Module, Problem>, moduleRuntimeCache: Map<Module, RuntimeSpec>, chunkGraph: ChunkGraph, avoidMutateOnFailure: boolean, statistics: Statistics): null | Problem;
}
declare namespace ModuleConcatenationPlugin {
    export { BAILOUT_PREFIX, REJECTED_PREFIX, Problem, Statistics, Warnings };
}
import type Compiler from "../Compiler";
import ModuleGraph = require("../graph/ModuleGraph");
import Module = require("../module/Module");
/** @typedef {Map<Module, Problem>} Warnings */
declare class ConcatConfiguration {
    /**
     * Creates an instance of ConcatConfiguration.
     * @param {Module} rootModule the root module
     * @param {RuntimeSpec} runtime the runtime
     * @param {Chunk[]} rootChunks the chunks the root module is in
     */
    constructor(rootModule: Module, runtime: RuntimeSpec, rootChunks: Chunk[]);
    /** @type {Module} */
    rootModule: Module;
    /** @type {RuntimeSpec} */
    runtime: RuntimeSpec;
    /** @type {Chunk[]} the root's chunks, reused for every candidate's chunk check */
    rootChunks: Chunk[];
    /** @type {Set<Module>} */
    modules: Set<Module>;
    /** @type {Warnings} */
    warnings: Warnings;
    /**
     * Processes the provided module.
     * @param {Module} module the module
     */
    add(module: Module): void;
    /**
     * Returns true, when the module is in the module set.
     * @param {Module} module the module
     * @returns {boolean} true, when the module is in the module set
     */
    has(module: Module): boolean;
    isEmpty(): boolean;
    /**
     * Adds the provided module to the concat configuration.
     * @param {Module} module the module
     * @param {Problem} problem the problem
     */
    addWarning(module: Module, problem: Problem): void;
    /**
     * Gets warnings sorted.
     * @returns {Warnings} warnings
     */
    getWarningsSorted(): Warnings;
    /**
     * Returns modules as set.
     * @returns {Set<Module>} modules as set
     */
    getModules(): Set<Module>;
    snapshot(): number;
    /**
     * Processes the provided snapshot.
     * @param {number} snapshot snapshot
     */
    rollback(snapshot: number): void;
}
import type Compilation from "../Compilation";
import type { RuntimeSpec } from "../util/runtime";
import ChunkGraph = require("../graph/ChunkGraph");
declare const BAILOUT_PREFIX: "ModuleConcatenation bailout: ";
declare const REJECTED_PREFIX: "Cannot concat with ";
type Problem = Module | ((requestShortener: RequestShortener) => string);
/**
 * Defines the statistics type used by this module.
 */
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
type Warnings = Map<Module, Problem>;
import type Chunk from "../graph/Chunk";
import type RequestShortener from "../util/RequestShortener";
