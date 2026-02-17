export = MainTemplate;
declare class MainTemplate {
  /**
   *
   * @param {OutputOptions} outputOptions output options for the MainTemplate
   * @param {Compilation} compilation the compilation
   */
  constructor(outputOptions: OutputOptions, compilation: Compilation);
  /** @type {OutputOptions} */
  _outputOptions: OutputOptions;
  hooks: Readonly<{
    renderManifest: {
      tap: (options: any, fn: any) => void;
    };
    modules: {
      tap: () => never;
    };
    moduleObj: {
      tap: () => never;
    };
    require: {
      tap: (options: any, fn: any) => void;
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
      tap: (options: any, fn: any) => void;
    };
    renderWithEntry: {
      tap: (options: any, fn: any) => void;
    };
    assetPath: {
      tap: (options: any, fn: any) => void;
      call: (filename: any, options: any) => string;
    };
    hash: {
      tap: (options: any, fn: any) => void;
    };
    hashForChunk: {
      tap: (options: any, fn: any) => void;
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
      import('tapable').UnsetAdditionalOptions
    >;
    readonly linkPrefetch: SyncWaterfallHook<
      [string, import('./Chunk')],
      import('tapable').UnsetAdditionalOptions
    >;
    readonly linkPreload: SyncWaterfallHook<
      [string, import('./Chunk')],
      import('tapable').UnsetAdditionalOptions
    >;
  }>;
  renderCurrentHashCode: (hash: string, length?: number | undefined) => string;
  getPublicPath: (options: object) => string;
  getAssetPath: (path: any, options: any) => string;
  getAssetPathWithInfo: (
    path: any,
    options: any,
  ) => {
    path: string;
    info: import('./Compilation').AssetInfo;
  };
  get requireFn(): '__webpack_require__';
  get outputOptions(): import('../declarations/WebpackOptions').Output;
}
declare namespace MainTemplate {
  export {
    ConcatSource,
    Source,
    OutputOptions,
    ModuleTemplate,
    Chunk,
    Compilation,
    AssetInfo,
    Module,
    Hash,
    DependencyTemplates,
    RenderContext,
    RuntimeTemplate,
    ModuleGraph,
    ChunkGraph,
    RenderManifestOptions,
    RenderManifestEntry,
  };
}
type OutputOptions = import('../declarations/WebpackOptions').Output;
import { SyncWaterfallHook } from 'tapable';
type Chunk = import('./Chunk');
type ModuleTemplate = import('./ModuleTemplate');
/**
 * }
 */
type DependencyTemplates = import('./DependencyTemplates');
type Compilation = import('./Compilation');
type ConcatSource = any;
type Source = any;
type AssetInfo = import('./Compilation').AssetInfo;
/**
 * }
 */
type Module = import('./Module');
/**
 * }
 */
type Hash = import('./util/Hash');
/**
 * }
 */
type RenderContext =
  import('./javascript/JavascriptModulesPlugin').RenderContext;
/**
 * }
 */
type RuntimeTemplate = import('./RuntimeTemplate');
/**
 * }
 */
type ModuleGraph = import('./ModuleGraph');
/**
 * }
 */
type ChunkGraph = import('./ChunkGraph');
/**
 * }
 */
type RenderManifestOptions = import('./Template').RenderManifestOptions;
/**
 * }
 */
type RenderManifestEntry = import('./Template').RenderManifestEntry;
