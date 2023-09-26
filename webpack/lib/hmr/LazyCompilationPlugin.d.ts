export = LazyCompilationPlugin;
declare class LazyCompilationPlugin {
  /**
   * @param {Object} options options
   * @param {(function(Compiler, function(Error?, BackendApi?): void): void) | function(Compiler): Promise<BackendApi>} options.backend the backend
   * @param {boolean} options.entries true, when entries are lazy compiled
   * @param {boolean} options.imports true, when import() modules are lazy compiled
   * @param {RegExp | string | (function(Module): boolean)} options.test additional filter for lazy compiled entrypoint modules
   */
  constructor({
    backend,
    entries,
    imports,
    test,
  }: {
    backend:
      | ((
          arg0: Compiler,
          arg1: (arg0: Error | null, arg1: BackendApi | null) => void,
        ) => void)
      | ((arg0: Compiler) => Promise<BackendApi>);
    entries: boolean;
    imports: boolean;
    test: RegExp | string | ((arg0: Module) => boolean);
  });
  backend:
    | ((
        arg0: Compiler,
        arg1: (arg0: Error | null, arg1: BackendApi | null) => void,
      ) => void)
    | ((arg0: Compiler) => Promise<BackendApi>);
  entries: boolean;
  imports: boolean;
  test: string | RegExp | ((arg0: Module) => boolean);
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
    BuildMeta,
    CodeGenerationContext,
    CodeGenerationResult,
    LibIdentOptions,
    NeedBuildContext,
    ModuleFactoryCreateData,
    ModuleFactoryResult,
    RequestShortener,
    ResolverWithOptions,
    WebpackError,
    HarmonyImportDependency,
    Hash,
    InputFileSystem,
    BackendApi,
  };
}
type Compiler = import('../Compiler');
type BackendApi = {
  dispose: (arg0: Error | undefined) => void;
  module: (arg0: Module) => {
    client: string;
    data: string;
    active: boolean;
  };
};
import Module = require('../Module');
type WebpackOptions = typeof import('../../declarations/WebpackOptions');
type Compilation = import('../Compilation');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type BuildMeta = import('../Module').BuildMeta;
type CodeGenerationContext = import('../Module').CodeGenerationContext;
type CodeGenerationResult = import('../Module').CodeGenerationResult;
type LibIdentOptions = import('../Module').LibIdentOptions;
type NeedBuildContext = import('../Module').NeedBuildContext;
type ModuleFactoryCreateData =
  import('../ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult = import('../ModuleFactory').ModuleFactoryResult;
type RequestShortener = import('../RequestShortener');
type ResolverWithOptions = import('../ResolverFactory').ResolverWithOptions;
type WebpackError = import('../WebpackError');
type HarmonyImportDependency =
  import('../dependencies/HarmonyImportDependency');
type Hash = import('../util/Hash');
type InputFileSystem = import('../util/fs').InputFileSystem;
