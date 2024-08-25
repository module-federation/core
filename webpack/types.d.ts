/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn special-lint-fix` to update
 */
import Compilation from './lib/Compilation';
import Chunk from './lib/Chunk';
import Compiler from './lib/Compiler';
import WebpackError from './lib/WebpackError';
import NormalModule from './lib/NormalModule';
import Module from './lib/Module';
import AsyncDependenciesBlock from './lib/AsyncDependenciesBlock';
import Template from './lib/Template';
import Dependency from './lib/Dependency';
import RuntimeModule from './lib/RuntimeModule';
import DependenciesBlock from './lib/DependenciesBlock';
import ChunkGraph from './lib/ChunkGraph';
import { WebpackPluginInstance } from './lib/Compilation';
import ChunkGroup from './lib/ChunkGroup';
import CodeGenerationResults from './lib/CodeGenerationResults';
import { Optimization } from './declarations/WebpackOptions';
import ConcatenationScope from './lib/ConcatenationScope';
import {
  WebpackOptionsNormalized,
  RuleSetRule,
  RuleSetCondition,
  RuleSetConditionAbsolute,
  ResolveOptions as ResolveOptionsWebpackOptions,
} from './declarations/WebpackOptions';
import EntryPlugin from './lib/EntryPlugin';
import { EntryData } from './lib/Compilation';
import CacheFacade from './lib/CacheFacade';
import { MainRenderContext } from './lib/javascript/JavascriptModulesPlugin';
import { StatsOptions } from './declarations/WebpackOptions';
import BasicEvaluatedExpression from './lib/javascript/BasicEvaluatedExpression';
import { ChunkRenderContext } from './lib/Template';
import {
  Source,
  RawSource,
  OriginalSource,
  ReplaceSource,
  SourceMapSource,
  ConcatSource,
  PrefixSource,
  CachedSource,
  SizeOnlySource,
  CompatSource,
} from './lib/Source';
import AbstractLibraryPlugin from './lib/library/AbstractLibraryPlugin';
import { Buffer } from 'buffer';
import {
  ArrayExpression,
  ArrayPattern,
  ArrowFunctionExpression,
  AssignmentExpression,
  AssignmentPattern,
  AssignmentProperty,
  AwaitExpression,
  BigIntLiteral,
  BinaryExpression,
  BlockStatement,
  BreakStatement,
  CatchClause,
  ChainExpression,
  ClassBody,
  ClassDeclaration,
  ClassExpression,
  Comment,
  ConditionalExpression,
  ContinueStatement,
  DebuggerStatement,
  Directive,
  DoWhileStatement,
  EmptyStatement,
  ExportAllDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  ExportSpecifier,
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  IfStatement,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportExpression,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  LabeledStatement,
  LogicalExpression,
  MemberExpression,
  MetaProperty,
  MethodDefinition,
  NewExpression,
  ObjectExpression,
  ObjectPattern,
  PrivateIdentifier,
  Program,
  Property,
  PropertyDefinition,
  RegExpLiteral,
  RestElement,
  ReturnStatement,
  SequenceExpression,
  SimpleCallExpression,
  SimpleLiteral,
  SpreadElement,
  StaticBlock,
  Super,
  SwitchCase,
  SwitchStatement,
  TaggedTemplateExpression,
  TemplateElement,
  TemplateLiteral,
  ThisExpression,
  ThrowStatement,
  TryStatement,
  UnaryExpression,
  UpdateExpression,
  VariableDeclaration,
  VariableDeclarator,
  WhileStatement,
  WithStatement,
  YieldExpression,
} from 'estree';
import { Dirent } from 'fs';
import {
  IncomingMessage,
  ServerOptions as ServerOptionsImport,
  ServerResponse,
} from 'http';
import { ListenOptions, Server } from 'net';
import { validate as validateFunction } from 'schema-utils';
import { default as ValidationError } from 'schema-utils/declarations/ValidationError';
import { ValidationErrorConfiguration } from 'schema-utils/declarations/validate';
import {
  AsArray,
  AsyncParallelHook,
  AsyncSeriesBailHook,
  AsyncSeriesHook,
  AsyncSeriesWaterfallHook,
  HookMap,
  MultiHook,
  SyncBailHook,
  SyncHook,
  SyncWaterfallHook,
} from 'tapable';
import { SecureContextOptions, TlsOptions } from 'tls';
import { PathData } from './lib/Compilation';
import SortableSet from './lib/util/SortableSet';
import ExportsInfo from './lib/ExportsInfo';
import RuntimeTemplate from './lib/RuntimeTemplate';
declare interface AdditionalData {
  [index: string]: any;
  webpackAST: object;
}
declare class AggressiveMergingPlugin {
  constructor(options?: AggressiveMergingPluginOptions);
  options: AggressiveMergingPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface AggressiveMergingPluginOptions {
  /**
   * minimal size reduction to trigger merging
   */
  minSizeReduce?: number;
}
declare class AggressiveSplittingPlugin {
  constructor(options?: AggressiveSplittingPluginOptions);
  options: AggressiveSplittingPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  static wasChunkRecorded(chunk: Chunk): boolean;
}
declare interface AggressiveSplittingPluginOptions {
  /**
   * Extra cost for each chunk (Default: 9.8kiB).
   */
  chunkOverhead?: number;

  /**
   * Extra cost multiplicator for entry chunks (Default: 10).
   */
  entryChunkMultiplicator?: number;

  /**
   * Byte, max size of per file (Default: 50kiB).
   */
  maxSize?: number;

  /**
   * Byte, split point. (Default: 30kiB).
   */
  minSize?: number;
}
type Alias = string | false | string[];
declare interface AliasOption {
  alias: Alias;
  name: string;
  onlyModule?: boolean;
}
type AliasOptionNewRequest = string | false | string[];
declare interface AliasOptions {
  [index: string]: AliasOptionNewRequest;
}
declare interface Argument {
  description: string;
  simpleType: 'string' | 'number' | 'boolean';
  multiple: boolean;
  configs: ArgumentConfig[];
}
declare interface ArgumentConfig {
  description: string;
  negatedDescription?: string;
  path: string;
  multiple: boolean;
  type: 'string' | 'number' | 'boolean' | 'path' | 'enum' | 'RegExp' | 'reset';
  values?: any[];
}
declare interface Assertions {
  [index: string]: any;
}
declare interface Asset {
  /**
   * the filename of the asset
   */
  name: string;

  /**
   * source of the asset
   */
  source: Source;

  /**
   * info about the asset
   */
  info: AssetInfo;
}
declare interface AssetEmittedInfo {
  content: Buffer;
  source: Source;
  compilation: Compilation;
  outputPath: string;
  targetPath: string;
}

/**
 * Options object for data url generation.
 */
declare interface AssetGeneratorDataUrlOptions {
  /**
   * Asset encoding (defaults to base64).
   */
  encoding?: false | 'base64';

  /**
   * Asset mimetype (getting from file extension by default).
   */
  mimetype?: string;
}
type AssetGeneratorOptions = AssetInlineGeneratorOptions &
  AssetResourceGeneratorOptions;
type AssetInfo = KnownAssetInfo & Record<string, any>;

/**
 * Generator options for asset/inline modules.
 */
declare interface AssetInlineGeneratorOptions {
  /**
   * The options for data url generator.
   */
  dataUrl?:
    | AssetGeneratorDataUrlOptions
    | ((
        source: string | Buffer,
        context: { filename: string; module: Module },
      ) => string);
}

/**
 * Options object for DataUrl condition.
 */
declare interface AssetParserDataUrlOptions {
  /**
   * Maximum size of asset that should be inline as modules. Default: 8kb.
   */
  maxSize?: number;
}

/**
 * Parser options for asset modules.
 */
declare interface AssetParserOptions {
  /**
   * The condition for inlining the asset as DataUrl.
   */
  dataUrlCondition?:
    | AssetParserDataUrlOptions
    | ((
        source: string | Buffer,
        context: { filename: string; module: Module },
      ) => boolean);
}

/**
 * Generator options for asset/resource modules.
 */
declare interface AssetResourceGeneratorOptions {
  /**
   * Emit an output asset from this asset module. This can be set to 'false' to omit emitting e. g. for SSR.
   */
  emit?: boolean;

  /**
   * Specifies the filename template of output files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  filename?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Emit the asset in the specified folder relative to 'output.path'. This should only be needed when custom 'publicPath' is specified to match the folder structure there.
   */
  outputPath?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * The 'publicPath' specifies the public URL address of the output files when referenced in a browser.
   */
  publicPath?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);
}
declare abstract class AsyncQueue<T, K, R> {
  hooks: {
    beforeAdd: AsyncSeriesHook<[T]>;
    added: SyncHook<[T]>;
    beforeStart: AsyncSeriesHook<[T]>;
    started: SyncHook<[T]>;
    result: SyncHook<[T, Error, R]>;
  };
  add(item: T, callback: CallbackAsyncQueue<R>): void;
  invalidate(item: T): void;

  /**
   * Waits for an already started item
   */
  waitFor(item: T, callback: CallbackAsyncQueue<R>): void;
  stop(): void;
  increaseParallelism(): void;
  decreaseParallelism(): void;
  isProcessing(item: T): boolean;
  isQueued(item: T): boolean;
  isDone(item: T): boolean;
  clear(): void;
}
declare class AsyncWebAssemblyModulesPlugin {
  constructor(options: AsyncWebAssemblyModulesPluginOptions);
  options: AsyncWebAssemblyModulesPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  renderModule(
    module: Module,
    renderContext: WebAssemblyRenderContext,
    hooks: CompilationHooksAsyncWebAssemblyModulesPlugin,
  ): Source;
  static getCompilationHooks(
    compilation: Compilation,
  ): CompilationHooksAsyncWebAssemblyModulesPlugin;
}
declare interface AsyncWebAssemblyModulesPluginOptions {
  /**
   * mangle imports
   */
  mangleImports?: boolean;
}
declare class AutomaticPrefetchPlugin {
  constructor();

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
type AuxiliaryComment = string | LibraryCustomUmdCommentObject;
declare interface BackendApi {
  dispose: (arg0?: Error) => void;
  module: (arg0: Module) => { client: string; data: string; active: boolean };
}
declare class BannerPlugin {
  constructor(options: BannerPluginArgument);
  options: BannerPluginOptions;
  banner: (data: { hash: string; chunk: Chunk; filename: string }) => string;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
type BannerPluginArgument =
  | string
  | BannerPluginOptions
  | ((data: { hash: string; chunk: Chunk; filename: string }) => string);
declare interface BannerPluginOptions {
  /**
   * Specifies the banner.
   */
  banner:
    | string
    | ((data: { hash: string; chunk: Chunk; filename: string }) => string);

  /**
   * If true, the banner will only be added to the entry chunks.
   */
  entryOnly?: boolean;

  /**
   * Exclude all modules matching any of these conditions.
   */
  exclude?: string | RegExp | Rule[];

  /**
   * If true, banner will be placed at the end of the output.
   */
  footer?: boolean;

  /**
   * Include all modules matching any of these conditions.
   */
  include?: string | RegExp | Rule[];

  /**
   * If true, banner will not be wrapped in a comment.
   */
  raw?: boolean;

  /**
   * Include all modules that pass test assertion.
   */
  test?: string | RegExp | Rule[];
}
declare interface BaseResolveRequest {
  path: string | false;
  context?: object;
  descriptionFilePath?: string;
  descriptionFileRoot?: string;
  descriptionFileData?: JsonObject;
  relativePath?: string;
  ignoreSymlinks?: boolean;
  fullySpecified?: boolean;
  __innerRequest?: string;
  __innerRequest_request?: string;
  __innerRequest_relativePath?: string;
}

declare abstract class ByTypeGenerator extends Generator {
  map: Record<string, Generator>;
}
declare const CIRCULAR_CONNECTION: unique symbol;
declare class Cache {
  constructor();
  hooks: {
    get: AsyncSeriesBailHook<
      [
        string,
        null | Etag,
        ((result: any, callback: (arg0?: Error) => void) => void)[],
      ],
      any
    >;
    store: AsyncParallelHook<[string, null | Etag, any]>;
    storeBuildDependencies: AsyncParallelHook<[Iterable<string>]>;
    beginIdle: SyncHook<[]>;
    endIdle: AsyncParallelHook<[]>;
    shutdown: AsyncParallelHook<[]>;
  };
  get<T>(
    identifier: string,
    etag: null | Etag,
    callback: CallbackCache<T>,
  ): void;
  store<T>(
    identifier: string,
    etag: null | Etag,
    data: T,
    callback: CallbackCache<void>,
  ): void;

  /**
   * After this method has succeeded the cache can only be restored when build dependencies are
   */
  storeBuildDependencies(
    dependencies: Iterable<string>,
    callback: CallbackCache<void>,
  ): void;
  beginIdle(): void;
  endIdle(callback: CallbackCache<void>): void;
  shutdown(callback: CallbackCache<void>): void;
  static STAGE_MEMORY: number;
  static STAGE_DEFAULT: number;
  static STAGE_DISK: number;
  static STAGE_NETWORK: number;
}

declare interface CacheGroupSource {
  key?: string;
  priority?: number;
  getName?: (
    module?: Module,
    chunks?: Chunk[],
    key?: string,
  ) => undefined | string;
  chunksFilter?: (chunk: Chunk) => undefined | boolean;
  enforce?: boolean;
  minSize: SplitChunksSizes;
  minSizeReduction: SplitChunksSizes;
  minRemainingSize: SplitChunksSizes;
  enforceSizeThreshold: SplitChunksSizes;
  maxAsyncSize: SplitChunksSizes;
  maxInitialSize: SplitChunksSizes;
  minChunks?: number;
  maxAsyncRequests?: number;
  maxInitialRequests?: number;
  filename?: string | ((arg0: PathData, arg1?: AssetInfo) => string);
  idHint?: string;
  automaticNameDelimiter?: string;
  reuseExistingChunk?: boolean;
  usedExports?: boolean;
}
declare interface CacheGroupsContext {
  moduleGraph: ModuleGraph;
  chunkGraph: ChunkGraph;
}

type CallExpression = SimpleCallExpression | NewExpression;
declare interface CallExpressionInfo {
  type: 'call';
  call: CallExpression;
  calleeName: string;
  rootInfo: string | VariableInfo;
  getCalleeMembers: () => string[];
  name: string;
  getMembers: () => string[];
  getMembersOptionals: () => boolean[];
  getMemberRanges: () => [number, number][];
}
declare interface CallbackAsyncQueue<T> {
  (err?: null | WebpackError, result?: T): any;
}
declare interface CallbackCache<T> {
  (err?: null | WebpackError, result?: T): void;
}
declare interface CallbackFunction<T> {
  (err?: null | Error, result?: T): any;
}
declare interface CallbackNormalErrorCache<T> {
  (err?: null | Error, result?: T): void;
}
declare interface CallbackWebpack<T> {
  (err?: Error, stats?: T): void;
}
type Cell<T> = undefined | T;

type ChunkGroupOptions = RawChunkGroupOptions & { name?: string };
declare interface ChunkHashContext {
  /**
   * results of code generation
   */
  codeGenerationResults: CodeGenerationResults;

  /**
   * the runtime template
   */
  runtimeTemplate: RuntimeTemplate;

  /**
   * the module graph
   */
  moduleGraph: ModuleGraph;

  /**
   * the chunk graph
   */
  chunkGraph: ChunkGraph;
}
type ChunkId = string | number;
declare interface ChunkMaps {
  hash: Record<string | number, string>;
  contentHash: Record<string | number, Record<string, string>>;
  name: Record<string | number, string>;
}
declare class ChunkModuleIdRangePlugin {
  constructor(options: ChunkModuleIdRangePluginOptions);
  options: ChunkModuleIdRangePluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface ChunkModuleIdRangePluginOptions {
  /**
   * the chunk name
   */
  name: string;

  /**
   * order
   */
  order?: 'index' | 'index2' | 'preOrderIndex' | 'postOrderIndex';

  /**
   * start id
   */
  start?: number;

  /**
   * end id
   */
  end?: number;
}
declare interface ChunkModuleMaps {
  id: Record<string | number, (string | number)[]>;
  hash: Record<string | number, string>;
}
declare interface ChunkPathData {
  id: string | number;
  name?: string;
  hash: string;
  hashWithLength?: (arg0: number) => string;
  contentHash?: Record<string, string>;
  contentHashWithLength?: Record<string, (length: number) => string>;
}
declare class ChunkPrefetchPreloadPlugin {
  constructor();
  apply(compiler: Compiler): void;
}

/**
 * Advanced options for cleaning assets.
 */
declare interface CleanOptions {
  /**
   * Log the assets that should be removed instead of deleting them.
   */
  dry?: boolean;

  /**
   * Keep these assets.
   */
  keep?: string | RegExp | ((filename: string) => boolean);
}
declare class CleanPlugin {
  constructor(options?: CleanOptions);
  options: {
    /**
     * Log the assets that should be removed instead of deleting them.
     */
    dry: boolean;
    /**
     * Keep these assets.
     */
    keep?: string | RegExp | ((filename: string) => boolean);
  };

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  static getCompilationHooks(
    compilation: Compilation,
  ): CleanPluginCompilationHooks;
}
declare interface CleanPluginCompilationHooks {
  /**
   * when returning true the file/directory will be kept during cleaning, returning false will clean it and ignore the following plugins and config
   */
  keep: SyncBailHook<[string], boolean>;
}
declare interface CodeGenerationContext {
  /**
   * the dependency templates
   */
  dependencyTemplates: DependencyTemplates;

  /**
   * the runtime template
   */
  runtimeTemplate: RuntimeTemplate;

  /**
   * the module graph
   */
  moduleGraph: ModuleGraph;

  /**
   * the chunk graph
   */
  chunkGraph: ChunkGraph;

  /**
   * the runtimes code should be generated for
   */
  runtime: RuntimeSpec;

  /**
   * when in concatenated module, information about other concatenated modules
   */
  concatenationScope?: ConcatenationScope;

  /**
   * code generation results of other modules (need to have a codeGenerationDependency to use that)
   */
  codeGenerationResults: CodeGenerationResults;

  /**
   * the compilation
   */
  compilation?: Compilation;

  /**
   * source types
   */
  sourceTypes?: ReadonlySet<string>;
}
declare interface CodeGenerationResult {
  /**
   * the resulting sources for all source types
   */
  sources: Map<string, Source>;

  /**
   * the resulting data for all source types
   */
  data?: Map<string, any>;

  /**
   * the runtime requirements
   */
  runtimeRequirements: ReadonlySet<string>;

  /**
   * a hash of the code generation result (will be automatically calculated from sources and runtimeRequirements if not provided)
   */
  hash?: string;
}

type CodeValue =
  | undefined
  | null
  | string
  | number
  | bigint
  | boolean
  | Function
  | RegExp
  | RuntimeValue
  | {
      [index: string]: RecursiveArrayOrRecord<
        | undefined
        | null
        | string
        | number
        | bigint
        | boolean
        | Function
        | RegExp
        | RuntimeValue
      >;
    }
  | RecursiveArrayOrRecord<
      | undefined
      | null
      | string
      | number
      | bigint
      | boolean
      | Function
      | RegExp
      | RuntimeValue
    >[];
type CodeValuePrimitive =
  | undefined
  | null
  | string
  | number
  | bigint
  | boolean
  | Function
  | RegExp;
declare interface Comparator<T> {
  (arg0: T, arg1: T): 0 | 1 | -1;
}

declare interface CompilationAssets {
  [index: string]: Source;
}
declare interface CompilationHooksAsyncWebAssemblyModulesPlugin {
  renderModuleContent: SyncWaterfallHook<
    [Source, Module, WebAssemblyRenderContext]
  >;
}
declare interface CompilationHooksJavascriptModulesPlugin {
  renderModuleContent: SyncWaterfallHook<[Source, Module, ChunkRenderContext]>;
  renderModuleContainer: SyncWaterfallHook<
    [Source, Module, ChunkRenderContext]
  >;
  renderModulePackage: SyncWaterfallHook<[Source, Module, ChunkRenderContext]>;
  renderChunk: SyncWaterfallHook<[Source, RenderContext]>;
  renderMain: SyncWaterfallHook<[Source, RenderContext]>;
  renderContent: SyncWaterfallHook<[Source, RenderContext]>;
  render: SyncWaterfallHook<[Source, RenderContext]>;
  renderStartup: SyncWaterfallHook<[Source, Module, StartupRenderContext]>;
  renderRequire: SyncWaterfallHook<[string, RenderBootstrapContext]>;
  inlineInRuntimeBailout: SyncBailHook<
    [Module, RenderBootstrapContext],
    string
  >;
  embedInRuntimeBailout: SyncBailHook<[Module, RenderContext], string | void>;
  strictRuntimeBailout: SyncBailHook<[RenderContext], string | void>;
  chunkHash: SyncHook<[Chunk, Hash, ChunkHashContext]>;
  useSourceMap: SyncBailHook<[Chunk, RenderContext], boolean>;
}
declare interface CompilationHooksRealContentHashPlugin {
  updateHash: SyncBailHook<[Buffer[], string], string>;
}
declare interface CompilationParams {
  normalModuleFactory: NormalModuleFactory;
  contextModuleFactory: ContextModuleFactory;
}

declare interface ConcatenatedModuleInfo {
  index: number;
  module: Module;

  /**
   * mapping from export name to symbol
   */
  exportMap: Map<string, string>;

  /**
   * mapping from export name to symbol
   */
  rawExportMap: Map<string, string>;
  namespaceExportSymbol?: string;
}
declare interface ConcatenationBailoutReasonContext {
  /**
   * the module graph
   */
  moduleGraph: ModuleGraph;

  /**
   * the chunk graph
   */
  chunkGraph: ChunkGraph;
}

/**
 * Options object as provided by the user.
 */
declare interface Configuration {
  /**
   * Set the value of `require.amd` and `define.amd`. Or disable AMD support.
   */
  amd?: false | { [index: string]: any };

  /**
   * Report the first error as a hard error instead of tolerating it.
   */
  bail?: boolean;

  /**
   * Cache generated modules and chunks to improve performance for multiple incremental builds.
   */
  cache?: boolean | FileCacheOptions | MemoryCacheOptions;

  /**
   * The base directory (absolute path!) for resolving the `entry` option. If `output.pathinfo` is set, the included pathinfo is shortened to this directory.
   */
  context?: string;

  /**
   * References to other configurations to depend on.
   */
  dependencies?: string[];

  /**
   * A developer tool to enhance debugging (false | eval | [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map).
   */
  devtool?: string | false;

  /**
   * The entry point(s) of the compilation.
   */
  entry?:
    | string
    | (() => string | EntryObject | string[] | Promise<EntryStatic>)
    | EntryObject
    | string[];

  /**
   * Enables/Disables experiments (experimental features with relax SemVer compatibility).
   */
  experiments?: Experiments;

  /**
   * Extend configuration from another configuration (only works when using webpack-cli).
   */
  extends?: string | string[];

  /**
   * Specify dependencies that shouldn't be resolved by webpack, but should become dependencies of the resulting bundle. The kind of the dependency depends on `output.libraryTarget`.
   */
  externals?:
    | string
    | RegExp
    | ExternalItem[]
    | (ExternalItemObjectKnown & ExternalItemObjectUnknown)
    | ((
        data: ExternalItemFunctionData,
        callback: (
          err?: null | Error,
          result?: string | boolean | string[] | { [index: string]: any },
        ) => void,
      ) => void)
    | ((data: ExternalItemFunctionData) => Promise<ExternalItemValue>);

  /**
   * Enable presets of externals for specific targets.
   */
  externalsPresets?: ExternalsPresets;

  /**
   * Specifies the default type of externals ('amd*', 'umd*', 'system' and 'jsonp' depend on output.libraryTarget set to the same value).
   */
  externalsType?:
    | 'import'
    | 'var'
    | 'module'
    | 'assign'
    | 'this'
    | 'window'
    | 'self'
    | 'global'
    | 'commonjs'
    | 'commonjs2'
    | 'commonjs-module'
    | 'commonjs-static'
    | 'amd'
    | 'amd-require'
    | 'umd'
    | 'umd2'
    | 'jsonp'
    | 'system'
    | 'promise'
    | 'script'
    | 'node-commonjs';

  /**
   * Ignore specific warnings.
   */
  ignoreWarnings?: (
    | RegExp
    | {
        /**
         * A RegExp to select the origin file for the warning.
         */
        file?: RegExp;
        /**
         * A RegExp to select the warning message.
         */
        message?: RegExp;
        /**
         * A RegExp to select the origin module for the warning.
         */
        module?: RegExp;
      }
    | ((warning: WebpackError, compilation: Compilation) => boolean)
  )[];

  /**
   * Options for infrastructure level logging.
   */
  infrastructureLogging?: InfrastructureLogging;

  /**
   * Custom values available in the loader context.
   */
  loader?: Loader;

  /**
   * Enable production optimizations or development hints.
   */
  mode?: 'none' | 'development' | 'production';

  /**
   * Options affecting the normal modules (`NormalModuleFactory`).
   */
  module?: ModuleOptions;

  /**
   * Name of the configuration. Used when loading multiple configurations.
   */
  name?: string;

  /**
   * Include polyfills or mocks for various node stuff.
   */
  node?: false | NodeOptions;

  /**
   * Enables/Disables integrated optimizations.
   */
  optimization?: Optimization;

  /**
   * Options affecting the output of the compilation. `output` options tell webpack how to write the compiled files to disk.
   */
  output?: Output;

  /**
   * The number of parallel processed modules in the compilation.
   */
  parallelism?: number;

  /**
   * Configuration for web performance recommendations.
   */
  performance?: false | PerformanceOptions;

  /**
   * Add additional plugins to the compiler.
   */
  plugins?: (
    | undefined
    | null
    | false
    | ''
    | 0
    | ((this: Compiler, compiler: Compiler) => void)
    | WebpackPluginInstance
  )[];

  /**
   * Capture timing information for each module.
   */
  profile?: boolean;

  /**
   * Store compiler state to a json file.
   */
  recordsInputPath?: string | false;

  /**
   * Load compiler state from a json file.
   */
  recordsOutputPath?: string | false;

  /**
   * Store/Load compiler state from/to a json file. This will result in persistent ids of modules and chunks. An absolute path is expected. `recordsPath` is used for `recordsInputPath` and `recordsOutputPath` if they left undefined.
   */
  recordsPath?: string | false;

  /**
   * Options for the resolver.
   */
  resolve?: ResolveOptionsWebpackOptions;

  /**
   * Options for the resolver when resolving loaders.
   */
  resolveLoader?: ResolveOptionsWebpackOptions;

  /**
   * Options affecting how file system snapshots are created and validated.
   */
  snapshot?: SnapshotOptionsWebpackOptions;

  /**
   * Stats options object or preset name.
   */
  stats?:
    | boolean
    | StatsOptions
    | 'none'
    | 'verbose'
    | 'summary'
    | 'errors-only'
    | 'errors-warnings'
    | 'minimal'
    | 'normal'
    | 'detailed';

  /**
   * Environment to build for. An array of environments to build for all of them when possible.
   */
  target?: string | false | string[];

  /**
   * Enter watch mode, which rebuilds on file change.
   */
  watch?: boolean;

  /**
   * Options for the watcher.
   */
  watchOptions?: WatchOptions;
}
type ConnectionState =
  | boolean
  | typeof TRANSITIVE_ONLY
  | typeof CIRCULAR_CONNECTION;
declare class ConstDependency extends NullDependency {
  constructor(
    expression: string,
    range: number | [number, number],
    runtimeRequirements?: null | string[],
  );
  expression: string;
  range: number | [number, number];
  runtimeRequirements: null | Set<string>;
  static Template: typeof ConstDependencyTemplate;
  static NO_EXPORTS_REFERENCED: string[][];
  static EXPORTS_OBJECT_REFERENCED: string[][];
  static TRANSITIVE: typeof TRANSITIVE;
}
declare class ConstDependencyTemplate extends NullDependencyTemplate {
  constructor();
}
declare interface Constructor {
  new (...params: any[]): any;
}
declare class ConsumeSharedPlugin {
  constructor(options: ConsumeSharedPluginOptions);

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}

/**
 * Options for consuming shared modules.
 */
declare interface ConsumeSharedPluginOptions {
  /**
   * Modules that should be consumed from share scope. When provided, property names are used to match requested modules in this compilation.
   */
  consumes: Consumes;

  /**
   * Share scope name used for all consumed modules (defaults to 'default').
   */
  shareScope?: string;
}
type Consumes = (string | ConsumesObject)[] | ConsumesObject;

/**
 * Advanced configuration for modules that should be consumed from share scope.
 */
declare interface ConsumesConfig {
  /**
   * Include the fallback module directly instead behind an async request. This allows to use fallback module in initial load too. All possible shared modules need to be eager too.
   */
  eager?: boolean;

  /**
   * Fallback module if no shared module is found in share scope. Defaults to the property name.
   */
  import?: string | false;

  /**
   * Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
   */
  packageName?: string;

  /**
   * Version requirement from module in share scope.
   */
  requiredVersion?: string | false;

  /**
   * Module is looked up under this key from the share scope.
   */
  shareKey?: string;

  /**
   * Share scope name.
   */
  shareScope?: string;

  /**
   * Allow only a single version of the shared module in share scope (disabled by default).
   */
  singleton?: boolean;

  /**
   * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
   */
  strictVersion?: boolean;
}

/**
 * Modules that should be consumed from share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 */
declare interface ConsumesObject {
  [index: string]: string | ConsumesConfig;
}
type ContainerOptionsFormat<T> =
  | Record<string, string | string[] | T>
  | (string | Record<string, string | string[] | T>)[];
declare class ContainerPlugin {
  constructor(options: ContainerPluginOptions);

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface ContainerPluginOptions {
  /**
   * Modules that should be exposed by this container. When provided, property name is used as public name, otherwise public name is automatically inferred from request.
   */
  exposes: Exposes;

  /**
   * The filename for this container relative path inside the `output.path` directory.
   */
  filename?: string;

  /**
   * Options for library.
   */
  library?: LibraryOptions;

  /**
   * The name for this container.
   */
  name: string;

  /**
   * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
   */
  runtime?: string | false;

  /**
   * The name of the share scope which is shared with the host (defaults to 'default').
   */
  shareScope?: string;
}
declare class ContainerReferencePlugin {
  constructor(options: ContainerReferencePluginOptions);

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface ContainerReferencePluginOptions {
  /**
   * The external type of the remote containers.
   */
  remoteType: ExternalsType;

  /**
   * Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.
   */
  remotes: Remotes;

  /**
   * The name of the share scope shared with all remotes (defaults to 'default').
   */
  shareScope?: string;
}
declare abstract class ContextElementDependency extends ModuleDependency {
  referencedExports?: string[][];
}
declare class ContextExclusionPlugin {
  constructor(negativeMatcher: RegExp);
  negativeMatcher: RegExp;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface ContextFileSystemInfoEntry {
  safeTime: number;
  timestampHash?: string;
  resolved?: ResolvedContextFileSystemInfoEntry;
  symlinks?: Set<string>;
}
declare interface ContextHash {
  hash: string;
  resolved?: string;
  symlinks?: Set<string>;
}
type ContextMode =
  | 'weak'
  | 'eager'
  | 'lazy'
  | 'lazy-once'
  | 'sync'
  | 'async-weak';
declare abstract class ContextModuleFactory extends ModuleFactory {
  hooks: Readonly<{
    beforeResolve: AsyncSeriesWaterfallHook<[any]>;
    afterResolve: AsyncSeriesWaterfallHook<[any]>;
    contextModuleFiles: SyncWaterfallHook<[string[]]>;
    alternatives: FakeHook<
      Pick<
        AsyncSeriesWaterfallHook<[any[]]>,
        'name' | 'tap' | 'tapAsync' | 'tapPromise'
      >
    >;
    alternativeRequests: AsyncSeriesWaterfallHook<
      [any[], ContextModuleOptions]
    >;
  }>;
  resolverFactory: ResolverFactory;
  resolveDependencies(
    fs: InputFileSystem,
    options: ContextModuleOptions,
    callback: (
      err?: null | Error,
      dependencies?: ContextElementDependency[],
    ) => any,
  ): void;
}

declare interface ContextModuleOptions {
  mode: ContextMode;
  recursive: boolean;
  regExp: RegExp;
  namespaceObject?: boolean | 'strict';
  addon?: string;
  chunkName?: string;
  include?: RegExp;
  exclude?: RegExp;
  groupOptions?: RawChunkGroupOptions;
  typePrefix?: string;
  category?: string;

  /**
   * exports referenced from modules (won't be mangled)
   */
  referencedExports?: null | string[][];
  layer?: string;
  resource: string | false | string[];
  resourceQuery?: string;
  resourceFragment?: string;
  resolveOptions: any;
}
declare class ContextReplacementPlugin {
  constructor(
    resourceRegExp: RegExp,
    newContentResource?: any,
    newContentRecursive?: any,
    newContentRegExp?: any,
  );
  resourceRegExp: RegExp;
  newContentCallback: any;
  newContentResource: any;
  newContentCreateContextMap: any;
  newContentRecursive: any;
  newContentRegExp: any;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface ContextTimestampAndHash {
  safeTime: number;
  timestampHash?: string;
  hash: string;
  resolved?: ResolvedContextTimestampAndHash;
  symlinks?: Set<string>;
}
type CreateStatsOptionsContext = KnownCreateStatsOptionsContext &
  Record<string, any>;

/**
 * Options for css handling.
 */
declare interface CssExperimentOptions {
  /**
   * Avoid generating and loading a stylesheet and only embed exports from css into output javascript files.
   */
  exportsOnly?: boolean;
}
type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration;
declare class DefinePlugin {
  /**
   * Create a new define plugin
   */
  constructor(definitions: Record<string, CodeValue>);
  definitions: Record<string, CodeValue>;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  static runtimeValue(
    fn: (arg0: {
      module: NormalModule;
      key: string;
      readonly version?: string;
    }) => CodeValuePrimitive,
    options?: true | string[] | RuntimeValueOptions,
  ): RuntimeValue;
}
declare class DelegatedPlugin {
  constructor(options?: any);
  options: any;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface DepConstructor {
  new (...args: any[]): Dependency;
}
declare interface DependenciesBlockLike {
  dependencies: Dependency[];
  blocks: AsyncDependenciesBlock[];
}
declare interface DependencyConstructor {
  new (...args: any[]): Dependency;
}
type DependencyLocation = SyntheticDependencyLocation | RealDependencyLocation;
declare class DependencyTemplate {
  constructor();
  apply(
    dependency: Dependency,
    source: ReplaceSource,
    templateContext: DependencyTemplateContext,
  ): void;
}
declare interface DependencyTemplateContext {
  /**
   * the runtime template
   */
  runtimeTemplate: RuntimeTemplate;

  /**
   * the dependency templates
   */
  dependencyTemplates: DependencyTemplates;

  /**
   * the module graph
   */
  moduleGraph: ModuleGraph;

  /**
   * the chunk graph
   */
  chunkGraph: ChunkGraph;

  /**
   * the requirements for runtime
   */
  runtimeRequirements: Set<string>;

  /**
   * current module
   */
  module: Module;

  /**
   * current runtimes, for which code is generated
   */
  runtime: RuntimeSpec;

  /**
   * mutable array of init fragments for the current module
   */
  initFragments: InitFragment<GenerateContext>[];

  /**
   * when in a concatenated module, information about other concatenated modules
   */
  concatenationScope?: ConcatenationScope;

  /**
   * the code generation results
   */
  codeGenerationResults: CodeGenerationResults;
}
declare abstract class DependencyTemplates {
  get(dependency: DependencyConstructor): undefined | DependencyTemplate;
  set(
    dependency: DependencyConstructor,
    dependencyTemplate: DependencyTemplate,
  ): void;
  updateHash(part: string): void;
  getHash(): string;
  clone(): DependencyTemplates;
}
declare class DeterministicChunkIdsPlugin {
  constructor(options?: DeterministicChunkIdsPluginOptions);
  options: DeterministicChunkIdsPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface DeterministicChunkIdsPluginOptions {
  /**
   * context for ids
   */
  context?: string;

  /**
   * maximum length of ids
   */
  maxLength?: number;
}
declare class DeterministicModuleIdsPlugin {
  constructor(options?: DeterministicModuleIdsPluginOptions);
  options: DeterministicModuleIdsPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface DeterministicModuleIdsPluginOptions {
  /**
   * context relative to which module identifiers are computed
   */
  context?: string;

  /**
   * selector function for modules
   */
  test?: (arg0: Module) => boolean;

  /**
   * maximum id length in digits (used as starting point)
   */
  maxLength?: number;

  /**
   * hash salt for ids
   */
  salt?: number;

  /**
   * do not increase the maxLength to find an optimal id space size
   */
  fixedLength?: boolean;

  /**
   * throw an error when id conflicts occur (instead of rehashing)
   */
  failOnConflict?: boolean;
}

/**
 * Options for the webpack-dev-server.
 */
declare interface DevServer {
  [index: string]: any;
}
declare class DllPlugin {
  constructor(options: DllPluginOptions);
  options: {
    entryOnly: boolean;
    /**
     * Context of requests in the manifest file (defaults to the webpack context).
     */
    context?: string;
    /**
     * If true, manifest json file (output) will be formatted.
     */
    format?: boolean;
    /**
     * Name of the exposed dll function (external name, use value of 'output.library').
     */
    name?: string;
    /**
     * Absolute path to the manifest json file (output).
     */
    path: string;
    /**
     * Type of the dll bundle (external type, use value of 'output.libraryTarget').
     */
    type?: string;
  };

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface DllPluginOptions {
  /**
   * Context of requests in the manifest file (defaults to the webpack context).
   */
  context?: string;

  /**
   * If true, only entry points will be exposed (default: true).
   */
  entryOnly?: boolean;

  /**
   * If true, manifest json file (output) will be formatted.
   */
  format?: boolean;

  /**
   * Name of the exposed dll function (external name, use value of 'output.library').
   */
  name?: string;

  /**
   * Absolute path to the manifest json file (output).
   */
  path: string;

  /**
   * Type of the dll bundle (external type, use value of 'output.libraryTarget').
   */
  type?: string;
}
declare class DllReferencePlugin {
  constructor(options: DllReferencePluginOptions);
  options: DllReferencePluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
type DllReferencePluginOptions =
  | {
      /**
       * Context of requests in the manifest (or content property) as absolute path.
       */
      context?: string;
      /**
       * Extensions used to resolve modules in the dll bundle (only used when using 'scope').
       */
      extensions?: string[];
      /**
       * An object containing content and name or a string to the absolute path of the JSON manifest to be loaded upon compilation.
       */
      manifest: string | DllReferencePluginOptionsManifest;
      /**
       * The name where the dll is exposed (external name, defaults to manifest.name).
       */
      name?: string;
      /**
       * Prefix which is used for accessing the content of the dll.
       */
      scope?: string;
      /**
       * How the dll is exposed (libraryTarget, defaults to manifest.type).
       */
      sourceType?:
        | 'var'
        | 'assign'
        | 'this'
        | 'window'
        | 'global'
        | 'commonjs'
        | 'commonjs2'
        | 'commonjs-module'
        | 'amd'
        | 'amd-require'
        | 'umd'
        | 'umd2'
        | 'jsonp'
        | 'system';
      /**
       * The way how the export of the dll bundle is used.
       */
      type?: 'object' | 'require';
    }
  | {
      /**
       * The mappings from request to module info.
       */
      content: DllReferencePluginOptionsContent;
      /**
       * Context of requests in the manifest (or content property) as absolute path.
       */
      context?: string;
      /**
       * Extensions used to resolve modules in the dll bundle (only used when using 'scope').
       */
      extensions?: string[];
      /**
       * The name where the dll is exposed (external name).
       */
      name: string;
      /**
       * Prefix which is used for accessing the content of the dll.
       */
      scope?: string;
      /**
       * How the dll is exposed (libraryTarget).
       */
      sourceType?:
        | 'var'
        | 'assign'
        | 'this'
        | 'window'
        | 'global'
        | 'commonjs'
        | 'commonjs2'
        | 'commonjs-module'
        | 'amd'
        | 'amd-require'
        | 'umd'
        | 'umd2'
        | 'jsonp'
        | 'system';
      /**
       * The way how the export of the dll bundle is used.
       */
      type?: 'object' | 'require';
    };

/**
 * The mappings from request to module info.
 */
declare interface DllReferencePluginOptionsContent {
  [index: string]: {
    /**
     * Meta information about the module.
     */
    buildMeta?: { [index: string]: any };
    /**
     * Information about the provided exports of the module.
     */
    exports?: true | string[];
    /**
     * Module ID.
     */
    id: string | number;
  };
}

/**
 * An object containing content, name and type.
 */
declare interface DllReferencePluginOptionsManifest {
  /**
   * The mappings from request to module info.
   */
  content: DllReferencePluginOptionsContent;

  /**
   * The name where the dll is exposed (external name).
   */
  name?: string;

  /**
   * The type how the dll is exposed (external type).
   */
  type?:
    | 'var'
    | 'assign'
    | 'this'
    | 'window'
    | 'global'
    | 'commonjs'
    | 'commonjs2'
    | 'commonjs-module'
    | 'amd'
    | 'amd-require'
    | 'umd'
    | 'umd2'
    | 'jsonp'
    | 'system';
}
declare class DynamicEntryPlugin {
  constructor(context: string, entry: () => Promise<EntryStaticNormalized>);
  context: string;
  entry: () => Promise<EntryStaticNormalized>;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface Effect {
  type: string;
  value: any;
}
declare class ElectronTargetPlugin {
  constructor(context?: 'main' | 'preload' | 'renderer');

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}

/**
 * No generator options are supported for this module type.
 */
declare interface EmptyGeneratorOptions {}

/**
 * No parser options are supported for this module type.
 */
declare interface EmptyParserOptions {}
declare class EnableChunkLoadingPlugin {
  constructor(type: string);
  type: string;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  static setEnabled(compiler: Compiler, type: string): void;
  static checkEnabled(compiler: Compiler, type: string): void;
}
declare class EnableLibraryPlugin {
  constructor(type: string);
  type: string;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  static setEnabled(compiler: Compiler, type: string): void;
  static checkEnabled(compiler: Compiler, type: string): void;
}
declare class EnableWasmLoadingPlugin {
  constructor(type: string);
  type: string;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  static setEnabled(compiler: Compiler, type: string): void;
  static checkEnabled(compiler: Compiler, type: string): void;
}
type Entry =
  | string
  | (() => string | EntryObject | string[] | Promise<EntryStatic>)
  | EntryObject
  | string[];

declare abstract class EntryDependency extends ModuleDependency {}

/**
 * An object with entry point description.
 */
declare interface EntryDescription {
  /**
   * Enable/disable creating async chunks that are loaded on demand.
   */
  asyncChunks?: boolean;

  /**
   * Base uri for this entry.
   */
  baseUri?: string;

  /**
   * The method of loading chunks (methods included by default are 'jsonp' (web), 'import' (ESM), 'importScripts' (WebWorker), 'require' (sync node.js), 'async-node' (async node.js), but others might be added by plugins).
   */
  chunkLoading?: string | false;

  /**
   * The entrypoints that the current entrypoint depend on. They must be loaded when this entrypoint is loaded.
   */
  dependOn?: string | string[];

  /**
   * Specifies the filename of the output file on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  filename?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Module(s) that are loaded upon startup.
   */
  import: EntryItem;

  /**
   * Specifies the layer in which modules of this entrypoint are placed.
   */
  layer?: null | string;

  /**
   * Options for library.
   */
  library?: LibraryOptions;

  /**
   * The 'publicPath' specifies the public URL address of the output files when referenced in a browser.
   */
  publicPath?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
   */
  runtime?: string | false;

  /**
   * The method of loading WebAssembly Modules (methods included by default are 'fetch' (web/WebWorker), 'async-node' (node.js), but others might be added by plugins).
   */
  wasmLoading?: string | false;
}

/**
 * An object with entry point description.
 */
declare interface EntryDescriptionNormalized {
  /**
   * Enable/disable creating async chunks that are loaded on demand.
   */
  asyncChunks?: boolean;

  /**
   * Base uri for this entry.
   */
  baseUri?: string;

  /**
   * The method of loading chunks (methods included by default are 'jsonp' (web), 'import' (ESM), 'importScripts' (WebWorker), 'require' (sync node.js), 'async-node' (async node.js), but others might be added by plugins).
   */
  chunkLoading?: string | false;

  /**
   * The entrypoints that the current entrypoint depend on. They must be loaded when this entrypoint is loaded.
   */
  dependOn?: string[];

  /**
   * Specifies the filename of output files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  filename?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Module(s) that are loaded upon startup. The last one is exported.
   */
  import?: string[];

  /**
   * Specifies the layer in which modules of this entrypoint are placed.
   */
  layer?: null | string;

  /**
   * Options for library.
   */
  library?: LibraryOptions;

  /**
   * The 'publicPath' specifies the public URL address of the output files when referenced in a browser.
   */
  publicPath?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
   */
  runtime?: string | false;

  /**
   * The method of loading WebAssembly Modules (methods included by default are 'fetch' (web/WebWorker), 'async-node' (node.js), but others might be added by plugins).
   */
  wasmLoading?: string | false;
}
type EntryItem = string | string[];
type EntryNormalized =
  | (() => Promise<EntryStaticNormalized>)
  | EntryStaticNormalized;

/**
 * Multiple entry bundles are created. The key is the entry name. The value can be a string, an array or an entry description object.
 */
declare interface EntryObject {
  [index: string]: string | string[] | EntryDescription;
}
declare class EntryOptionPlugin {
  constructor();
  apply(compiler: Compiler): void;
  static applyEntryOption(
    compiler: Compiler,
    context: string,
    entry: EntryNormalized,
  ): void;
  static entryDescriptionToOptions(
    compiler: Compiler,
    name: string,
    desc: EntryDescriptionNormalized,
  ): EntryOptions;
}
type EntryOptions = { name?: string } & Omit<
  EntryDescriptionNormalized,
  'import'
>;

type EntryStatic = string | EntryObject | string[];

/**
 * Multiple entry bundles are created. The key is the entry name. The value is an entry description object.
 */
declare interface EntryStaticNormalized {
  [index: string]: EntryDescriptionNormalized;
}
declare abstract class Entrypoint extends ChunkGroup {
  /**
   * Sets the runtimeChunk for an entrypoint.
   */
  setRuntimeChunk(chunk: Chunk): void;

  /**
   * Fetches the chunk reference containing the webpack bootstrap code
   */
  getRuntimeChunk(): null | Chunk;

  /**
   * Sets the chunk with the entrypoint modules for an entrypoint.
   */
  setEntrypointChunk(chunk: Chunk): void;

  /**
   * Returns the chunk which contains the entrypoint modules
   * (or at least the execution of them)
   */
  getEntrypointChunk(): Chunk;
}

/**
 * The abilities of the environment where the webpack generated code should run.
 */
declare interface Environment {
  /**
   * The environment supports arrow functions ('() => { ... }').
   */
  arrowFunction?: boolean;

  /**
   * The environment supports async function and await ('async function () { await ... }').
   */
  asyncFunction?: boolean;

  /**
   * The environment supports BigInt as literal (123n).
   */
  bigIntLiteral?: boolean;

  /**
   * The environment supports const and let for variable declarations.
   */
  const?: boolean;

  /**
   * The environment supports destructuring ('{ a, b } = obj').
   */
  destructuring?: boolean;

  /**
   * The environment supports an async import() function to import EcmaScript modules.
   */
  dynamicImport?: boolean;

  /**
   * The environment supports an async import() is available when creating a worker.
   */
  dynamicImportInWorker?: boolean;

  /**
   * The environment supports 'for of' iteration ('for (const x of array) { ... }').
   */
  forOf?: boolean;

  /**
   * The environment supports 'globalThis'.
   */
  globalThis?: boolean;

  /**
   * The environment supports EcmaScript Module syntax to import EcmaScript modules (import ... from '...').
   */
  module?: boolean;

  /**
   * The environment supports optional chaining ('obj?.a' or 'obj?.()').
   */
  optionalChaining?: boolean;

  /**
   * The environment supports template literals.
   */
  templateLiteral?: boolean;
}

declare class EnvironmentPlugin {
  constructor(...keys: any[]);
  keys: any[];
  defaultValues: any;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
type ErrorWithDetail = Error & { details?: string };
declare interface Etag {
  toString: () => string;
}
declare class EvalDevToolModulePlugin {
  constructor(options?: any);
  namespace: any;
  sourceUrlComment: any;
  moduleFilenameTemplate: any;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare class EvalSourceMapDevToolPlugin {
  constructor(inputOptions: string | SourceMapDevToolPluginOptions);
  sourceMapComment: string;
  moduleFilenameTemplate: string | Function;
  namespace: string;
  options: SourceMapDevToolPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface ExecuteModuleArgument {
  module: Module;
  moduleObject?: { id: string; exports: any; loaded: boolean };
  preparedInfo: any;
  codeGenerationResult: CodeGenerationResult;
}
declare interface ExecuteModuleContext {
  assets: Map<string, { source: Source; info: AssetInfo }>;
  chunk: Chunk;
  chunkGraph: ChunkGraph;
  __webpack_require__?: (arg0: string) => any;
}
declare interface ExecuteModuleOptions {
  entryOptions?: EntryOptions;
}
declare interface ExecuteModuleResult {
  exports: any;
  cacheable: boolean;
  assets: Map<string, { source: Source; info: AssetInfo }>;
  fileDependencies: LazySet<string>;
  contextDependencies: LazySet<string>;
  missingDependencies: LazySet<string>;
  buildDependencies: LazySet<string>;
}
type Experiments = ExperimentsCommon & ExperimentsExtra;

/**
 * Enables/Disables experiments (experimental features with relax SemVer compatibility).
 */
declare interface ExperimentsCommon {
  /**
   * Support WebAssembly as asynchronous EcmaScript Module.
   */
  asyncWebAssembly?: boolean;

  /**
   * Enable backward-compat layer with deprecation warnings for many webpack 4 APIs.
   */
  backCompat?: boolean;

  /**
   * Enable additional in memory caching of modules that are unchanged and reference only unchanged modules.
   */
  cacheUnaffected?: boolean;

  /**
   * Apply defaults of next major version.
   */
  futureDefaults?: boolean;

  /**
   * Enable module layers.
   */
  layers?: boolean;

  /**
   * Allow output javascript files as module source type.
   */
  outputModule?: boolean;

  /**
   * Support WebAssembly as synchronous EcmaScript Module (outdated).
   */
  syncWebAssembly?: boolean;

  /**
   * Allow using top-level-await in EcmaScript Modules.
   */
  topLevelAwait?: boolean;
}

/**
 * Enables/Disables experiments (experimental features with relax SemVer compatibility).
 */
declare interface ExperimentsExtra {
  /**
   * Build http(s): urls using a lockfile and resource content cache.
   */
  buildHttp?: HttpUriOptions | (string | RegExp | ((uri: string) => boolean))[];

  /**
   * Enable css support.
   */
  css?: boolean | CssExperimentOptions;

  /**
   * Compile entrypoints and import()s only when they are accessed.
   */
  lazyCompilation?: boolean | LazyCompilationOptions;
}
type ExperimentsNormalized = ExperimentsCommon & ExperimentsNormalizedExtra;

/**
 * Enables/Disables experiments (experimental features with relax SemVer compatibility).
 */
declare interface ExperimentsNormalizedExtra {
  /**
   * Build http(s): urls using a lockfile and resource content cache.
   */
  buildHttp?: HttpUriOptions;

  /**
   * Enable css support.
   */
  css?: false | CssExperimentOptions;

  /**
   * Compile entrypoints and import()s only when they are accessed.
   */
  lazyCompilation?: false | LazyCompilationOptions;
}
declare abstract class ExportInfo {
  name: string;

  /**
   * true: it is provided
   * false: it is not provided
   * null: only the runtime knows if it is provided
   * undefined: it was not determined if it is provided
   */
  provided?: null | boolean;

  /**
   * is the export a terminal binding that should be checked for export star conflicts
   */
  terminalBinding: boolean;

  /**
   * true: it can be mangled
   * false: is can not be mangled
   * undefined: it was not determined if it can be mangled
   */
  canMangleProvide?: boolean;

  /**
   * true: it can be mangled
   * false: is can not be mangled
   * undefined: it was not determined if it can be mangled
   */
  canMangleUse?: boolean;
  exportsInfoOwned: boolean;
  exportsInfo?: ExportsInfo;
  get canMangle(): boolean;
  setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
  setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
  setHasUseInfo(): void;
  setUsedConditionally(
    condition: (arg0: UsageStateType) => boolean,
    newValue: UsageStateType,
    runtime: RuntimeSpec,
  ): boolean;
  setUsed(newValue: UsageStateType, runtime: RuntimeSpec): boolean;
  unsetTarget(key?: any): boolean;
  setTarget(
    key: any,
    connection: ModuleGraphConnection,
    exportName?: string[],
    priority?: number,
  ): boolean;
  getUsed(runtime: RuntimeSpec): UsageStateType;

  /**
   * get used name
   */
  getUsedName(
    fallbackName: undefined | string,
    runtime: RuntimeSpec,
  ): string | false;
  hasUsedName(): boolean;

  /**
   * Sets the mangled name of this export
   */
  setUsedName(name: string): void;
  getTerminalBinding(
    moduleGraph: ModuleGraph,
    resolveTargetFilter?: (arg0: {
      module: Module;
      export?: string[];
    }) => boolean,
  ): undefined | ExportsInfo | ExportInfo;
  isReexport(): undefined | boolean;
  findTarget(
    moduleGraph: ModuleGraph,
    validTargetModuleFilter: (arg0: Module) => boolean,
  ): undefined | false | { module: Module; export?: string[] };
  getTarget(
    moduleGraph: ModuleGraph,
    resolveTargetFilter?: (arg0: {
      module: Module;
      export?: string[];
    }) => boolean,
  ): undefined | { module: Module; export?: string[] };

  /**
   * Move the target forward as long resolveTargetFilter is fulfilled
   */
  moveTarget(
    moduleGraph: ModuleGraph,
    resolveTargetFilter: (arg0: {
      module: Module;
      export?: string[];
    }) => boolean,
    updateOriginalConnection?: (arg0: {
      module: Module;
      export?: string[];
    }) => ModuleGraphConnection,
  ): undefined | { module: Module; export?: string[] };
  createNestedExportsInfo(): undefined | ExportsInfo;
  getNestedExportsInfo(): undefined | ExportsInfo;
  hasInfo(baseInfo?: any, runtime?: any): boolean;
  updateHash(hash?: any, runtime?: any): void;
  getUsedInfo(): string;
  getProvidedInfo():
    | 'no provided info'
    | 'maybe provided (runtime-defined)'
    | 'provided'
    | 'not provided';
  getRenameInfo(): string;
}
declare interface ExportSpec {
  /**
   * the name of the export
   */
  name: string;

  /**
   * can the export be renamed (defaults to true)
   */
  canMangle?: boolean;

  /**
   * is the export a terminal binding that should be checked for export star conflicts
   */
  terminalBinding?: boolean;

  /**
   * nested exports
   */
  exports?: (string | ExportSpec)[];

  /**
   * when reexported: from which module
   */
  from?: ModuleGraphConnection;

  /**
   * when reexported: from which export
   */
  export?: null | string[];

  /**
   * when reexported: with which priority
   */
  priority?: number;

  /**
   * export is not visible, because another export blends over it
   */
  hidden?: boolean;
}
type ExportedVariableInfo = string | ScopeInfo | VariableInfo;
declare interface ExportsSpec {
  /**
   * exported names, true for unknown exports or null for no exports
   */
  exports: null | true | (string | ExportSpec)[];

  /**
   * when exports = true, list of unaffected exports
   */
  excludeExports?: Set<string>;

  /**
   * list of maybe prior exposed, but now hidden exports
   */
  hideExports?: Set<string>;

  /**
   * when reexported: from which module
   */
  from?: ModuleGraphConnection;

  /**
   * when reexported: with which priority
   */
  priority?: number;

  /**
   * can the export be renamed (defaults to true)
   */
  canMangle?: boolean;

  /**
   * are the exports terminal bindings that should be checked for export star conflicts
   */
  terminalBinding?: boolean;

  /**
   * module on which the result depends on
   */
  dependencies?: Module[];
}
type Exposes = (string | ExposesObject)[] | ExposesObject;

/**
 * Advanced configuration for modules that should be exposed by this container.
 */
declare interface ExposesConfig {
  /**
   * Request to a module that should be exposed by this container.
   */
  import: string | string[];

  /**
   * Custom chunk name for the exposed module.
   */
  name?: string;
}

/**
 * Modules that should be exposed by this container. Property names are used as public paths.
 */
declare interface ExposesObject {
  [index: string]: string | ExposesConfig | string[];
}
type Expression =
  | UnaryExpression
  | ArrayExpression
  | ArrowFunctionExpression
  | AssignmentExpression
  | AwaitExpression
  | BinaryExpression
  | SimpleCallExpression
  | NewExpression
  | ChainExpression
  | ClassExpression
  | ConditionalExpression
  | FunctionExpression
  | Identifier
  | ImportExpression
  | SimpleLiteral
  | RegExpLiteral
  | BigIntLiteral
  | LogicalExpression
  | MemberExpression
  | MetaProperty
  | ObjectExpression
  | SequenceExpression
  | TaggedTemplateExpression
  | TemplateLiteral
  | ThisExpression
  | UpdateExpression
  | YieldExpression;
declare interface ExpressionExpressionInfo {
  type: 'expression';
  rootInfo: string | VariableInfo;
  name: string;
  getMembers: () => string[];
  getMembersOptionals: () => boolean[];
  getMemberRanges: () => [number, number][];
}
declare interface ExtensionAliasOption {
  alias: string | string[];
  extension: string;
}
declare interface ExtensionAliasOptions {
  [index: string]: string | string[];
}
type ExternalItem =
  | string
  | RegExp
  | (ExternalItemObjectKnown & ExternalItemObjectUnknown)
  | ((
      data: ExternalItemFunctionData,
      callback: (
        err?: null | Error,
        result?: string | boolean | string[] | { [index: string]: any },
      ) => void,
    ) => void)
  | ((data: ExternalItemFunctionData) => Promise<ExternalItemValue>);

/**
 * Data object passed as argument when a function is set for 'externals'.
 */
declare interface ExternalItemFunctionData {
  /**
   * The directory in which the request is placed.
   */
  context?: string;

  /**
   * Contextual information.
   */
  contextInfo?: ModuleFactoryCreateDataContextInfo;

  /**
   * The category of the referencing dependencies.
   */
  dependencyType?: string;

  /**
   * Get a resolve function with the current resolver options.
   */
  getResolve?: (
    options?: ResolveOptionsWebpackOptions,
  ) =>
    | ((
        context: string,
        request: string,
        callback: (err?: Error, result?: string) => void,
      ) => void)
    | ((context: string, request: string) => Promise<string>);

  /**
   * The request as written by the user in the require/import expression/statement.
   */
  request?: string;
}

/**
 * If an dependency matches exactly a property of the object, the property value is used as dependency.
 */
declare interface ExternalItemObjectKnown {
  /**
   * Specify externals depending on the layer.
   */
  byLayer?:
    | { [index: string]: ExternalItem }
    | ((layer: null | string) => ExternalItem);
}

/**
 * If an dependency matches exactly a property of the object, the property value is used as dependency.
 */
declare interface ExternalItemObjectUnknown {
  [index: string]: ExternalItemValue;
}
type ExternalItemValue = string | boolean | string[] | { [index: string]: any };
declare class ExternalModule extends Module {
  constructor(
    request: string | string[] | Record<string, string | string[]>,
    type: any,
    userRequest: string,
  );
  request: string | string[] | Record<string, string | string[]>;
  externalType: string;
  userRequest: string;
  restoreFromUnsafeCache(
    unsafeCacheData?: any,
    normalModuleFactory?: any,
  ): void;
}
declare interface ExternalModuleInfo {
  index: number;
  module: Module;
}
type Externals =
  | string
  | RegExp
  | ExternalItem[]
  | (ExternalItemObjectKnown & ExternalItemObjectUnknown)
  | ((
      data: ExternalItemFunctionData,
      callback: (
        err?: null | Error,
        result?: string | boolean | string[] | { [index: string]: any },
      ) => void,
    ) => void)
  | ((data: ExternalItemFunctionData) => Promise<ExternalItemValue>);
declare class ExternalsPlugin {
  constructor(type: undefined | string, externals: Externals);
  type?: string;
  externals: Externals;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}

/**
 * Enable presets of externals for specific targets.
 */
declare interface ExternalsPresets {
  /**
   * Treat common electron built-in modules in main and preload context like 'electron', 'ipc' or 'shell' as external and load them via require() when used.
   */
  electron?: boolean;

  /**
   * Treat electron built-in modules in the main context like 'app', 'ipc-main' or 'shell' as external and load them via require() when used.
   */
  electronMain?: boolean;

  /**
   * Treat electron built-in modules in the preload context like 'web-frame', 'ipc-renderer' or 'shell' as external and load them via require() when used.
   */
  electronPreload?: boolean;

  /**
   * Treat electron built-in modules in the renderer context like 'web-frame', 'ipc-renderer' or 'shell' as external and load them via require() when used.
   */
  electronRenderer?: boolean;

  /**
   * Treat node.js built-in modules like fs, path or vm as external and load them via require() when used.
   */
  node?: boolean;

  /**
   * Treat NW.js legacy nw.gui module as external and load it via require() when used.
   */
  nwjs?: boolean;

  /**
   * Treat references to 'http(s)://...' and 'std:...' as external and load them via import when used (Note that this changes execution order as externals are executed before any other code in the chunk).
   */
  web?: boolean;

  /**
   * Treat references to 'http(s)://...' and 'std:...' as external and load them via async import() when used (Note that this external type is an async module, which has various effects on the execution).
   */
  webAsync?: boolean;
}
type ExternalsType =
  | 'import'
  | 'var'
  | 'module'
  | 'assign'
  | 'this'
  | 'window'
  | 'self'
  | 'global'
  | 'commonjs'
  | 'commonjs2'
  | 'commonjs-module'
  | 'commonjs-static'
  | 'amd'
  | 'amd-require'
  | 'umd'
  | 'umd2'
  | 'jsonp'
  | 'system'
  | 'promise'
  | 'script'
  | 'node-commonjs';
declare interface FactorizeModuleOptions {
  currentProfile: ModuleProfile;
  factory: ModuleFactory;
  dependencies: Dependency[];

  /**
   * return full ModuleFactoryResult instead of only module
   */
  factoryResult?: boolean;
  originModule: null | Module;
  contextInfo?: Partial<ModuleFactoryCreateDataContextInfo>;
  context?: string;
}
declare interface FactoryMeta {
  sideEffectFree?: boolean;
}
type FakeHook<T> = T & FakeHookMarker;
declare interface FakeHookMarker {}
declare interface FallbackCacheGroup {
  chunksFilter: (chunk: Chunk) => undefined | boolean;
  minSize: SplitChunksSizes;
  maxAsyncSize: SplitChunksSizes;
  maxInitialSize: SplitChunksSizes;
  automaticNameDelimiter: string;
}
declare class FetchCompileAsyncWasmPlugin {
  constructor();

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare class FetchCompileWasmPlugin {
  constructor(options?: FetchCompileWasmPluginOptions);
  options: FetchCompileWasmPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface FetchCompileWasmPluginOptions {
  /**
   * mangle imports
   */
  mangleImports?: boolean;
}

/**
 * Options object for persistent file-based caching.
 */
declare interface FileCacheOptions {
  /**
   * Allows to collect unused memory allocated during deserialization. This requires copying data into smaller buffers and has a performance cost.
   */
  allowCollectingMemory?: boolean;

  /**
   * Dependencies the build depends on (in multiple categories, default categories: 'defaultWebpack').
   */
  buildDependencies?: { [index: string]: string[] };

  /**
   * Base directory for the cache (defaults to node_modules/.cache/webpack).
   */
  cacheDirectory?: string;

  /**
   * Locations for the cache (defaults to cacheDirectory / name).
   */
  cacheLocation?: string;

  /**
   * Compression type used for the cache files.
   */
  compression?: false | 'gzip' | 'brotli';

  /**
   * Algorithm used for generation the hash (see node.js crypto package).
   */
  hashAlgorithm?: string;

  /**
   * Time in ms after which idle period the cache storing should happen.
   */
  idleTimeout?: number;

  /**
   * Time in ms after which idle period the cache storing should happen when larger changes has been detected (cumulative build time > 2 x avg cache store time).
   */
  idleTimeoutAfterLargeChanges?: number;

  /**
   * Time in ms after which idle period the initial cache storing should happen.
   */
  idleTimeoutForInitialStore?: number;

  /**
   * List of paths that are managed by a package manager and contain a version or hash in its path so all files are immutable.
   */
  immutablePaths?: (string | RegExp)[];

  /**
   * List of paths that are managed by a package manager and can be trusted to not be modified otherwise.
   */
  managedPaths?: (string | RegExp)[];

  /**
   * Time for which unused cache entries stay in the filesystem cache at minimum (in milliseconds).
   */
  maxAge?: number;

  /**
   * Number of generations unused cache entries stay in memory cache at minimum (0 = no memory cache used, 1 = may be removed after unused for a single compilation, ..., Infinity: kept forever). Cache entries will be deserialized from disk when removed from memory cache.
   */
  maxMemoryGenerations?: number;

  /**
   * Additionally cache computation of modules that are unchanged and reference only unchanged modules in memory.
   */
  memoryCacheUnaffected?: boolean;

  /**
   * Name for the cache. Different names will lead to different coexisting caches.
   */
  name?: string;

  /**
   * Track and log detailed timing information for individual cache items.
   */
  profile?: boolean;

  /**
   * Enable/disable readonly mode.
   */
  readonly?: boolean;

  /**
   * When to store data to the filesystem. (pack: Store data when compiler is idle in a single file).
   */
  store?: 'pack';

  /**
   * Filesystem caching.
   */
  type: 'filesystem';

  /**
   * Version of the cache data. Different versions won't allow to reuse the cache and override existing content. Update the version when config changed in a way which doesn't allow to reuse cache. This will invalidate the cache.
   */
  version?: string;
}
declare interface FileSystem {
  readFile: {
    (arg0: string, arg1: FileSystemCallback<string | Buffer>): void;
    (
      arg0: string,
      arg1: object,
      arg2: FileSystemCallback<string | Buffer>,
    ): void;
  };
  readdir: (
    arg0: string,
    arg1?:
      | null
      | 'ascii'
      | 'utf8'
      | 'utf16le'
      | 'ucs2'
      | 'latin1'
      | 'binary'
      | ((
          arg0?: null | NodeJS.ErrnoException,
          arg1?: (string | Buffer)[] | (typeof Dirent)[],
        ) => void)
      | ReaddirOptions
      | 'utf-8'
      | 'ucs-2'
      | 'base64'
      | 'base64url'
      | 'hex'
      | 'buffer',
    arg2?: (
      arg0?: null | NodeJS.ErrnoException,
      arg1?: (string | Buffer)[] | (typeof Dirent)[],
    ) => void,
  ) => void;
  readJson?: {
    (arg0: string, arg1: FileSystemCallback<object>): void;
    (arg0: string, arg1: object, arg2: FileSystemCallback<object>): void;
  };
  readlink: {
    (arg0: string, arg1: FileSystemCallback<string | Buffer>): void;
    (
      arg0: string,
      arg1: object,
      arg2: FileSystemCallback<string | Buffer>,
    ): void;
  };
  lstat?: {
    (arg0: string, arg1: FileSystemCallback<FileSystemStats>): void;
    (
      arg0: string,
      arg1: object,
      arg2: FileSystemCallback<string | Buffer>,
    ): void;
  };
  stat: {
    (arg0: string, arg1: FileSystemCallback<FileSystemStats>): void;
    (
      arg0: string,
      arg1: object,
      arg2: FileSystemCallback<string | Buffer>,
    ): void;
  };
}
declare interface FileSystemCallback<T> {
  (err?: null | (PossibleFileSystemError & Error), result?: T): any;
}
declare abstract class FileSystemInfo {
  fs: InputFileSystem;
  logger?: WebpackLogger;
  fileTimestampQueue: AsyncQueue<string, string, null | FileSystemInfoEntry>;
  fileHashQueue: AsyncQueue<string, string, null | string>;
  contextTimestampQueue: AsyncQueue<
    string,
    string,
    null | ContextFileSystemInfoEntry
  >;
  contextHashQueue: AsyncQueue<string, string, null | ContextHash>;
  contextTshQueue: AsyncQueue<string, string, null | ContextTimestampAndHash>;
  managedItemQueue: AsyncQueue<string, string, null | string>;
  managedItemDirectoryQueue: AsyncQueue<string, string, Set<string>>;
  managedPaths: (string | RegExp)[];
  managedPathsWithSlash: string[];
  managedPathsRegExps: RegExp[];
  immutablePaths: (string | RegExp)[];
  immutablePathsWithSlash: string[];
  immutablePathsRegExps: RegExp[];
  logStatistics(): void;
  clear(): void;
  addFileTimestamps(
    map: ReadonlyMap<string, null | FileSystemInfoEntry | 'ignore'>,
    immutable?: boolean,
  ): void;
  addContextTimestamps(
    map: ReadonlyMap<string, null | FileSystemInfoEntry | 'ignore'>,
    immutable?: boolean,
  ): void;
  getFileTimestamp(
    path: string,
    callback: (
      arg0?: null | WebpackError,
      arg1?: null | FileSystemInfoEntry | 'ignore',
    ) => void,
  ): void;
  getContextTimestamp(
    path: string,
    callback: (
      arg0?: null | WebpackError,
      arg1?: null | 'ignore' | ResolvedContextFileSystemInfoEntry,
    ) => void,
  ): void;
  getFileHash(
    path: string,
    callback: (arg0?: null | WebpackError, arg1?: null | string) => void,
  ): void;
  getContextHash(
    path: string,
    callback: (arg0?: null | WebpackError, arg1?: string) => void,
  ): void;
  getContextTsh(
    path: string,
    callback: (
      arg0?: null | WebpackError,
      arg1?: ResolvedContextTimestampAndHash,
    ) => void,
  ): void;
  resolveBuildDependencies(
    context: string,
    deps: Iterable<string>,
    callback: (
      arg0?: null | Error,
      arg1?: ResolveBuildDependenciesResult,
    ) => void,
  ): void;
  checkResolveResultsValid(
    resolveResults: Map<string, string | false>,
    callback: (arg0?: null | Error, arg1?: boolean) => void,
  ): void;
  createSnapshot(
    startTime: undefined | null | number,
    files: Iterable<string>,
    directories: Iterable<string>,
    missing: Iterable<string>,
    options: undefined | null | SnapshotOptionsFileSystemInfo,
    callback: (arg0?: null | WebpackError, arg1?: null | Snapshot) => void,
  ): void;
  mergeSnapshots(snapshot1: Snapshot, snapshot2: Snapshot): Snapshot;
  checkSnapshotValid(
    snapshot: Snapshot,
    callback: (arg0?: null | WebpackError, arg1?: boolean) => void,
  ): void;
  getDeprecatedFileTimestamps(): Map<any, any>;
  getDeprecatedContextTimestamps(): Map<any, any>;
}
declare interface FileSystemInfoEntry {
  safeTime: number;
  timestamp?: number;
}
declare interface FileSystemStats {
  isDirectory: () => boolean;
  isFile: () => boolean;
}
type FilterItemTypes = string | RegExp | ((value: string) => boolean);
declare interface GenerateContext {
  /**
   * mapping from dependencies to templates
   */
  dependencyTemplates: DependencyTemplates;

  /**
   * the runtime template
   */
  runtimeTemplate: RuntimeTemplate;

  /**
   * the module graph
   */
  moduleGraph: ModuleGraph;

  /**
   * the chunk graph
   */
  chunkGraph: ChunkGraph;

  /**
   * the requirements for runtime
   */
  runtimeRequirements: Set<string>;

  /**
   * the runtime
   */
  runtime: RuntimeSpec;

  /**
   * when in concatenated module, information about other concatenated modules
   */
  concatenationScope?: ConcatenationScope;

  /**
   * code generation results of other modules (need to have a codeGenerationDependency to use that)
   */
  codeGenerationResults?: CodeGenerationResults;

  /**
   * which kind of code should be generated
   */
  type: string;

  /**
   * get access to the code generation data
   */
  getData?: () => Map<string, any>;
}
declare class Generator {
  constructor();
  getTypes(module: NormalModule): Set<string>;
  getSize(module: NormalModule, type?: string): number;
  generate(module: NormalModule, __1: GenerateContext): Source;
  getConcatenationBailoutReason(
    module: NormalModule,
    context: ConcatenationBailoutReasonContext,
  ): undefined | string;
  updateHash(hash: Hash, __1: UpdateHashContextGenerator): void;
  static byType(map: Record<string, Generator>): ByTypeGenerator;
}
type GeneratorOptionsByModuleType = GeneratorOptionsByModuleTypeKnown &
  GeneratorOptionsByModuleTypeUnknown;

/**
 * Specify options for each generator.
 */
declare interface GeneratorOptionsByModuleTypeKnown {
  /**
   * Generator options for asset modules.
   */
  asset?: AssetGeneratorOptions;

  /**
   * Generator options for asset/inline modules.
   */
  'asset/inline'?: AssetInlineGeneratorOptions;

  /**
   * Generator options for asset/resource modules.
   */
  'asset/resource'?: AssetResourceGeneratorOptions;

  /**
   * No generator options are supported for this module type.
   */
  javascript?: EmptyGeneratorOptions;

  /**
   * No generator options are supported for this module type.
   */
  'javascript/auto'?: EmptyGeneratorOptions;

  /**
   * No generator options are supported for this module type.
   */
  'javascript/dynamic'?: EmptyGeneratorOptions;

  /**
   * No generator options are supported for this module type.
   */
  'javascript/esm'?: EmptyGeneratorOptions;
}

/**
 * Specify options for each generator.
 */
declare interface GeneratorOptionsByModuleTypeUnknown {
  [index: string]: { [index: string]: any };
}
declare class GetChunkFilenameRuntimeModule extends RuntimeModule {
  constructor(
    contentType: string,
    name: string,
    global: string,
    getFilenameForChunk: (
      arg0: Chunk,
    ) => string | ((arg0: PathData, arg1?: AssetInfo) => string),
    allChunks: boolean,
  );
  contentType: string;
  global: string;
  getFilenameForChunk: (
    arg0: Chunk,
  ) => string | ((arg0: PathData, arg1?: AssetInfo) => string);
  allChunks: boolean;

  /**
   * Runtime modules without any dependencies to other runtime modules
   */
  static STAGE_NORMAL: number;

  /**
   * Runtime modules with simple dependencies on other runtime modules
   */
  static STAGE_BASIC: number;

  /**
   * Runtime modules which attach to handlers of other runtime modules
   */
  static STAGE_ATTACH: number;

  /**
   * Runtime modules which trigger actions on bootstrap
   */
  static STAGE_TRIGGER: number;
}
declare interface GroupConfig {
  getKeys: (arg0?: any) => string[];
  createGroup: (arg0: string, arg1: any[], arg2: any[]) => object;
  getOptions?: (arg0: string, arg1: any[]) => GroupOptions;
}
declare interface GroupOptions {
  groupChildren?: boolean;
  force?: boolean;
  targetGroupCount?: number;
}
declare interface HMRJavascriptParserHooks {
  hotAcceptCallback: SyncBailHook<[any, string[]], void>;
  hotAcceptWithoutCallback: SyncBailHook<[any, string[]], void>;
}
declare interface HandleModuleCreationOptions {
  factory: ModuleFactory;
  dependencies: Dependency[];
  originModule: null | Module;
  contextInfo?: Partial<ModuleFactoryCreateDataContextInfo>;
  context?: string;

  /**
   * recurse into dependencies of the created module
   */
  recursive?: boolean;

  /**
   * connect the resolved module with the origin module
   */
  connectOrigin?: boolean;
}
declare class HarmonyImportDependency extends ModuleDependency {
  constructor(request: string, sourceOrder: number, assertions?: Assertions);
  sourceOrder: number;
  getImportVar(moduleGraph: ModuleGraph): string;
  getImportStatement(
    update: boolean,
    __1: DependencyTemplateContext,
  ): [string, string];
  getLinkingErrors(
    moduleGraph: ModuleGraph,
    ids: string[],
    additionalMessage: string,
  ): undefined | WebpackError[];
  static Template: typeof HarmonyImportDependencyTemplate;
  static ExportPresenceModes: {
    NONE: 0;
    WARN: 1;
    AUTO: 2;
    ERROR: 3;
    fromUserOption(str?: any): 0 | 1 | 2 | 3;
  };
  static NO_EXPORTS_REFERENCED: string[][];
  static EXPORTS_OBJECT_REFERENCED: string[][];
  static TRANSITIVE: typeof TRANSITIVE;
}
declare class HarmonyImportDependencyTemplate extends DependencyTemplate {
  constructor();
  static getImportEmittedRuntime(
    module: Module,
    referencedModule: Module,
  ): undefined | string | boolean | SortableSet<string>;
}
declare class Hash {
  constructor();

  /**
   * Update hash {@link https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding}
   */
  update(data: string | Buffer, inputEncoding?: string): Hash;

  /**
   * Calculates the digest {@link https://nodejs.org/api/crypto.html#crypto_hash_digest_encoding}
   */
  digest(encoding?: string): string | Buffer;
}
declare interface HashableObject {
  updateHash: (arg0: Hash) => void;
}
declare class HashedModuleIdsPlugin {
  constructor(options?: HashedModuleIdsPluginOptions);
  options: HashedModuleIdsPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface HashedModuleIdsPluginOptions {
  /**
   * The context directory for creating names.
   */
  context?: string;

  /**
   * The encoding to use when generating the hash, defaults to 'base64'. All encodings from Node.JS' hash.digest are supported.
   */
  hashDigest?: 'latin1' | 'base64' | 'hex';

  /**
   * The prefix length of the hash digest to use, defaults to 4.
   */
  hashDigestLength?: number;

  /**
   * The hashing algorithm to use, defaults to 'md4'. All functions from Node.JS' crypto.createHash are supported.
   */
  hashFunction?: string | typeof Hash;
}
declare abstract class HelperRuntimeModule extends RuntimeModule {}
declare class HotModuleReplacementPlugin {
  constructor(options?: any);
  options: any;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  static getParserHooks(parser: JavascriptParser): HMRJavascriptParserHooks;
}

/**
 * These properties are added by the HotModuleReplacementPlugin
 */
declare interface HotModuleReplacementPluginLoaderContext {
  hot?: boolean;
}
declare class HotUpdateChunk extends Chunk {
  constructor();
}

/**
 * Options for building http resources.
 */
declare interface HttpUriOptions {
  /**
   * List of allowed URIs (resp. the beginning of them).
   */
  allowedUris: (string | RegExp | ((uri: string) => boolean))[];

  /**
   * Location where resource content is stored for lockfile entries. It's also possible to disable storing by passing false.
   */
  cacheLocation?: string | false;

  /**
   * When set, anything that would lead to a modification of the lockfile or any resource content, will result in an error.
   */
  frozen?: boolean;

  /**
   * Location of the lockfile.
   */
  lockfileLocation?: string;

  /**
   * Proxy configuration, which can be used to specify a proxy server to use for HTTP requests.
   */
  proxy?: string;

  /**
   * When set, resources of existing lockfile entries will be fetched and entries will be upgraded when resource content has changed.
   */
  upgrade?: boolean;
}
declare class HttpUriPlugin {
  constructor(options: HttpUriOptions);

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface IDirent {
  isFile: () => boolean;
  isDirectory: () => boolean;
  isBlockDevice: () => boolean;
  isCharacterDevice: () => boolean;
  isSymbolicLink: () => boolean;
  isFIFO: () => boolean;
  isSocket: () => boolean;
  name: string | Buffer;
}
declare interface IStats {
  isFile: () => boolean;
  isDirectory: () => boolean;
  isBlockDevice: () => boolean;
  isCharacterDevice: () => boolean;
  isSymbolicLink: () => boolean;
  isFIFO: () => boolean;
  isSocket: () => boolean;
  dev: number | bigint;
  ino: number | bigint;
  mode: number | bigint;
  nlink: number | bigint;
  uid: number | bigint;
  gid: number | bigint;
  rdev: number | bigint;
  size: number | bigint;
  blksize: number | bigint;
  blocks: number | bigint;
  atimeMs: number | bigint;
  mtimeMs: number | bigint;
  ctimeMs: number | bigint;
  birthtimeMs: number | bigint;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
}
declare class IgnorePlugin {
  constructor(options: IgnorePluginOptions);
  options: IgnorePluginOptions;

  /**
   * Note that if "contextRegExp" is given, both the "resourceRegExp"
   * and "contextRegExp" have to match.
   */
  checkIgnore(resolveData: ResolveData): undefined | false;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
type IgnorePluginOptions =
  | {
      /**
       * A RegExp to test the context (directory) against.
       */
      contextRegExp?: RegExp;
      /**
       * A RegExp to test the request against.
       */
      resourceRegExp: RegExp;
    }
  | {
      /**
       * A filter function for resource and context.
       */
      checkResource: (resource: string, context: string) => boolean;
    };
declare interface ImportModuleOptions {
  /**
   * the target layer
   */
  layer?: string;

  /**
   * the target public path
   */
  publicPath?: string;

  /**
   * target base uri
   */
  baseUri?: string;
}
type ImportSource =
  | undefined
  | null
  | string
  | SimpleLiteral
  | RegExpLiteral
  | BigIntLiteral;

/**
 * Options for infrastructure level logging.
 */
declare interface InfrastructureLogging {
  /**
   * Only appends lines to the output. Avoids updating existing output e. g. for status messages. This option is only used when no custom console is provided.
   */
  appendOnly?: boolean;

  /**
   * Enables/Disables colorful output. This option is only used when no custom console is provided.
   */
  colors?: boolean;

  /**
   * Custom console used for logging.
   */
  console?: Console;

  /**
   * Enable debug logging for specific loggers.
   */
  debug?:
    | string
    | boolean
    | RegExp
    | FilterItemTypes[]
    | ((value: string) => boolean);

  /**
   * Log level.
   */
  level?: 'none' | 'error' | 'warn' | 'info' | 'log' | 'verbose';

  /**
   * Stream used for logging output. Defaults to process.stderr. This option is only used when no custom console is provided.
   */
  stream?: NodeJS.WritableStream;
}
declare abstract class InitFragment<Context> {
  content: string | Source;
  stage: number;
  position: number;
  key?: string;
  endContent?: string | Source;
  getContent(context: Context): string | Source;
  getEndContent(context: Context): undefined | string | Source;
  serialize(context: ObjectSerializerContext): void;
  deserialize(context: ObjectDeserializerContext): void;
  merge: any;
}
declare interface InputFileSystem {
  readFile: (
    arg0: string,
    arg1: (arg0?: null | NodeJS.ErrnoException, arg1?: string | Buffer) => void,
  ) => void;
  readJson?: (
    arg0: string,
    arg1: (arg0?: null | Error | NodeJS.ErrnoException, arg1?: any) => void,
  ) => void;
  readlink: (
    arg0: string,
    arg1: (arg0?: null | NodeJS.ErrnoException, arg1?: string | Buffer) => void,
  ) => void;
  readdir: (
    arg0: string,
    arg1: (
      arg0?: null | NodeJS.ErrnoException,
      arg1?: (string | Buffer)[] | IDirent[],
    ) => void,
  ) => void;
  stat: (
    arg0: string,
    arg1: (arg0?: null | NodeJS.ErrnoException, arg1?: IStats) => void,
  ) => void;
  lstat?: (
    arg0: string,
    arg1: (arg0?: null | NodeJS.ErrnoException, arg1?: IStats) => void,
  ) => void;
  realpath?: (
    arg0: string,
    arg1: (arg0?: null | NodeJS.ErrnoException, arg1?: string | Buffer) => void,
  ) => void;
  purge?: (arg0?: string) => void;
  join?: (arg0: string, arg1: string) => string;
  relative?: (arg0: string, arg1: string) => string;
  dirname?: (arg0: string) => string;
}
type IntermediateFileSystem = InputFileSystem &
  OutputFileSystem &
  IntermediateFileSystemExtras;
declare interface IntermediateFileSystemExtras {
  mkdirSync: (arg0: string) => void;
  createWriteStream: (arg0: string) => NodeJS.WritableStream;
  open: (
    arg0: string,
    arg1: string,
    arg2: (arg0?: null | NodeJS.ErrnoException, arg1?: number) => void,
  ) => void;
  read: (
    arg0: number,
    arg1: Buffer,
    arg2: number,
    arg3: number,
    arg4: number,
    arg5: (arg0?: null | NodeJS.ErrnoException, arg1?: number) => void,
  ) => void;
  close: (
    arg0: number,
    arg1: (arg0?: null | NodeJS.ErrnoException) => void,
  ) => void;
  rename: (
    arg0: string,
    arg1: string,
    arg2: (arg0?: null | NodeJS.ErrnoException) => void,
  ) => void;
}
type InternalCell<T> = T | typeof TOMBSTONE | typeof UNDEFINED_MARKER;
declare abstract class ItemCacheFacade {
  get<T>(callback: CallbackCache<T>): void;
  getPromise<T>(): Promise<T>;
  store<T>(data: T, callback: CallbackCache<void>): void;
  storePromise<T>(data: T): Promise<void>;
  provide<T>(
    computer: (arg0: CallbackNormalErrorCache<T>) => void,
    callback: CallbackNormalErrorCache<T>,
  ): void;
  providePromise<T>(computer: () => T | Promise<T>): Promise<T>;
}
declare class JavascriptModulesPlugin {
  constructor(options?: object);
  options: object;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  renderModule(
    module: Module,
    renderContext: ChunkRenderContext,
    hooks: CompilationHooksJavascriptModulesPlugin,
    factory: boolean,
  ): Source;
  renderChunk(
    renderContext: RenderContext,
    hooks: CompilationHooksJavascriptModulesPlugin,
  ): Source;
  renderMain(
    renderContext: MainRenderContext,
    hooks: CompilationHooksJavascriptModulesPlugin,
    compilation: Compilation,
  ): Source;
  updateHashWithBootstrap(
    hash: Hash,
    renderContext: RenderBootstrapContext,
    hooks: CompilationHooksJavascriptModulesPlugin,
  ): void;
  renderBootstrap(
    renderContext: RenderBootstrapContext,
    hooks: CompilationHooksJavascriptModulesPlugin,
  ): {
    header: string[];
    beforeStartup: string[];
    startup: string[];
    afterStartup: string[];
    allowInlineStartup: boolean;
  };
  renderRequire(
    renderContext: RenderBootstrapContext,
    hooks: CompilationHooksJavascriptModulesPlugin,
  ): string;
  static getCompilationHooks(
    compilation: Compilation,
  ): CompilationHooksJavascriptModulesPlugin;
  static getChunkFilenameTemplate(chunk?: any, outputOptions?: any): any;
  static chunkHasJs: (chunk: Chunk, chunkGraph: ChunkGraph) => boolean;
}
declare class JavascriptParser extends Parser {
  constructor(sourceType?: 'module' | 'auto' | 'script');
  hooks: Readonly<{
    evaluateTypeof: HookMap<
      SyncBailHook<
        [UnaryExpression],
        undefined | null | BasicEvaluatedExpression
      >
    >;
    evaluate: HookMap<
      SyncBailHook<[Expression], undefined | null | BasicEvaluatedExpression>
    >;
    evaluateIdentifier: HookMap<
      SyncBailHook<
        [Identifier | MemberExpression | MetaProperty | ThisExpression],
        undefined | null | BasicEvaluatedExpression
      >
    >;
    evaluateDefinedIdentifier: HookMap<
      SyncBailHook<
        [Identifier | MemberExpression | ThisExpression],
        undefined | null | BasicEvaluatedExpression
      >
    >;
    evaluateNewExpression: HookMap<
      SyncBailHook<[NewExpression], undefined | null | BasicEvaluatedExpression>
    >;
    evaluateCallExpression: HookMap<
      SyncBailHook<
        [CallExpression],
        undefined | null | BasicEvaluatedExpression
      >
    >;
    evaluateCallExpressionMember: HookMap<
      SyncBailHook<
        [CallExpression, undefined | BasicEvaluatedExpression],
        undefined | null | BasicEvaluatedExpression
      >
    >;
    isPure: HookMap<
      SyncBailHook<
        [
          (
            | UnaryExpression
            | ArrayExpression
            | ArrowFunctionExpression
            | AssignmentExpression
            | AwaitExpression
            | BinaryExpression
            | SimpleCallExpression
            | NewExpression
            | ChainExpression
            | ClassExpression
            | ConditionalExpression
            | FunctionExpression
            | Identifier
            | ImportExpression
            | SimpleLiteral
            | RegExpLiteral
            | BigIntLiteral
            | LogicalExpression
            | MemberExpression
            | MetaProperty
            | ObjectExpression
            | SequenceExpression
            | TaggedTemplateExpression
            | TemplateLiteral
            | ThisExpression
            | UpdateExpression
            | YieldExpression
            | FunctionDeclaration
            | VariableDeclaration
            | ClassDeclaration
            | PrivateIdentifier
          ),
          number,
        ],
        boolean | void
      >
    >;
    preStatement: SyncBailHook<
      [
        | FunctionDeclaration
        | VariableDeclaration
        | ClassDeclaration
        | ExpressionStatement
        | BlockStatement
        | StaticBlock
        | EmptyStatement
        | DebuggerStatement
        | WithStatement
        | ReturnStatement
        | LabeledStatement
        | BreakStatement
        | ContinueStatement
        | IfStatement
        | SwitchStatement
        | ThrowStatement
        | TryStatement
        | WhileStatement
        | DoWhileStatement
        | ForStatement
        | ForInStatement
        | ForOfStatement
        | ImportDeclaration
        | ExportNamedDeclaration
        | ExportDefaultDeclaration
        | ExportAllDeclaration,
      ],
      boolean | void
    >;
    blockPreStatement: SyncBailHook<
      [
        | FunctionDeclaration
        | VariableDeclaration
        | ClassDeclaration
        | ExpressionStatement
        | BlockStatement
        | StaticBlock
        | EmptyStatement
        | DebuggerStatement
        | WithStatement
        | ReturnStatement
        | LabeledStatement
        | BreakStatement
        | ContinueStatement
        | IfStatement
        | SwitchStatement
        | ThrowStatement
        | TryStatement
        | WhileStatement
        | DoWhileStatement
        | ForStatement
        | ForInStatement
        | ForOfStatement
        | ImportDeclaration
        | ExportNamedDeclaration
        | ExportDefaultDeclaration
        | ExportAllDeclaration,
      ],
      boolean | void
    >;
    statement: SyncBailHook<
      [
        | FunctionDeclaration
        | VariableDeclaration
        | ClassDeclaration
        | ExpressionStatement
        | BlockStatement
        | StaticBlock
        | EmptyStatement
        | DebuggerStatement
        | WithStatement
        | ReturnStatement
        | LabeledStatement
        | BreakStatement
        | ContinueStatement
        | IfStatement
        | SwitchStatement
        | ThrowStatement
        | TryStatement
        | WhileStatement
        | DoWhileStatement
        | ForStatement
        | ForInStatement
        | ForOfStatement
        | ImportDeclaration
        | ExportNamedDeclaration
        | ExportDefaultDeclaration
        | ExportAllDeclaration,
      ],
      boolean | void
    >;
    statementIf: SyncBailHook<[IfStatement], boolean | void>;
    classExtendsExpression: SyncBailHook<
      [Expression, ClassExpression | ClassDeclaration],
      boolean | void
    >;
    classBodyElement: SyncBailHook<
      [
        StaticBlock | MethodDefinition | PropertyDefinition,
        ClassExpression | ClassDeclaration,
      ],
      boolean | void
    >;
    classBodyValue: SyncBailHook<
      [
        Expression,
        MethodDefinition | PropertyDefinition,
        ClassExpression | ClassDeclaration,
      ],
      boolean | void
    >;
    label: HookMap<SyncBailHook<[LabeledStatement], boolean | void>>;
    import: SyncBailHook<[ImportDeclaration, ImportSource], boolean | void>;
    importSpecifier: SyncBailHook<
      [ImportDeclaration, ImportSource, string, string],
      boolean | void
    >;
    export: SyncBailHook<
      [ExportNamedDeclaration | ExportAllDeclaration],
      boolean | void
    >;
    exportImport: SyncBailHook<
      [ExportNamedDeclaration | ExportAllDeclaration, ImportSource],
      boolean | void
    >;
    exportDeclaration: SyncBailHook<
      [ExportNamedDeclaration | ExportAllDeclaration, Declaration],
      boolean | void
    >;
    exportExpression: SyncBailHook<
      [ExportDefaultDeclaration, Declaration],
      boolean | void
    >;
    exportSpecifier: SyncBailHook<
      [
        ExportNamedDeclaration | ExportAllDeclaration,
        string,
        string,
        undefined | number,
      ],
      boolean | void
    >;
    exportImportSpecifier: SyncBailHook<
      [
        ExportNamedDeclaration | ExportAllDeclaration,
        ImportSource,
        string,
        string,
        undefined | number,
      ],
      boolean | void
    >;
    preDeclarator: SyncBailHook<
      [VariableDeclarator, Statement],
      boolean | void
    >;
    declarator: SyncBailHook<[VariableDeclarator, Statement], boolean | void>;
    varDeclaration: HookMap<SyncBailHook<[Declaration], boolean | void>>;
    varDeclarationLet: HookMap<SyncBailHook<[Declaration], boolean | void>>;
    varDeclarationConst: HookMap<SyncBailHook<[Declaration], boolean | void>>;
    varDeclarationVar: HookMap<SyncBailHook<[Declaration], boolean | void>>;
    pattern: HookMap<SyncBailHook<[Identifier], boolean | void>>;
    canRename: HookMap<SyncBailHook<[Expression], boolean | void>>;
    rename: HookMap<SyncBailHook<[Expression], boolean | void>>;
    assign: HookMap<SyncBailHook<[AssignmentExpression], boolean | void>>;
    assignMemberChain: HookMap<
      SyncBailHook<[AssignmentExpression, string[]], boolean | void>
    >;
    typeof: HookMap<SyncBailHook<[Expression], boolean | void>>;
    importCall: SyncBailHook<[ImportExpression], boolean | void>;
    topLevelAwait: SyncBailHook<[Expression], boolean | void>;
    call: HookMap<SyncBailHook<[CallExpression], boolean | void>>;
    callMemberChain: HookMap<
      SyncBailHook<
        [CallExpression, string[], boolean[], [number, number][]],
        boolean | void
      >
    >;
    memberChainOfCallMemberChain: HookMap<
      SyncBailHook<
        [Expression, string[], CallExpression, string[]],
        boolean | void
      >
    >;
    callMemberChainOfCallMemberChain: HookMap<
      SyncBailHook<
        [CallExpression, string[], CallExpression, string[]],
        boolean | void
      >
    >;
    optionalChaining: SyncBailHook<[ChainExpression], boolean | void>;
    new: HookMap<SyncBailHook<[NewExpression], boolean | void>>;
    binaryExpression: SyncBailHook<[BinaryExpression], boolean | void>;
    expression: HookMap<SyncBailHook<[Expression], boolean | void>>;
    expressionMemberChain: HookMap<
      SyncBailHook<
        [MemberExpression, string[], boolean[], [number, number][]],
        boolean | void
      >
    >;
    unhandledExpressionMemberChain: HookMap<
      SyncBailHook<[MemberExpression, string[]], boolean | void>
    >;
    expressionConditionalOperator: SyncBailHook<
      [ConditionalExpression],
      boolean | void
    >;
    expressionLogicalOperator: SyncBailHook<
      [LogicalExpression],
      boolean | void
    >;
    program: SyncBailHook<[Program, Comment[]], boolean | void>;
    finish: SyncBailHook<[Program, Comment[]], boolean | void>;
  }>;
  sourceType: 'module' | 'auto' | 'script';
  scope: ScopeInfo;
  state: ParserState;
  comments: any;
  semicolons: any;
  statementPath: (
    | UnaryExpression
    | ArrayExpression
    | ArrowFunctionExpression
    | AssignmentExpression
    | AwaitExpression
    | BinaryExpression
    | SimpleCallExpression
    | NewExpression
    | ChainExpression
    | ClassExpression
    | ConditionalExpression
    | FunctionExpression
    | Identifier
    | ImportExpression
    | SimpleLiteral
    | RegExpLiteral
    | BigIntLiteral
    | LogicalExpression
    | MemberExpression
    | MetaProperty
    | ObjectExpression
    | SequenceExpression
    | TaggedTemplateExpression
    | TemplateLiteral
    | ThisExpression
    | UpdateExpression
    | YieldExpression
    | FunctionDeclaration
    | VariableDeclaration
    | ClassDeclaration
    | ExpressionStatement
    | BlockStatement
    | StaticBlock
    | EmptyStatement
    | DebuggerStatement
    | WithStatement
    | ReturnStatement
    | LabeledStatement
    | BreakStatement
    | ContinueStatement
    | IfStatement
    | SwitchStatement
    | ThrowStatement
    | TryStatement
    | WhileStatement
    | DoWhileStatement
    | ForStatement
    | ForInStatement
    | ForOfStatement
    | ImportDeclaration
    | ExportNamedDeclaration
    | ExportDefaultDeclaration
    | ExportAllDeclaration
  )[];
  prevStatement?:
    | UnaryExpression
    | ArrayExpression
    | ArrowFunctionExpression
    | AssignmentExpression
    | AwaitExpression
    | BinaryExpression
    | SimpleCallExpression
    | NewExpression
    | ChainExpression
    | ClassExpression
    | ConditionalExpression
    | FunctionExpression
    | Identifier
    | ImportExpression
    | SimpleLiteral
    | RegExpLiteral
    | BigIntLiteral
    | LogicalExpression
    | MemberExpression
    | MetaProperty
    | ObjectExpression
    | SequenceExpression
    | TaggedTemplateExpression
    | TemplateLiteral
    | ThisExpression
    | UpdateExpression
    | YieldExpression
    | FunctionDeclaration
    | VariableDeclaration
    | ClassDeclaration
    | ExpressionStatement
    | BlockStatement
    | StaticBlock
    | EmptyStatement
    | DebuggerStatement
    | WithStatement
    | ReturnStatement
    | LabeledStatement
    | BreakStatement
    | ContinueStatement
    | IfStatement
    | SwitchStatement
    | ThrowStatement
    | TryStatement
    | WhileStatement
    | DoWhileStatement
    | ForStatement
    | ForInStatement
    | ForOfStatement
    | ImportDeclaration
    | ExportNamedDeclaration
    | ExportDefaultDeclaration
    | ExportAllDeclaration;
  destructuringAssignmentProperties: WeakMap<Expression, Set<string>>;
  currentTagData: any;
  destructuringAssignmentPropertiesFor(
    node: Expression,
  ): undefined | Set<string>;
  getRenameIdentifier(
    expr: Expression,
  ): undefined | string | VariableInfoInterface;
  walkClass(classy: ClassExpression | ClassDeclaration): void;

  /**
   * Pre walking iterates the scope for variable declarations
   */
  preWalkStatements(
    statements: (
      | FunctionDeclaration
      | VariableDeclaration
      | ClassDeclaration
      | ExpressionStatement
      | BlockStatement
      | StaticBlock
      | EmptyStatement
      | DebuggerStatement
      | WithStatement
      | ReturnStatement
      | LabeledStatement
      | BreakStatement
      | ContinueStatement
      | IfStatement
      | SwitchStatement
      | ThrowStatement
      | TryStatement
      | WhileStatement
      | DoWhileStatement
      | ForStatement
      | ForInStatement
      | ForOfStatement
      | ImportDeclaration
      | ExportNamedDeclaration
      | ExportDefaultDeclaration
      | ExportAllDeclaration
    )[],
  ): void;

  /**
   * Block pre walking iterates the scope for block variable declarations
   */
  blockPreWalkStatements(
    statements: (
      | FunctionDeclaration
      | VariableDeclaration
      | ClassDeclaration
      | ExpressionStatement
      | BlockStatement
      | StaticBlock
      | EmptyStatement
      | DebuggerStatement
      | WithStatement
      | ReturnStatement
      | LabeledStatement
      | BreakStatement
      | ContinueStatement
      | IfStatement
      | SwitchStatement
      | ThrowStatement
      | TryStatement
      | WhileStatement
      | DoWhileStatement
      | ForStatement
      | ForInStatement
      | ForOfStatement
      | ImportDeclaration
      | ExportNamedDeclaration
      | ExportDefaultDeclaration
      | ExportAllDeclaration
    )[],
  ): void;

  /**
   * Walking iterates the statements and expressions and processes them
   */
  walkStatements(
    statements: (
      | FunctionDeclaration
      | VariableDeclaration
      | ClassDeclaration
      | ExpressionStatement
      | BlockStatement
      | StaticBlock
      | EmptyStatement
      | DebuggerStatement
      | WithStatement
      | ReturnStatement
      | LabeledStatement
      | BreakStatement
      | ContinueStatement
      | IfStatement
      | SwitchStatement
      | ThrowStatement
      | TryStatement
      | WhileStatement
      | DoWhileStatement
      | ForStatement
      | ForInStatement
      | ForOfStatement
      | ImportDeclaration
      | ExportNamedDeclaration
      | ExportDefaultDeclaration
      | ExportAllDeclaration
    )[],
  ): void;

  /**
   * Walking iterates the statements and expressions and processes them
   */
  preWalkStatement(
    statement:
      | FunctionDeclaration
      | VariableDeclaration
      | ClassDeclaration
      | ExpressionStatement
      | BlockStatement
      | StaticBlock
      | EmptyStatement
      | DebuggerStatement
      | WithStatement
      | ReturnStatement
      | LabeledStatement
      | BreakStatement
      | ContinueStatement
      | IfStatement
      | SwitchStatement
      | ThrowStatement
      | TryStatement
      | WhileStatement
      | DoWhileStatement
      | ForStatement
      | ForInStatement
      | ForOfStatement
      | ImportDeclaration
      | ExportNamedDeclaration
      | ExportDefaultDeclaration
      | ExportAllDeclaration,
  ): void;
  blockPreWalkStatement(
    statement:
      | FunctionDeclaration
      | VariableDeclaration
      | ClassDeclaration
      | ExpressionStatement
      | BlockStatement
      | StaticBlock
      | EmptyStatement
      | DebuggerStatement
      | WithStatement
      | ReturnStatement
      | LabeledStatement
      | BreakStatement
      | ContinueStatement
      | IfStatement
      | SwitchStatement
      | ThrowStatement
      | TryStatement
      | WhileStatement
      | DoWhileStatement
      | ForStatement
      | ForInStatement
      | ForOfStatement
      | ImportDeclaration
      | ExportNamedDeclaration
      | ExportDefaultDeclaration
      | ExportAllDeclaration,
  ): void;
  walkStatement(
    statement:
      | FunctionDeclaration
      | VariableDeclaration
      | ClassDeclaration
      | ExpressionStatement
      | BlockStatement
      | StaticBlock
      | EmptyStatement
      | DebuggerStatement
      | WithStatement
      | ReturnStatement
      | LabeledStatement
      | BreakStatement
      | ContinueStatement
      | IfStatement
      | SwitchStatement
      | ThrowStatement
      | TryStatement
      | WhileStatement
      | DoWhileStatement
      | ForStatement
      | ForInStatement
      | ForOfStatement
      | ImportDeclaration
      | ExportNamedDeclaration
      | ExportDefaultDeclaration
      | ExportAllDeclaration,
  ): void;

  /**
   * Walks a statements that is nested within a parent statement
   * and can potentially be a non-block statement.
   * This enforces the nested statement to never be in ASI position.
   */
  walkNestedStatement(statement: Statement): void;
  preWalkBlockStatement(statement: BlockStatement): void;
  walkBlockStatement(statement: BlockStatement): void;
  walkExpressionStatement(statement: ExpressionStatement): void;
  preWalkIfStatement(statement: IfStatement): void;
  walkIfStatement(statement: IfStatement): void;
  preWalkLabeledStatement(statement: LabeledStatement): void;
  walkLabeledStatement(statement: LabeledStatement): void;
  preWalkWithStatement(statement: WithStatement): void;
  walkWithStatement(statement: WithStatement): void;
  preWalkSwitchStatement(statement: SwitchStatement): void;
  walkSwitchStatement(statement: SwitchStatement): void;
  walkTerminatingStatement(statement: ReturnStatement | ThrowStatement): void;
  walkReturnStatement(statement: ReturnStatement): void;
  walkThrowStatement(statement: ThrowStatement): void;
  preWalkTryStatement(statement: TryStatement): void;
  walkTryStatement(statement: TryStatement): void;
  preWalkWhileStatement(statement: WhileStatement): void;
  walkWhileStatement(statement: WhileStatement): void;
  preWalkDoWhileStatement(statement: DoWhileStatement): void;
  walkDoWhileStatement(statement: DoWhileStatement): void;
  preWalkForStatement(statement: ForStatement): void;
  walkForStatement(statement: ForStatement): void;
  preWalkForInStatement(statement: ForInStatement): void;
  walkForInStatement(statement: ForInStatement): void;
  preWalkForOfStatement(statement?: any): void;
  walkForOfStatement(statement: ForOfStatement): void;
  preWalkFunctionDeclaration(statement: FunctionDeclaration): void;
  walkFunctionDeclaration(statement: FunctionDeclaration): void;
  blockPreWalkExpressionStatement(statement: ExpressionStatement): void;
  preWalkAssignmentExpression(expression: AssignmentExpression): void;
  blockPreWalkImportDeclaration(statement?: any): void;
  enterDeclaration(declaration?: any, onIdent?: any): void;
  blockPreWalkExportNamedDeclaration(statement?: any): void;
  walkExportNamedDeclaration(statement: ExportNamedDeclaration): void;
  blockPreWalkExportDefaultDeclaration(statement?: any): void;
  walkExportDefaultDeclaration(statement?: any): void;
  blockPreWalkExportAllDeclaration(statement?: any): void;
  preWalkVariableDeclaration(statement: VariableDeclaration): void;
  blockPreWalkVariableDeclaration(statement: VariableDeclaration): void;
  preWalkVariableDeclarator(declarator: VariableDeclarator): void;
  walkVariableDeclaration(statement: VariableDeclaration): void;
  blockPreWalkClassDeclaration(statement: ClassDeclaration): void;
  walkClassDeclaration(statement: ClassDeclaration): void;
  preWalkSwitchCases(switchCases: SwitchCase[]): void;
  walkSwitchCases(switchCases: SwitchCase[]): void;
  preWalkCatchClause(catchClause: CatchClause): void;
  walkCatchClause(catchClause: CatchClause): void;
  walkPattern(pattern: Pattern): void;
  walkAssignmentPattern(pattern: AssignmentPattern): void;
  walkObjectPattern(pattern?: any): void;
  walkArrayPattern(pattern: ArrayPattern): void;
  walkRestElement(pattern: RestElement): void;
  walkExpressions(
    expressions: (
      | null
      | UnaryExpression
      | ArrayExpression
      | ArrowFunctionExpression
      | AssignmentExpression
      | AwaitExpression
      | BinaryExpression
      | SimpleCallExpression
      | NewExpression
      | ChainExpression
      | ClassExpression
      | ConditionalExpression
      | FunctionExpression
      | Identifier
      | ImportExpression
      | SimpleLiteral
      | RegExpLiteral
      | BigIntLiteral
      | LogicalExpression
      | MemberExpression
      | MetaProperty
      | ObjectExpression
      | SequenceExpression
      | TaggedTemplateExpression
      | TemplateLiteral
      | ThisExpression
      | UpdateExpression
      | YieldExpression
      | SpreadElement
    )[],
  ): void;
  walkExpression(expression?: any): void;
  walkAwaitExpression(expression: AwaitExpression): void;
  walkArrayExpression(expression: ArrayExpression): void;
  walkSpreadElement(expression: SpreadElement): void;
  walkObjectExpression(expression: ObjectExpression): void;
  walkProperty(prop: SpreadElement | Property): void;
  walkFunctionExpression(expression: FunctionExpression): void;
  walkArrowFunctionExpression(expression: ArrowFunctionExpression): void;
  walkSequenceExpression(expression: SequenceExpression): void;
  walkUpdateExpression(expression: UpdateExpression): void;
  walkUnaryExpression(expression: UnaryExpression): void;
  walkLeftRightExpression(
    expression: BinaryExpression | LogicalExpression,
  ): void;
  walkBinaryExpression(expression: BinaryExpression): void;
  walkLogicalExpression(expression: LogicalExpression): void;
  walkAssignmentExpression(expression: AssignmentExpression): void;
  walkConditionalExpression(expression: ConditionalExpression): void;
  walkNewExpression(expression: NewExpression): void;
  walkYieldExpression(expression: YieldExpression): void;
  walkTemplateLiteral(expression: TemplateLiteral): void;
  walkTaggedTemplateExpression(expression: TaggedTemplateExpression): void;
  walkClassExpression(expression: ClassExpression): void;
  walkChainExpression(expression: ChainExpression): void;
  walkImportExpression(expression: ImportExpression): void;
  walkCallExpression(expression?: any): void;
  walkMemberExpression(expression: MemberExpression): void;
  walkMemberExpressionWithExpressionName(
    expression?: any,
    name?: any,
    rootInfo?: any,
    members?: any,
    onUnhandled?: any,
  ): void;
  walkThisExpression(expression: ThisExpression): void;
  walkIdentifier(expression: Identifier): void;
  walkMetaProperty(metaProperty: MetaProperty): void;
  callHooksForExpression(hookMap: any, expr: any, ...args: any[]): any;
  callHooksForExpressionWithFallback<T, R>(
    hookMap: HookMap<SyncBailHook<T, R>>,
    expr: MemberExpression,
    fallback:
      | undefined
      | ((
          arg0: string,
          arg1: string | ScopeInfo | VariableInfo,
          arg2: () => string[],
        ) => any),
    defined: undefined | ((arg0: string) => any),
    ...args: AsArray<T>
  ): undefined | R;
  callHooksForName<T, R>(
    hookMap: HookMap<SyncBailHook<T, R>>,
    name: string,
    ...args: AsArray<T>
  ): undefined | R;
  callHooksForInfo<T, R>(
    hookMap: HookMap<SyncBailHook<T, R>>,
    info: ExportedVariableInfo,
    ...args: AsArray<T>
  ): undefined | R;
  callHooksForInfoWithFallback<T, R>(
    hookMap: HookMap<SyncBailHook<T, R>>,
    info: ExportedVariableInfo,
    fallback: undefined | ((arg0: string) => any),
    defined: undefined | (() => any),
    ...args: AsArray<T>
  ): undefined | R;
  callHooksForNameWithFallback<T, R>(
    hookMap: HookMap<SyncBailHook<T, R>>,
    name: string,
    fallback: undefined | ((arg0: string) => any),
    defined: undefined | (() => any),
    ...args: AsArray<T>
  ): undefined | R;
  inScope(params: any, fn: () => void): void;
  inClassScope(hasThis: boolean, params: any, fn: () => void): void;
  inFunctionScope(hasThis: boolean, params: any, fn: () => void): void;
  inBlockScope(fn: () => void): void;
  detectMode(
    statements: (
      | FunctionDeclaration
      | VariableDeclaration
      | ClassDeclaration
      | ExpressionStatement
      | BlockStatement
      | StaticBlock
      | EmptyStatement
      | DebuggerStatement
      | WithStatement
      | ReturnStatement
      | LabeledStatement
      | BreakStatement
      | ContinueStatement
      | IfStatement
      | SwitchStatement
      | ThrowStatement
      | TryStatement
      | WhileStatement
      | DoWhileStatement
      | ForStatement
      | ForInStatement
      | ForOfStatement
      | ImportDeclaration
      | ExportNamedDeclaration
      | ExportDefaultDeclaration
      | ExportAllDeclaration
      | Directive
    )[],
  ): void;
  enterPatterns(patterns?: any, onIdent?: any): void;
  enterPattern(pattern?: any, onIdent?: any): void;
  enterIdentifier(pattern: Identifier, onIdent?: any): void;
  enterObjectPattern(pattern: ObjectPattern, onIdent?: any): void;
  enterArrayPattern(pattern: ArrayPattern, onIdent?: any): void;
  enterRestElement(pattern: RestElement, onIdent?: any): void;
  enterAssignmentPattern(pattern: AssignmentPattern, onIdent?: any): void;
  evaluateExpression(expression?: any): BasicEvaluatedExpression;
  parseString(expression: Expression): string;
  parseCalculatedString(expression?: any): any;
  evaluate(source: string): BasicEvaluatedExpression;
  isPure(
    expr:
      | undefined
      | null
      | UnaryExpression
      | ArrayExpression
      | ArrowFunctionExpression
      | AssignmentExpression
      | AwaitExpression
      | BinaryExpression
      | SimpleCallExpression
      | NewExpression
      | ChainExpression
      | ClassExpression
      | ConditionalExpression
      | FunctionExpression
      | Identifier
      | ImportExpression
      | SimpleLiteral
      | RegExpLiteral
      | BigIntLiteral
      | LogicalExpression
      | MemberExpression
      | MetaProperty
      | ObjectExpression
      | SequenceExpression
      | TaggedTemplateExpression
      | TemplateLiteral
      | ThisExpression
      | UpdateExpression
      | YieldExpression
      | FunctionDeclaration
      | VariableDeclaration
      | ClassDeclaration
      | PrivateIdentifier,
    commentsStartPos: number,
  ): boolean;
  getComments(range: [number, number]): any[];
  isAsiPosition(pos: number): boolean;
  unsetAsiPosition(pos: number): void;
  isStatementLevelExpression(expr: Expression): boolean;
  getTagData(name?: any, tag?: any): any;
  tagVariable(name?: any, tag?: any, data?: any): void;
  defineVariable(name: string): void;
  undefineVariable(name: string): void;
  isVariableDefined(name: string): boolean;
  getVariableInfo(name: string): ExportedVariableInfo;
  setVariable(name: string, variableInfo: ExportedVariableInfo): void;
  evaluatedVariable(tagInfo: TagInfo): VariableInfo;
  parseCommentOptions(range: [number, number]): any;
  extractMemberExpressionChain(expression: MemberExpression): {
    members: string[];
    object:
      | UnaryExpression
      | ArrayExpression
      | ArrowFunctionExpression
      | AssignmentExpression
      | AwaitExpression
      | BinaryExpression
      | SimpleCallExpression
      | NewExpression
      | ChainExpression
      | ClassExpression
      | ConditionalExpression
      | FunctionExpression
      | Identifier
      | ImportExpression
      | SimpleLiteral
      | RegExpLiteral
      | BigIntLiteral
      | LogicalExpression
      | MemberExpression
      | MetaProperty
      | ObjectExpression
      | SequenceExpression
      | TaggedTemplateExpression
      | TemplateLiteral
      | ThisExpression
      | UpdateExpression
      | YieldExpression
      | Super;
    membersOptionals: boolean[];
    memberRanges: [number, number][];
  };
  getFreeInfoFromVariable(
    varName: string,
  ): undefined | { name: string; info: string | VariableInfo };
  getMemberExpressionInfo(
    expression: MemberExpression,
    allowedTypes: number,
  ): undefined | CallExpressionInfo | ExpressionExpressionInfo;
  getNameForExpression(expression: MemberExpression):
    | undefined
    | {
        name: string;
        rootInfo: ExportedVariableInfo;
        getMembers: () => string[];
      };
  static ALLOWED_MEMBER_TYPES_ALL: 3;
  static ALLOWED_MEMBER_TYPES_EXPRESSION: 2;
  static ALLOWED_MEMBER_TYPES_CALL_EXPRESSION: 1;
}

/**
 * Parser options for javascript modules.
 */
declare interface JavascriptParserOptions {
  [index: string]: any;

  /**
   * Set the value of `require.amd` and `define.amd`. Or disable AMD support.
   */
  amd?: false | { [index: string]: any };

  /**
   * Enable/disable special handling for browserify bundles.
   */
  browserify?: boolean;

  /**
   * Enable/disable parsing of CommonJs syntax.
   */
  commonjs?: boolean;

  /**
   * Enable/disable parsing of magic comments in CommonJs syntax.
   */
  commonjsMagicComments?: boolean;

  /**
   * Enable/disable parsing "import { createRequire } from "module"" and evaluating createRequire().
   */
  createRequire?: string | boolean;

  /**
   * Specifies global fetchPriority for dynamic import.
   */
  dynamicImportFetchPriority?: false | 'auto' | 'low' | 'high';

  /**
   * Specifies global mode for dynamic import.
   */
  dynamicImportMode?: 'weak' | 'eager' | 'lazy' | 'lazy-once';

  /**
   * Specifies global prefetch for dynamic import.
   */
  dynamicImportPrefetch?: number | boolean;

  /**
   * Specifies global preload for dynamic import.
   */
  dynamicImportPreload?: number | boolean;

  /**
   * Specifies the behavior of invalid export names in "import ... from ..." and "export ... from ...".
   */
  exportsPresence?: false | 'auto' | 'error' | 'warn';

  /**
   * Enable warnings for full dynamic dependencies.
   */
  exprContextCritical?: boolean;

  /**
   * Enable recursive directory lookup for full dynamic dependencies.
   */
  exprContextRecursive?: boolean;

  /**
   * Sets the default regular expression for full dynamic dependencies.
   */
  exprContextRegExp?: boolean | RegExp;

  /**
   * Set the default request for full dynamic dependencies.
   */
  exprContextRequest?: string;

  /**
   * Enable/disable parsing of EcmaScript Modules syntax.
   */
  harmony?: boolean;

  /**
   * Enable/disable parsing of import() syntax.
   */
  import?: boolean;

  /**
   * Specifies the behavior of invalid export names in "import ... from ...".
   */
  importExportsPresence?: false | 'auto' | 'error' | 'warn';

  /**
   * Enable/disable evaluating import.meta.
   */
  importMeta?: boolean;

  /**
   * Enable/disable evaluating import.meta.webpackContext.
   */
  importMetaContext?: boolean;

  /**
   * Include polyfills or mocks for various node stuff.
   */
  node?: false | NodeOptions;

  /**
   * Specifies the behavior of invalid export names in "export ... from ...". This might be useful to disable during the migration from "export ... from ..." to "export type ... from ..." when reexporting types in TypeScript.
   */
  reexportExportsPresence?: false | 'auto' | 'error' | 'warn';

  /**
   * Enable/disable parsing of require.context syntax.
   */
  requireContext?: boolean;

  /**
   * Enable/disable parsing of require.ensure syntax.
   */
  requireEnsure?: boolean;

  /**
   * Enable/disable parsing of require.include syntax.
   */
  requireInclude?: boolean;

  /**
   * Enable/disable parsing of require.js special syntax like require.config, requirejs.config, require.version and requirejs.onError.
   */
  requireJs?: boolean;

  /**
   * Deprecated in favor of "exportsPresence". Emit errors instead of warnings when imported names don't exist in imported module.
   */
  strictExportPresence?: boolean;

  /**
   * Handle the this context correctly according to the spec for namespace objects.
   */
  strictThisContextOnImports?: boolean;

  /**
   * Enable/disable parsing of System.js special syntax like System.import, System.get, System.set and System.register.
   */
  system?: boolean;

  /**
   * Enable warnings when using the require function in a not statically analyse-able way.
   */
  unknownContextCritical?: boolean;

  /**
   * Enable recursive directory lookup when using the require function in a not statically analyse-able way.
   */
  unknownContextRecursive?: boolean;

  /**
   * Sets the regular expression when using the require function in a not statically analyse-able way.
   */
  unknownContextRegExp?: boolean | RegExp;

  /**
   * Sets the request when using the require function in a not statically analyse-able way.
   */
  unknownContextRequest?: string;

  /**
   * Enable/disable parsing of new URL() syntax.
   */
  url?: boolean | 'relative';

  /**
   * Disable or configure parsing of WebWorker syntax like new Worker() or navigator.serviceWorker.register().
   */
  worker?: boolean | string[];

  /**
   * Enable warnings for partial dynamic dependencies.
   */
  wrappedContextCritical?: boolean;

  /**
   * Enable recursive directory lookup for partial dynamic dependencies.
   */
  wrappedContextRecursive?: boolean;

  /**
   * Set the inner regular expression for partial dynamic dependencies.
   */
  wrappedContextRegExp?: RegExp;
}
type JsonObject = { [index: string]: JsonValue } & {
  [index: string]:
    | undefined
    | null
    | string
    | number
    | boolean
    | JsonObject
    | JsonValue[];
};
type JsonValue = null | string | number | boolean | JsonObject | JsonValue[];
declare class JsonpChunkLoadingRuntimeModule extends RuntimeModule {
  constructor(runtimeRequirements: Set<string>);
  static getCompilationHooks(
    compilation: Compilation,
  ): JsonpCompilationPluginHooks;

  /**
   * Runtime modules without any dependencies to other runtime modules
   */
  static STAGE_NORMAL: number;

  /**
   * Runtime modules with simple dependencies on other runtime modules
   */
  static STAGE_BASIC: number;

  /**
   * Runtime modules which attach to handlers of other runtime modules
   */
  static STAGE_ATTACH: number;

  /**
   * Runtime modules which trigger actions on bootstrap
   */
  static STAGE_TRIGGER: number;
}
declare interface JsonpCompilationPluginHooks {
  linkPreload: SyncWaterfallHook<[string, Chunk]>;
  linkPrefetch: SyncWaterfallHook<[string, Chunk]>;
}
declare class JsonpTemplatePlugin {
  constructor();

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  static getCompilationHooks(
    compilation: Compilation,
  ): JsonpCompilationPluginHooks;
}
declare interface KnownAssetInfo {
  /**
   * true, if the asset can be long term cached forever (contains a hash)
   */
  immutable?: boolean;

  /**
   * whether the asset is minimized
   */
  minimized?: boolean;

  /**
   * the value(s) of the full hash used for this asset
   */
  fullhash?: string | string[];

  /**
   * the value(s) of the chunk hash used for this asset
   */
  chunkhash?: string | string[];

  /**
   * the value(s) of the module hash used for this asset
   */
  modulehash?: string | string[];

  /**
   * the value(s) of the content hash used for this asset
   */
  contenthash?: string | string[];

  /**
   * when asset was created from a source file (potentially transformed), the original filename relative to compilation context
   */
  sourceFilename?: string;

  /**
   * size in bytes, only set after asset has been emitted
   */
  size?: number;

  /**
   * true, when asset is only used for development and doesn't count towards user-facing assets
   */
  development?: boolean;

  /**
   * true, when asset ships data for updating an existing application (HMR)
   */
  hotModuleReplacement?: boolean;

  /**
   * true, when asset is javascript and an ESM
   */
  javascriptModule?: boolean;

  /**
   * object of pointers to other assets, keyed by type of relation (only points from parent to child)
   */
  related?: Record<string, string | string[]>;
}
declare interface KnownBuildMeta {
  moduleArgument?: string;
  exportsArgument?: string;
  strict?: boolean;
  moduleConcatenationBailout?: string;
  exportsType?: 'namespace' | 'dynamic' | 'default' | 'flagged';
  defaultObject?: false | 'redirect' | 'redirect-warn';
  strictHarmonyModule?: boolean;
  async?: boolean;
  sideEffectFree?: boolean;
}
declare interface KnownCreateStatsOptionsContext {
  forToString?: boolean;
}
declare interface KnownHooks {
  resolveStep: SyncHook<
    [
      AsyncSeriesBailHook<
        [ResolveRequest, ResolveContext],
        null | ResolveRequest
      >,
      ResolveRequest,
    ]
  >;
  noResolve: SyncHook<[ResolveRequest, Error]>;
  resolve: AsyncSeriesBailHook<
    [ResolveRequest, ResolveContext],
    null | ResolveRequest
  >;
  result: AsyncSeriesHook<[ResolveRequest, ResolveContext]>;
}
declare interface KnownNormalizedStatsOptions {
  context: string;
  requestShortener: RequestShortener;
  chunksSort: string;
  modulesSort: string;
  chunkModulesSort: string;
  nestedModulesSort: string;
  assetsSort: string;
  ids: boolean;
  cachedAssets: boolean;
  groupAssetsByEmitStatus: boolean;
  groupAssetsByPath: boolean;
  groupAssetsByExtension: boolean;
  assetsSpace: number;
  excludeAssets: ((value: string, asset: StatsAsset) => boolean)[];
  excludeModules: ((
    name: string,
    module: StatsModule,
    type: 'module' | 'chunk' | 'root-of-chunk' | 'nested',
  ) => boolean)[];
  warningsFilter: ((warning: StatsError, textValue: string) => boolean)[];
  cachedModules: boolean;
  orphanModules: boolean;
  dependentModules: boolean;
  runtimeModules: boolean;
  groupModulesByCacheStatus: boolean;
  groupModulesByLayer: boolean;
  groupModulesByAttributes: boolean;
  groupModulesByPath: boolean;
  groupModulesByExtension: boolean;
  groupModulesByType: boolean;
  entrypoints: boolean | 'auto';
  chunkGroups: boolean;
  chunkGroupAuxiliary: boolean;
  chunkGroupChildren: boolean;
  chunkGroupMaxAssets: number;
  modulesSpace: number;
  chunkModulesSpace: number;
  nestedModulesSpace: number;
  logging: false | 'none' | 'error' | 'warn' | 'info' | 'log' | 'verbose';
  loggingDebug: ((value: string) => boolean)[];
  loggingTrace: boolean;
}
declare interface KnownStatsAsset {
  type: string;
  name: string;
  info: AssetInfo;
  size: number;
  emitted: boolean;
  comparedForEmit: boolean;
  cached: boolean;
  related?: StatsAsset[];
  chunkNames?: (string | number)[];
  chunkIdHints?: (string | number)[];
  chunks?: (string | number)[];
  auxiliaryChunkNames?: (string | number)[];
  auxiliaryChunks?: (string | number)[];
  auxiliaryChunkIdHints?: (string | number)[];
  filteredRelated?: number;
  isOverSizeLimit?: boolean;
}
declare interface KnownStatsChunk {
  rendered: boolean;
  initial: boolean;
  entry: boolean;
  recorded: boolean;
  reason?: string;
  size: number;
  sizes?: Record<string, number>;
  names?: string[];
  idHints?: string[];
  runtime?: string[];
  files?: string[];
  auxiliaryFiles?: string[];
  hash: string;
  childrenByOrder?: Record<string, (string | number)[]>;
  id?: string | number;
  siblings?: (string | number)[];
  parents?: (string | number)[];
  children?: (string | number)[];
  modules?: StatsModule[];
  filteredModules?: number;
  origins?: StatsChunkOrigin[];
}
declare interface KnownStatsChunkGroup {
  name?: string;
  chunks?: (string | number)[];
  assets?: { name: string; size?: number }[];
  filteredAssets?: number;
  assetsSize?: number;
  auxiliaryAssets?: { name: string; size?: number }[];
  filteredAuxiliaryAssets?: number;
  auxiliaryAssetsSize?: number;
  children?: { [index: string]: StatsChunkGroup[] };
  childAssets?: { [index: string]: string[] };
  isOverSizeLimit?: boolean;
}
declare interface KnownStatsChunkOrigin {
  module?: string;
  moduleIdentifier?: string;
  moduleName?: string;
  loc?: string;
  request?: string;
  moduleId?: string | number;
}
declare interface KnownStatsCompilation {
  env?: any;
  name?: string;
  hash?: string;
  version?: string;
  time?: number;
  builtAt?: number;
  needAdditionalPass?: boolean;
  publicPath?: string;
  outputPath?: string;
  assetsByChunkName?: Record<string, string[]>;
  assets?: StatsAsset[];
  filteredAssets?: number;
  chunks?: StatsChunk[];
  modules?: StatsModule[];
  filteredModules?: number;
  entrypoints?: Record<string, StatsChunkGroup>;
  namedChunkGroups?: Record<string, StatsChunkGroup>;
  errors?: StatsError[];
  errorsCount?: number;
  warnings?: StatsError[];
  warningsCount?: number;
  children?: StatsCompilation[];
  logging?: Record<string, StatsLogging>;
}
declare interface KnownStatsError {
  message: string;
  chunkName?: string;
  chunkEntry?: boolean;
  chunkInitial?: boolean;
  file?: string;
  moduleIdentifier?: string;
  moduleName?: string;
  loc?: string;
  chunkId?: string | number;
  moduleId?: string | number;
  moduleTrace?: StatsModuleTraceItem[];
  details?: any;
  stack?: string;
}
declare interface KnownStatsFactoryContext {
  type: string;
  makePathsRelative?: (arg0: string) => string;
  compilation?: Compilation;
  rootModules?: Set<Module>;
  compilationFileToChunks?: Map<string, Chunk[]>;
  compilationAuxiliaryFileToChunks?: Map<string, Chunk[]>;
  runtime?: RuntimeSpec;
  cachedGetErrors?: (arg0: Compilation) => WebpackError[];
  cachedGetWarnings?: (arg0: Compilation) => WebpackError[];
}
declare interface KnownStatsLogging {
  entries: StatsLoggingEntry[];
  filteredEntries: number;
  debug: boolean;
}
declare interface KnownStatsLoggingEntry {
  type: string;
  message: string;
  trace?: string[];
  children?: StatsLoggingEntry[];
  args?: any[];
  time?: number;
}
declare interface KnownStatsModule {
  type?: string;
  moduleType?: string;
  layer?: string;
  identifier?: string;
  name?: string;
  nameForCondition?: string;
  index?: number;
  preOrderIndex?: number;
  index2?: number;
  postOrderIndex?: number;
  size?: number;
  sizes?: { [index: string]: number };
  cacheable?: boolean;
  built?: boolean;
  codeGenerated?: boolean;
  buildTimeExecuted?: boolean;
  cached?: boolean;
  optional?: boolean;
  orphan?: boolean;
  id?: string | number;
  issuerId?: string | number;
  chunks?: (string | number)[];
  assets?: (string | number)[];
  dependent?: boolean;
  issuer?: string;
  issuerName?: string;
  issuerPath?: StatsModuleIssuer[];
  failed?: boolean;
  errors?: number;
  warnings?: number;
  profile?: StatsProfile;
  reasons?: StatsModuleReason[];
  usedExports?: boolean | string[];
  providedExports?: string[];
  optimizationBailout?: string[];
  depth?: number;
  modules?: StatsModule[];
  filteredModules?: number;
  source?: string | Buffer;
}
declare interface KnownStatsModuleIssuer {
  identifier?: string;
  name?: string;
  id?: string | number;
  profile?: StatsProfile;
}
declare interface KnownStatsModuleReason {
  moduleIdentifier?: string;
  module?: string;
  moduleName?: string;
  resolvedModuleIdentifier?: string;
  resolvedModule?: string;
  type?: string;
  active: boolean;
  explanation?: string;
  userRequest?: string;
  loc?: string;
  moduleId?: string | number;
  resolvedModuleId?: string | number;
}
declare interface KnownStatsModuleTraceDependency {
  loc?: string;
}
declare interface KnownStatsModuleTraceItem {
  originIdentifier?: string;
  originName?: string;
  moduleIdentifier?: string;
  moduleName?: string;
  dependencies?: StatsModuleTraceDependency[];
  originId?: string | number;
  moduleId?: string | number;
}
declare interface KnownStatsPrinterContext {
  type?: string;
  compilation?: StatsCompilation;
  chunkGroup?: StatsChunkGroup;
  asset?: StatsAsset;
  module?: StatsModule;
  chunk?: StatsChunk;
  moduleReason?: StatsModuleReason;
  bold?: (str: string) => string;
  yellow?: (str: string) => string;
  red?: (str: string) => string;
  green?: (str: string) => string;
  magenta?: (str: string) => string;
  cyan?: (str: string) => string;
  formatFilename?: (file: string, oversize?: boolean) => string;
  formatModuleId?: (id: string) => string;
  formatChunkId?: (
    id: string,
    direction?: 'parent' | 'child' | 'sibling',
  ) => string;
  formatSize?: (size: number) => string;
  formatDateTime?: (dateTime: number) => string;
  formatFlag?: (flag: string) => string;
  formatTime?: (time: number, boldQuantity?: boolean) => string;
  chunkGroupKind?: string;
}
declare interface KnownStatsProfile {
  total: number;
  resolving: number;
  restoring: number;
  building: number;
  integration: number;
  storing: number;
  additionalResolving: number;
  additionalIntegration: number;
  factory: number;
  dependencies: number;
}

/**
 * Options for the default backend.
 */
declare interface LazyCompilationDefaultBackendOptions {
  /**
   * A custom client.
   */
  client?: string;

  /**
   * Specifies where to listen to from the server.
   */
  listen?: number | ListenOptions | ((server: typeof Server) => void);

  /**
   * Specifies the protocol the client should use to connect to the server.
   */
  protocol?: 'http' | 'https';

  /**
   * Specifies how to create the server handling the EventSource requests.
   */
  server?:
    | ServerOptionsImport<typeof IncomingMessage>
    | ServerOptionsHttps<typeof IncomingMessage, typeof ServerResponse>
    | (() => typeof Server);
}

/**
 * Options for compiling entrypoints and import()s only when they are accessed.
 */
declare interface LazyCompilationOptions {
  /**
   * Specifies the backend that should be used for handling client keep alive.
   */
  backend?:
    | ((
        compiler: Compiler,
        callback: (err?: Error, api?: BackendApi) => void,
      ) => void)
    | ((compiler: Compiler) => Promise<BackendApi>)
    | LazyCompilationDefaultBackendOptions;

  /**
   * Enable/disable lazy compilation for entries.
   */
  entries?: boolean;

  /**
   * Enable/disable lazy compilation for import() modules.
   */
  imports?: boolean;

  /**
   * Specify which entrypoints or import()ed modules should be lazily compiled. This is matched with the imported module and not the entrypoint name.
   */
  test?: string | RegExp | ((module: Module) => boolean);
}
declare class LazySet<T> {
  constructor(iterable?: Iterable<T>);
  get size(): number;
  add(item: T): LazySet<T>;
  addAll(iterable: LazySet<T> | Iterable<T>): LazySet<T>;
  clear(): void;
  delete(value: T): boolean;
  entries(): IterableIterator<[T, T]>;
  forEach(
    callbackFn: (arg0: T, arg1: T, arg2: Set<T>) => void,
    thisArg?: any,
  ): void;
  has(item: T): boolean;
  keys(): IterableIterator<T>;
  values(): IterableIterator<T>;
  serialize(__0: ObjectSerializerContext): void;
  [Symbol.iterator](): IterableIterator<T>;
  static deserialize<T>(__0: ObjectDeserializerContext): LazySet<T>;
}
declare interface LibIdentOptions {
  /**
   * absolute context path to which lib ident is relative to
   */
  context: string;

  /**
   * object for caching
   */
  associatedObjectForCache?: Object;
}
declare class LibManifestPlugin {
  constructor(options: LibManifestPluginOptions);
  options: LibManifestPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface LibManifestPluginOptions {
  /**
   * Context of requests in the manifest file (defaults to the webpack context).
   */
  context?: string;

  /**
   * If true, only entry points will be exposed (default: true).
   */
  entryOnly?: boolean;

  /**
   * If true, manifest json file (output) will be formatted.
   */
  format?: boolean;

  /**
   * Name of the exposed dll function (external name, use value of 'output.library').
   */
  name?: string;

  /**
   * Absolute path to the manifest json file (output).
   */
  path: string;

  /**
   * Type of the dll bundle (external type, use value of 'output.libraryTarget').
   */
  type?: string;
}
declare interface LibraryContext<T> {
  compilation: Compilation;
  chunkGraph: ChunkGraph;
  options: T;
}

/**
 * Set explicit comments for `commonjs`, `commonjs2`, `amd`, and `root`.
 */
declare interface LibraryCustomUmdCommentObject {
  /**
   * Set comment for `amd` section in UMD.
   */
  amd?: string;

  /**
   * Set comment for `commonjs` (exports) section in UMD.
   */
  commonjs?: string;

  /**
   * Set comment for `commonjs2` (module.exports) section in UMD.
   */
  commonjs2?: string;

  /**
   * Set comment for `root` (global variable) section in UMD.
   */
  root?: string;
}

/**
 * Description object for all UMD variants of the library name.
 */
declare interface LibraryCustomUmdObject {
  /**
   * Name of the exposed AMD library in the UMD.
   */
  amd?: string;

  /**
   * Name of the exposed commonjs export in the UMD.
   */
  commonjs?: string;

  /**
   * Name of the property exposed globally by a UMD library.
   */
  root?: string | string[];
}
type LibraryExport = string | string[];
type LibraryName = string | string[] | LibraryCustomUmdObject;

/**
 * Options for library.
 */
declare interface LibraryOptions {
  /**
   * Add a container for define/require functions in the AMD module.
   */
  amdContainer?: string;

  /**
   * Add a comment in the UMD wrapper.
   */
  auxiliaryComment?: string | LibraryCustomUmdCommentObject;

  /**
   * Specify which export should be exposed as library.
   */
  export?: string | string[];

  /**
   * The name of the library (some types allow unnamed libraries too).
   */
  name?: string | string[] | LibraryCustomUmdObject;

  /**
   * Type of library (types included by default are 'var', 'module', 'assign', 'assign-properties', 'this', 'window', 'self', 'global', 'commonjs', 'commonjs2', 'commonjs-module', 'commonjs-static', 'amd', 'amd-require', 'umd', 'umd2', 'jsonp', 'system', but others might be added by plugins).
   */
  type: string;

  /**
   * If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.
   */
  umdNamedDefine?: boolean;
}
declare class LibraryTemplatePlugin {
  constructor(
    name: LibraryName,
    target: string,
    umdNamedDefine: boolean,
    auxiliaryComment: AuxiliaryComment,
    exportProperty: LibraryExport,
  );
  library: {
    type: string;
    name: LibraryName;
    umdNamedDefine: boolean;
    auxiliaryComment: AuxiliaryComment;
    export: LibraryExport;
  };

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare class LimitChunkCountPlugin {
  constructor(options?: LimitChunkCountPluginOptions);
  options?: LimitChunkCountPluginOptions;
  apply(compiler: Compiler): void;
}
declare interface LimitChunkCountPluginOptions {
  /**
   * Constant overhead for a chunk.
   */
  chunkOverhead?: number;

  /**
   * Multiplicator for initial chunks.
   */
  entryChunkMultiplicator?: number;

  /**
   * Limit the maximum number of chunks using a value greater greater than or equal to 1.
   */
  maxChunks: number;
}
declare interface LoadScriptCompilationHooks {
  createScript: SyncWaterfallHook<[string, Chunk]>;
}
declare class LoadScriptRuntimeModule extends HelperRuntimeModule {
  constructor(withCreateScriptUrl?: boolean, withFetchPriority?: boolean);
  static getCompilationHooks(
    compilation: Compilation,
  ): LoadScriptCompilationHooks;

  /**
   * Runtime modules without any dependencies to other runtime modules
   */
  static STAGE_NORMAL: number;

  /**
   * Runtime modules with simple dependencies on other runtime modules
   */
  static STAGE_BASIC: number;

  /**
   * Runtime modules which attach to handlers of other runtime modules
   */
  static STAGE_ATTACH: number;

  /**
   * Runtime modules which trigger actions on bootstrap
   */
  static STAGE_TRIGGER: number;
}

/**
 * Custom values available in the loader context.
 */
declare interface Loader {
  [index: string]: any;
}
type LoaderContext<OptionsType> = NormalModuleLoaderContext<OptionsType> &
  LoaderRunnerLoaderContext<OptionsType> &
  LoaderPluginLoaderContext &
  HotModuleReplacementPluginLoaderContext;
type LoaderDefinition<
  OptionsType = {},
  ContextAdditions = {},
> = LoaderDefinitionFunction<OptionsType, ContextAdditions> & {
  raw?: false;
  pitch?: PitchLoaderDefinitionFunction<OptionsType, ContextAdditions>;
};
declare interface LoaderDefinitionFunction<
  OptionsType = {},
  ContextAdditions = {},
> {
  (
    this: NormalModuleLoaderContext<OptionsType> &
      LoaderRunnerLoaderContext<OptionsType> &
      LoaderPluginLoaderContext &
      HotModuleReplacementPluginLoaderContext &
      ContextAdditions,
    content: string,
    sourceMap?: string | SourceMap,
    additionalData?: AdditionalData,
  ): string | void | Buffer | Promise<string | Buffer>;
}
declare interface LoaderItem {
  loader: string;
  options: any;
  ident: null | string;
  type: null | string;
}
declare interface LoaderModule<OptionsType = {}, ContextAdditions = {}> {
  default?:
    | RawLoaderDefinitionFunction<OptionsType, ContextAdditions>
    | LoaderDefinitionFunction<OptionsType, ContextAdditions>;
  raw?: false;
  pitch?: PitchLoaderDefinitionFunction<OptionsType, ContextAdditions>;
}
declare class LoaderOptionsPlugin {
  constructor(options?: LoaderOptionsPluginOptions & MatchObject);
  options: LoaderOptionsPluginOptions & MatchObject;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface LoaderOptionsPluginOptions {
  [index: string]: any;

  /**
   * Whether loaders should be in debug mode or not. debug will be removed as of webpack 3.
   */
  debug?: boolean;

  /**
   * Where loaders can be switched to minimize mode.
   */
  minimize?: boolean;

  /**
   * A configuration object that can be used to configure older loaders.
   */
  options?: {
    [index: string]: any;
    /**
     * The context that can be used to configure older loaders.
     */
    context?: string;
  };
}

/**
 * These properties are added by the LoaderPlugin
 */
declare interface LoaderPluginLoaderContext {
  /**
   * Resolves the given request to a module, applies all configured loaders and calls
   * back with the generated source, the sourceMap and the module instance (usually an
   * instance of NormalModule). Use this function if you need to know the source code
   * of another module to generate the result.
   */
  loadModule(
    request: string,
    callback: (
      err: null | Error,
      source: string,
      sourceMap: any,
      module: NormalModule,
    ) => void,
  ): void;
  importModule(
    request: string,
    options: ImportModuleOptions,
    callback: (err?: null | Error, exports?: any) => any,
  ): void;
  importModule(request: string, options?: ImportModuleOptions): Promise<any>;
}

/**
 * The properties are added by https://github.com/webpack/loader-runner
 */
declare interface LoaderRunnerLoaderContext<OptionsType> {
  /**
   * Add a directory as dependency of the loader result.
   */
  addContextDependency(context: string): void;

  /**
   * Adds a file as dependency of the loader result in order to make them watchable.
   * For example, html-loader uses this technique as it finds src and src-set attributes.
   * Then, it sets the url's for those attributes as dependencies of the html file that is parsed.
   */
  addDependency(file: string): void;
  addMissingDependency(context: string): void;

  /**
   * Make this loader async.
   */
  async(): (
    err?: null | Error,
    content?: string | Buffer,
    sourceMap?: string | SourceMap,
    additionalData?: AdditionalData,
  ) => void;

  /**
   * Make this loader result cacheable. By default it's cacheable.
   * A cacheable loader must have a deterministic result, when inputs and dependencies haven't changed.
   * This means the loader shouldn't have other dependencies than specified with this.addDependency.
   * Most loaders are deterministic and cacheable.
   */
  cacheable(flag?: boolean): void;
  callback: (
    err?: null | Error,
    content?: string | Buffer,
    sourceMap?: string | SourceMap,
    additionalData?: AdditionalData,
  ) => void;

  /**
   * Remove all dependencies of the loader result. Even initial dependencies and these of other loaders.
   */
  clearDependencies(): void;

  /**
   * The directory of the module. Can be used as context for resolving other stuff.
   * eg '/workspaces/ts-loader/examples/vanilla/src'
   */
  context: string;
  readonly currentRequest: string;
  readonly data: any;

  /**
   * alias of addDependency
   * Adds a file as dependency of the loader result in order to make them watchable.
   * For example, html-loader uses this technique as it finds src and src-set attributes.
   * Then, it sets the url's for those attributes as dependencies of the html file that is parsed.
   */
  dependency(file: string): void;
  getContextDependencies(): string[];
  getDependencies(): string[];
  getMissingDependencies(): string[];

  /**
   * The index in the loaders array of the current loader.
   * In the example: in loader1: 0, in loader2: 1
   */
  loaderIndex: number;
  readonly previousRequest: string;
  readonly query: string | OptionsType;
  readonly remainingRequest: string;
  readonly request: string;

  /**
   * An array of all the loaders. It is writeable in the pitch phase.
   * loaders = [{request: string, path: string, query: string, module: function}]
   * In the example:
   * [
   *   { request: "/abc/loader1.js?xyz",
   *     path: "/abc/loader1.js",
   *     query: "?xyz",
   *     module: [Function]
   *   },
   *   { request: "/abc/node_modules/loader2/index.js",
   *     path: "/abc/node_modules/loader2/index.js",
   *     query: "",
   *     module: [Function]
   *   }
   * ]
   */
  loaders: {
    request: string;
    path: string;
    query: string;
    fragment: string;
    options?: string | object;
    ident: string;
    normal?: Function;
    pitch?: Function;
    raw?: boolean;
    data?: object;
    pitchExecuted: boolean;
    normalExecuted: boolean;
    type?: 'module' | 'commonjs';
  }[];

  /**
   * The resource path.
   * In the example: "/abc/resource.js"
   */
  resourcePath: string;

  /**
   * The resource query string.
   * Example: "?query"
   */
  resourceQuery: string;

  /**
   * The resource fragment.
   * Example: "#frag"
   */
  resourceFragment: string;

  /**
   * The resource inclusive query and fragment.
   * Example: "/abc/resource.js?query#frag"
   */
  resource: string;

  /**
   * Target of compilation.
   * Example: "web"
   */
  target: string;

  /**
   * Tell what kind of ES-features may be used in the generated runtime-code.
   * Example: { arrowFunction: true }
   */
  environment: Environment;
}
declare class LoaderTargetPlugin {
  constructor(target: string);
  target: string;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface LogEntry {
  type: string;
  args: any[];
  time: number;
  trace?: string[];
}
declare const MEASURE_END_OPERATION: unique symbol;
declare const MEASURE_START_OPERATION: unique symbol;
declare interface MatchObject {
  test?: string | RegExp | (string | RegExp)[];
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
}
type Matcher = string | RegExp | (string | RegExp)[];

/**
 * Options object for in-memory caching.
 */
declare interface MemoryCacheOptions {
  /**
   * Additionally cache computation of modules that are unchanged and reference only unchanged modules.
   */
  cacheUnaffected?: boolean;

  /**
   * Number of generations unused cache entries stay in memory cache at minimum (1 = may be removed after unused for a single compilation, ..., Infinity: kept forever).
   */
  maxGenerations?: number;

  /**
   * In memory caching.
   */
  type: 'memory';
}
declare class MemoryCachePlugin {
  constructor();

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare class MinChunkSizePlugin {
  constructor(options: MinChunkSizePluginOptions);
  options: MinChunkSizePluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface MinChunkSizePluginOptions {
  /**
   * Constant overhead for a chunk.
   */
  chunkOverhead?: number;

  /**
   * Multiplicator for initial chunks.
   */
  entryChunkMultiplicator?: number;

  /**
   * Minimum number of characters.
   */
  minChunkSize: number;
}

declare class ModuleConcatenationPlugin {
  constructor(options?: any);
  options: any;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare class ModuleDependency extends Dependency {
  constructor(request: string);
  request: string;
  userRequest: string;
  range: any;
  assertions?: Record<string, any>;
  static Template: typeof DependencyTemplate;
  static NO_EXPORTS_REFERENCED: string[][];
  static EXPORTS_OBJECT_REFERENCED: string[][];
  static TRANSITIVE: typeof TRANSITIVE;
}
declare abstract class ModuleFactory {
  create(
    data: ModuleFactoryCreateData,
    callback: (arg0?: null | Error, arg1?: ModuleFactoryResult) => void,
  ): void;
}
declare interface ModuleFactoryCreateData {
  contextInfo: ModuleFactoryCreateDataContextInfo;
  resolveOptions?: ResolveOptionsWebpackOptions;
  context: string;
  dependencies: Dependency[];
}
declare interface ModuleFactoryCreateDataContextInfo {
  issuer: string;
  issuerLayer?: null | string;
  compiler: string;
}
declare interface ModuleFactoryResult {
  /**
   * the created module or unset if no module was created
   */
  module?: Module;
  fileDependencies?: Set<string>;
  contextDependencies?: Set<string>;
  missingDependencies?: Set<string>;

  /**
   * allow to use the unsafe cache
   */
  cacheable?: boolean;
}
declare class ModuleFederationPlugin {
  constructor(options: ModuleFederationPluginOptions);

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface ModuleFederationPluginOptions {
  /**
   * Modules that should be exposed by this container. When provided, property name is used as public name, otherwise public name is automatically inferred from request.
   */
  exposes?: (string | ExposesObject)[] | ExposesObject;

  /**
   * The filename of the container as relative path inside the `output.path` directory.
   */
  filename?: string;

  /**
   * Options for library.
   */
  library?: LibraryOptions;

  /**
   * The name of the container.
   */
  name?: string;

  /**
   * The external type of the remote containers.
   */
  remoteType?:
    | 'import'
    | 'var'
    | 'module'
    | 'assign'
    | 'this'
    | 'window'
    | 'self'
    | 'global'
    | 'commonjs'
    | 'commonjs2'
    | 'commonjs-module'
    | 'commonjs-static'
    | 'amd'
    | 'amd-require'
    | 'umd'
    | 'umd2'
    | 'jsonp'
    | 'system'
    | 'promise'
    | 'script'
    | 'node-commonjs';

  /**
   * Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.
   */
  remotes?: (string | RemotesObject)[] | RemotesObject;

  /**
   * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
   */
  runtime?: string | false;

  /**
   * Share scope name used for all shared modules (defaults to 'default').
   */
  shareScope?: string;

  /**
   * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
   */
  shared?: (string | SharedObject)[] | SharedObject;
}
type ModuleFilterItemTypes =
  | string
  | RegExp
  | ((
      name: string,
      module: StatsModule,
      type: 'module' | 'chunk' | 'root-of-chunk' | 'nested',
    ) => boolean);
declare class ModuleGraph {
  constructor();
  setParents(
    dependency: Dependency,
    block: DependenciesBlock,
    module: Module,
    indexInBlock?: number,
  ): void;
  getParentModule(dependency: Dependency): Module;
  getParentBlock(dependency: Dependency): DependenciesBlock;
  getParentBlockIndex(dependency: Dependency): number;
  setResolvedModule(
    originModule: Module,
    dependency: Dependency,
    module: Module,
  ): void;
  updateModule(dependency: Dependency, module: Module): void;
  removeConnection(dependency: Dependency): void;
  addExplanation(dependency: Dependency, explanation: string): void;
  cloneModuleAttributes(sourceModule: Module, targetModule: Module): void;
  removeModuleAttributes(module: Module): void;
  removeAllModuleAttributes(): void;
  moveModuleConnections(
    oldModule: Module,
    newModule: Module,
    filterConnection: (arg0: ModuleGraphConnection) => boolean,
  ): void;
  copyOutgoingModuleConnections(
    oldModule: Module,
    newModule: Module,
    filterConnection: (arg0: ModuleGraphConnection) => boolean,
  ): void;
  addExtraReason(module: Module, explanation: string): void;
  getResolvedModule(dependency: Dependency): null | Module;
  getConnection(dependency: Dependency): undefined | ModuleGraphConnection;
  getModule(dependency: Dependency): null | Module;
  getOrigin(dependency: Dependency): null | Module;
  getResolvedOrigin(dependency: Dependency): null | Module;
  getIncomingConnections(module: Module): Iterable<ModuleGraphConnection>;
  getOutgoingConnections(module: Module): Iterable<ModuleGraphConnection>;
  getIncomingConnectionsByOriginModule(
    module: Module,
  ): Map<undefined | Module, ReadonlyArray<ModuleGraphConnection>>;
  getOutgoingConnectionsByModule(
    module: Module,
  ): undefined | Map<undefined | Module, ReadonlyArray<ModuleGraphConnection>>;
  getProfile(module: Module): null | ModuleProfile;
  setProfile(module: Module, profile: null | ModuleProfile): void;
  getIssuer(module: Module): null | Module;
  setIssuer(module: Module, issuer: null | Module): void;
  setIssuerIfUnset(module: Module, issuer: null | Module): void;
  getOptimizationBailout(
    module: Module,
  ): (string | ((requestShortener: RequestShortener) => string))[];
  getProvidedExports(module: Module): null | true | string[];
  isExportProvided(
    module: Module,
    exportName: string | string[],
  ): null | boolean;
  getExportsInfo(module: Module): ExportsInfo;
  getExportInfo(module: Module, exportName: string): ExportInfo;
  getReadOnlyExportInfo(module: Module, exportName: string): ExportInfo;
  getUsedExports(
    module: Module,
    runtime: RuntimeSpec,
  ): null | boolean | SortableSet<string>;
  getPreOrderIndex(module: Module): null | number;
  getPostOrderIndex(module: Module): null | number;
  setPreOrderIndex(module: Module, index: number): void;
  setPreOrderIndexIfUnset(module: Module, index: number): boolean;
  setPostOrderIndex(module: Module, index: number): void;
  setPostOrderIndexIfUnset(module: Module, index: number): boolean;
  getDepth(module: Module): null | number;
  setDepth(module: Module, depth: number): void;
  setDepthIfLower(module: Module, depth: number): boolean;
  isAsync(module: Module): boolean;
  setAsync(module: Module): void;
  getMeta(thing?: any): Object;
  getMetaIfExisting(thing?: any): undefined | Object;
  freeze(cacheStage?: string): void;
  unfreeze(): void;
  cached<T extends any[], V>(
    fn: (moduleGraph: ModuleGraph, ...args: T) => V,
    ...args: T
  ): V;
  setModuleMemCaches(
    moduleMemCaches: Map<Module, WeakTupleMap<any, any>>,
  ): void;
  dependencyCacheProvide(dependency: Dependency, ...args: any[]): any;
  static getModuleGraphForModule(
    module: Module,
    deprecateMessage: string,
    deprecationCode: string,
  ): ModuleGraph;
  static setModuleGraphForModule(
    module: Module,
    moduleGraph: ModuleGraph,
  ): void;
  static clearModuleGraphForModule(module: Module): void;
  static ModuleGraphConnection: typeof ModuleGraphConnection;
}
declare class ModuleGraphConnection {
  constructor(
    originModule: null | Module,
    dependency: null | Dependency,
    module: Module,
    explanation?: string,
    weak?: boolean,
    condition?:
      | false
      | ((arg0: ModuleGraphConnection, arg1: RuntimeSpec) => ConnectionState),
  );
  originModule: null | Module;
  resolvedOriginModule: null | Module;
  dependency: null | Dependency;
  resolvedModule: Module;
  module: Module;
  weak: boolean;
  conditional: boolean;
  condition?: (
    arg0: ModuleGraphConnection,
    arg1: RuntimeSpec,
  ) => ConnectionState;
  explanations?: Set<string>;
  clone(): ModuleGraphConnection;
  addCondition(
    condition: (
      arg0: ModuleGraphConnection,
      arg1: RuntimeSpec,
    ) => ConnectionState,
  ): void;
  addExplanation(explanation: string): void;
  get explanation(): string;
  active: void;
  isActive(runtime: RuntimeSpec): boolean;
  isTargetActive(runtime: RuntimeSpec): boolean;
  getActiveState(runtime: RuntimeSpec): ConnectionState;
  setActive(value: boolean): void;
  static addConnectionStates: (
    a: ConnectionState,
    b: ConnectionState,
  ) => ConnectionState;
  static TRANSITIVE_ONLY: typeof TRANSITIVE_ONLY;
  static CIRCULAR_CONNECTION: typeof CIRCULAR_CONNECTION;
}
type ModuleInfo = ConcatenatedModuleInfo | ExternalModuleInfo;

/**
 * Options affecting the normal modules (`NormalModuleFactory`).
 */
declare interface ModuleOptions {
  /**
   * An array of rules applied by default for modules.
   */
  defaultRules?: (undefined | null | false | '' | 0 | RuleSetRule | '...')[];

  /**
   * Enable warnings for full dynamic dependencies.
   */
  exprContextCritical?: boolean;

  /**
   * Enable recursive directory lookup for full dynamic dependencies. Deprecated: This option has moved to 'module.parser.javascript.exprContextRecursive'.
   */
  exprContextRecursive?: boolean;

  /**
   * Sets the default regular expression for full dynamic dependencies. Deprecated: This option has moved to 'module.parser.javascript.exprContextRegExp'.
   */
  exprContextRegExp?: boolean | RegExp;

  /**
   * Set the default request for full dynamic dependencies. Deprecated: This option has moved to 'module.parser.javascript.exprContextRequest'.
   */
  exprContextRequest?: string;

  /**
   * Specify options for each generator.
   */
  generator?: GeneratorOptionsByModuleType;

  /**
   * Don't parse files matching. It's matched against the full resolved request.
   */
  noParse?: string | Function | RegExp | (string | Function | RegExp)[];

  /**
   * Specify options for each parser.
   */
  parser?: ParserOptionsByModuleType;

  /**
   * An array of rules applied for modules.
   */
  rules?: (undefined | null | false | '' | 0 | RuleSetRule | '...')[];

  /**
   * Emit errors instead of warnings when imported names don't exist in imported module. Deprecated: This option has moved to 'module.parser.javascript.strictExportPresence'.
   */
  strictExportPresence?: boolean;

  /**
   * Handle the this context correctly according to the spec for namespace objects. Deprecated: This option has moved to 'module.parser.javascript.strictThisContextOnImports'.
   */
  strictThisContextOnImports?: boolean;

  /**
   * Enable warnings when using the require function in a not statically analyse-able way. Deprecated: This option has moved to 'module.parser.javascript.unknownContextCritical'.
   */
  unknownContextCritical?: boolean;

  /**
   * Enable recursive directory lookup when using the require function in a not statically analyse-able way. Deprecated: This option has moved to 'module.parser.javascript.unknownContextRecursive'.
   */
  unknownContextRecursive?: boolean;

  /**
   * Sets the regular expression when using the require function in a not statically analyse-able way. Deprecated: This option has moved to 'module.parser.javascript.unknownContextRegExp'.
   */
  unknownContextRegExp?: boolean | RegExp;

  /**
   * Sets the request when using the require function in a not statically analyse-able way. Deprecated: This option has moved to 'module.parser.javascript.unknownContextRequest'.
   */
  unknownContextRequest?: string;

  /**
   * Cache the resolving of module requests.
   */
  unsafeCache?: boolean | Function;

  /**
   * Enable warnings for partial dynamic dependencies. Deprecated: This option has moved to 'module.parser.javascript.wrappedContextCritical'.
   */
  wrappedContextCritical?: boolean;

  /**
   * Enable recursive directory lookup for partial dynamic dependencies. Deprecated: This option has moved to 'module.parser.javascript.wrappedContextRecursive'.
   */
  wrappedContextRecursive?: boolean;

  /**
   * Set the inner regular expression for partial dynamic dependencies. Deprecated: This option has moved to 'module.parser.javascript.wrappedContextRegExp'.
   */
  wrappedContextRegExp?: RegExp;
}

/**
 * Options affecting the normal modules (`NormalModuleFactory`).
 */
declare interface ModuleOptionsNormalized {
  /**
   * An array of rules applied by default for modules.
   */
  defaultRules: (undefined | null | false | '' | 0 | RuleSetRule | '...')[];

  /**
   * Specify options for each generator.
   */
  generator: GeneratorOptionsByModuleType;

  /**
   * Don't parse files matching. It's matched against the full resolved request.
   */
  noParse?: string | Function | RegExp | (string | Function | RegExp)[];

  /**
   * Specify options for each parser.
   */
  parser: ParserOptionsByModuleType;

  /**
   * An array of rules applied for modules.
   */
  rules: (undefined | null | false | '' | 0 | RuleSetRule | '...')[];

  /**
   * Cache the resolving of module requests.
   */
  unsafeCache?: boolean | Function;
}
declare interface ModulePathData {
  id: string | number;
  hash: string;
  hashWithLength?: (arg0: number) => string;
}
declare abstract class ModuleProfile {
  startTime: number;
  factoryStartTime: number;
  factoryEndTime: number;
  factory: number;
  factoryParallelismFactor: number;
  restoringStartTime: number;
  restoringEndTime: number;
  restoring: number;
  restoringParallelismFactor: number;
  integrationStartTime: number;
  integrationEndTime: number;
  integration: number;
  integrationParallelismFactor: number;
  buildingStartTime: number;
  buildingEndTime: number;
  building: number;
  buildingParallelismFactor: number;
  storingStartTime: number;
  storingEndTime: number;
  storing: number;
  storingParallelismFactor: number;
  additionalFactoryTimes?: { start: number; end: number }[];
  additionalFactories: number;
  additionalFactoriesParallelismFactor: number;
  additionalIntegration: number;
  markFactoryStart(): void;
  markFactoryEnd(): void;
  markRestoringStart(): void;
  markRestoringEnd(): void;
  markIntegrationStart(): void;
  markIntegrationEnd(): void;
  markBuildingStart(): void;
  markBuildingEnd(): void;
  markStoringStart(): void;
  markStoringEnd(): void;

  /**
   * Merge this profile into another one
   */
  mergeInto(realProfile: ModuleProfile): void;
}
declare interface ModuleReferenceOptions {
  /**
   * the properties/exports of the module
   */
  ids: string[];

  /**
   * true, when this referenced export is called
   */
  call: boolean;

  /**
   * true, when this referenced export is directly imported (not via property access)
   */
  directImport: boolean;

  /**
   * if the position is ASI safe or unknown
   */
  asiSafe?: boolean;
}
declare interface ModuleSettings {
  /**
   * Specifies the layer in which the module should be placed in.
   */
  layer?: string;

  /**
   * Module type to use for the module.
   */
  type?: string;

  /**
   * Options for the resolver.
   */
  resolve?: ResolveOptionsWebpackOptions;

  /**
   * Options for parsing.
   */
  parser?: { [index: string]: any };

  /**
   * The options for the module generator.
   */
  generator?: { [index: string]: any };

  /**
   * Flags a module as with or without side effects.
   */
  sideEffects?: boolean;
}
declare abstract class ModuleTemplate {
  type: string;
  hooks: Readonly<{
    content: { tap: (options?: any, fn?: any) => void };
    module: { tap: (options?: any, fn?: any) => void };
    render: { tap: (options?: any, fn?: any) => void };
    package: { tap: (options?: any, fn?: any) => void };
    hash: { tap: (options?: any, fn?: any) => void };
  }>;
  get runtimeTemplate(): any;
}
declare class MultiCompiler {
  constructor(
    compilers: Compiler[] | Record<string, Compiler>,
    options: MultiCompilerOptions,
  );
  hooks: Readonly<{
    done: SyncHook<[MultiStats]>;
    invalid: MultiHook<SyncHook<[null | string, number]>>;
    run: MultiHook<AsyncSeriesHook<[Compiler]>>;
    watchClose: SyncHook<[]>;
    watchRun: MultiHook<AsyncSeriesHook<[Compiler]>>;
    infrastructureLog: MultiHook<SyncBailHook<[string, string, any[]], true>>;
  }>;
  compilers: Compiler[];
  dependencies: WeakMap<Compiler, string[]>;
  running: boolean;
  get options(): WebpackOptionsNormalized[] & MultiCompilerOptions;
  get outputPath(): string;
  inputFileSystem: InputFileSystem;
  outputFileSystem: OutputFileSystem;
  watchFileSystem: WatchFileSystem;
  intermediateFileSystem: IntermediateFileSystem;
  getInfrastructureLogger(name?: any): WebpackLogger;
  setDependencies(compiler: Compiler, dependencies: string[]): void;
  validateDependencies(callback: CallbackFunction<MultiStats>): boolean;
  runWithDependencies(
    compilers: Compiler[],
    fn: (compiler: Compiler, callback: CallbackFunction<MultiStats>) => any,
    callback: CallbackFunction<MultiStats>,
  ): void;
  watch(
    watchOptions: WatchOptions | WatchOptions[],
    handler: CallbackFunction<MultiStats>,
  ): MultiWatching;
  run(callback: CallbackFunction<MultiStats>): void;
  purgeInputFileSystem(): void;
  close(callback: CallbackFunction<void>): void;
}
declare interface MultiCompilerOptions {
  /**
   * how many Compilers are allows to run at the same time in parallel
   */
  parallelism?: number;
}
declare abstract class MultiStats {
  stats: Stats[];
  get hash(): string;
  hasErrors(): boolean;
  hasWarnings(): boolean;
  toJson(options?: any): StatsCompilation;
  toString(options?: any): string;
}
declare abstract class MultiWatching {
  watchings: Watching[];
  compiler: MultiCompiler;
  invalidate(callback?: CallbackFunction<void>): void;
  suspend(): void;
  resume(): void;
  close(callback: CallbackFunction<void>): void;
}
declare class NamedChunkIdsPlugin {
  constructor(options?: NamedChunkIdsPluginOptions);
  delimiter: string;
  context?: string;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface NamedChunkIdsPluginOptions {
  /**
   * context
   */
  context?: string;

  /**
   * delimiter
   */
  delimiter?: string;
}
declare class NamedModuleIdsPlugin {
  constructor(options?: NamedModuleIdsPluginOptions);
  options: NamedModuleIdsPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface NamedModuleIdsPluginOptions {
  /**
   * context
   */
  context?: string;
}
declare class NaturalModuleIdsPlugin {
  constructor();

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface NeedBuildContext {
  compilation: Compilation;
  fileSystemInfo: FileSystemInfo;
  valueCacheVersions: Map<string, string | Set<string>>;
}
declare class NoEmitOnErrorsPlugin {
  constructor();

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
type Node = false | NodeOptions;
declare class NodeEnvironmentPlugin {
  constructor(options: {
    /**
     * infrastructure logging options
     */
    infrastructureLogging: InfrastructureLogging;
  });
  options: {
    /**
     * infrastructure logging options
     */
    infrastructureLogging: InfrastructureLogging;
  };

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}

/**
 * Options object for node compatibility features.
 */
declare interface NodeOptions {
  /**
   * Include a polyfill for the '__dirname' variable.
   */
  __dirname?: boolean | 'warn-mock' | 'mock' | 'eval-only';

  /**
   * Include a polyfill for the '__filename' variable.
   */
  __filename?: boolean | 'warn-mock' | 'mock' | 'eval-only';

  /**
   * Include a polyfill for the 'global' variable.
   */
  global?: boolean | 'warn';
}
declare class NodeSourcePlugin {
  constructor();

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare class NodeTargetPlugin {
  constructor();

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare class NodeTemplatePlugin {
  constructor(options?: NodeTemplatePluginOptions);

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface NodeTemplatePluginOptions {
  /**
   * enable async chunk loading
   */
  asyncChunkLoading?: boolean;
}
declare interface NormalModuleCompilationHooks {
  loader: SyncHook<[object, NormalModule]>;
  beforeLoaders: SyncHook<[LoaderItem[], NormalModule, object]>;
  beforeParse: SyncHook<[NormalModule]>;
  beforeSnapshot: SyncHook<[NormalModule]>;
  readResourceForScheme: HookMap<
    AsyncSeriesBailHook<[string, NormalModule], string | Buffer>
  >;
  readResource: HookMap<AsyncSeriesBailHook<[object], string | Buffer>>;
  needBuild: AsyncSeriesBailHook<[NormalModule, NeedBuildContext], boolean>;
}
declare interface NormalModuleCreateData {
  /**
   * an optional layer in which the module is
   */
  layer?: string;

  /**
   * module type. When deserializing, this is set to an empty string "".
   */
  type: '' | 'javascript/auto' | 'javascript/dynamic' | 'javascript/esm';

  /**
   * request string
   */
  request: string;

  /**
   * request intended by user (without loaders from config)
   */
  userRequest: string;

  /**
   * request without resolving
   */
  rawRequest: string;

  /**
   * list of loaders
   */
  loaders: LoaderItem[];

  /**
   * path + query of the real resource
   */
  resource: string;

  /**
   * resource resolve data
   */
  resourceResolveData?: Record<string, any>;

  /**
   * context directory for resolving
   */
  context: string;

  /**
   * path + query of the matched resource (virtual)
   */
  matchResource?: string;

  /**
   * the parser used
   */
  parser: Parser;

  /**
   * the options of the parser used
   */
  parserOptions?: Record<string, any>;

  /**
   * the generator used
   */
  generator: Generator;

  /**
   * the options of the generator used
   */
  generatorOptions?: Record<string, any>;

  /**
   * options used for resolving requests from this module
   */
  resolveOptions?: ResolveOptionsWebpackOptions;
}
declare abstract class NormalModuleFactory extends ModuleFactory {
  hooks: Readonly<{
    resolve: AsyncSeriesBailHook<[ResolveData], false | void | Module>;
    resolveForScheme: HookMap<
      AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>
    >;
    resolveInScheme: HookMap<
      AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>
    >;
    factorize: AsyncSeriesBailHook<[ResolveData], Module>;
    beforeResolve: AsyncSeriesBailHook<[ResolveData], false | void>;
    afterResolve: AsyncSeriesBailHook<[ResolveData], false | void>;
    createModule: AsyncSeriesBailHook<
      [
        Partial<NormalModuleCreateData & { settings: ModuleSettings }>,
        ResolveData,
      ],
      void | Module
    >;
    module: SyncWaterfallHook<
      [
        Module,
        Partial<NormalModuleCreateData & { settings: ModuleSettings }>,
        ResolveData,
      ],
      Module
    >;
    createParser: HookMap<SyncBailHook<any, any>>;
    parser: HookMap<SyncHook<any>>;
    createGenerator: HookMap<SyncBailHook<any, any>>;
    generator: HookMap<SyncHook<any>>;
    createModuleClass: HookMap<SyncBailHook<any, any>>;
  }>;
  resolverFactory: ResolverFactory;
  ruleSet: RuleSet;
  context: string;
  fs: InputFileSystem;
  parserCache: Map<string, WeakMap<Object, any>>;
  generatorCache: Map<string, WeakMap<Object, Generator>>;
  cleanupForCache(): void;
  resolveResource(
    contextInfo?: any,
    context?: any,
    unresolvedResource?: any,
    resolver?: any,
    resolveContext?: any,
    callback?: any,
  ): void;
  resolveRequestArray(
    contextInfo?: any,
    context?: any,
    array?: any,
    resolver?: any,
    resolveContext?: any,
    callback?: any,
  ): any;
  getParser(type?: any, parserOptions?: object): any;
  createParser(type: string, parserOptions?: { [index: string]: any }): Parser;
  getGenerator(type?: any, generatorOptions?: object): undefined | Generator;
  createGenerator(type?: any, generatorOptions?: object): any;
  getResolver(type?: any, resolveOptions?: any): ResolverWithOptions;
}

/**
 * These properties are added by the NormalModule
 */
declare interface NormalModuleLoaderContext<OptionsType> {
  version: number;
  getOptions(): OptionsType;
  getOptions(schema: Parameters<typeof validateFunction>[0]): OptionsType;
  emitWarning(warning: Error): void;
  emitError(error: Error): void;
  getLogger(name?: string): WebpackLogger;
  resolve(
    context: string,
    request: string,
    callback: (
      err: null | ErrorWithDetail,
      res?: string | false,
      req?: ResolveRequest,
    ) => void,
  ): any;
  getResolve(options?: ResolveOptionsWithDependencyType): {
    (
      context: string,
      request: string,
      callback: (
        err: null | ErrorWithDetail,
        res?: string | false,
        req?: ResolveRequest,
      ) => void,
    ): void;
    (context: string, request: string): Promise<string>;
  };
  emitFile(
    name: string,
    content: string | Buffer,
    sourceMap?: string,
    assetInfo?: AssetInfo,
  ): void;
  addBuildDependency(dep: string): void;
  utils: {
    absolutify: (context: string, request: string) => string;
    contextify: (context: string, request: string) => string;
    createHash: (algorithm?: string | typeof Hash) => Hash;
  };
  rootContext: string;
  fs: InputFileSystem;
  sourceMap?: boolean;
  mode: 'none' | 'development' | 'production';
  webpack?: boolean;
  _module?: NormalModule;
  _compilation?: Compilation;
  _compiler?: Compiler;
}

declare class NormalModuleReplacementPlugin {
  /**
   * Create an instance of the plugin
   */
  constructor(
    resourceRegExp: RegExp,
    newResource: string | ((arg0: ResolveData) => void),
  );
  resourceRegExp: RegExp;
  newResource: string | ((arg0: ResolveData) => void);

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
type NormalizedStatsOptions = KnownNormalizedStatsOptions &
  Omit<
    StatsOptions,
    | 'context'
    | 'chunkGroups'
    | 'requestShortener'
    | 'chunksSort'
    | 'modulesSort'
    | 'chunkModulesSort'
    | 'nestedModulesSort'
    | 'assetsSort'
    | 'ids'
    | 'cachedAssets'
    | 'groupAssetsByEmitStatus'
    | 'groupAssetsByPath'
    | 'groupAssetsByExtension'
    | 'assetsSpace'
    | 'excludeAssets'
    | 'excludeModules'
    | 'warningsFilter'
    | 'cachedModules'
    | 'orphanModules'
    | 'dependentModules'
    | 'runtimeModules'
    | 'groupModulesByCacheStatus'
    | 'groupModulesByLayer'
    | 'groupModulesByAttributes'
    | 'groupModulesByPath'
    | 'groupModulesByExtension'
    | 'groupModulesByType'
    | 'entrypoints'
    | 'chunkGroupAuxiliary'
    | 'chunkGroupChildren'
    | 'chunkGroupMaxAssets'
    | 'modulesSpace'
    | 'chunkModulesSpace'
    | 'nestedModulesSpace'
    | 'logging'
    | 'loggingDebug'
    | 'loggingTrace'
    | '_env'
  > &
  Record<string, any>;
declare class NullDependency extends Dependency {
  constructor();
  static Template: typeof NullDependencyTemplate;
  static NO_EXPORTS_REFERENCED: string[][];
  static EXPORTS_OBJECT_REFERENCED: string[][];
  static TRANSITIVE: typeof TRANSITIVE;
}
declare class NullDependencyTemplate extends DependencyTemplate {
  constructor();
}
declare interface ObjectDeserializerContext {
  read: () => any;
  setCircularReference: (arg0?: any) => void;
}
declare interface ObjectSerializer {
  serialize: (arg0: any, arg1: ObjectSerializerContext) => void;
  deserialize: (arg0: ObjectDeserializerContext) => any;
}
declare interface ObjectSerializerContext {
  write: (arg0?: any) => void;
  setCircularReference: (arg0?: any) => void;
}
declare class OccurrenceChunkIdsPlugin {
  constructor(options?: OccurrenceChunkIdsPluginOptions);
  options: OccurrenceChunkIdsPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface OccurrenceChunkIdsPluginOptions {
  /**
   * Prioritise initial size over total size.
   */
  prioritiseInitial?: boolean;
}
declare class OccurrenceModuleIdsPlugin {
  constructor(options?: OccurrenceModuleIdsPluginOptions);
  options: OccurrenceModuleIdsPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface OccurrenceModuleIdsPluginOptions {
  /**
   * Prioritise initial size over total size.
   */
  prioritiseInitial?: boolean;
}

/**
 * Options object for describing behavior of a cache group selecting modules that should be cached together.
 */
declare interface OptimizationSplitChunksCacheGroup {
  /**
   * Sets the name delimiter for created chunks.
   */
  automaticNameDelimiter?: string;

  /**
   * Select chunks for determining cache group content (defaults to "initial", "initial" and "all" requires adding these chunks to the HTML).
   */
  chunks?: RegExp | 'all' | 'initial' | 'async' | ((chunk: Chunk) => boolean);

  /**
   * Ignore minimum size, minimum chunks and maximum requests and always create chunks for this cache group.
   */
  enforce?: boolean;

  /**
   * Size threshold at which splitting is enforced and other restrictions (minRemainingSize, maxAsyncRequests, maxInitialRequests) are ignored.
   */
  enforceSizeThreshold?: number | { [index: string]: number };

  /**
   * Sets the template for the filename for created chunks.
   */
  filename?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Sets the hint for chunk id.
   */
  idHint?: string;

  /**
   * Assign modules to a cache group by module layer.
   */
  layer?: string | Function | RegExp;

  /**
   * Maximum number of requests which are accepted for on-demand loading.
   */
  maxAsyncRequests?: number;

  /**
   * Maximal size hint for the on-demand chunks.
   */
  maxAsyncSize?: number | { [index: string]: number };

  /**
   * Maximum number of initial chunks which are accepted for an entry point.
   */
  maxInitialRequests?: number;

  /**
   * Maximal size hint for the initial chunks.
   */
  maxInitialSize?: number | { [index: string]: number };

  /**
   * Maximal size hint for the created chunks.
   */
  maxSize?: number | { [index: string]: number };

  /**
   * Minimum number of times a module has to be duplicated until it's considered for splitting.
   */
  minChunks?: number;

  /**
   * Minimal size for the chunks the stay after moving the modules to a new chunk.
   */
  minRemainingSize?: number | { [index: string]: number };

  /**
   * Minimal size for the created chunk.
   */
  minSize?: number | { [index: string]: number };

  /**
   * Minimum size reduction due to the created chunk.
   */
  minSizeReduction?: number | { [index: string]: number };

  /**
   * Give chunks for this cache group a name (chunks with equal name are merged).
   */
  name?: string | false | Function;

  /**
   * Priority of this cache group.
   */
  priority?: number;

  /**
   * Try to reuse existing chunk (with name) when it has matching modules.
   */
  reuseExistingChunk?: boolean;

  /**
   * Assign modules to a cache group by module name.
   */
  test?: string | Function | RegExp;

  /**
   * Assign modules to a cache group by module type.
   */
  type?: string | Function | RegExp;

  /**
   * Compare used exports when checking common modules. Modules will only be put in the same chunk when exports are equal.
   */
  usedExports?: boolean;
}

/**
 * Options object for splitting chunks into smaller chunks.
 */
declare interface OptimizationSplitChunksOptions {
  /**
   * Sets the name delimiter for created chunks.
   */
  automaticNameDelimiter?: string;

  /**
   * Assign modules to a cache group (modules from different cache groups are tried to keep in separate chunks, default categories: 'default', 'defaultVendors').
   */
  cacheGroups?: {
    [index: string]:
      | string
      | false
      | Function
      | RegExp
      | OptimizationSplitChunksCacheGroup;
  };

  /**
   * Select chunks for determining shared modules (defaults to "async", "initial" and "all" requires adding these chunks to the HTML).
   */
  chunks?: RegExp | 'all' | 'initial' | 'async' | ((chunk: Chunk) => boolean);

  /**
   * Sets the size types which are used when a number is used for sizes.
   */
  defaultSizeTypes?: string[];

  /**
   * Size threshold at which splitting is enforced and other restrictions (minRemainingSize, maxAsyncRequests, maxInitialRequests) are ignored.
   */
  enforceSizeThreshold?: number | { [index: string]: number };

  /**
   * Options for modules not selected by any other cache group.
   */
  fallbackCacheGroup?: {
    /**
     * Sets the name delimiter for created chunks.
     */
    automaticNameDelimiter?: string;
    /**
     * Select chunks for determining shared modules (defaults to "async", "initial" and "all" requires adding these chunks to the HTML).
     */
    chunks?: RegExp | 'all' | 'initial' | 'async' | ((chunk: Chunk) => boolean);
    /**
     * Maximal size hint for the on-demand chunks.
     */
    maxAsyncSize?: number | { [index: string]: number };
    /**
     * Maximal size hint for the initial chunks.
     */
    maxInitialSize?: number | { [index: string]: number };
    /**
     * Maximal size hint for the created chunks.
     */
    maxSize?: number | { [index: string]: number };
    /**
     * Minimal size for the created chunk.
     */
    minSize?: number | { [index: string]: number };
    /**
     * Minimum size reduction due to the created chunk.
     */
    minSizeReduction?: number | { [index: string]: number };
  };

  /**
   * Sets the template for the filename for created chunks.
   */
  filename?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Prevents exposing path info when creating names for parts splitted by maxSize.
   */
  hidePathInfo?: boolean;

  /**
   * Maximum number of requests which are accepted for on-demand loading.
   */
  maxAsyncRequests?: number;

  /**
   * Maximal size hint for the on-demand chunks.
   */
  maxAsyncSize?: number | { [index: string]: number };

  /**
   * Maximum number of initial chunks which are accepted for an entry point.
   */
  maxInitialRequests?: number;

  /**
   * Maximal size hint for the initial chunks.
   */
  maxInitialSize?: number | { [index: string]: number };

  /**
   * Maximal size hint for the created chunks.
   */
  maxSize?: number | { [index: string]: number };

  /**
   * Minimum number of times a module has to be duplicated until it's considered for splitting.
   */
  minChunks?: number;

  /**
   * Minimal size for the chunks the stay after moving the modules to a new chunk.
   */
  minRemainingSize?: number | { [index: string]: number };

  /**
   * Minimal size for the created chunks.
   */
  minSize?: number | { [index: string]: number };

  /**
   * Minimum size reduction due to the created chunk.
   */
  minSizeReduction?: number | { [index: string]: number };

  /**
   * Give chunks created a name (chunks with equal name are merged).
   */
  name?: string | false | Function;

  /**
   * Compare used exports when checking common modules. Modules will only be put in the same chunk when exports are equal.
   */
  usedExports?: boolean;
}
declare abstract class OptionsApply {
  process(options?: any, compiler?: any): void;
}
declare interface OriginRecord {
  module: Module;
  loc: DependencyLocation;
  request: string;
}

/**
 * Options affecting the output of the compilation. `output` options tell webpack how to write the compiled files to disk.
 */
declare interface Output {
  /**
   * Add a container for define/require functions in the AMD module.
   */
  amdContainer?: string;

  /**
   * The filename of asset modules as relative path inside the 'output.path' directory.
   */
  assetModuleFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Enable/disable creating async chunks that are loaded on demand.
   */
  asyncChunks?: boolean;

  /**
   * Add a comment in the UMD wrapper.
   */
  auxiliaryComment?: string | LibraryCustomUmdCommentObject;

  /**
   * Add charset attribute for script tag.
   */
  charset?: boolean;

  /**
   * Specifies the filename template of output files of non-initial chunks on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  chunkFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * The format of chunks (formats included by default are 'array-push' (web/WebWorker), 'commonjs' (node.js), 'module' (ESM), but others might be added by plugins).
   */
  chunkFormat?: string | false;

  /**
   * Number of milliseconds before chunk request expires.
   */
  chunkLoadTimeout?: number;

  /**
   * The method of loading chunks (methods included by default are 'jsonp' (web), 'import' (ESM), 'importScripts' (WebWorker), 'require' (sync node.js), 'async-node' (async node.js), but others might be added by plugins).
   */
  chunkLoading?: string | false;

  /**
   * The global variable used by webpack for loading of chunks.
   */
  chunkLoadingGlobal?: string;

  /**
   * Clean the output directory before emit.
   */
  clean?: boolean | CleanOptions;

  /**
   * Check if to be emitted file already exists and have the same content before writing to output filesystem.
   */
  compareBeforeEmit?: boolean;

  /**
   * This option enables cross-origin loading of chunks.
   */
  crossOriginLoading?: false | 'anonymous' | 'use-credentials';

  /**
   * Specifies the filename template of non-initial output css files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  cssChunkFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Specifies the filename template of output css files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  cssFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Compress the data in the head tag of CSS files.
   */
  cssHeadDataCompression?: boolean;

  /**
   * Similar to `output.devtoolModuleFilenameTemplate`, but used in the case of duplicate module identifiers.
   */
  devtoolFallbackModuleFilenameTemplate?: string | Function;

  /**
   * Filename template string of function for the sources array in a generated SourceMap.
   */
  devtoolModuleFilenameTemplate?: string | Function;

  /**
   * Module namespace to use when interpolating filename template string for the sources array in a generated SourceMap. Defaults to `output.library` if not set. It's useful for avoiding runtime collisions in sourcemaps from multiple webpack projects built as libraries.
   */
  devtoolNamespace?: string;

  /**
   * List of chunk loading types enabled for use by entry points.
   */
  enabledChunkLoadingTypes?: string[];

  /**
   * List of library types enabled for use by entry points.
   */
  enabledLibraryTypes?: string[];

  /**
   * List of wasm loading types enabled for use by entry points.
   */
  enabledWasmLoadingTypes?: string[];

  /**
   * The abilities of the environment where the webpack generated code should run.
   */
  environment?: Environment;

  /**
   * Specifies the filename of output files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  filename?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * An expression which is used to address the global object/scope in runtime code.
   */
  globalObject?: string;

  /**
   * Digest type used for the hash.
   */
  hashDigest?: string;

  /**
   * Number of chars which are used for the hash.
   */
  hashDigestLength?: number;

  /**
   * Algorithm used for generation the hash (see node.js crypto package).
   */
  hashFunction?: string | typeof Hash;

  /**
   * Any string which is added to the hash to salt it.
   */
  hashSalt?: string;

  /**
   * The filename of the Hot Update Chunks. They are inside the output.path directory.
   */
  hotUpdateChunkFilename?: string;

  /**
   * The global variable used by webpack for loading of hot update chunks.
   */
  hotUpdateGlobal?: string;

  /**
   * The filename of the Hot Update Main File. It is inside the 'output.path' directory.
   */
  hotUpdateMainFilename?: string;

  /**
   * Ignore warnings in the browser.
   */
  ignoreBrowserWarnings?: boolean;

  /**
   * Wrap javascript code into IIFE's to avoid leaking into global scope.
   */
  iife?: boolean;

  /**
   * The name of the native import() function (can be exchanged for a polyfill).
   */
  importFunctionName?: string;

  /**
   * The name of the native import.meta object (can be exchanged for a polyfill).
   */
  importMetaName?: string;

  /**
   * Make the output files a library, exporting the exports of the entry point.
   */
  library?: string | string[] | LibraryOptions | LibraryCustomUmdObject;

  /**
   * Specify which export should be exposed as library.
   */
  libraryExport?: string | string[];

  /**
   * Type of library (types included by default are 'var', 'module', 'assign', 'assign-properties', 'this', 'window', 'self', 'global', 'commonjs', 'commonjs2', 'commonjs-module', 'commonjs-static', 'amd', 'amd-require', 'umd', 'umd2', 'jsonp', 'system', but others might be added by plugins).
   */
  libraryTarget?: string;

  /**
   * Output javascript files as module source type.
   */
  module?: boolean;

  /**
   * The output directory as **absolute path** (required).
   */
  path?: string;

  /**
   * Include comments with information about the modules.
   */
  pathinfo?: boolean | 'verbose';

  /**
   * The 'publicPath' specifies the public URL address of the output files when referenced in a browser.
   */
  publicPath?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * This option enables loading async chunks via a custom script type, such as script type="module".
   */
  scriptType?: false | 'module' | 'text/javascript';

  /**
   * The filename of the SourceMaps for the JavaScript files. They are inside the 'output.path' directory.
   */
  sourceMapFilename?: string;

  /**
   * Prefixes every line of the source in the bundle with this string.
   */
  sourcePrefix?: string;

  /**
   * Handles error in module loading correctly at a performance cost. This will handle module error compatible with the EcmaScript Modules spec.
   */
  strictModuleErrorHandling?: boolean;

  /**
   * Handles exceptions in module loading correctly at a performance cost (Deprecated). This will handle module error compatible with the Node.js CommonJS way.
   */
  strictModuleExceptionHandling?: boolean;

  /**
   * Use a Trusted Types policy to create urls for chunks. 'output.uniqueName' is used a default policy name. Passing a string sets a custom policy name.
   */
  trustedTypes?: string | true | TrustedTypes;

  /**
   * If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.
   */
  umdNamedDefine?: boolean;

  /**
   * A unique name of the webpack build to avoid multiple webpack runtimes to conflict when using globals.
   */
  uniqueName?: string;

  /**
   * The method of loading WebAssembly Modules (methods included by default are 'fetch' (web/WebWorker), 'async-node' (node.js), but others might be added by plugins).
   */
  wasmLoading?: string | false;

  /**
   * The filename of WebAssembly modules as relative path inside the 'output.path' directory.
   */
  webassemblyModuleFilename?: string;

  /**
   * The method of loading chunks (methods included by default are 'jsonp' (web), 'import' (ESM), 'importScripts' (WebWorker), 'require' (sync node.js), 'async-node' (async node.js), but others might be added by plugins).
   */
  workerChunkLoading?: string | false;

  /**
   * Worker public path. Much like the public path, this sets the location where the worker script file is intended to be found. If not set, webpack will use the publicPath. Don't set this option unless your worker scripts are located at a different path from your other script files.
   */
  workerPublicPath?: string;

  /**
   * The method of loading WebAssembly Modules (methods included by default are 'fetch' (web/WebWorker), 'async-node' (node.js), but others might be added by plugins).
   */
  workerWasmLoading?: string | false;
}

declare interface OutputFileSystem {
  writeFile: (
    arg0: string,
    arg1: string | Buffer,
    arg2: (arg0?: null | NodeJS.ErrnoException) => void,
  ) => void;
  mkdir: (
    arg0: string,
    arg1: (arg0?: null | NodeJS.ErrnoException) => void,
  ) => void;
  readdir?: (
    arg0: string,
    arg1: (
      arg0?: null | NodeJS.ErrnoException,
      arg1?: (string | Buffer)[] | IDirent[],
    ) => void,
  ) => void;
  rmdir?: (
    arg0: string,
    arg1: (arg0?: null | NodeJS.ErrnoException) => void,
  ) => void;
  unlink?: (
    arg0: string,
    arg1: (arg0?: null | NodeJS.ErrnoException) => void,
  ) => void;
  stat: (
    arg0: string,
    arg1: (arg0?: null | NodeJS.ErrnoException, arg1?: IStats) => void,
  ) => void;
  lstat?: (
    arg0: string,
    arg1: (arg0?: null | NodeJS.ErrnoException, arg1?: IStats) => void,
  ) => void;
  readFile: (
    arg0: string,
    arg1: (arg0?: null | NodeJS.ErrnoException, arg1?: string | Buffer) => void,
  ) => void;
  join?: (arg0: string, arg1: string) => string;
  relative?: (arg0: string, arg1: string) => string;
  dirname?: (arg0: string) => string;
}

/**
 * Normalized options affecting the output of the compilation. `output` options tell webpack how to write the compiled files to disk.
 */
declare interface OutputNormalized {
  /**
   * The filename of asset modules as relative path inside the 'output.path' directory.
   */
  assetModuleFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Enable/disable creating async chunks that are loaded on demand.
   */
  asyncChunks?: boolean;

  /**
   * Add charset attribute for script tag.
   */
  charset?: boolean;

  /**
   * Specifies the filename template of output files of non-initial chunks on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  chunkFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * The format of chunks (formats included by default are 'array-push' (web/WebWorker), 'commonjs' (node.js), 'module' (ESM), but others might be added by plugins).
   */
  chunkFormat?: string | false;

  /**
   * Number of milliseconds before chunk request expires.
   */
  chunkLoadTimeout?: number;

  /**
   * The method of loading chunks (methods included by default are 'jsonp' (web), 'import' (ESM), 'importScripts' (WebWorker), 'require' (sync node.js), 'async-node' (async node.js), but others might be added by plugins).
   */
  chunkLoading?: string | false;

  /**
   * The global variable used by webpack for loading of chunks.
   */
  chunkLoadingGlobal?: string;

  /**
   * Clean the output directory before emit.
   */
  clean?: boolean | CleanOptions;

  /**
   * Check if to be emitted file already exists and have the same content before writing to output filesystem.
   */
  compareBeforeEmit?: boolean;

  /**
   * This option enables cross-origin loading of chunks.
   */
  crossOriginLoading?: false | 'anonymous' | 'use-credentials';

  /**
   * Specifies the filename template of non-initial output css files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  cssChunkFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Specifies the filename template of output css files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  cssFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Similar to `output.devtoolModuleFilenameTemplate`, but used in the case of duplicate module identifiers.
   */
  devtoolFallbackModuleFilenameTemplate?: string | Function;

  /**
   * Filename template string of function for the sources array in a generated SourceMap.
   */
  devtoolModuleFilenameTemplate?: string | Function;

  /**
   * Module namespace to use when interpolating filename template string for the sources array in a generated SourceMap. Defaults to `output.library` if not set. It's useful for avoiding runtime collisions in sourcemaps from multiple webpack projects built as libraries.
   */
  devtoolNamespace?: string;

  /**
   * List of chunk loading types enabled for use by entry points.
   */
  enabledChunkLoadingTypes?: string[];

  /**
   * List of library types enabled for use by entry points.
   */
  enabledLibraryTypes?: string[];

  /**
   * List of wasm loading types enabled for use by entry points.
   */
  enabledWasmLoadingTypes?: string[];

  /**
   * The abilities of the environment where the webpack generated code should run.
   */
  environment?: Environment;

  /**
   * Specifies the filename of output files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  filename?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * An expression which is used to address the global object/scope in runtime code.
   */
  globalObject?: string;

  /**
   * Digest type used for the hash.
   */
  hashDigest?: string;

  /**
   * Number of chars which are used for the hash.
   */
  hashDigestLength?: number;

  /**
   * Algorithm used for generation the hash (see node.js crypto package).
   */
  hashFunction?: string | typeof Hash;

  /**
   * Any string which is added to the hash to salt it.
   */
  hashSalt?: string;

  /**
   * The filename of the Hot Update Chunks. They are inside the output.path directory.
   */
  hotUpdateChunkFilename?: string;

  /**
   * The global variable used by webpack for loading of hot update chunks.
   */
  hotUpdateGlobal?: string;

  /**
   * The filename of the Hot Update Main File. It is inside the 'output.path' directory.
   */
  hotUpdateMainFilename?: string;

  /**
   * Ignore warnings in the browser.
   */
  ignoreBrowserWarnings?: boolean;

  /**
   * Wrap javascript code into IIFE's to avoid leaking into global scope.
   */
  iife?: boolean;

  /**
   * The name of the native import() function (can be exchanged for a polyfill).
   */
  importFunctionName?: string;

  /**
   * The name of the native import.meta object (can be exchanged for a polyfill).
   */
  importMetaName?: string;

  /**
   * Options for library.
   */
  library?: LibraryOptions;

  /**
   * Output javascript files as module source type.
   */
  module?: boolean;

  /**
   * The output directory as **absolute path** (required).
   */
  path?: string;

  /**
   * Include comments with information about the modules.
   */
  pathinfo?: boolean | 'verbose';

  /**
   * The 'publicPath' specifies the public URL address of the output files when referenced in a browser.
   */
  publicPath?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * This option enables loading async chunks via a custom script type, such as script type="module".
   */
  scriptType?: false | 'module' | 'text/javascript';

  /**
   * The filename of the SourceMaps for the JavaScript files. They are inside the 'output.path' directory.
   */
  sourceMapFilename?: string;

  /**
   * Prefixes every line of the source in the bundle with this string.
   */
  sourcePrefix?: string;

  /**
   * Handles error in module loading correctly at a performance cost. This will handle module error compatible with the EcmaScript Modules spec.
   */
  strictModuleErrorHandling?: boolean;

  /**
   * Handles exceptions in module loading correctly at a performance cost (Deprecated). This will handle module error compatible with the Node.js CommonJS way.
   */
  strictModuleExceptionHandling?: boolean;

  /**
   * Use a Trusted Types policy to create urls for chunks.
   */
  trustedTypes?: TrustedTypes;

  /**
   * A unique name of the webpack build to avoid multiple webpack runtimes to conflict when using globals.
   */
  uniqueName?: string;

  /**
   * The method of loading WebAssembly Modules (methods included by default are 'fetch' (web/WebWorker), 'async-node' (node.js), but others might be added by plugins).
   */
  wasmLoading?: string | false;

  /**
   * The filename of WebAssembly modules as relative path inside the 'output.path' directory.
   */
  webassemblyModuleFilename?: string;

  /**
   * The method of loading chunks (methods included by default are 'jsonp' (web), 'import' (ESM), 'importScripts' (WebWorker), 'require' (sync node.js), 'async-node' (async node.js), but others might be added by plugins).
   */
  workerChunkLoading?: string | false;

  /**
   * Worker public path. Much like the public path, this sets the location where the worker script file is intended to be found. If not set, webpack will use the publicPath. Don't set this option unless your worker scripts are located at a different path from your other script files.
   */
  workerPublicPath?: string;

  /**
   * The method of loading WebAssembly Modules (methods included by default are 'fetch' (web/WebWorker), 'async-node' (node.js), but others might be added by plugins).
   */
  workerWasmLoading?: string | false;
}
declare interface ParameterizedComparator<TArg, T> {
  (arg0: TArg): Comparator<T>;
}
declare interface ParsedIdentifier {
  request: string;
  query: string;
  fragment: string;
  directory: boolean;
  module: boolean;
  file: boolean;
  internal: boolean;
}
declare class Parser {
  constructor();
  parse(
    source: string | Buffer | PreparsedAst,
    state: ParserState,
  ): ParserState;
}
type ParserOptionsByModuleType = ParserOptionsByModuleTypeKnown &
  ParserOptionsByModuleTypeUnknown;

/**
 * Specify options for each parser.
 */
declare interface ParserOptionsByModuleTypeKnown {
  /**
   * Parser options for asset modules.
   */
  asset?: AssetParserOptions;

  /**
   * No parser options are supported for this module type.
   */
  'asset/inline'?: EmptyParserOptions;

  /**
   * No parser options are supported for this module type.
   */
  'asset/resource'?: EmptyParserOptions;

  /**
   * No parser options are supported for this module type.
   */
  'asset/source'?: EmptyParserOptions;

  /**
   * Parser options for javascript modules.
   */
  javascript?: JavascriptParserOptions;

  /**
   * Parser options for javascript modules.
   */
  'javascript/auto'?: JavascriptParserOptions;

  /**
   * Parser options for javascript modules.
   */
  'javascript/dynamic'?: JavascriptParserOptions;

  /**
   * Parser options for javascript modules.
   */
  'javascript/esm'?: JavascriptParserOptions;
}

/**
 * Specify options for each parser.
 */
declare interface ParserOptionsByModuleTypeUnknown {
  [index: string]: { [index: string]: any };
}
type ParserState = Record<string, any> & ParserStateBase;
declare interface ParserStateBase {
  source: string | Buffer;
  current: NormalModule;
  module: NormalModule;
  compilation: Compilation;
  options: { [index: string]: any };
}
type Pattern =
  | Identifier
  | MemberExpression
  | ObjectPattern
  | ArrayPattern
  | RestElement
  | AssignmentPattern;

/**
 * Configuration object for web performance recommendations.
 */
declare interface PerformanceOptions {
  /**
   * Filter function to select assets that are checked.
   */
  assetFilter?: Function;

  /**
   * Sets the format of the hints: warnings, errors or nothing at all.
   */
  hints?: false | 'error' | 'warning';

  /**
   * File size limit (in bytes) when exceeded, that webpack will provide performance hints.
   */
  maxAssetSize?: number;

  /**
   * Total size of an entry point (in bytes).
   */
  maxEntrypointSize?: number;
}
declare interface PitchLoaderDefinitionFunction<
  OptionsType = {},
  ContextAdditions = {},
> {
  (
    this: NormalModuleLoaderContext<OptionsType> &
      LoaderRunnerLoaderContext<OptionsType> &
      LoaderPluginLoaderContext &
      HotModuleReplacementPluginLoaderContext &
      ContextAdditions,
    remainingRequest: string,
    previousRequest: string,
    data: object,
  ): string | void | Buffer | Promise<string | Buffer>;
}
type Plugin =
  | undefined
  | null
  | false
  | ''
  | 0
  | { apply: (arg0: Resolver) => void }
  | ((this: Resolver, arg1: Resolver) => void);
declare interface PnpApiImpl {
  resolveToUnqualified: (arg0: string, arg1: string, arg2: object) => string;
}
declare interface PossibleFileSystemError {
  code?: string;
  errno?: number;
  path?: string;
  syscall?: string;
}
declare class PrefetchPlugin {
  constructor(context: string, request?: string);
  context: null | string;
  request: string;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}

declare interface PreparsedAst {
  [index: string]: any;
}
declare interface PrintedElement {
  element: string;
  content: string;
}
declare interface Problem {
  type: ProblemType;
  path: string;
  argument: string;
  value?: any;
  index?: number;
  expected?: string;
}
type ProblemType =
  | 'unknown-argument'
  | 'unexpected-non-array-in-path'
  | 'unexpected-non-object-in-path'
  | 'multiple-values-unexpected'
  | 'invalid-value';
declare interface ProcessAssetsAdditionalOptions {
  additionalAssets?: true | Function;
}
declare class Profiler {
  constructor(inspector?: any);
  session: any;
  inspector: any;
  hasSession(): boolean;
  startProfiling(): Promise<void> | Promise<[any, any, any]>;
  sendCommand(method: string, params?: object): Promise<any>;
  destroy(): Promise<void>;
  stopProfiling(): Promise<{ profile: any }>;
}
declare class ProfilingPlugin {
  constructor(options?: ProfilingPluginOptions);
  outputPath: string;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  static Profiler: typeof Profiler;
}
declare interface ProfilingPluginOptions {
  /**
   * Path to the output file e.g. `path.resolve(__dirname, 'profiling/events.json')`. Defaults to `events.json`.
   */
  outputPath?: string;
}
declare class ProgressPlugin {
  constructor(options?: ProgressPluginArgument);
  profile?: null | boolean;
  handler?: (percentage: number, msg: string, ...args: string[]) => void;
  modulesCount?: number;
  dependenciesCount?: number;
  showEntries?: boolean;
  showModules?: boolean;
  showDependencies?: boolean;
  showActiveModules?: boolean;
  percentBy?: null | 'entries' | 'modules' | 'dependencies';
  apply(compiler: Compiler | MultiCompiler): void;
  static getReporter(
    compiler: Compiler,
  ): undefined | ((p: number, ...args: string[]) => void);
  static defaultOptions: {
    profile: boolean;
    modulesCount: number;
    dependenciesCount: number;
    modules: boolean;
    dependencies: boolean;
    activeModules: boolean;
    entries: boolean;
  };
  static createDefaultHandler: (
    profile: undefined | null | boolean,
    logger: WebpackLogger,
  ) => (percentage: number, msg: string, ...args: string[]) => void;
}
type ProgressPluginArgument =
  | ProgressPluginOptions
  | ((percentage: number, msg: string, ...args: string[]) => void);

/**
 * Options object for the ProgressPlugin.
 */
declare interface ProgressPluginOptions {
  /**
   * Show active modules count and one active module in progress message.
   */
  activeModules?: boolean;

  /**
   * Show dependencies count in progress message.
   */
  dependencies?: boolean;

  /**
   * Minimum dependencies count to start with. For better progress calculation. Default: 10000.
   */
  dependenciesCount?: number;

  /**
   * Show entries count in progress message.
   */
  entries?: boolean;

  /**
   * Function that executes for every progress step.
   */
  handler?: (percentage: number, msg: string, ...args: string[]) => void;

  /**
   * Show modules count in progress message.
   */
  modules?: boolean;

  /**
   * Minimum modules count to start with. For better progress calculation. Default: 5000.
   */
  modulesCount?: number;

  /**
   * Collect percent algorithm. By default it calculates by a median from modules, entries and dependencies percent.
   */
  percentBy?: null | 'entries' | 'modules' | 'dependencies';

  /**
   * Collect profile data for progress steps. Default: false.
   */
  profile?: null | boolean;
}
declare class ProvidePlugin {
  constructor(definitions: Record<string, string | string[]>);
  definitions: Record<string, string | string[]>;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare class ProvideSharedPlugin {
  constructor(options: ProvideSharedPluginOptions);

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface ProvideSharedPluginOptions {
  /**
   * Modules that should be provided as shared modules to the share scope. When provided, property name is used to match modules, otherwise this is automatically inferred from share key.
   */
  provides: Provides;

  /**
   * Share scope name used for all provided modules (defaults to 'default').
   */
  shareScope?: string;
}
type Provides = (string | ProvidesObject)[] | ProvidesObject;

/**
 * Advanced configuration for modules that should be provided as shared modules to the share scope.
 */
declare interface ProvidesConfig {
  /**
   * Include the provided module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
   */
  eager?: boolean;

  /**
   * Key in the share scope under which the shared modules should be stored.
   */
  shareKey?: string;

  /**
   * Share scope name.
   */
  shareScope?: string;

  /**
   * Version of the provided module. Will replace lower matching versions, but not higher.
   */
  version?: string | false;
}

/**
 * Modules that should be provided as shared modules to the share scope. Property names are used as share keys.
 */
declare interface ProvidesObject {
  [index: string]: string | ProvidesConfig;
}
declare interface RawChunkGroupOptions {
  preloadOrder?: number;
  prefetchOrder?: number;
  fetchPriority?: 'auto' | 'low' | 'high';
}
type RawLoaderDefinition<
  OptionsType = {},
  ContextAdditions = {},
> = RawLoaderDefinitionFunction<OptionsType, ContextAdditions> & {
  raw: true;
  pitch?: PitchLoaderDefinitionFunction<OptionsType, ContextAdditions>;
};
declare interface RawLoaderDefinitionFunction<
  OptionsType = {},
  ContextAdditions = {},
> {
  (
    this: NormalModuleLoaderContext<OptionsType> &
      LoaderRunnerLoaderContext<OptionsType> &
      LoaderPluginLoaderContext &
      HotModuleReplacementPluginLoaderContext &
      ContextAdditions,
    content: Buffer,
    sourceMap?: string | SourceMap,
    additionalData?: AdditionalData,
  ): string | void | Buffer | Promise<string | Buffer>;
}

declare interface RawSourceMap {
  version: number;
  sources: string[];
  names: string[];
  sourceRoot?: string;
  sourcesContent?: string[];
  mappings: string;
  file: string;
}
declare class ReadFileCompileWasmPlugin {
  constructor(options?: ReadFileCompileWasmPluginOptions);
  options: ReadFileCompileWasmPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface ReadFileCompileWasmPluginOptions {
  /**
   * mangle imports
   */
  mangleImports?: boolean;
}
declare interface ReaddirOptions {
  encoding?:
    | null
    | 'ascii'
    | 'utf8'
    | 'utf16le'
    | 'ucs2'
    | 'latin1'
    | 'binary'
    | 'utf-8'
    | 'ucs-2'
    | 'base64'
    | 'base64url'
    | 'hex'
    | 'buffer';
  withFileTypes?: boolean;
}
declare class RealContentHashPlugin {
  constructor(__0: {
    /**
     * the hash function to use
     */
    hashFunction: string | typeof Hash;
    /**
     * the hash digest to use
     */
    hashDigest: string;
  });

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  static getCompilationHooks(
    compilation: Compilation,
  ): CompilationHooksRealContentHashPlugin;
}
declare interface RealDependencyLocation {
  start: SourcePosition;
  end?: SourcePosition;
  index?: number;
}
type RecursiveArrayOrRecord<T> =
  | { [index: string]: RecursiveArrayOrRecord<T> }
  | RecursiveArrayOrRecord<T>[]
  | T;
declare interface ReferencedExport {
  /**
   * name of the referenced export
   */
  name: string[];

  /**
   * when false, referenced export can not be mangled, defaults to true
   */
  canMangle?: boolean;
}
type Remotes = (string | RemotesObject)[] | RemotesObject;

/**
 * Advanced configuration for container locations from which modules should be resolved and loaded at runtime.
 */
declare interface RemotesConfig {
  /**
   * Container locations from which modules should be resolved and loaded at runtime.
   */
  external: string | string[];

  /**
   * The name of the share scope shared with this remote.
   */
  shareScope?: string;
}

/**
 * Container locations from which modules should be resolved and loaded at runtime. Property names are used as request scopes.
 */
declare interface RemotesObject {
  [index: string]: string | RemotesConfig | string[];
}
declare interface RenderBootstrapContext {
  /**
   * the chunk
   */
  chunk: Chunk;

  /**
   * results of code generation
   */
  codeGenerationResults: CodeGenerationResults;

  /**
   * the runtime template
   */
  runtimeTemplate: RuntimeTemplate;

  /**
   * the module graph
   */
  moduleGraph: ModuleGraph;

  /**
   * the chunk graph
   */
  chunkGraph: ChunkGraph;

  /**
   * hash to be used for render call
   */
  hash: string;
}
declare interface RenderContext {
  /**
   * the chunk
   */
  chunk: Chunk;

  /**
   * the dependency templates
   */
  dependencyTemplates: DependencyTemplates;

  /**
   * the runtime template
   */
  runtimeTemplate: RuntimeTemplate;

  /**
   * the module graph
   */
  moduleGraph: ModuleGraph;

  /**
   * the chunk graph
   */
  chunkGraph: ChunkGraph;

  /**
   * results of code generation
   */
  codeGenerationResults: CodeGenerationResults;

  /**
   * rendering in strict context
   */
  strictMode: boolean;
}
type RenderManifestEntry =
  | RenderManifestEntryTemplated
  | RenderManifestEntryStatic;
declare interface RenderManifestEntryStatic {
  render: () => Source;
  filename: string;
  info: AssetInfo;
  identifier: string;
  hash?: string;
  auxiliary?: boolean;
}
declare interface RenderManifestEntryTemplated {
  render: () => Source;
  filenameTemplate: string | ((arg0: PathData, arg1?: AssetInfo) => string);
  pathOptions?: PathData;
  info?: AssetInfo;
  identifier: string;
  hash?: string;
  auxiliary?: boolean;
}
declare interface RenderManifestOptions {
  /**
   * the chunk used to render
   */
  chunk: Chunk;
  hash: string;
  fullHash: string;
  outputOptions: Output;
  codeGenerationResults: CodeGenerationResults;
  moduleTemplates: { javascript: ModuleTemplate };
  dependencyTemplates: DependencyTemplates;
  runtimeTemplate: RuntimeTemplate;
  moduleGraph: ModuleGraph;
  chunkGraph: ChunkGraph;
}

declare abstract class RequestShortener {
  contextify: (arg0: string) => string;
  shorten(request?: null | string): undefined | null | string;
}
declare interface ResolveBuildDependenciesResult {
  /**
   * list of files
   */
  files: Set<string>;

  /**
   * list of directories
   */
  directories: Set<string>;

  /**
   * list of missing entries
   */
  missing: Set<string>;

  /**
   * stored resolve results
   */
  resolveResults: Map<string, string | false>;

  /**
   * dependencies of the resolving
   */
  resolveDependencies: {
    /**
     * list of files
     */
    files: Set<string>;
    /**
     * list of directories
     */
    directories: Set<string>;
    /**
     * list of missing entries
     */
    missing: Set<string>;
  };
}

/**
 * Resolve context
 */
declare interface ResolveContext {
  contextDependencies?: WriteOnlySet<string>;

  /**
   * files that was found on file system
   */
  fileDependencies?: WriteOnlySet<string>;

  /**
   * dependencies that was not found on file system
   */
  missingDependencies?: WriteOnlySet<string>;

  /**
   * set of hooks' calls. For instance, `resolve → parsedResolve → describedResolve`,
   */
  stack?: Set<string>;

  /**
   * log function
   */
  log?: (arg0: string) => void;

  /**
   * yield result, if provided plugins can return several results
   */
  yield?: (arg0: ResolveRequest) => void;
}
declare interface ResolveData {
  contextInfo: ModuleFactoryCreateDataContextInfo;
  resolveOptions?: ResolveOptionsWebpackOptions;
  context: string;
  request: string;
  assertions?: Record<string, any>;
  dependencies: ModuleDependency[];
  dependencyType: string;
  createData: Partial<NormalModuleCreateData & { settings: ModuleSettings }>;
  fileDependencies: LazySet<string>;
  missingDependencies: LazySet<string>;
  contextDependencies: LazySet<string>;

  /**
   * allow to use the unsafe cache
   */
  cacheable: boolean;
}
declare interface ResolveOptionsTypes {
  alias: AliasOption[];
  fallback: AliasOption[];
  aliasFields: Set<string | string[]>;
  extensionAlias: ExtensionAliasOption[];
  cachePredicate: (arg0: ResolveRequest) => boolean;
  cacheWithContext: boolean;

  /**
   * A list of exports field condition names.
   */
  conditionNames: Set<string>;
  descriptionFiles: string[];
  enforceExtension: boolean;
  exportsFields: Set<string | string[]>;
  importsFields: Set<string | string[]>;
  extensions: Set<string>;
  fileSystem: FileSystem;
  unsafeCache: false | object;
  symlinks: boolean;
  resolver?: Resolver;
  modules: (string | string[])[];
  mainFields: { name: string[]; forceRelative: boolean }[];
  mainFiles: Set<string>;
  plugins: Plugin[];
  pnpApi: null | PnpApiImpl;
  roots: Set<string>;
  fullySpecified: boolean;
  resolveToContext: boolean;
  restrictions: Set<string | RegExp>;
  preferRelative: boolean;
  preferAbsolute: boolean;
}

/**
 * Options object for resolving requests.
 */

type ResolveOptionsWithDependencyType = ResolveOptionsWebpackOptions & {
  dependencyType?: string;
  resolveToContext?: boolean;
};

/**
 * Plugin instance.
 */
declare interface ResolvePluginInstance {
  [index: string]: any;

  /**
   * The run point of the plugin, required method.
   */
  apply: (resolver: Resolver) => void;
}
type ResolveRequest = BaseResolveRequest & Partial<ParsedIdentifier>;
declare interface ResolvedContextFileSystemInfoEntry {
  safeTime: number;
  timestampHash?: string;
}
declare interface ResolvedContextTimestampAndHash {
  safeTime: number;
  timestampHash?: string;
  hash: string;
}
declare abstract class Resolver {
  fileSystem: FileSystem;
  options: ResolveOptionsTypes;
  hooks: KnownHooks;
  ensureHook(
    name:
      | string
      | AsyncSeriesBailHook<
          [ResolveRequest, ResolveContext],
          null | ResolveRequest
        >,
  ): AsyncSeriesBailHook<
    [ResolveRequest, ResolveContext],
    null | ResolveRequest
  >;
  getHook(
    name:
      | string
      | AsyncSeriesBailHook<
          [ResolveRequest, ResolveContext],
          null | ResolveRequest
        >,
  ): AsyncSeriesBailHook<
    [ResolveRequest, ResolveContext],
    null | ResolveRequest
  >;
  resolveSync(context: object, path: string, request: string): string | false;
  resolve(
    context: object,
    path: string,
    request: string,
    resolveContext: ResolveContext,
    callback: (
      err: null | ErrorWithDetail,
      res?: string | false,
      req?: ResolveRequest,
    ) => void,
  ): void;
  doResolve(
    hook: AsyncSeriesBailHook<
      [ResolveRequest, ResolveContext],
      null | ResolveRequest
    >,
    request: ResolveRequest,
    message: null | string,
    resolveContext: ResolveContext,
    callback: (err?: null | Error, result?: ResolveRequest) => void,
  ): void;
  parse(identifier: string): ParsedIdentifier;
  isModule(path: string): boolean;
  isPrivate(path: string): boolean;
  isDirectory(path: string): boolean;
  join(path: string, request: string): string;
  normalize(path: string): string;
}
declare interface ResolverCache {
  direct: WeakMap<Object, ResolverWithOptions>;
  stringified: Map<string, ResolverWithOptions>;
}
declare abstract class ResolverFactory {
  hooks: Readonly<{
    resolveOptions: HookMap<
      SyncWaterfallHook<[ResolveOptionsWithDependencyType]>
    >;
    resolver: HookMap<
      SyncHook<[Resolver, UserResolveOptions, ResolveOptionsWithDependencyType]>
    >;
  }>;
  cache: Map<string, ResolverCache>;
  get(
    type: string,
    resolveOptions?: ResolveOptionsWithDependencyType,
  ): ResolverWithOptions;
}
type ResolverWithOptions = Resolver & WithOptions;

declare interface ResourceDataWithData {
  resource: string;
  path: string;
  query: string;
  fragment: string;
  context?: string;
  data: Record<string, any>;
}
type Rule = string | RegExp;
declare interface RuleSet {
  /**
   * map of references in the rule set (may grow over time)
   */
  references: Map<string, any>;

  /**
   * execute the rule set
   */
  exec: (arg0: object) => Effect[];
}

type RuleSetConditionOrConditions =
  | string
  | RegExp
  | ((value: string) => boolean)
  | RuleSetLogicalConditions
  | RuleSetCondition[];

/**
 * Logic operators used in a condition matcher.
 */
declare interface RuleSetLogicalConditions {
  /**
   * Logical AND.
   */
  and?: RuleSetCondition[];

  /**
   * Logical NOT.
   */
  not?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditions
    | RuleSetCondition[];

  /**
   * Logical OR.
   */
  or?: RuleSetCondition[];
}

/**
 * Logic operators used in a condition matcher.
 */
declare interface RuleSetLogicalConditionsAbsolute {
  /**
   * Logical AND.
   */
  and?: RuleSetConditionAbsolute[];

  /**
   * Logical NOT.
   */
  not?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditionsAbsolute
    | RuleSetConditionAbsolute[];

  /**
   * Logical OR.
   */
  or?: RuleSetConditionAbsolute[];
}

/**
 * A rule description with conditions and effects for modules.
 */

type RuleSetUse =
  | string
  | (
      | undefined
      | null
      | string
      | false
      | 0
      | {
          /**
           * Unique loader options identifier.
           */
          ident?: string;
          /**
           * Loader name.
           */
          loader?: string;
          /**
           * Loader options.
           */
          options?: string | { [index: string]: any };
        }
      | ((data: object) =>
          | string
          | {
              /**
               * Unique loader options identifier.
               */
              ident?: string;
              /**
               * Loader name.
               */
              loader?: string;
              /**
               * Loader options.
               */
              options?: string | { [index: string]: any };
            }
          | __TypeWebpackOptions
          | __Type_2[])
    )[]
  | ((data: {
      resource: string;
      realResource: string;
      resourceQuery: string;
      issuer: string;
      compiler: string;
    }) => __Type_2[])
  | {
      /**
       * Unique loader options identifier.
       */
      ident?: string;
      /**
       * Loader name.
       */
      loader?: string;
      /**
       * Loader options.
       */
      options?: string | { [index: string]: any };
    }
  | __TypeWebpackOptions;
type RuleSetUseItem =
  | string
  | {
      /**
       * Unique loader options identifier.
       */
      ident?: string;
      /**
       * Loader name.
       */
      loader?: string;
      /**
       * Loader options.
       */
      options?: string | { [index: string]: any };
    }
  | __TypeWebpackOptions;
declare class RuntimeChunkPlugin {
  constructor(options?: any);
  options: any;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
type RuntimeCondition = undefined | string | boolean | SortableSet<string>;
declare interface RuntimeRequirementsContext {
  /**
   * the chunk graph
   */
  chunkGraph: ChunkGraph;

  /**
   * the code generation results
   */
  codeGenerationResults: CodeGenerationResults;
}
type RuntimeSpec = undefined | string | SortableSet<string>;
declare class RuntimeSpecMap<T> {
  constructor(clone?: RuntimeSpecMap<T>);
  get(runtime: RuntimeSpec): undefined | T;
  has(runtime: RuntimeSpec): boolean;
  set(runtime: RuntimeSpec, value: T): void;
  provide(runtime: RuntimeSpec, computer: () => any): any;
  delete(runtime: RuntimeSpec): void;
  update(runtime: RuntimeSpec, fn: (arg0?: T) => T): void;
  keys(): RuntimeSpec[];
  values(): IterableIterator<T>;
  get size(): number;
}
declare class RuntimeSpecSet {
  constructor(iterable?: Iterable<RuntimeSpec>);
  add(runtime: RuntimeSpec): void;
  has(runtime: RuntimeSpec): boolean;
  get size(): number;
  [Symbol.iterator](): IterableIterator<RuntimeSpec>;
}
declare abstract class RuntimeValue {
  fn: (arg0: {
    module: NormalModule;
    key: string;
    readonly version?: string;
  }) => CodeValuePrimitive;
  options: true | RuntimeValueOptions;
  get fileDependencies(): true | string[];
  exec(
    parser: JavascriptParser,
    valueCacheVersions: Map<string, string | Set<string>>,
    key: string,
  ): CodeValuePrimitive;
  getCacheVersion(): undefined | string;
}
declare interface RuntimeValueOptions {
  fileDependencies?: string[];
  contextDependencies?: string[];
  missingDependencies?: string[];
  buildDependencies?: string[];
  version?: string | (() => string);
}

/**
 * Helper function for joining two ranges into a single range. This is useful
 * when working with AST nodes, as it allows you to combine the ranges of child nodes
 * to create the range of the _parent node_.
 */
declare interface ScopeInfo {
  definitions: StackedMap<string, ScopeInfo | VariableInfo>;
  topLevelScope: boolean | 'arrow';
  inShorthand: string | boolean;
  inTaggedTemplateTag: boolean;
  inTry: boolean;
  isStrict: boolean;
  isAsmJs: boolean;
}
declare interface Selector<A, B> {
  (input: A): B;
}
declare abstract class Serializer {
  serializeMiddlewares: any;
  deserializeMiddlewares: any;
  context: any;
  serialize(obj?: any, context?: any): any;
  deserialize(value?: any, context?: any): any;
}
type ServerOptionsHttps<
  Request extends typeof IncomingMessage = typeof IncomingMessage,
  Response extends typeof ServerResponse = typeof ServerResponse,
> = SecureContextOptions & TlsOptions & ServerOptionsImport<Request, Response>;
declare class SharePlugin {
  constructor(options: SharePluginOptions);

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}

/**
 * Options for shared modules.
 */
declare interface SharePluginOptions {
  /**
   * Share scope name used for all shared modules (defaults to 'default').
   */
  shareScope?: string;

  /**
   * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
   */
  shared: Shared;
}
type Shared = (string | SharedObject)[] | SharedObject;

/**
 * Advanced configuration for modules that should be shared in the share scope.
 */
declare interface SharedConfig {
  /**
   * Include the provided and fallback module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
   */
  eager?: boolean;

  /**
   * Provided module that should be provided to share scope. Also acts as fallback module if no shared module is found in share scope or version isn't valid. Defaults to the property name.
   */
  import?: string | false;

  /**
   * Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
   */
  packageName?: string;

  /**
   * Version requirement from module in share scope.
   */
  requiredVersion?: string | false;

  /**
   * Module is looked up under this key from the share scope.
   */
  shareKey?: string;

  /**
   * Share scope name.
   */
  shareScope?: string;

  /**
   * Allow only a single version of the shared module in share scope (disabled by default).
   */
  singleton?: boolean;

  /**
   * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
   */
  strictVersion?: boolean;

  /**
   * Version of the provided module. Will replace lower matching versions, but not higher.
   */
  version?: string | false;
}

/**
 * Modules that should be shared in the share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 */
declare interface SharedObject {
  [index: string]: string | SharedConfig;
}
declare class SideEffectsFlagPlugin {
  constructor(analyseSource?: boolean);

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
  static moduleHasSideEffects(
    moduleName: string,
    flagValue: undefined | string | boolean | string[],
    cache: Map<string, RegExp>,
  ): undefined | boolean;
}

declare abstract class Snapshot {
  startTime?: number;
  fileTimestamps?: Map<string, null | FileSystemInfoEntry>;
  fileHashes?: Map<string, null | string>;
  fileTshs?: Map<string, null | string | TimestampAndHash>;
  contextTimestamps?: Map<string, null | ResolvedContextFileSystemInfoEntry>;
  contextHashes?: Map<string, null | string>;
  contextTshs?: Map<string, null | ResolvedContextTimestampAndHash>;
  missingExistence?: Map<string, boolean>;
  managedItemInfo?: Map<string, string>;
  managedFiles?: Set<string>;
  managedContexts?: Set<string>;
  managedMissing?: Set<string>;
  children?: Set<Snapshot>;
  hasStartTime(): boolean;
  setStartTime(value?: any): void;
  setMergedStartTime(value?: any, snapshot?: any): void;
  hasFileTimestamps(): boolean;
  setFileTimestamps(value?: any): void;
  hasFileHashes(): boolean;
  setFileHashes(value?: any): void;
  hasFileTshs(): boolean;
  setFileTshs(value?: any): void;
  hasContextTimestamps(): boolean;
  setContextTimestamps(value?: any): void;
  hasContextHashes(): boolean;
  setContextHashes(value?: any): void;
  hasContextTshs(): boolean;
  setContextTshs(value?: any): void;
  hasMissingExistence(): boolean;
  setMissingExistence(value?: any): void;
  hasManagedItemInfo(): boolean;
  setManagedItemInfo(value?: any): void;
  hasManagedFiles(): boolean;
  setManagedFiles(value?: any): void;
  hasManagedContexts(): boolean;
  setManagedContexts(value?: any): void;
  hasManagedMissing(): boolean;
  setManagedMissing(value?: any): void;
  hasChildren(): boolean;
  setChildren(value?: any): void;
  addChild(child?: any): void;
  serialize(__0: ObjectSerializerContext): void;
  deserialize(__0: ObjectDeserializerContext): void;
  getFileIterable(): Iterable<string>;
  getContextIterable(): Iterable<string>;
  getMissingIterable(): Iterable<string>;
}
declare interface SnapshotOptionsFileSystemInfo {
  /**
   * should use hash to snapshot
   */
  hash?: boolean;

  /**
   * should use timestamp to snapshot
   */
  timestamp?: boolean;
}

/**
 * Options affecting how file system snapshots are created and validated.
 */
declare interface SnapshotOptionsWebpackOptions {
  /**
   * Options for snapshotting build dependencies to determine if the whole cache need to be invalidated.
   */
  buildDependencies?: {
    /**
     * Use hashes of the content of the files/directories to determine invalidation.
     */
    hash?: boolean;
    /**
     * Use timestamps of the files/directories to determine invalidation.
     */
    timestamp?: boolean;
  };

  /**
   * List of paths that are managed by a package manager and contain a version or hash in its path so all files are immutable.
   */
  immutablePaths?: (string | RegExp)[];

  /**
   * List of paths that are managed by a package manager and can be trusted to not be modified otherwise.
   */
  managedPaths?: (string | RegExp)[];

  /**
   * Options for snapshotting dependencies of modules to determine if they need to be built again.
   */
  module?: {
    /**
     * Use hashes of the content of the files/directories to determine invalidation.
     */
    hash?: boolean;
    /**
     * Use timestamps of the files/directories to determine invalidation.
     */
    timestamp?: boolean;
  };

  /**
   * Options for snapshotting dependencies of request resolving to determine if requests need to be re-resolved.
   */
  resolve?: {
    /**
     * Use hashes of the content of the files/directories to determine invalidation.
     */
    hash?: boolean;
    /**
     * Use timestamps of the files/directories to determine invalidation.
     */
    timestamp?: boolean;
  };

  /**
   * Options for snapshotting the resolving of build dependencies to determine if the build dependencies need to be re-resolved.
   */
  resolveBuildDependencies?: {
    /**
     * Use hashes of the content of the files/directories to determine invalidation.
     */
    hash?: boolean;
    /**
     * Use timestamps of the files/directories to determine invalidation.
     */
    timestamp?: boolean;
  };
}

declare interface SourceLike {
  source(): string | Buffer;
}
declare interface SourceMap {
  version: number;
  sources: string[];
  mappings: string;
  file?: string;
  sourceRoot?: string;
  sourcesContent?: string[];
  names?: string[];
}
declare class SourceMapDevToolPlugin {
  constructor(options?: SourceMapDevToolPluginOptions);
  sourceMapFilename: string | false;
  sourceMappingURLComment:
    | string
    | false
    | ((arg0: PathData, arg1?: AssetInfo) => string);
  moduleFilenameTemplate: string | Function;
  fallbackModuleFilenameTemplate: string | Function;
  namespace: string;
  options: SourceMapDevToolPluginOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface SourceMapDevToolPluginOptions {
  /**
   * Appends the given value to the original asset. Usually the #sourceMappingURL comment. [url] is replaced with a URL to the source map file. false disables the appending.
   */
  append?:
    | null
    | string
    | false
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Indicates whether column mappings should be used (defaults to true).
   */
  columns?: boolean;

  /**
   * Exclude modules that match the given value from source map generation.
   */
  exclude?: string | RegExp | Rule[];

  /**
   * Generator string or function to create identifiers of modules for the 'sources' array in the SourceMap used only if 'moduleFilenameTemplate' would result in a conflict.
   */
  fallbackModuleFilenameTemplate?: string | Function;

  /**
   * Path prefix to which the [file] placeholder is relative to.
   */
  fileContext?: string;

  /**
   * Defines the output filename of the SourceMap (will be inlined if no value is provided).
   */
  filename?: null | string | false;

  /**
   * Include source maps for module paths that match the given value.
   */
  include?: string | RegExp | Rule[];

  /**
   * Indicates whether SourceMaps from loaders should be used (defaults to true).
   */
  module?: boolean;

  /**
   * Generator string or function to create identifiers of modules for the 'sources' array in the SourceMap.
   */
  moduleFilenameTemplate?: string | Function;

  /**
   * Namespace prefix to allow multiple webpack roots in the devtools.
   */
  namespace?: string;

  /**
   * Omit the 'sourceContents' array from the SourceMap.
   */
  noSources?: boolean;

  /**
   * Provide a custom public path for the SourceMapping comment.
   */
  publicPath?: string;

  /**
   * Provide a custom value for the 'sourceRoot' property in the SourceMap.
   */
  sourceRoot?: string;

  /**
   * Include source maps for modules based on their extension (defaults to .js and .css).
   */
  test?: string | RegExp | Rule[];
}

declare interface SourcePosition {
  line: number;
  column?: number;
}
declare interface SplitChunksOptions {
  chunksFilter: (chunk: Chunk) => undefined | boolean;
  defaultSizeTypes: string[];
  minSize: SplitChunksSizes;
  minSizeReduction: SplitChunksSizes;
  minRemainingSize: SplitChunksSizes;
  enforceSizeThreshold: SplitChunksSizes;
  maxInitialSize: SplitChunksSizes;
  maxAsyncSize: SplitChunksSizes;
  minChunks: number;
  maxAsyncRequests: number;
  maxInitialRequests: number;
  hidePathInfo: boolean;
  filename: string | ((arg0: PathData, arg1?: AssetInfo) => string);
  automaticNameDelimiter: string;
  getCacheGroups: (
    module: Module,
    context: CacheGroupsContext,
  ) => CacheGroupSource[];
  getName: (
    module?: Module,
    chunks?: Chunk[],
    key?: string,
  ) => undefined | string;
  usedExports: boolean;
  fallbackCacheGroup: FallbackCacheGroup;
}
declare class SplitChunksPlugin {
  constructor(options?: OptimizationSplitChunksOptions);
  options: SplitChunksOptions;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface SplitChunksSizes {
  [index: string]: number;
}
declare abstract class StackedMap<K, V> {
  map: Map<K, InternalCell<V>>;
  stack: Map<K, InternalCell<V>>[];
  set(item: K, value: V): void;
  delete(item: K): void;
  has(item: K): boolean;
  get(item: K): Cell<V>;
  asArray(): K[];
  asSet(): Set<K>;
  asPairArray(): [K, Cell<V>][];
  asMap(): Map<K, Cell<V>>;
  get size(): number;
  createChild(): StackedMap<K, V>;
}
type StartupRenderContext = RenderContext & { inlined: boolean };
type Statement =
  | FunctionDeclaration
  | VariableDeclaration
  | ClassDeclaration
  | ExpressionStatement
  | BlockStatement
  | StaticBlock
  | EmptyStatement
  | DebuggerStatement
  | WithStatement
  | ReturnStatement
  | LabeledStatement
  | BreakStatement
  | ContinueStatement
  | IfStatement
  | SwitchStatement
  | ThrowStatement
  | TryStatement
  | WhileStatement
  | DoWhileStatement
  | ForStatement
  | ForInStatement
  | ForOfStatement;
declare class Stats {
  constructor(compilation: Compilation);
  compilation: Compilation;
  get hash(): string;
  get startTime(): any;
  get endTime(): any;
  hasWarnings(): boolean;
  hasErrors(): boolean;
  toJson(options?: string | StatsOptions): StatsCompilation;
  toString(options?: any): string;
}
type StatsAsset = KnownStatsAsset & Record<string, any>;
type StatsChunk = KnownStatsChunk & Record<string, any>;
type StatsChunkGroup = KnownStatsChunkGroup & Record<string, any>;
type StatsChunkOrigin = KnownStatsChunkOrigin & Record<string, any>;
type StatsCompilation = KnownStatsCompilation & Record<string, any>;
type StatsError = KnownStatsError & Record<string, any>;
declare abstract class StatsFactory {
  hooks: Readonly<{
    extract: HookMap<SyncBailHook<[Object, any, StatsFactoryContext], any>>;
    filter: HookMap<
      SyncBailHook<[any, StatsFactoryContext, number, number], any>
    >;
    sort: HookMap<
      SyncBailHook<
        [((arg0?: any, arg1?: any) => number)[], StatsFactoryContext],
        any
      >
    >;
    filterSorted: HookMap<
      SyncBailHook<[any, StatsFactoryContext, number, number], any>
    >;
    groupResults: HookMap<
      SyncBailHook<[GroupConfig[], StatsFactoryContext], any>
    >;
    sortResults: HookMap<
      SyncBailHook<
        [((arg0?: any, arg1?: any) => number)[], StatsFactoryContext],
        any
      >
    >;
    filterResults: HookMap<
      SyncBailHook<[any, StatsFactoryContext, number, number], any>
    >;
    merge: HookMap<SyncBailHook<[any[], StatsFactoryContext], any>>;
    result: HookMap<SyncBailHook<[any[], StatsFactoryContext], any>>;
    getItemName: HookMap<SyncBailHook<[any, StatsFactoryContext], any>>;
    getItemFactory: HookMap<SyncBailHook<[any, StatsFactoryContext], any>>;
  }>;
  create(
    type: string,
    data: any,
    baseContext: Omit<StatsFactoryContext, 'type'>,
  ): any;
}
type StatsFactoryContext = KnownStatsFactoryContext & Record<string, any>;
type StatsLogging = KnownStatsLogging & Record<string, any>;
type StatsLoggingEntry = KnownStatsLoggingEntry & Record<string, any>;
type StatsModule = KnownStatsModule & Record<string, any>;
type StatsModuleIssuer = KnownStatsModuleIssuer & Record<string, any>;
type StatsModuleReason = KnownStatsModuleReason & Record<string, any>;
type StatsModuleTraceDependency = KnownStatsModuleTraceDependency &
  Record<string, any>;
type StatsModuleTraceItem = KnownStatsModuleTraceItem & Record<string, any>;

/**
 * Stats options object.
 */
declare abstract class StatsPrinter {
  hooks: Readonly<{
    sortElements: HookMap<SyncBailHook<[string[], StatsPrinterContext], true>>;
    printElements: HookMap<
      SyncBailHook<[PrintedElement[], StatsPrinterContext], string>
    >;
    sortItems: HookMap<SyncBailHook<[any[], StatsPrinterContext], true>>;
    getItemName: HookMap<SyncBailHook<[any, StatsPrinterContext], string>>;
    printItems: HookMap<SyncBailHook<[string[], StatsPrinterContext], string>>;
    print: HookMap<SyncBailHook<[{}, StatsPrinterContext], string>>;
    result: HookMap<SyncWaterfallHook<[string, StatsPrinterContext]>>;
  }>;
  print(type: string, object: Object, baseContext?: Object): string;
}
type StatsPrinterContext = KnownStatsPrinterContext & Record<string, any>;
type StatsProfile = KnownStatsProfile & Record<string, any>;
type StatsValue =
  | boolean
  | StatsOptions
  | 'none'
  | 'verbose'
  | 'summary'
  | 'errors-only'
  | 'errors-warnings'
  | 'minimal'
  | 'normal'
  | 'detailed';
declare class SyncModuleIdsPlugin {
  constructor(__0: {
    /**
     * path to file
     */
    path: string;
    /**
     * context for module names
     */
    context?: string;
    /**
     * selector for modules
     */
    test: (arg0: Module) => boolean;
    /**
     * operation mode (defaults to merge)
     */
    mode?: 'read' | 'merge' | 'create' | 'update';
  });

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface SyntheticDependencyLocation {
  name: string;
  index?: number;
}
declare const TOMBSTONE: unique symbol;
declare const TRANSITIVE: unique symbol;
declare const TRANSITIVE_ONLY: unique symbol;

/**
 * Helper function for joining two ranges into a single range. This is useful
 * when working with AST nodes, as it allows you to combine the ranges of child nodes
 * to create the range of the _parent node_.
 */
declare interface TagInfo {
  tag: any;
  data: any;
  next?: TagInfo;
}
declare interface TimestampAndHash {
  safeTime: number;
  timestamp?: number;
  hash: string;
}
declare class TopLevelSymbol {
  constructor(name: string);
  name: string;
}

/**
 * Use a Trusted Types policy to create urls for chunks.
 */
declare interface TrustedTypes {
  /**
   * If the call to `trustedTypes.createPolicy(...)` fails -- e.g., due to the policy name missing from the CSP `trusted-types` list, or it being a duplicate name, etc. -- controls whether to continue with loading in the hope that `require-trusted-types-for 'script'` isn't enforced yet, versus fail immediately. Default behavior is 'stop'.
   */
  onPolicyCreationFailure?: 'continue' | 'stop';

  /**
   * The name of the Trusted Types policy created by webpack to serve bundle chunks.
   */
  policyName?: string;
}
declare const UNDEFINED_MARKER: unique symbol;
declare interface UpdateHashContextDependency {
  chunkGraph: ChunkGraph;
  runtime: RuntimeSpec;
  runtimeTemplate?: RuntimeTemplate;
}
declare interface UpdateHashContextGenerator {
  /**
   * the module
   */
  module: NormalModule;
  chunkGraph: ChunkGraph;
  runtime: RuntimeSpec;
  runtimeTemplate?: RuntimeTemplate;
}
type UsageStateType = 0 | 1 | 2 | 3 | 4;
declare interface UserResolveOptions {
  /**
   * A list of module alias configurations or an object which maps key to value
   */
  alias?: AliasOption[] | AliasOptions;

  /**
   * A list of module alias configurations or an object which maps key to value, applied only after modules option
   */
  fallback?: AliasOption[] | AliasOptions;

  /**
   * An object which maps extension to extension aliases
   */
  extensionAlias?: ExtensionAliasOptions;

  /**
   * A list of alias fields in description files
   */
  aliasFields?: (string | string[])[];

  /**
   * A function which decides whether a request should be cached or not. An object is passed with at least `path` and `request` properties.
   */
  cachePredicate?: (arg0: ResolveRequest) => boolean;

  /**
   * Whether or not the unsafeCache should include request context as part of the cache key.
   */
  cacheWithContext?: boolean;

  /**
   * A list of description files to read from
   */
  descriptionFiles?: string[];

  /**
   * A list of exports field condition names.
   */
  conditionNames?: string[];

  /**
   * Enforce that a extension from extensions must be used
   */
  enforceExtension?: boolean;

  /**
   * A list of exports fields in description files
   */
  exportsFields?: (string | string[])[];

  /**
   * A list of imports fields in description files
   */
  importsFields?: (string | string[])[];

  /**
   * A list of extensions which should be tried for files
   */
  extensions?: string[];

  /**
   * The file system which should be used
   */
  fileSystem: FileSystem;

  /**
   * Use this cache object to unsafely cache the successful requests
   */
  unsafeCache?: boolean | object;

  /**
   * Resolve symlinks to their symlinked location
   */
  symlinks?: boolean;

  /**
   * A prepared Resolver to which the plugins are attached
   */
  resolver?: Resolver;

  /**
   * A list of directories to resolve modules from, can be absolute path or folder name
   */
  modules?: string | string[];

  /**
   * A list of main fields in description files
   */
  mainFields?: (
    | string
    | string[]
    | { name: string | string[]; forceRelative: boolean }
  )[];

  /**
   * A list of main files in directories
   */
  mainFiles?: string[];

  /**
   * A list of additional resolve plugins which should be applied
   */
  plugins?: Plugin[];

  /**
   * A PnP API that should be used - null is "never", undefined is "auto"
   */
  pnpApi?: null | PnpApiImpl;

  /**
   * A list of root paths
   */
  roots?: string[];

  /**
   * The request is already fully specified and no extensions or directories are resolved for it
   */
  fullySpecified?: boolean;

  /**
   * Resolve to a context instead of a file
   */
  resolveToContext?: boolean;

  /**
   * A list of resolve restrictions
   */
  restrictions?: (string | RegExp)[];

  /**
   * Use only the sync constraints of the file system calls
   */
  useSyncFileSystemCalls?: boolean;

  /**
   * Prefer to resolve module requests as relative requests before falling back to modules
   */
  preferRelative?: boolean;

  /**
   * Prefer to resolve server-relative urls as absolute paths before falling back to resolve in roots
   */
  preferAbsolute?: boolean;
}
declare abstract class VariableInfo {
  declaredScope: ScopeInfo;
  freeName?: string | true;
  tagInfo?: TagInfo;
}
declare interface VariableInfoInterface {
  declaredScope: ScopeInfo;
  freeName: string | true;
  tagInfo?: TagInfo;
}
type WarningFilterItemTypes =
  | string
  | RegExp
  | ((warning: StatsError, value: string) => boolean);
declare interface WatchFileSystem {
  watch: (
    files: Iterable<string>,
    directories: Iterable<string>,
    missing: Iterable<string>,
    startTime: number,
    options: WatchOptions,
    callback: (
      arg0: undefined | Error,
      arg1: Map<string, FileSystemInfoEntry | 'ignore'>,
      arg2: Map<string, FileSystemInfoEntry | 'ignore'>,
      arg3: Set<string>,
      arg4: Set<string>,
    ) => void,
    callbackUndelayed: (arg0: string, arg1: number) => void,
  ) => Watcher;
}
declare class WatchIgnorePlugin {
  constructor(options: WatchIgnorePluginOptions);
  paths: (string | RegExp)[];

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}
declare interface WatchIgnorePluginOptions {
  /**
   * A list of RegExps or absolute paths to directories or files that should be ignored.
   */
  paths: (string | RegExp)[];
}

/**
 * Options for the watcher.
 */
declare interface WatchOptions {
  /**
   * Delay the rebuilt after the first change. Value is a time in ms.
   */
  aggregateTimeout?: number;

  /**
   * Resolve symlinks and watch symlink and real file. This is usually not needed as webpack already resolves symlinks ('resolve.symlinks').
   */
  followSymlinks?: boolean;

  /**
   * Ignore some files from watching (glob pattern or regexp).
   */
  ignored?: string | RegExp | string[];

  /**
   * Enable polling mode for watching.
   */
  poll?: number | boolean;

  /**
   * Stop watching when stdin stream has ended.
   */
  stdin?: boolean;
}
declare interface Watcher {
  /**
   * closes the watcher and all underlying file watchers
   */
  close: () => void;

  /**
   * closes the watcher, but keeps underlying file watchers alive until the next watch call
   */
  pause: () => void;

  /**
   * get current aggregated changes that have not yet send to callback
   */
  getAggregatedChanges?: () => Set<string>;

  /**
   * get current aggregated removals that have not yet send to callback
   */
  getAggregatedRemovals?: () => Set<string>;

  /**
   * get info about files
   */
  getFileTimeInfoEntries: () => Map<string, FileSystemInfoEntry | 'ignore'>;

  /**
   * get info about directories
   */
  getContextTimeInfoEntries: () => Map<string, FileSystemInfoEntry | 'ignore'>;

  /**
   * get info about timestamps and changes
   */
  getInfo?: () => WatcherInfo;
}
declare interface WatcherInfo {
  /**
   * get current aggregated changes that have not yet send to callback
   */
  changes: Set<string>;

  /**
   * get current aggregated removals that have not yet send to callback
   */
  removals: Set<string>;

  /**
   * get info about files
   */
  fileTimeInfoEntries: Map<string, FileSystemInfoEntry | 'ignore'>;

  /**
   * get info about directories
   */
  contextTimeInfoEntries: Map<string, FileSystemInfoEntry | 'ignore'>;
}
declare abstract class Watching {
  startTime: null | number;
  invalid: boolean;
  handler: CallbackFunction<Stats>;
  callbacks: CallbackFunction<void>[];
  closed: boolean;
  suspended: boolean;
  blocked: boolean;
  watchOptions: {
    /**
     * Delay the rebuilt after the first change. Value is a time in ms.
     */
    aggregateTimeout?: number;
    /**
     * Resolve symlinks and watch symlink and real file. This is usually not needed as webpack already resolves symlinks ('resolve.symlinks').
     */
    followSymlinks?: boolean;
    /**
     * Ignore some files from watching (glob pattern or regexp).
     */
    ignored?: string | RegExp | string[];
    /**
     * Enable polling mode for watching.
     */
    poll?: number | boolean;
    /**
     * Stop watching when stdin stream has ended.
     */
    stdin?: boolean;
  };
  compiler: Compiler;
  running: boolean;
  watcher?: null | Watcher;
  pausedWatcher?: null | Watcher;
  lastWatcherStartTime?: number;
  watch(
    files: Iterable<string>,
    dirs: Iterable<string>,
    missing: Iterable<string>,
  ): void;
  invalidate(callback?: CallbackFunction<void>): void;
  suspend(): void;
  resume(): void;
  close(callback: CallbackFunction<void>): void;
}
declare abstract class WeakTupleMap<T extends any[], V> {
  set(...args: [T, ...V[]]): void;
  has(...args: T): boolean;
  get(...args: T): V;
  provide(...args: [T, ...(() => V)[]]): V;
  delete(...args: T): void;
  clear(): void;
}
declare interface WebAssemblyRenderContext {
  /**
   * the chunk
   */
  chunk: Chunk;

  /**
   * the dependency templates
   */
  dependencyTemplates: DependencyTemplates;

  /**
   * the runtime template
   */
  runtimeTemplate: RuntimeTemplate;

  /**
   * the module graph
   */
  moduleGraph: ModuleGraph;

  /**
   * the chunk graph
   */
  chunkGraph: ChunkGraph;

  /**
   * results of code generation
   */
  codeGenerationResults: CodeGenerationResults;
}
declare class WebWorkerTemplatePlugin {
  constructor();

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}

declare abstract class WebpackLogger {
  getChildLogger: (arg0: string | (() => string)) => WebpackLogger;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  log(...args: any[]): void;
  debug(...args: any[]): void;
  assert(assertion: any, ...args: any[]): void;
  trace(): void;
  clear(): void;
  status(...args: any[]): void;
  group(...args: any[]): void;
  groupCollapsed(...args: any[]): void;
  groupEnd(...args: any[]): void;
  profile(label?: any): void;
  profileEnd(label?: any): void;
  time(label?: any): void;
  timeLog(label?: any): void;
  timeEnd(label?: any): void;
  timeAggregate(label?: any): void;
  timeAggregateEnd(label?: any): void;
}
declare class WebpackOptionsApply extends OptionsApply {
  constructor();
}
declare class WebpackOptionsDefaulter {
  constructor();
  process(options: Configuration): WebpackOptionsNormalized;
}

declare interface WithId {
  id: string | number;
}
declare interface WithOptions {
  /**
   * create a resolver with additional/different options
   */
  withOptions: (
    arg0: Partial<ResolveOptionsWithDependencyType>,
  ) => ResolverWithOptions;
}
declare interface WriteOnlySet<T> {
  add: (item: T) => void;
}
type __TypeWebpackOptions = (data: object) =>
  | string
  | {
      /**
       * Unique loader options identifier.
       */
      ident?: string;
      /**
       * Loader name.
       */
      loader?: string;
      /**
       * Loader options.
       */
      options?: string | { [index: string]: any };
    }
  | __TypeWebpackOptions
  | __Type_2[];
type __Type_2 =
  | undefined
  | null
  | string
  | false
  | 0
  | {
      /**
       * Unique loader options identifier.
       */
      ident?: string;
      /**
       * Loader name.
       */
      loader?: string;
      /**
       * Loader options.
       */
      options?: string | { [index: string]: any };
    }
  | ((data: object) =>
      | string
      | {
          /**
           * Unique loader options identifier.
           */
          ident?: string;
          /**
           * Loader name.
           */
          loader?: string;
          /**
           * Loader options.
           */
          options?: string | { [index: string]: any };
        }
      | __TypeWebpackOptions
      | __Type_2[]);
declare function exports(
  options: Configuration,
  callback?: CallbackWebpack<Stats>,
): Compiler;
declare function exports(
  options: ReadonlyArray<Configuration> & MultiCompilerOptions,
  callback?: CallbackWebpack<MultiStats>,
): MultiCompiler;
declare namespace exports {
  export const webpack: {
    (options: Configuration, callback?: CallbackWebpack<Stats>): Compiler;
    (
      options: ReadonlyArray<Configuration> & MultiCompilerOptions,
      callback?: CallbackWebpack<MultiStats>,
    ): MultiCompiler;
  };
  export const validate: (options?: any) => void;
  export const validateSchema: (
    schema: Parameters<typeof validateFunction>[0],
    options: Parameters<typeof validateFunction>[1],
    validationConfiguration?: ValidationErrorConfiguration,
  ) => void;
  export const version: string;
  export namespace cli {
    export let getArguments: (schema?: any) => Record<string, Argument>;
    export let processArguments: (
      args: Record<string, Argument>,
      config: any,
      values: Record<
        string,
        | string
        | number
        | boolean
        | RegExp
        | (string | number | boolean | RegExp)[]
      >,
    ) => null | Problem[];
  }
  export namespace ModuleFilenameHelpers {
    export let ALL_LOADERS_RESOURCE: string;
    export let REGEXP_ALL_LOADERS_RESOURCE: RegExp;
    export let LOADERS_RESOURCE: string;
    export let REGEXP_LOADERS_RESOURCE: RegExp;
    export let RESOURCE: string;
    export let REGEXP_RESOURCE: RegExp;
    export let ABSOLUTE_RESOURCE_PATH: string;
    export let REGEXP_ABSOLUTE_RESOURCE_PATH: RegExp;
    export let RESOURCE_PATH: string;
    export let REGEXP_RESOURCE_PATH: RegExp;
    export let ALL_LOADERS: string;
    export let REGEXP_ALL_LOADERS: RegExp;
    export let LOADERS: string;
    export let REGEXP_LOADERS: RegExp;
    export let QUERY: string;
    export let REGEXP_QUERY: RegExp;
    export let ID: string;
    export let REGEXP_ID: RegExp;
    export let HASH: string;
    export let REGEXP_HASH: RegExp;
    export let NAMESPACE: string;
    export let REGEXP_NAMESPACE: RegExp;
    export let createFilename: (
      module: string | Module,
      options: any,
      __2: {
        /**
         * requestShortener
         */
        requestShortener: RequestShortener;
        /**
         * chunk graph
         */
        chunkGraph: ChunkGraph;
        /**
         * the hash function to use
         */
        hashFunction: string | typeof Hash;
      },
    ) => string;
    export let replaceDuplicates: <T>(
      array: T[],
      fn: (
        duplicateItem: T,
        duplicateItemIndex: number,
        numberOfTimesReplaced: number,
      ) => T,
      comparator?: (firstElement: T, nextElement: T) => 0 | 1 | -1,
    ) => T[];
    export let matchPart: (str: string, test: Matcher) => boolean;
    export let matchObject: (obj: MatchObject, str: string) => boolean;
  }
  export namespace RuntimeGlobals {
    export let require: '__webpack_require__';
    export let requireScope: '__webpack_require__.*';
    export let exports: '__webpack_exports__';
    export let thisAsExports: 'top-level-this-exports';
    export let returnExportsFromRuntime: 'return-exports-from-runtime';
    export let module: 'module';
    export let moduleId: 'module.id';
    export let moduleLoaded: 'module.loaded';
    export let publicPath: '__webpack_require__.p';
    export let entryModuleId: '__webpack_require__.s';
    export let moduleCache: '__webpack_require__.c';
    export let moduleFactories: '__webpack_require__.m';
    export let moduleFactoriesAddOnly: '__webpack_require__.m (add only)';
    export let ensureChunk: '__webpack_require__.e';
    export let ensureChunkHandlers: '__webpack_require__.f';
    export let ensureChunkIncludeEntries: '__webpack_require__.f (include entries)';
    export let prefetchChunk: '__webpack_require__.E';
    export let prefetchChunkHandlers: '__webpack_require__.F';
    export let preloadChunk: '__webpack_require__.G';
    export let preloadChunkHandlers: '__webpack_require__.H';
    export let definePropertyGetters: '__webpack_require__.d';
    export let makeNamespaceObject: '__webpack_require__.r';
    export let createFakeNamespaceObject: '__webpack_require__.t';
    export let compatGetDefaultExport: '__webpack_require__.n';
    export let harmonyModuleDecorator: '__webpack_require__.hmd';
    export let nodeModuleDecorator: '__webpack_require__.nmd';
    export let getFullHash: '__webpack_require__.h';
    export let wasmInstances: '__webpack_require__.w';
    export let instantiateWasm: '__webpack_require__.v';
    export let uncaughtErrorHandler: '__webpack_require__.oe';
    export let scriptNonce: '__webpack_require__.nc';
    export let loadScript: '__webpack_require__.l';
    export let createScript: '__webpack_require__.ts';
    export let createScriptUrl: '__webpack_require__.tu';
    export let getTrustedTypesPolicy: '__webpack_require__.tt';
    export let hasFetchPriority: 'has fetch priority';
    export let chunkName: '__webpack_require__.cn';
    export let runtimeId: '__webpack_require__.j';
    export let getChunkScriptFilename: '__webpack_require__.u';
    export let getChunkCssFilename: '__webpack_require__.k';
    export let hasCssModules: 'has css modules';
    export let getChunkUpdateScriptFilename: '__webpack_require__.hu';
    export let getChunkUpdateCssFilename: '__webpack_require__.hk';
    export let startup: '__webpack_require__.x';
    export let startupNoDefault: '__webpack_require__.x (no default handler)';
    export let startupOnlyAfter: '__webpack_require__.x (only after)';
    export let startupOnlyBefore: '__webpack_require__.x (only before)';
    export let chunkCallback: 'webpackChunk';
    export let startupEntrypoint: '__webpack_require__.X';
    export let onChunksLoaded: '__webpack_require__.O';
    export let externalInstallChunk: '__webpack_require__.C';
    export let interceptModuleExecution: '__webpack_require__.i';
    export let global: '__webpack_require__.g';
    export let shareScopeMap: '__webpack_require__.S';
    export let initializeSharing: '__webpack_require__.I';
    export let currentRemoteGetScope: '__webpack_require__.R';
    export let getUpdateManifestFilename: '__webpack_require__.hmrF';
    export let hmrDownloadManifest: '__webpack_require__.hmrM';
    export let hmrDownloadUpdateHandlers: '__webpack_require__.hmrC';
    export let hmrModuleData: '__webpack_require__.hmrD';
    export let hmrInvalidateModuleHandlers: '__webpack_require__.hmrI';
    export let hmrRuntimeStatePrefix: '__webpack_require__.hmrS';
    export let amdDefine: '__webpack_require__.amdD';
    export let amdOptions: '__webpack_require__.amdO';
    export let system: '__webpack_require__.System';
    export let hasOwnProperty: '__webpack_require__.o';
    export let systemContext: '__webpack_require__.y';
    export let baseURI: '__webpack_require__.b';
    export let relativeUrl: '__webpack_require__.U';
    export let asyncModule: '__webpack_require__.a';
  }
  export const UsageState: Readonly<{
    Unused: 0;
    OnlyPropertiesUsed: 1;
    NoInfo: 2;
    Unknown: 3;
    Used: 4;
  }>;
  export namespace cache {
    export { MemoryCachePlugin };
  }
  export namespace config {
    export const getNormalizedWebpackOptions: (
      config: Configuration,
    ) => WebpackOptionsNormalized;
    export const applyWebpackOptionsDefaults: (
      options: WebpackOptionsNormalized,
    ) => void;
  }
  export namespace dependencies {
    export {
      ModuleDependency,
      HarmonyImportDependency,
      ConstDependency,
      NullDependency,
    };
  }
  export namespace ids {
    export {
      ChunkModuleIdRangePlugin,
      NaturalModuleIdsPlugin,
      OccurrenceModuleIdsPlugin,
      NamedModuleIdsPlugin,
      DeterministicChunkIdsPlugin,
      DeterministicModuleIdsPlugin,
      NamedChunkIdsPlugin,
      OccurrenceChunkIdsPlugin,
      HashedModuleIdsPlugin,
    };
  }
  export namespace javascript {
    export {
      EnableChunkLoadingPlugin,
      JavascriptModulesPlugin,
      JavascriptParser,
    };
  }
  export namespace optimize {
    export namespace InnerGraph {
      export let bailout: (parserState: ParserState) => void;
      export let enable: (parserState: ParserState) => void;
      export let isEnabled: (parserState: ParserState) => boolean;
      export let addUsage: (
        state: ParserState,
        symbol: null | TopLevelSymbol,
        usage: string | true | TopLevelSymbol,
      ) => void;
      export let addVariableUsage: (
        parser: JavascriptParser,
        name: string,
        usage: string | true | TopLevelSymbol,
      ) => void;
      export let inferDependencyUsage: (state: ParserState) => void;
      export let onUsage: (
        state: ParserState,
        onUsageCallback: (arg0?: boolean | Set<string>) => void,
      ) => void;
      export let setTopLevelSymbol: (
        state: ParserState,
        symbol?: TopLevelSymbol,
      ) => void;
      export let getTopLevelSymbol: (
        state: ParserState,
      ) => void | TopLevelSymbol;
      export let tagTopLevelSymbol: (
        parser: JavascriptParser,
        name: string,
      ) => undefined | TopLevelSymbol;
      export let isDependencyUsedByExports: (
        dependency: Dependency,
        usedByExports: boolean | Set<string>,
        moduleGraph: ModuleGraph,
        runtime: RuntimeSpec,
      ) => boolean;
      export let getDependencyUsedByExportsCondition: (
        dependency: Dependency,
        usedByExports: undefined | boolean | Set<string>,
        moduleGraph: ModuleGraph,
      ) =>
        | null
        | false
        | ((arg0: ModuleGraphConnection, arg1: RuntimeSpec) => ConnectionState);
      export { TopLevelSymbol, topLevelSymbolTag };
    }
    export {
      AggressiveMergingPlugin,
      AggressiveSplittingPlugin,
      LimitChunkCountPlugin,
      MinChunkSizePlugin,
      ModuleConcatenationPlugin,
      RealContentHashPlugin,
      RuntimeChunkPlugin,
      SideEffectsFlagPlugin,
      SplitChunksPlugin,
    };
  }
  export namespace runtime {
    export { GetChunkFilenameRuntimeModule, LoadScriptRuntimeModule };
  }
  export namespace prefetch {
    export { ChunkPrefetchPreloadPlugin };
  }
  export namespace web {
    export {
      FetchCompileAsyncWasmPlugin,
      FetchCompileWasmPlugin,
      JsonpChunkLoadingRuntimeModule,
      JsonpTemplatePlugin,
    };
  }
  export namespace webworker {
    export { WebWorkerTemplatePlugin };
  }
  export namespace node {
    export {
      NodeEnvironmentPlugin,
      NodeSourcePlugin,
      NodeTargetPlugin,
      NodeTemplatePlugin,
      ReadFileCompileWasmPlugin,
    };
  }
  export namespace electron {
    export { ElectronTargetPlugin };
  }
  export namespace wasm {
    export { AsyncWebAssemblyModulesPlugin, EnableWasmLoadingPlugin };
  }
  export namespace library {
    export { AbstractLibraryPlugin, EnableLibraryPlugin };
  }
  export namespace container {
    export const scope: <T>(
      scope: string,
      options: ContainerOptionsFormat<T>,
    ) => Record<string, string | string[] | T>;
    export {
      ContainerPlugin,
      ContainerReferencePlugin,
      ModuleFederationPlugin,
    };
  }
  export namespace sharing {
    export const scope: <T>(
      scope: string,
      options: ContainerOptionsFormat<T>,
    ) => Record<string, string | string[] | T>;
    export { ConsumeSharedPlugin, ProvideSharedPlugin, SharePlugin };
  }
  export namespace debug {
    export { ProfilingPlugin };
  }
  export namespace util {
    export const createHash: (algorithm?: string | typeof Hash) => Hash;
    export namespace comparators {
      export let compareChunksById: (a: Chunk, b: Chunk) => 0 | 1 | -1;
      export let compareModulesByIdentifier: (
        a: Module,
        b: Module,
      ) => 0 | 1 | -1;
      export let compareModulesById: ParameterizedComparator<
        ChunkGraph,
        Module
      >;
      export let compareNumbers: (a: number, b: number) => 0 | 1 | -1;
      export let compareStringsNumeric: (a: string, b: string) => 0 | 1 | -1;
      export let compareModulesByPostOrderIndexOrIdentifier: ParameterizedComparator<
        ModuleGraph,
        Module
      >;
      export let compareModulesByPreOrderIndexOrIdentifier: ParameterizedComparator<
        ModuleGraph,
        Module
      >;
      export let compareModulesByIdOrIdentifier: ParameterizedComparator<
        ChunkGraph,
        Module
      >;
      export let compareChunks: ParameterizedComparator<ChunkGraph, Chunk>;
      export let compareIds: (
        a: string | number,
        b: string | number,
      ) => 0 | 1 | -1;
      export let compareStrings: (a: string, b: string) => 0 | 1 | -1;
      export let compareChunkGroupsByIndex: (
        a: ChunkGroup,
        b: ChunkGroup,
      ) => 0 | 1 | -1;
      export let concatComparators: <T>(
        c1: Comparator<T>,
        c2: Comparator<T>,
        ...cRest: Comparator<T>[]
      ) => Comparator<T>;
      export let compareSelect: <T, R>(
        getter: Selector<T, R>,
        comparator: Comparator<R>,
      ) => Comparator<T>;
      export let compareIterables: <T>(
        elementComparator: Comparator<T>,
      ) => Comparator<Iterable<T>>;
      export let keepOriginalOrder: <T>(iterable: Iterable<T>) => Comparator<T>;
      export let compareChunksNatural: (
        chunkGraph: ChunkGraph,
      ) => Comparator<Chunk>;
      export let compareLocations: (
        a: DependencyLocation,
        b: DependencyLocation,
      ) => 0 | 1 | -1;
    }
    export namespace runtime {
      export let getEntryRuntime: (
        compilation: Compilation,
        name: string,
        options?: EntryOptions,
      ) => RuntimeSpec;
      export let forEachRuntime: (
        runtime: RuntimeSpec,
        fn: (arg0?: string) => void,
        deterministicOrder?: boolean,
      ) => void;
      export let getRuntimeKey: (runtime: RuntimeSpec) => string;
      export let keyToRuntime: (key: string) => RuntimeSpec;
      export let runtimeToString: (runtime: RuntimeSpec) => string;
      export let runtimeConditionToString: (
        runtimeCondition: RuntimeCondition,
      ) => string;
      export let runtimeEqual: (a: RuntimeSpec, b: RuntimeSpec) => boolean;
      export let compareRuntime: (a: RuntimeSpec, b: RuntimeSpec) => 0 | 1 | -1;
      export let mergeRuntime: (a: RuntimeSpec, b: RuntimeSpec) => RuntimeSpec;
      export let mergeRuntimeCondition: (
        a: RuntimeCondition,
        b: RuntimeCondition,
        runtime: RuntimeSpec,
      ) => RuntimeCondition;
      export let mergeRuntimeConditionNonFalse: (
        a: undefined | string | true | SortableSet<string>,
        b: undefined | string | true | SortableSet<string>,
        runtime: RuntimeSpec,
      ) => undefined | string | true | SortableSet<string>;
      export let mergeRuntimeOwned: (
        a: RuntimeSpec,
        b: RuntimeSpec,
      ) => RuntimeSpec;
      export let intersectRuntime: (
        a: RuntimeSpec,
        b: RuntimeSpec,
      ) => RuntimeSpec;
      export let subtractRuntime: (
        a: RuntimeSpec,
        b: RuntimeSpec,
      ) => RuntimeSpec;
      export let subtractRuntimeCondition: (
        a: RuntimeCondition,
        b: RuntimeCondition,
        runtime: RuntimeSpec,
      ) => RuntimeCondition;
      export let filterRuntime: (
        runtime: RuntimeSpec,
        filter: (arg0: RuntimeSpec) => boolean,
      ) => undefined | string | boolean | SortableSet<string>;
      export { RuntimeSpecMap, RuntimeSpecSet };
    }
    export namespace serialization {
      export const register: (
        Constructor: Constructor,
        request: string,
        name: null | string,
        serializer: ObjectSerializer,
      ) => void;
      export const registerLoader: (
        regExp: RegExp,
        loader: (arg0: string) => boolean,
      ) => void;
      export const registerNotSerializable: (Constructor: Constructor) => void;
      export const NOT_SERIALIZABLE: object;
      export const buffersSerializer: Serializer;
      export let createFileSerializer: (
        fs: IntermediateFileSystem,
        hashFunction: string | typeof Hash,
      ) => Serializer;
      export { MEASURE_START_OPERATION, MEASURE_END_OPERATION };
    }
    export const cleverMerge: <T, O>(first: T, second: O) => T | O | (T & O);
    export { LazySet };
  }
  export namespace sources {
    export {
      Source,
      RawSource,
      OriginalSource,
      ReplaceSource,
      SourceMapSource,
      ConcatSource,
      PrefixSource,
      CachedSource,
      SizeOnlySource,
      CompatSource,
    };
  }
  export namespace experiments {
    export namespace schemes {
      export { HttpUriPlugin };
    }
    export namespace ids {
      export { SyncModuleIdsPlugin };
    }
  }
  export type WebpackPluginFunction = (
    this: Compiler,
    compiler: Compiler,
  ) => void;
  export {
    AutomaticPrefetchPlugin,
    AsyncDependenciesBlock,
    BannerPlugin,
    Cache,
    Chunk,
    ChunkGraph,
    CleanPlugin,
    Compilation,
    Compiler,
    ConcatenationScope,
    ContextExclusionPlugin,
    ContextReplacementPlugin,
    DefinePlugin,
    DelegatedPlugin,
    Dependency,
    DllPlugin,
    DllReferencePlugin,
    DynamicEntryPlugin,
    EntryOptionPlugin,
    EntryPlugin,
    EnvironmentPlugin,
    EvalDevToolModulePlugin,
    EvalSourceMapDevToolPlugin,
    ExternalModule,
    ExternalsPlugin,
    Generator,
    HotUpdateChunk,
    HotModuleReplacementPlugin,
    IgnorePlugin,
    JavascriptModulesPlugin,
    LibManifestPlugin,
    LibraryTemplatePlugin,
    LoaderOptionsPlugin,
    LoaderTargetPlugin,
    Module,
    ModuleGraph,
    ModuleGraphConnection,
    NoEmitOnErrorsPlugin,
    NormalModule,
    NormalModuleReplacementPlugin,
    MultiCompiler,
    Parser,
    PrefetchPlugin,
    ProgressPlugin,
    ProvidePlugin,
    RuntimeModule,
    EntryPlugin as SingleEntryPlugin,
    SourceMapDevToolPlugin,
    Stats,
    Template,
    WatchIgnorePlugin,
    WebpackError,
    WebpackOptionsApply,
    WebpackOptionsDefaulter,
    ValidationError as WebpackOptionsValidationError,
    ValidationError,
    Entry,
    EntryNormalized,
    EntryObject,
    ExternalItemFunctionData,
    ExternalItemObjectKnown,
    ExternalItemObjectUnknown,
    ExternalItemValue,
    Externals,
    FileCacheOptions,
    LibraryOptions,
    MemoryCacheOptions,
    ModuleOptions,
    ResolveOptionsWebpackOptions as ResolveOptions,
    RuleSetCondition,
    RuleSetConditionAbsolute,
    MatchObject,
    RuleSetRule,
    RuleSetUse,
    RuleSetUseItem,
    StatsOptions,
    Configuration,
    WebpackOptionsNormalized,
    WebpackPluginInstance,
    ChunkGroup,
    Asset,
    AssetInfo,
    EntryOptions,
    PathData,
    AssetEmittedInfo,
    MultiStats,
    ResolveData,
    ParserState,
    ResolvePluginInstance,
    Resolver,
    Watching,
    Argument,
    Problem,
    StatsAsset,
    StatsChunk,
    StatsChunkGroup,
    StatsChunkOrigin,
    StatsCompilation,
    StatsError,
    StatsLogging,
    StatsLoggingEntry,
    StatsModule,
    StatsModuleIssuer,
    StatsModuleReason,
    StatsModuleTraceDependency,
    StatsModuleTraceItem,
    StatsProfile,
    LoaderModule,
    RawLoaderDefinition,
    LoaderDefinition,
    LoaderDefinitionFunction,
    PitchLoaderDefinitionFunction,
    RawLoaderDefinitionFunction,
    LoaderContext,
  };
}
declare const topLevelSymbolTag: unique symbol;

export = exports;
