export = RuntimeTemplate;
declare class RuntimeTemplate {
  /**
   * @param {Compilation} compilation the compilation
   * @param {OutputOptions} outputOptions the compilation output options
   * @param {RequestShortener} requestShortener the request shortener
   */
  constructor(
    compilation: Compilation,
    outputOptions: OutputOptions,
    requestShortener: RequestShortener,
  );
  compilation: import('./Compilation');
  outputOptions: import('./config/defaults').OutputNormalizedWithDefaults;
  requestShortener: import('./RequestShortener');
  globalObject: string;
  contentHashReplacement: string;
  isIIFE(): boolean;
  isModule(): boolean;
  isNeutralPlatform(): boolean;
  supportsConst(): boolean;
  supportsMethodShorthand(): boolean;
  supportsArrowFunction(): boolean;
  supportsAsyncFunction(): boolean;
  supportsOptionalChaining(): boolean;
  supportsForOf(): boolean;
  supportsDestructuring(): boolean;
  supportsBigIntLiteral(): boolean;
  supportsDynamicImport(): boolean;
  supportsEcmaScriptModuleSyntax(): boolean;
  supportTemplateLiteral(): boolean;
  supportNodePrefixForCoreModules(): boolean;
  /**
   * @param {string} mod a module
   * @returns {string} a module with `node:` prefix when supported, otherwise an original name
   */
  renderNodePrefixForCoreModule(mod: string): string;
  /**
   * @returns {"const" | "var"} return `const` when it is supported, otherwise `var`
   */
  renderConst(): 'const' | 'var';
  /**
   * @param {string} returnValue return value
   * @param {string} args arguments
   * @returns {string} returning function
   */
  returningFunction(returnValue: string, args?: string): string;
  /**
   * @param {string} args arguments
   * @param {string | string[]} body body
   * @returns {string} basic function
   */
  basicFunction(args: string, body: string | string[]): string;
  /**
   * @param {(string | { expr: string })[]} args args
   * @returns {string} result expression
   */
  concatenation(
    ...args: (
      | string
      | {
          expr: string;
        }
    )[]
  ): string;
  /**
   * @param {(string | { expr: string })[]} args args (len >= 2)
   * @returns {string} result expression
   * @private
   */
  private _es5Concatenation;
  /**
   * @param {string} expression expression
   * @param {string} args arguments
   * @returns {string} expression function code
   */
  expressionFunction(expression: string, args?: string): string;
  /**
   * @returns {string} empty function code
   */
  emptyFunction(): string;
  /**
   * @param {string[]} items items
   * @param {string} value value
   * @returns {string} destructure array code
   */
  destructureArray(items: string[], value: string): string;
  /**
   * @param {string[]} items items
   * @param {string} value value
   * @returns {string} destructure object code
   */
  destructureObject(items: string[], value: string): string;
  /**
   * @param {string} args arguments
   * @param {string} body body
   * @returns {string} IIFE code
   */
  iife(args: string, body: string): string;
  /**
   * @param {string} variable variable
   * @param {string} array array
   * @param {string | string[]} body body
   * @returns {string} for each code
   */
  forEach(variable: string, array: string, body: string | string[]): string;
  /**
   * Add a comment
   * @param {object} options Information content of the comment
   * @param {string=} options.request request string used originally
   * @param {(string | null)=} options.chunkName name of the chunk referenced
   * @param {string=} options.chunkReason reason information of the chunk
   * @param {string=} options.message additional message
   * @param {string=} options.exportName name of the export
   * @returns {string} comment
   */
  comment({
    request,
    chunkName,
    chunkReason,
    message,
    exportName,
  }: {
    request?: string | undefined;
    chunkName?: (string | null) | undefined;
    chunkReason?: string | undefined;
    message?: string | undefined;
    exportName?: string | undefined;
  }): string;
  /**
   * @param {object} options generation options
   * @param {string=} options.request request string used originally
   * @returns {string} generated error block
   */
  throwMissingModuleErrorBlock({
    request,
  }: {
    request?: string | undefined;
  }): string;
  /**
   * @param {object} options generation options
   * @param {string=} options.request request string used originally
   * @returns {string} generated error function
   */
  throwMissingModuleErrorFunction({
    request,
  }: {
    request?: string | undefined;
  }): string;
  /**
   * @param {object} options generation options
   * @param {string=} options.request request string used originally
   * @returns {string} generated error IIFE
   */
  missingModule({ request }: { request?: string | undefined }): string;
  /**
   * @param {object} options generation options
   * @param {string=} options.request request string used originally
   * @returns {string} generated error statement
   */
  missingModuleStatement({ request }: { request?: string | undefined }): string;
  /**
   * @param {object} options generation options
   * @param {string=} options.request request string used originally
   * @returns {string} generated error code
   */
  missingModulePromise({ request }: { request?: string | undefined }): string;
  /**
   * @param {object} options options object
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {Module} options.module the module
   * @param {string=} options.request the request that should be printed as comment
   * @param {string=} options.idExpr expression to use as id expression
   * @param {"expression" | "promise" | "statements"} options.type which kind of code should be returned
   * @returns {string} the code
   */
  weakError({
    module,
    chunkGraph,
    request,
    idExpr,
    type,
  }: {
    chunkGraph: ChunkGraph;
    module: Module;
    request?: string | undefined;
    idExpr?: string | undefined;
    type: 'expression' | 'promise' | 'statements';
  }): string;
  /**
   * @param {object} options options object
   * @param {Module} options.module the module
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {string=} options.request the request that should be printed as comment
   * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
   * @returns {string} the expression
   */
  moduleId({
    module,
    chunkGraph,
    request,
    weak,
  }: {
    module: Module;
    chunkGraph: ChunkGraph;
    request?: string | undefined;
    weak?: boolean | undefined;
  }): string;
  /**
   * @param {object} options options object
   * @param {Module | null} options.module the module
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {string=} options.request the request that should be printed as comment
   * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
   * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
   * @returns {string} the expression
   */
  moduleRaw({
    module,
    chunkGraph,
    request,
    weak,
    runtimeRequirements,
  }: {
    module: Module | null;
    chunkGraph: ChunkGraph;
    request?: string | undefined;
    weak?: boolean | undefined;
    runtimeRequirements: RuntimeRequirements;
  }): string;
  /**
   * @param {object} options options object
   * @param {Module | null} options.module the module
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {string} options.request the request that should be printed as comment
   * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
   * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
   * @returns {string} the expression
   */
  moduleExports({
    module,
    chunkGraph,
    request,
    weak,
    runtimeRequirements,
  }: {
    module: Module | null;
    chunkGraph: ChunkGraph;
    request: string;
    weak?: boolean | undefined;
    runtimeRequirements: RuntimeRequirements;
  }): string;
  /**
   * @param {object} options options object
   * @param {Module} options.module the module
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {string} options.request the request that should be printed as comment
   * @param {boolean=} options.strict if the current module is in strict esm mode
   * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
   * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
   * @returns {string} the expression
   */
  moduleNamespace({
    module,
    chunkGraph,
    request,
    strict,
    weak,
    runtimeRequirements,
  }: {
    module: Module;
    chunkGraph: ChunkGraph;
    request: string;
    strict?: boolean | undefined;
    weak?: boolean | undefined;
    runtimeRequirements: RuntimeRequirements;
  }): string;
  /**
   * @param {object} options options object
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {AsyncDependenciesBlock=} options.block the current dependencies block
   * @param {Module} options.module the module
   * @param {string} options.request the request that should be printed as comment
   * @param {string} options.message a message for the comment
   * @param {boolean=} options.strict if the current module is in strict esm mode
   * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
   * @param {Dependency} options.dependency dependency
   * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
   * @returns {string} the promise expression
   */
  moduleNamespacePromise({
    chunkGraph,
    block,
    module,
    request,
    message,
    strict,
    weak,
    dependency,
    runtimeRequirements,
  }: {
    chunkGraph: ChunkGraph;
    block?: AsyncDependenciesBlock | undefined;
    module: Module;
    request: string;
    message: string;
    strict?: boolean | undefined;
    weak?: boolean | undefined;
    dependency: Dependency;
    runtimeRequirements: RuntimeRequirements;
  }): string;
  /**
   * @param {object} options options object
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {RuntimeSpec=} options.runtime runtime for which this code will be generated
   * @param {RuntimeSpec | boolean=} options.runtimeCondition only execute the statement in some runtimes
   * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
   * @returns {string} expression
   */
  runtimeConditionExpression({
    chunkGraph,
    runtimeCondition,
    runtime,
    runtimeRequirements,
  }: {
    chunkGraph: ChunkGraph;
    runtime?: RuntimeSpec | undefined;
    runtimeCondition?: (RuntimeSpec | boolean) | undefined;
    runtimeRequirements: RuntimeRequirements;
  }): string;
  /**
   * @param {object} options options object
   * @param {boolean=} options.update whether a new variable should be created or the existing one updated
   * @param {Module} options.module the module
   * @param {ModuleGraph} options.moduleGraph the module graph
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {string} options.request the request that should be printed as comment
   * @param {string} options.importVar name of the import variable
   * @param {Module} options.originModule module in which the statement is emitted
   * @param {boolean=} options.weak true, if this is a weak dependency
   * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
   * @param {ModuleDependency} options.dependency module dependency
   * @returns {[string, string]} the import statement and the compat statement
   */
  importStatement({
    update,
    module,
    moduleGraph,
    chunkGraph,
    request,
    importVar,
    originModule,
    weak,
    dependency,
    runtimeRequirements,
  }: {
    update?: boolean | undefined;
    module: Module;
    moduleGraph: ModuleGraph;
    chunkGraph: ChunkGraph;
    request: string;
    importVar: string;
    originModule: Module;
    weak?: boolean | undefined;
    runtimeRequirements: RuntimeRequirements;
    dependency: ModuleDependency;
  }): [string, string];
  /**
   * @template GenerateContext
   * @param {object} options options
   * @param {ModuleGraph} options.moduleGraph the module graph
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {Module} options.module the module
   * @param {string} options.request the request
   * @param {string | string[]} options.exportName the export name
   * @param {Module} options.originModule the origin module
   * @param {boolean | undefined} options.asiSafe true, if location is safe for ASI, a bracket can be emitted
   * @param {boolean} options.isCall true, if expression will be called
   * @param {boolean | null} options.callContext when false, call context will not be preserved
   * @param {boolean} options.defaultInterop when true and accessing the default exports, interop code will be generated
   * @param {string} options.importVar the identifier name of the import variable
   * @param {InitFragment<GenerateContext>[]} options.initFragments init fragments will be added here
   * @param {RuntimeSpec} options.runtime runtime for which this code will be generated
   * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
   * @param {ModuleDependency} options.dependency module dependency
   * @returns {string} expression
   */
  exportFromImport<GenerateContext>({
    moduleGraph,
    chunkGraph,
    module,
    request,
    exportName,
    originModule,
    asiSafe,
    isCall,
    callContext,
    defaultInterop,
    importVar,
    initFragments,
    runtime,
    runtimeRequirements,
    dependency,
  }: {
    moduleGraph: ModuleGraph;
    chunkGraph: ChunkGraph;
    module: Module;
    request: string;
    exportName: string | string[];
    originModule: Module;
    asiSafe: boolean | undefined;
    isCall: boolean;
    callContext: boolean | null;
    defaultInterop: boolean;
    importVar: string;
    initFragments: InitFragment<GenerateContext>[];
    runtime: RuntimeSpec;
    runtimeRequirements: RuntimeRequirements;
    dependency: ModuleDependency;
  }): string;
  /**
   * @param {object} options options
   * @param {AsyncDependenciesBlock | undefined} options.block the async block
   * @param {string} options.message the message
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
   * @returns {string} expression
   */
  blockPromise({
    block,
    message,
    chunkGraph,
    runtimeRequirements,
  }: {
    block: AsyncDependenciesBlock | undefined;
    message: string;
    chunkGraph: ChunkGraph;
    runtimeRequirements: RuntimeRequirements;
  }): string;
  /**
   * @param {object} options options
   * @param {AsyncDependenciesBlock} options.block the async block
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
   * @param {string=} options.request request string used originally
   * @returns {string} expression
   */
  asyncModuleFactory({
    block,
    chunkGraph,
    runtimeRequirements,
    request,
  }: {
    block: AsyncDependenciesBlock;
    chunkGraph: ChunkGraph;
    runtimeRequirements: RuntimeRequirements;
    request?: string | undefined;
  }): string;
  /**
   * @param {object} options options
   * @param {Dependency} options.dependency the dependency
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
   * @param {string=} options.request request string used originally
   * @returns {string} expression
   */
  syncModuleFactory({
    dependency,
    chunkGraph,
    runtimeRequirements,
    request,
  }: {
    dependency: Dependency;
    chunkGraph: ChunkGraph;
    runtimeRequirements: RuntimeRequirements;
    request?: string | undefined;
  }): string;
  /**
   * @param {object} options options
   * @param {string} options.exportsArgument the name of the exports object
   * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
   * @returns {string} statement
   */
  defineEsModuleFlagStatement({
    exportsArgument,
    runtimeRequirements,
  }: {
    exportsArgument: string;
    runtimeRequirements: RuntimeRequirements;
  }): string;
}
declare namespace RuntimeTemplate {
  export {
    OutputOptions,
    AsyncDependenciesBlock,
    Chunk,
    ChunkGraph,
    Compilation,
    Dependency,
    Module,
    BuildMeta,
    RuntimeRequirements,
    ModuleGraph,
    RequestShortener,
    RuntimeSpec,
    ImportPhaseType,
    ModuleDependency,
  };
}
import InitFragment = require('./InitFragment');
type OutputOptions = import('./config/defaults').OutputNormalizedWithDefaults;
type AsyncDependenciesBlock = import('./AsyncDependenciesBlock');
type Chunk = import('./Chunk');
type ChunkGraph = import('./ChunkGraph');
type Compilation = import('./Compilation');
type Dependency = import('./Dependency');
type Module = import('./Module');
type BuildMeta = import('./Module').BuildMeta;
type RuntimeRequirements = import('./Module').RuntimeRequirements;
type ModuleGraph = import('./ModuleGraph');
type RequestShortener = import('./RequestShortener');
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type ImportPhaseType = import('./dependencies/ImportPhase').ImportPhaseType;
type ModuleDependency = import('./NormalModuleFactory').ModuleDependency;
