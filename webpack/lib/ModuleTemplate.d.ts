export = ModuleTemplate;
declare class ModuleTemplate {
  /**
   * @param {RuntimeTemplate} runtimeTemplate the runtime template
   * @param {Compilation} compilation the compilation
   */
  constructor(runtimeTemplate: RuntimeTemplate, compilation: Compilation);
  _runtimeTemplate: import('./RuntimeTemplate');
  type: string;
  hooks: Readonly<{
    content: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (
          source: Source,
          module: Module,
          moduleRenderContext: ModuleRenderContext,
          dependencyTemplates: DependencyTemplates,
        ) => Source,
      ) => void;
    };
    module: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (
          source: Source,
          module: Module,
          moduleRenderContext: ModuleRenderContext,
          dependencyTemplates: DependencyTemplates,
        ) => Source,
      ) => void;
    };
    render: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (
          source: Source,
          module: Module,
          chunkRenderContext: ChunkRenderContext,
          dependencyTemplates: DependencyTemplates,
        ) => Source,
      ) => void;
    };
    package: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (
          source: Source,
          module: Module,
          chunkRenderContext: ChunkRenderContext,
          dependencyTemplates: DependencyTemplates,
        ) => Source,
      ) => void;
    };
    hash: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (hash: Hash) => void,
      ) => void;
    };
  }>;
  get runtimeTemplate(): import('./RuntimeTemplate');
}
declare namespace ModuleTemplate {
  export {
    Tap,
    Source,
    Chunk,
    Compilation,
    DependencyTemplates,
    Module,
    RuntimeTemplate,
    ChunkRenderContext,
    ModuleRenderContext,
    Hash,
    IfSet,
  };
}
type Tap = import('tapable').Tap;
type Source = import('webpack-sources').Source;
type Chunk = import('./Chunk');
type Compilation = import('./Compilation');
type DependencyTemplates = import('./DependencyTemplates');
type Module = import('./Module');
type RuntimeTemplate = import('./RuntimeTemplate');
type ChunkRenderContext =
  import('./javascript/JavascriptModulesPlugin').ChunkRenderContext;
type ModuleRenderContext =
  import('./javascript/JavascriptModulesPlugin').ModuleRenderContext;
type Hash = import('./util/Hash');
type IfSet<T> = import('tapable').IfSet<T>;
