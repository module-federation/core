export = ConcatenatedModule;
/**
 * @typedef {object} ConcatenateModuleHooks
 * @property {SyncBailHook<[Partial<ConcatenatedModuleInfo>, ConcatenatedModuleInfo], boolean | void>} concatenatedModuleInfo
 */
/** @typedef {BuildInfo["topLevelDeclarations"]} TopLevelDeclarations */
/**
 * Defines the build info properties specific to concatenated modules.
 * @typedef {object} KnownConcatenatedModuleBuildInfo
 * @property {FileSystemDependencies=} fileDependencies
 * @property {FileSystemDependencies=} contextDependencies
 * @property {FileSystemDependencies=} missingDependencies
 * @property {boolean=} needCreateRequire collected from the inner modules
 * @property {boolean=} inlineExports taken over from the root module
 */
/** @typedef {BuildInfo & KnownConcatenatedModuleBuildInfo} ConcatenatedModuleBuildInfo */
declare class ConcatenatedModule extends Module {
    /**
     * @param {Module} rootModule the root module of the concatenation
     * @param {Set<Module>} modules all modules in the concatenation (including the root module)
     * @param {RuntimeSpec} runtime the runtime
     * @param {Compilation} compilation the compilation
     * @param {AssociatedObjectForCache=} associatedObjectForCache object for caching
     * @param {HashFunction=} hashFunction hash function to use
     * @returns {ConcatenatedModule} the module
     */
    static create(rootModule: Module, modules: Set<Module>, runtime: RuntimeSpec, compilation: Compilation, associatedObjectForCache?: AssociatedObjectForCache | undefined, hashFunction?: Hash.HashFunction | undefined): ConcatenatedModule;
    /**
     * @param {Module} rootModule the root module of the concatenation
     * @param {Set<Module>} modules all modules in the concatenation (including the root module)
     * @param {AssociatedObjectForCache=} associatedObjectForCache object for caching
     * @param {HashFunction=} hashFunction hash function to use
     * @returns {string} the identifier
     */
    static _createIdentifier(rootModule: Module, modules: Set<Module>, associatedObjectForCache?: AssociatedObjectForCache | undefined, hashFunction?: Hash.HashFunction | undefined): string;
    /**
     * @param {ObjectDeserializerContext} context context
     * @returns {ConcatenatedModule} ConcatenatedModule
     */
    static deserialize(context: ObjectDeserializerContext): ConcatenatedModule;
    /**
     * @param {object} options options
     * @param {string} options.identifier the identifier of the module
     * @param {Module} options.rootModule the root module of the concatenation
     * @param {RuntimeSpec} options.runtime the selected runtime
     * @param {Set<Module>} options.modules all concatenated modules
     * @param {Compilation} options.compilation the compilation
     */
    constructor({ identifier, rootModule, modules, runtime, compilation }: {
        identifier: string;
        rootModule: Module;
        runtime: RuntimeSpec;
        modules: Set<Module>;
        compilation: Compilation;
    });
    /** @type {string} */
    _identifier: string;
    /** @type {Module} */
    rootModule: Module;
    /** @type {Set<Module>} */
    _modules: Set<Module>;
    /** @type {RuntimeSpec} */
    _runtime: RuntimeSpec;
    /** @type {Compilation} */
    compilation: Compilation;
    get modules(): Module[];
    /**
     * @private
     * @param {Module} rootModule the root of the concatenation
     * @param {Set<Module>} modulesSet a set of modules which should be concatenated
     * @param {RuntimeSpec} runtime for this runtime
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {ConcatenationEntry[]} concatenation list
     */
    private _createConcatenationList;
    /**
     * @param {ModuleToInfoMap} modulesMap modulesMap
     * @param {ModuleInfo} info info
     * @param {DependencyTemplates} dependencyTemplates dependencyTemplates
     * @param {RuntimeTemplate} runtimeTemplate runtimeTemplate
     * @param {ModuleGraph} moduleGraph moduleGraph
     * @param {ChunkGraph} chunkGraph chunkGraph
     * @param {RuntimeSpec} runtime runtime
     * @param {RuntimeSpec[]} runtimes runtimes
     * @param {CodeGenerationResults} codeGenerationResults codeGenerationResults
     * @param {UsedNames} usedNames used names
     */
    _analyseModule(modulesMap: ModuleToInfoMap, info: ModuleInfo, dependencyTemplates: DependencyTemplates, runtimeTemplate: RuntimeTemplate, moduleGraph: ModuleGraph, chunkGraph: ChunkGraph, runtime: RuntimeSpec, runtimes: RuntimeSpec[], codeGenerationResults: CodeGenerationResults, usedNames: UsedNames): void;
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {RuntimeSpec} runtime the runtime
     * @returns {[ModuleInfoOrReference[], ModuleToInfoMap]} module info items
     */
    _getModulesWithInfo(moduleGraph: ModuleGraph, runtime: RuntimeSpec): [ModuleInfoOrReference[], ModuleToInfoMap];
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: Dependency.UpdateHashContext): void;
}
declare namespace ConcatenatedModule {
    export { getCompilationHooks, KINDS, getChunkGraphModule, InitFragment, Comparator, Binding, ExportName, RawBinding, SymbolBinding, ModuleInfo, ModuleInfoOrReference, ExportMap, ConcatenatedModuleInfo, ExternalModuleInfo, ReferenceToModuleInfo, NonDeferAccess, ConcatenationEntry, NeededNamespaceObjects, ModuleToInfoMap, ConcatenateModuleHooks, TopLevelDeclarations, KnownConcatenatedModuleBuildInfo, ConcatenatedModuleBuildInfo };
}
import Module = require("../module/Module");
import type { RuntimeSpec } from "../util/runtime";
import type Compilation from "../Compilation";
import type DependencyTemplates from "../template/DependencyTemplates";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import type ModuleGraph from "../graph/ModuleGraph";
import type ChunkGraph from "../graph/ChunkGraph";
import type CodeGenerationResults from "../module/CodeGenerationResults";
import type { UsedNames } from "../util/concatenate";
import type Hash from "../util/Hash";
import Dependency = require("../graph/Dependency");
import type { AssociatedObjectForCache } from "../util/identifier";
import type { ObjectDeserializerContext } from "../serialization/ObjectMiddleware";
declare var getCompilationHooks: (compilation: import("../Compilation")) => ConcatenateModuleHooks;
declare var KINDS: Set<keyof Module.ModuleKinds>;
/**
 * The module the chunk graph holds for `module`: concatenation replaces every module
 * it absorbs with one `ConcatenatedModule`, so an absorbed module is itself in no
 * chunk and no runtime, and asking the chunk graph about it answers about nothing.
 * @param {Compilation} compilation the compilation
 * @param {Module} module a module, possibly absorbed by concatenation
 * @returns {Module} the module the chunk graph holds, or `module` itself
 */
