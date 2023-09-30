export = ConcatenatedModule;
declare class ConcatenatedModule extends Module {
  /**
   * @param {Module} rootModule the root module of the concatenation
   * @param {Set<Module>} modules all modules in the concatenation (including the root module)
   * @param {RuntimeSpec} runtime the runtime
   * @param {Object=} associatedObjectForCache object for caching
   * @param {string | HashConstructor=} hashFunction hash function to use
   * @returns {ConcatenatedModule} the module
   */
  static create(
    rootModule: Module,
    modules: Set<Module>,
    runtime: RuntimeSpec,
    associatedObjectForCache?: any | undefined,
    hashFunction?: (string | HashConstructor) | undefined,
  ): ConcatenatedModule;
  /**
   * @param {Module} rootModule the root module of the concatenation
   * @param {Set<Module>} modules all modules in the concatenation (including the root module)
   * @param {Object=} associatedObjectForCache object for caching
   * @param {string | HashConstructor=} hashFunction hash function to use
   * @returns {string} the identifier
   */
  static _createIdentifier(
    rootModule: Module,
    modules: Set<Module>,
    associatedObjectForCache?: any | undefined,
    hashFunction?: (string | HashConstructor) | undefined,
  ): string;
  static deserialize(context: any): import('./ConcatenatedModule');
  /**
   * @param {Object} options options
   * @param {string} options.identifier the identifier of the module
   * @param {Module=} options.rootModule the root module of the concatenation
   * @param {RuntimeSpec} options.runtime the selected runtime
   * @param {Set<Module>=} options.modules all concatenated modules
   */
  constructor({
    identifier,
    rootModule,
    modules,
    runtime,
  }: {
    identifier: string;
    rootModule?: Module | undefined;
    runtime: RuntimeSpec;
    modules?: Set<Module> | undefined;
  });
  /** @type {string} */
  _identifier: string;
  /** @type {Module} */
  rootModule: Module;
  /** @type {Set<Module>} */
  _modules: Set<Module>;
  _runtime: import('../util/runtime').RuntimeSpec;
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
  findNewName(
    oldName: any,
    usedNamed1: any,
    usedNamed2: any,
    extraInfo: any,
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
    Scope,
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
    InitFragment,
    CodeGenerationContext,
    CodeGenerationResult,
    LibIdentOptions,
    ModuleGraph,
    ModuleGraphConnection,
    ConnectionState,
    RequestShortener,
    ResolverWithOptions,
    RuntimeTemplate,
    WebpackError,
    ChunkRenderContext,
    Hash,
    HashConstructor,
    InputFileSystem,
    RuntimeSpec,
    ReexportInfo,
    Binding,
    RawBinding,
    SymbolBinding,
    ModuleInfo,
    ModuleInfoOrReference,
    ConcatenatedModuleInfo,
    ExternalModuleInfo,
    ReferenceToModuleInfo,
    ConcatenationEntry,
  };
}
import Module = require('../Module');
type ModuleInfo = ConcatenatedModuleInfo | ExternalModuleInfo;
type DependencyTemplates = import('../DependencyTemplates');
type RuntimeTemplate = import('../RuntimeTemplate');
type ModuleGraph = import('../ModuleGraph');
type ChunkGraph = import('../ChunkGraph');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type CodeGenerationResults = import('../CodeGenerationResults');
type ModuleInfoOrReference =
  | ConcatenatedModuleInfo
  | ExternalModuleInfo
  | ReferenceToModuleInfo;
type Hash = import('../util/Hash');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type HashConstructor = typeof import('../util/Hash');
type Scope = import('eslint-scope').Scope;
type Source = any;
type WebpackOptions =
  import('../../declarations/WebpackOptions').WebpackOptionsNormalized;
type Compilation = import('../Compilation');
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ExportInfo = import('../ExportsInfo').ExportInfo;
type InitFragment<T> = import('../InitFragment')<T>;
type CodeGenerationContext = import('../Module').CodeGenerationContext;
type CodeGenerationResult = import('../Module').CodeGenerationResult;
type LibIdentOptions = import('../Module').LibIdentOptions;
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ConnectionState = import('../ModuleGraphConnection').ConnectionState;
type RequestShortener = import('../RequestShortener');
type ResolverWithOptions = import('../ResolverFactory').ResolverWithOptions;
type WebpackError = import('../WebpackError');
type ChunkRenderContext =
  import('../javascript/JavascriptModulesPlugin').ChunkRenderContext;
type InputFileSystem = import('../util/fs').InputFileSystem;
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
type ConcatenatedModuleInfo = {
  type: 'concatenated';
  module: Module;
  index: number;
  ast: any;
  internalSource: any;
  source: ReplaceSource;
  chunkInitFragments?: InitFragment<ChunkRenderContext>[] | undefined;
  runtimeRequirements: Iterable<string>;
  globalScope: Scope;
  moduleScope: Scope;
  internalNames: Map<string, string>;
  exportMap: Map<string, string>;
  rawExportMap: Map<string, string>;
  namespaceExportSymbol?: string | undefined;
  namespaceObjectName: string;
  interopNamespaceObjectUsed: boolean;
  interopNamespaceObjectName: string;
  interopNamespaceObject2Used: boolean;
  interopNamespaceObject2Name: string;
  interopDefaultAccessUsed: boolean;
  interopDefaultAccessName: string;
};
type ExternalModuleInfo = {
  type: 'external';
  module: Module;
  runtimeCondition: RuntimeSpec | boolean;
  index: number;
  name: string;
  interopNamespaceObjectUsed: boolean;
  interopNamespaceObjectName: string;
  interopNamespaceObject2Used: boolean;
  interopNamespaceObject2Name: string;
  interopDefaultAccessUsed: boolean;
  interopDefaultAccessName: string;
};
type ReferenceToModuleInfo = {
  type: 'reference';
  runtimeCondition: RuntimeSpec | boolean;
  target: ConcatenatedModuleInfo | ExternalModuleInfo;
};
type ConcatenationEntry = {
  type: 'concatenated' | 'external';
  module: Module;
  runtimeCondition: RuntimeSpec | boolean;
};
