export = ConcatenatedModule;
declare class ConcatenatedModule extends Module {
  /**
   * @param {Module} rootModule the root module of the concatenation
   * @param {Set<Module>} modules all modules in the concatenation (including the root module)
   * @param {RuntimeSpec} runtime the runtime
   * @param {Compilation} compilation the compilation
   * @param {AssociatedObjectForCache=} associatedObjectForCache object for caching
   * @param {string | HashConstructor=} hashFunction hash function to use
   * @returns {ConcatenatedModule} the module
   */
  static create(
    rootModule: Module,
    modules: Set<Module>,
    runtime: RuntimeSpec,
    compilation: Compilation,
    associatedObjectForCache?: AssociatedObjectForCache | undefined,
    hashFunction?: (string | HashConstructor) | undefined,
  ): ConcatenatedModule;
  /**
   * @param {Compilation} compilation the compilation
   * @returns {ConcatenateModuleHooks} the attached hooks
   */
  static getCompilationHooks(compilation: Compilation): ConcatenateModuleHooks;
  /**
   * @param {Module} rootModule the root module of the concatenation
   * @param {Set<Module>} modules all modules in the concatenation (including the root module)
   * @param {AssociatedObjectForCache=} associatedObjectForCache object for caching
   * @param {string | HashConstructor=} hashFunction hash function to use
   * @returns {string} the identifier
   */
  static _createIdentifier(
    rootModule: Module,
    modules: Set<Module>,
    associatedObjectForCache?: AssociatedObjectForCache | undefined,
    hashFunction?: (string | HashConstructor) | undefined,
  ): string;
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
  constructor({
    identifier,
    rootModule,
    modules,
    runtime,
    compilation,
  }: {
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
  _runtime: import('../util/runtime').RuntimeSpec;
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
   * @param {Set<string>} usedNames used names
   */
  _analyseModule(
    modulesMap: ModuleToInfoMap,
    info: ModuleInfo,
    dependencyTemplates: DependencyTemplates,
    runtimeTemplate: RuntimeTemplate,
    moduleGraph: ModuleGraph,
    chunkGraph: ChunkGraph,
    runtime: RuntimeSpec,
    runtimes: RuntimeSpec[],
    codeGenerationResults: CodeGenerationResults,
    usedNames: Set<string>,
  ): void;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {RuntimeSpec} runtime the runtime
   * @returns {[ModuleInfoOrReference[], ModuleToInfoMap]} module info items
   */
  _getModulesWithInfo(
    moduleGraph: ModuleGraph,
    runtime: RuntimeSpec,
  ): [ModuleInfoOrReference[], ModuleToInfoMap];
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace ConcatenatedModule {
  export {
    Reference,
    Scope,
    Variable,
    Source,
    WebpackOptions,
    ChunkGraph,
    CodeGenerationResults,
    Compilation,
    UpdateHashContext,
    DependencyTemplates,
    ExportInfo,
    BuildCallback,
    BuildInfo,
    FileSystemDependencies,
    BuildMeta,
    CodeGenerationContext,
    CodeGenerationResult,
    LibIdentOptions,
    LibIdent,
    NameForCondition,
    ReadOnlyRuntimeRequirements,
    RuntimeRequirements,
    SourceTypes,
    ModuleGraph,
    ModuleGraphConnection,
    ConnectionState,
    RequestShortener,
    ResolverWithOptions,
    RuntimeTemplate,
    ChunkRenderContext,
    Program,
    Range,
    ObjectDeserializerContext,
    Hash,
    HashConstructor,
    ScopeInfo,
    InputFileSystem,
    AssociatedObjectForCache,
    RuntimeSpec,
    InitFragment,
    Comparator,
    Binding,
    ExportName,
    RawBinding,
    SymbolBinding,
    ModuleInfo,
    ModuleInfoOrReference,
    ExportMap,
    ConcatenatedModuleInfo,
    ExternalModuleInfo,
    ReferenceToModuleInfo,
    NonDeferAccess,
    ConcatenationEntry,
    NeededNamespaceObjects,
    ModuleToInfoMap,
    ConcatenateModuleHooks,
    TopLevelDeclarations,
  };
}
import Module = require('../Module');
type Reference = import('eslint-scope').Reference;
type Scope = import('eslint-scope').Scope;
type Variable = import('eslint-scope').Variable;
type Source = import('webpack-sources').Source;
type WebpackOptions =
  import('../config/defaults').WebpackOptionsNormalizedWithDefaults;
type ChunkGraph = import('../ChunkGraph');
type CodeGenerationResults = import('../CodeGenerationResults');
type Compilation = import('../Compilation');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplates = import('../DependencyTemplates');
type ExportInfo = import('../ExportsInfo').ExportInfo;
type BuildCallback = import('../Module').BuildCallback;
type BuildInfo = import('../Module').BuildInfo;
type FileSystemDependencies = import('../Module').FileSystemDependencies;
type BuildMeta = import('../Module').BuildMeta;
type CodeGenerationContext = import('../Module').CodeGenerationContext;
type CodeGenerationResult = import('../Module').CodeGenerationResult;
type LibIdentOptions = import('../Module').LibIdentOptions;
type LibIdent = import('../Module').LibIdent;
type NameForCondition = import('../Module').NameForCondition;
type ReadOnlyRuntimeRequirements =
  import('../Module').ReadOnlyRuntimeRequirements;
type RuntimeRequirements = import('../Module').RuntimeRequirements;
type SourceTypes = import('../Module').SourceTypes;
type ModuleGraph = import('../ModuleGraph');
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ConnectionState = import('../ModuleGraphConnection').ConnectionState;
type RequestShortener = import('../RequestShortener');
type ResolverWithOptions = import('../ResolverFactory').ResolverWithOptions;
type RuntimeTemplate = import('../RuntimeTemplate');
type ChunkRenderContext =
  import('../javascript/JavascriptModulesPlugin').ChunkRenderContext;
type Program = import('../javascript/JavascriptParser').Program;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type Hash = import('../util/Hash');
type HashConstructor = typeof import('../util/Hash');
type ScopeInfo = import('../util/concatenate').ScopeInfo;
type InputFileSystem = import('../util/fs').InputFileSystem;
type AssociatedObjectForCache =
  import('../util/identifier').AssociatedObjectForCache;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type InitFragment<T> = import('../InitFragment')<T>;
type Comparator<T> = import('../util/comparators').Comparator<T>;
type Binding = RawBinding | SymbolBinding;
type ExportName = string[];
type RawBinding = {
  info: ModuleInfo;
  rawName: string;
  comment?: string | undefined;
  ids: ExportName;
  exportName: ExportName;
};
type SymbolBinding = {
  info: ConcatenatedModuleInfo;
  name: string;
  comment?: string | undefined;
  ids: ExportName;
  exportName: ExportName;
};
type ModuleInfo = ConcatenatedModuleInfo | ExternalModuleInfo;
type ModuleInfoOrReference =
  | ConcatenatedModuleInfo
  | ExternalModuleInfo
  | ReferenceToModuleInfo;
type ExportMap = Map<string, string>;
type ConcatenatedModuleInfo = {
  type: 'concatenated';
  module: Module;
  index: number;
  ast: Program | undefined;
  internalSource: Source | undefined;
  source: ReplaceSource | undefined;
  chunkInitFragments?: InitFragment<ChunkRenderContext>[] | undefined;
  runtimeRequirements: ReadOnlyRuntimeRequirements | undefined;
  globalScope: Scope | undefined;
  moduleScope: Scope | undefined;
  internalNames: Map<string, string>;
  exportMap: ExportMap | undefined;
  rawExportMap: ExportMap | undefined;
  namespaceExportSymbol?: string | undefined;
  namespaceObjectName: string | undefined;
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
};
type ExternalModuleInfo = {
  type: 'external';
  module: Module;
  runtimeCondition: RuntimeSpec | boolean;
  nonDeferAccess: NonDeferAccess;
  index: number;
  /**
   * module.exports / harmony namespace object
   */
  name: string | undefined;
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
};
type ReferenceToModuleInfo = {
  type: 'reference';
  runtimeCondition: RuntimeSpec | boolean;
  nonDeferAccess: NonDeferAccess;
  target: ModuleInfo;
};
type NonDeferAccess = boolean;
type ConcatenationEntry = {
  type: 'concatenated' | 'external';
  module: Module;
  runtimeCondition: RuntimeSpec | boolean;
  nonDeferAccess: NonDeferAccess;
};
type NeededNamespaceObjects = Set<ConcatenatedModuleInfo>;
type ModuleToInfoMap = Map<Module, ModuleInfo>;
type ConcatenateModuleHooks = {
  onDemandExportsGeneration: SyncBailHook<
    [ConcatenatedModule, RuntimeSpec[], string, Record<string, string>],
    boolean
  >;
  concatenatedModuleInfo: SyncBailHook<
    [Partial<ConcatenatedModuleInfo>, ConcatenatedModuleInfo],
    boolean | void
  >;
};
type TopLevelDeclarations = BuildInfo['topLevelDeclarations'];
import { ReplaceSource } from 'webpack-sources';
import ConcatenationScope = require('../ConcatenationScope');
import { SyncBailHook } from 'tapable';