declare function getChunkGraphModule(compilation: Compilation, module: Module): Module;
type InitFragment<T> = import("../template/InitFragment")<T>;
type Comparator<T> = import("../util/comparators").Comparator<T>;
type Binding = RawBinding | SymbolBinding;
type ExportName = string[];
type RawBinding = {
    info: ModuleInfo;
    rawName: string;
    comment?: string | undefined;
    ids: ExportName;
    exportName: ExportName;
    /**
     * the raw name is the wrapper accessor call itself, so it binds looser than the identifier it replaces
     */
    accessorCall?: boolean | undefined;
};
type SymbolBinding = {
    info: ConcatenatedModuleInfo;
    name: string;
    comment?: string | undefined;
    ids: ExportName;
    exportName: ExportName;
};
type ModuleInfo = ConcatenatedModuleInfo | ExternalModuleInfo;
type ModuleInfoOrReference = ConcatenatedModuleInfo | ExternalModuleInfo | ReferenceToModuleInfo;
type ExportMap = Map<string, string>;
type ConcatenatedModuleInfo = {
    type: "concatenated";
    /**
     * the body renders inside the lazy CJS wrapper with real module/exports instead of being scope-hoisted into the shared scope
     */
    wrapped: boolean;
    /**
     * a wrapped body reached by an eager import edge, so its accessor is called at its own slot in evaluation order
     */
    eager: boolean;
    module: Module;
    index: number;
    /**
     * where each shorthand property's identifier starts
     */
    shorthandIdentifierStarts: Set<number> | undefined;
    internalSource: Source | undefined;
    source: ReplaceSource | undefined;
    chunkInitFragments?: InitFragment<ChunkRenderContext>[] | undefined;
    runtimeRequirements: Module.ReadOnlyRuntimeRequirements | undefined;
    globalScope: Scope | undefined;
    /**
     * the module's free references
     */
    unresolvedReferences: Reference[] | undefined;
    moduleScope: Scope | undefined;
    internalNames: Map<string, string>;
    exportMap: ExportMap | undefined;
    rawExportMap: ExportMap | undefined;
    namespaceExportSymbol?: string | undefined;
    /**
     * name of the lazy wrapper accessor function (calling it evaluates the module and returns its exports)
     */
    namespaceFnName: string | undefined;
    namespaceObjectName: string | undefined;
    /**
     * decoupled namespace object that keeps original export names when the exports are mangled
     */
    escapeNamespaceObjectName: string | undefined;
    concatenationScope: ConcatenationScope | undefined;
    /**
     * "default-with-named" namespace
     */
    interopNamespaceObjectUsed: boolean;
    /**
     * "default-with-named" namespace
     */
    interopNamespaceObjectName: string | undefined;
    /**
     * "default-only" namespace
     */
    interopNamespaceObject2Used: boolean;
    /**
     * "default-only" namespace
     */
    interopNamespaceObject2Name: string | undefined;
    /**
     * runtime namespace object that detects "__esModule"
     */
    interopDefaultAccessUsed: boolean;
    /**
     * runtime namespace object that detects "__esModule"
     */
    interopDefaultAccessName: string | undefined;
    /**
     * memoized getExportsType(strict=true)
     */
    exportsTypeStrict?: Module.ExportsType | undefined;
    /**
     * memoized getExportsType(strict=false)
     */
    exportsTypeNonStrict?: Module.ExportsType | undefined;
};
type ExternalModuleInfo = {
    type: "external";
    /**
     * the module's `require()` call is deferred behind an accessor instead of running at its own slot; unlike a wrapped concatenated member there is no body and no CJS wrapper, so any external may be wrapped
     */
    wrapped: boolean;
    /**
     * a wrapped module reached by an eager import edge, so its accessor is called at its own slot in evaluation order
     */
    eager: boolean;
    module: Module;
    runtimeCondition: RuntimeSpec | boolean;
    nonDeferAccess: NonDeferAccess;
    index: number;
    /**
     * module.exports / harmony namespace object
     */
    name: string | undefined;
    /**
     * lazy module accessor
     */
    namespaceFnName: string | undefined;
    /**
     * decoupled namespace object that keeps original export names when the exports are mangled
     */
    escapeNamespaceObjectName: string | undefined;
    /**
     * deferred module.exports / harmony namespace object
     */
    deferredName: string | undefined;
    /**
     * the module is deferred at least once
     */
    deferred: boolean;
    /**
     * deferred namespace object that being used in a not-analyzable way so it must be materialized
     */
    deferredNamespaceObjectUsed: boolean;
    /**
     * deferred namespace object that being used in a not-analyzable way so it must be materialized
     */
    deferredNamespaceObjectName: string | undefined;
    /**
     * an import reads the spec namespace object the module hands out
     */
    specNamespaceObjectUsed: boolean;
    /**
     * "default-with-named" namespace
     */
    interopNamespaceObjectUsed: boolean;
    /**
     * "default-with-named" namespace
     */
    interopNamespaceObjectName: string | undefined;
    /**
     * "default-only" namespace
     */
    interopNamespaceObject2Used: boolean;
    /**
     * "default-only" namespace
     */
    interopNamespaceObject2Name: string | undefined;
    /**
     * runtime namespace object that detects "__esModule"
     */
    interopDefaultAccessUsed: boolean;
    /**
     * runtime namespace object that detects "__esModule"
     */
    interopDefaultAccessName: string | undefined;
    /**
     * memoized getExportsType(strict=true)
     */
    exportsTypeStrict?: Module.ExportsType | undefined;
    /**
     * memoized getExportsType(strict=false)
     */
    exportsTypeNonStrict?: Module.ExportsType | undefined;
};
type ReferenceToModuleInfo = {
    type: "reference";
    runtimeCondition: RuntimeSpec | boolean;
    nonDeferAccess: NonDeferAccess;
    target: ModuleInfo;
};
type NonDeferAccess = boolean;
type ConcatenationEntry = {
    type: "concatenated" | "external";
    /**
     * evaluation is deferred behind an accessor: a "concatenated" entry renders its body inside the lazy CJS wrapper instead of being scope-hoisted, an "external" entry only defers its `require()` call
     */
    wrapped: boolean;
    module: Module;
    runtimeCondition: RuntimeSpec | boolean;
    nonDeferAccess: NonDeferAccess;
};
type NeededNamespaceObjects = Set<ConcatenatedModuleInfo>;
type ModuleToInfoMap = Map<Module, ModuleInfo>;
type ConcatenateModuleHooks = {
    concatenatedModuleInfo: SyncBailHook<[Partial<ConcatenatedModuleInfo>, ConcatenatedModuleInfo], boolean | void>;
};
type TopLevelDeclarations = Module.BuildInfo["topLevelDeclarations"];
/**
 * Defines the build info properties specific to concatenated modules.
 */
type KnownConcatenatedModuleBuildInfo = {
    fileDependencies?: Compilation.FileSystemDependencies | undefined;
    contextDependencies?: Compilation.FileSystemDependencies | undefined;
    missingDependencies?: Compilation.FileSystemDependencies | undefined;
    /**
     * collected from the inner modules
     */
    needCreateRequire?: boolean | undefined;
    /**
     * taken over from the root module
     */
    inlineExports?: boolean | undefined;
};
type ConcatenatedModuleBuildInfo = Module.BuildInfo & KnownConcatenatedModuleBuildInfo;
import type { Source } from "webpack-sources";
import { ReplaceSource } from "webpack-sources";
import type { ChunkRenderContext } from "../javascript/JavascriptModulesPlugin";
import type { Scope } from "../javascript/JavascriptModulesPlugin";
import type { Reference } from "../javascript/JavascriptModulesPlugin";
import ConcatenationScope = require("./ConcatenationScope");
import { SyncBailHook } from "tapable";
