export = ConcatenatedModule;
declare class ConcatenatedModule extends Module {
  /**
   * @param {Module} rootModule the root module of the concatenation
   * @param {Set<Module>} modules all modules in the concatenation (including the root module)
   * @param {RuntimeSpec} runtime the runtime
   * @param {Compilation} compilation the compilation
   * @param {object=} associatedObjectForCache object for caching
   * @param {string | HashConstructor=} hashFunction hash function to use
   * @returns {ConcatenatedModule} the module
   */
  static create(
    rootModule: Module,
    modules: Set<Module>,
    runtime: RuntimeSpec,
    compilation: Compilation,
    associatedObjectForCache?: object | undefined,
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
   * @param {object=} associatedObjectForCache object for caching
   * @param {string | HashConstructor=} hashFunction hash function to use
   * @returns {string} the identifier
   */
  static _createIdentifier(
    rootModule: Module,
    modules: Set<Module>,
    associatedObjectForCache?: object | undefined,
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
   * @param {Module=} options.rootModule the root module of the concatenation
   * @param {RuntimeSpec} options.runtime the selected runtime
   * @param {Set<Module>=} options.modules all concatenated modules
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
    rootModule?: Module | undefined;
    runtime: RuntimeSpec;
    modules?: Set<Module> | undefined;
    compilation: Compilation;
  });
  /** @type {string} */
  _identifier: string;
  /** @type {Module} */
  rootModule: Module;
  /** @type {Set<Module>} */
  _modules: Set<Module>;
  _runtime: import('../util/runtime').RuntimeSpec;
  /** @type {Compilation | undefined} */
  compilation: Compilation | undefined;
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
   * @param {Map<Module, ModuleInfo>} modulesMap modulesMap
   * @param {ModuleInfo} info info
   * @param {DependencyTemplates} dependencyTemplates dependencyTemplates
   * @param {RuntimeTemplate} runtimeTemplate runtimeTemplate
   * @param {ModuleGraph} moduleGraph moduleGraph
   * @param {ChunkGraph} chunkGraph chunkGraph
   * @param {RuntimeSpec} runtime runtime
   * @param {CodeGenerationResults} codeGenerationResults codeGenerationResults
   */
  _analyseModule(
    modulesMap: Map<Module, ModuleInfo>,
    info: ModuleInfo,
    dependencyTemplates: DependencyTemplates,
    runtimeTemplate: RuntimeTemplate,
    moduleGraph: ModuleGraph,
    chunkGraph: ChunkGraph,
    runtime: RuntimeSpec,
    codeGenerationResults: CodeGenerationResults,
  ): void;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {RuntimeSpec} runtime the runtime
   * @returns {[ModuleInfoOrReference[], Map<Module, ModuleInfo>]} module info items
   */
  _getModulesWithInfo(
    moduleGraph: ModuleGraph,
    runtime: RuntimeSpec,
  ): [ModuleInfoOrReference[], Map<Module, ModuleInfo>];
  /**
   * @param {string} oldName old name
   * @param {UsedNames} usedNamed1 used named 1
   * @param {UsedNames} usedNamed2 used named 2
   * @param {string} extraInfo extra info
   * @returns {string} found new name
   */
  findNewName(
    oldName: string,
    usedNamed1: UsedNames,
    usedNamed2: UsedNames,
    extraInfo: string,
  ): string;
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
    Dependency,
    UpdateHashContext,
    DependencyTemplateContext,
    DependencyTemplates,
    ExportInfo,
    BuildInfo,
    BuildMeta,
    CodeGenerationContext,
    CodeGenerationResult,
    LibIdentOptions,
    ReadOnlyRuntimeRequirements,
    SourceTypes,
    ModuleGraph,
    ModuleGraphConnection,
    ConnectionState,
    ModuleParseError,
    RequestShortener,
    ResolverWithOptions,
    RuntimeTemplate,
    WebpackError,
    ChunkRenderContext,
    Program,
    Range,
    ObjectDeserializerContext,
    Hash,
    HashConstructor,
    InputFileSystem,
    RuntimeSpec,
    InitFragment,
    Comparator,
    ReexportInfo,
    Binding,
    RawBinding,
    SymbolBinding,
    ModuleInfo,
    ModuleInfoOrReference,
    ConcatenatedModuleInfo,
    ExternalModuleInfo,
    ReferenceToModuleInfo,
    UsedNames,
    ConcatenationEntry,
    ConcatenateModuleHooks,
  };
}
import Module = require('../Module');
type Reference = import('eslint-scope').Reference;
type Scope = import('eslint-scope').Scope;
type Variable = import('eslint-scope').Variable;
type Source = import('webpack-sources').Source;
type WebpackOptions =
  import('../../declarations/WebpackOptions').WebpackOptionsNormalized;
