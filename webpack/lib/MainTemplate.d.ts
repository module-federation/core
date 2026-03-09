export = MainTemplate;
declare class MainTemplate {
  /**
   * @param {OutputOptions} outputOptions output options for the MainTemplate
   * @param {Compilation} compilation the compilation
   */
  constructor(outputOptions: OutputOptions, compilation: Compilation);
  /** @type {OutputOptions} */
  _outputOptions: OutputOptions;
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
      tap: () => never;
    };
    moduleObj: {
      tap: () => never;
    };
    require: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (
          value: string,
          renderBootstrapContext: RenderBootstrapContext,
        ) => string,
      ) => void;
    };
    beforeStartup: {
      tap: () => never;
    };
    startup: {
      tap: () => never;
    };
    afterStartup: {
      tap: () => never;
    };
    render: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (
          source: Source,
          chunk: Chunk,
          hash: string | undefined,
          moduleTemplate: ModuleTemplate,
          dependencyTemplates: DependencyTemplates,
        ) => Source,
      ) => void;
    };
    renderWithEntry: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (source: Source, chunk: Chunk, hash: string | undefined) => Source,
      ) => void;
    };
    assetPath: {
      tap: <AdditionalOptions>(
        options: string | (Tap & IfSet<AdditionalOptions>),
        fn: (
          value: string,
          path: PathData,
          assetInfo: AssetInfo | undefined,
        ) => string,
      ) => void;
      call: (filename: TemplatePath, options: PathData) => string;
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
        fn: (hash: Hash, chunk: Chunk) => void,
      ) => void;
    };
    globalHashPaths: {
      tap: () => void;
    };
    globalHash: {
      tap: () => void;
    };
    hotBootstrap: {
      tap: () => never;
    };
    /** @type {SyncWaterfallHook<[string, Chunk, string, ModuleTemplate, DependencyTemplates]>} */
    bootstrap: SyncWaterfallHook<
      [string, Chunk, string, ModuleTemplate, DependencyTemplates]
    >;
    /** @type {SyncWaterfallHook<[string, Chunk, string]>} */
    localVars: SyncWaterfallHook<[string, Chunk, string]>;
    /** @type {SyncWaterfallHook<[string, Chunk, string]>} */
    requireExtensions: SyncWaterfallHook<[string, Chunk, string]>;
    /** @type {SyncWaterfallHook<[string, Chunk, string, string]>} */
    requireEnsure: SyncWaterfallHook<[string, Chunk, string, string]>;
    readonly jsonpScript: SyncWaterfallHook<
      [string, import('./Chunk')],
      string,
      import('tapable').UnsetAdditionalOptions
    >;
    readonly linkPrefetch: SyncWaterfallHook<
      [string, import('./Chunk')],
      string,
      import('tapable').UnsetAdditionalOptions
    >;
    readonly linkPreload: SyncWaterfallHook<
      [string, import('./Chunk')],
      string,
      import('tapable').UnsetAdditionalOptions
    >;
  }>;
  renderCurrentHashCode: (hash: string, length?: number | undefined) => string;
  getPublicPath: (options: PathData) => string;
  getAssetPath: (path: TemplatePath, options: PathData) => string;
  getAssetPathWithInfo: (
    path: TemplatePath,
    options: PathData,
  ) => InterpolatedPathAndAssetInfo;
  get requireFn(): '__webpack_require__';
  get outputOptions(): import('../declarations/WebpackOptions').Output;
}
declare namespace MainTemplate {
  export {
    Tap,
    Source,
    OutputOptions,
    ModuleTemplate,
    Chunk,
    Compilation,
    AssetInfo,
    InterpolatedPathAndAssetInfo,
    Hash,
    DependencyTemplates,
    RenderBootstrapContext,
    RenderManifestOptions,
    RenderManifestEntry,
    TemplatePath,
    PathData,
    IfSet,
  };
}
import { SyncWaterfallHook } from 'tapable';
type Tap = import('tapable').Tap;
type Source = import('webpack-sources').Source;
type OutputOptions = import('../declarations/WebpackOptions').Output;
type ModuleTemplate = import('./ModuleTemplate');
type Chunk = import('./Chunk');
type Compilation = import('./Compilation');
type AssetInfo = import('./Compilation').AssetInfo;
type InterpolatedPathAndAssetInfo =
  import('./Compilation').InterpolatedPathAndAssetInfo;
type Hash = import('./util/Hash');
type DependencyTemplates = import('./DependencyTemplates');
type RenderBootstrapContext =
  import('./javascript/JavascriptModulesPlugin').RenderBootstrapContext;
type RenderManifestOptions = import('./Template').RenderManifestOptions;
type RenderManifestEntry = import('./Template').RenderManifestEntry;
type TemplatePath = import('./TemplatedPathPlugin').TemplatePath;
type PathData = import('./TemplatedPathPlugin').PathData;
type IfSet<T> = import('tapable').IfSet<T>;
