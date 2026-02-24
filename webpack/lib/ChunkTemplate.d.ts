export = ChunkTemplate;
declare class ChunkTemplate {
  /**
   * @param {OutputOptions} outputOptions output options
   * @param {Compilation} compilation the compilation
   */
  constructor(outputOptions: OutputOptions, compilation: Compilation);
  _outputOptions: {};
  hooks: Readonly<{
    renderManifest: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (
          renderManifestEntries: RenderManifestEntry[],
          renderManifestOptions: RenderManifestOptions,
        ) => RenderManifestEntry[],
      ) => void;
    };
    modules: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (
          source: Source,
          moduleTemplate: ModuleTemplate,
          renderContext: RenderContext,
        ) => Source,
      ) => void;
    };
    render: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (
          source: Source,
          moduleTemplate: ModuleTemplate,
          renderContext: RenderContext,
        ) => Source,
      ) => void;
    };
    renderWithEntry: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (source: Source, chunk: Chunk) => Source,
      ) => void;
    };
    hash: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (hash: Hash) => void,
      ) => void;
    };
    hashForChunk: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (
          hash: Hash,
          chunk: Chunk,
          chunkHashContext: ChunkHashContext,
        ) => void,
      ) => void;
    };
  }>;
  get outputOptions(): import('./config/defaults').OutputNormalizedWithDefaults;
}
declare namespace ChunkTemplate {
  export {
    Tap,
    OutputOptions,
    Chunk,
    Compilation,
    ChunkHashContext,
    Hash,
    RenderManifestEntry,
    RenderManifestOptions,
    Source,
    ModuleTemplate,
    RenderContext,
    IfSet,
  };
}
type Tap = import('tapable').Tap;
type OutputOptions = import('./config/defaults').OutputNormalizedWithDefaults;
type Chunk = import('./Chunk');
type Compilation = import('./Compilation');
type ChunkHashContext = import('./Compilation').ChunkHashContext;
type Hash = import('./Compilation').Hash;
type RenderManifestEntry = import('./Compilation').RenderManifestEntry;
type RenderManifestOptions = import('./Compilation').RenderManifestOptions;
type Source = import('./Compilation').Source;
type ModuleTemplate = import('./ModuleTemplate');
type RenderContext =
  import('./javascript/JavascriptModulesPlugin').RenderContext;
type IfSet<T> = import('tapable').IfSet<T>;