type ChunkGraph = import('../ChunkGraph');
type CodeGenerationResults = import('../CodeGenerationResults');
type Compilation = import('../Compilation');
type Dependency = import('../Dependency');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type DependencyTemplates = import('../DependencyTemplates');
type ExportInfo = import('../ExportsInfo').ExportInfo;
type BuildInfo = import('../Module').BuildInfo;
type BuildMeta = import('../Module').BuildMeta;
type CodeGenerationContext = import('../Module').CodeGenerationContext;
type CodeGenerationResult = import('../Module').CodeGenerationResult;
type LibIdentOptions = import('../Module').LibIdentOptions;
type ReadOnlyRuntimeRequirements =
  import('../Module').ReadOnlyRuntimeRequirements;
type SourceTypes = import('../Module').SourceTypes;
type ModuleGraph = import('../ModuleGraph');
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ConnectionState = import('../ModuleGraphConnection').ConnectionState;
type ModuleParseError = import('../ModuleParseError');
type RequestShortener = import('../RequestShortener');
type ResolverWithOptions = import('../ResolverFactory').ResolverWithOptions;
type RuntimeTemplate = import('../RuntimeTemplate');
type WebpackError = import('../WebpackError');
type ChunkRenderContext =
  import('../javascript/JavascriptModulesPlugin').ChunkRenderContext;
type Program = import('../javascript/JavascriptParser').Program;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type Hash = import('../util/Hash');
type HashConstructor = typeof import('../util/Hash');
type InputFileSystem = import('../util/fs').InputFileSystem;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type InitFragment<T> = import('../InitFragment')<T>;
type Comparator<T> = import('../util/comparators').Comparator<T>;
type ReexportInfo = {
  module: Module;
  export: string[];
};
type Binding = RawBinding | SymbolBinding;
type RawBinding = {
  info: ModuleInfo;
  rawName: string;
  comment?: string | undefined;
  ids: string[];
  exportName: string[];
};
type SymbolBinding = {
  info: ConcatenatedModuleInfo;
  name: string;
  comment?: string | undefined;
  ids: string[];
  exportName: string[];
};
type ModuleInfo = ConcatenatedModuleInfo | ExternalModuleInfo;
type ModuleInfoOrReference =
  | ConcatenatedModuleInfo
  | ExternalModuleInfo
  | ReferenceToModuleInfo;
type ConcatenatedModuleInfo = {
  type: 'concatenated';
  module: Module;
  index: number;
  ast: Program | undefined;
  internalSource: Source | undefined;
  source: ReplaceSource;
  chunkInitFragments?: InitFragment<ChunkRenderContext>[] | undefined;
  runtimeRequirements: ReadOnlyRuntimeRequirements | undefined;
  globalScope: Scope | undefined;
  moduleScope: Scope | undefined;
  internalNames: Map<string, string>;
  exportMap: Map<string, string> | undefined;
  rawExportMap: Map<string, string> | undefined;
  namespaceExportSymbol?: string | undefined;
  namespaceObjectName: string | undefined;
  interopNamespaceObjectUsed: boolean;
  interopNamespaceObjectName: string | undefined;
  interopNamespaceObject2Used: boolean;
  interopNamespaceObject2Name: string | undefined;
  interopDefaultAccessUsed: boolean;
  interopDefaultAccessName: string | undefined;
};
type ExternalModuleInfo = {
  type: 'external';
  module: Module;
  runtimeCondition: RuntimeSpec | boolean;
  index: number;
  name: string | undefined;
  interopNamespaceObjectUsed: boolean;
  interopNamespaceObjectName: string | undefined;
  interopNamespaceObject2Used: boolean;
  interopNamespaceObject2Name: string | undefined;
  interopDefaultAccessUsed: boolean;
  interopDefaultAccessName: string | undefined;
};
type ReferenceToModuleInfo = {
  type: 'reference';
  runtimeCondition: RuntimeSpec | boolean;
  target: ConcatenatedModuleInfo | ExternalModuleInfo;
};
type UsedNames = Set<string>;
type ConcatenationEntry = {
  type: 'concatenated' | 'external';
  module: Module;
  runtimeCondition: RuntimeSpec | boolean;
};
type ConcatenateModuleHooks = {
  exportsDefinitions: SyncBailHook<[Record<string, string>], boolean>;
};
import { ReplaceSource } from 'webpack-sources';
import { SyncBailHook } from 'tapable';
