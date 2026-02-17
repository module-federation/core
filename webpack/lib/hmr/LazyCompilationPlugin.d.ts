export = LazyCompilationPlugin;
declare class LazyCompilationPlugin {
  /**
   * @param {Options} options options
   */
  constructor({ backend, entries, imports, test }: Options);
  backend: BackEnd;
  entries: boolean;
  imports: boolean;
  test: string | RegExp | TestFn;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace LazyCompilationPlugin {
  export {
    WebpackOptions,
    Compilation,
    Compiler,
    UpdateHashContext,
    BuildCallback,
    BuildMeta,
    CodeGenerationContext,
    CodeGenerationResult,
    LibIdentOptions,
    LibIdent,
    NeedBuildCallback,
    NeedBuildContext,
    SourceTypes,
    ModuleFactoryCallback,
    ModuleFactoryCreateData,
    RequestShortener,
    ResolverWithOptions,
    HarmonyImportDependency,
    Hash,
    InputFileSystem,
    ModuleResult,
    BackendApi,
    BackendHandler,
    PromiseBackendHandler,
    BackEnd,
    TestFn,
    Options,
  };
}
type WebpackOptions =
  import('../config/defaults').WebpackOptionsNormalizedWithDefaults;
type Compilation = import('../Compilation');
type Compiler = import('../Compiler');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type BuildCallback = import('../Module').BuildCallback;
type BuildMeta = import('../Module').BuildMeta;
type CodeGenerationContext = import('../Module').CodeGenerationContext;
type CodeGenerationResult = import('../Module').CodeGenerationResult;
type LibIdentOptions = import('../Module').LibIdentOptions;
type LibIdent = import('../Module').LibIdent;
type NeedBuildCallback = import('../Module').NeedBuildCallback;
type NeedBuildContext = import('../Module').NeedBuildContext;
type SourceTypes = import('../Module').SourceTypes;
type ModuleFactoryCallback = import('../ModuleFactory').ModuleFactoryCallback;
type ModuleFactoryCreateData =
  import('../ModuleFactory').ModuleFactoryCreateData;
type RequestShortener = import('../RequestShortener');
type ResolverWithOptions = import('../ResolverFactory').ResolverWithOptions;
type HarmonyImportDependency =
  import('../dependencies/HarmonyImportDependency');
type Hash = import('../util/Hash');
type InputFileSystem = import('../util/fs').InputFileSystem;
type ModuleResult = {
  client: string;
  data: string;
  active: boolean;
};
type BackendApi = {
  dispose: (callback: (err?: Error | null) => void) => void;
  module: (module: Module) => ModuleResult;
};
type BackendHandler = (
  compiler: Compiler,
  callback: (err: Error | null, backendApi?: BackendApi) => void,
) => void;
type PromiseBackendHandler = (compiler: Compiler) => Promise<BackendApi>;
type BackEnd = BackendHandler | PromiseBackendHandler;
type TestFn = (module: Module) => boolean;
/**
 * options
 */
type Options = {
  /**
   * the backend
   */
  backend: BackEnd;
  entries?: boolean | undefined;
  imports?: boolean | undefined;
  /**
   * additional filter for lazy compiled entrypoint modules
   */
  test?: (RegExp | string | TestFn) | undefined;
};
import Module = require('../Module');
