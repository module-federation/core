/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn special-lint-fix` to update
 */
import Compilation from './lib/Compilation';
import Stats from './lib/Stats';
import NormalModuleReplacementPlugin from './lib/NormalModuleReplacementPlugin';
import MultiCompiler from './lib/MultiCompiler';
import Parser from './lib/Parser';
import ModuleDependency from './lib/dependencies/ModuleDependency';
import ExternalModule from './lib/ExternalModule';
import JavascriptParser from './lib/javascript/JavascriptParser';
import HttpUriPlugin from './lib/schemes/HttpUriPlugin';
import Chunk from './lib/Chunk';
import LibraryTemplatePlugin from './lib/LibraryTemplatePlugin';
import LimitChunkCountPlugin from './lib/optimize/LimitChunkCountPlugin';
import LibManifestPlugin from './lib/LibManifestPlugin';
import ProgressPlugin from './lib/ProgressPlugin';
import ProfilingPlugin from './lib/debug/ProfilingPlugin';
import ModuleGraph from './lib/ModuleGraph';
import ModuleGraphConnection from './lib/ModuleGraphConnection';
import ProvidePlugin from './lib/ProvidePlugin';
import WebWorkerTemplatePlugin from './lib/webworker/WebWorkerTemplatePlugin';
import HotModuleReplacementPlugin from './lib/HotModuleReplacementPlugin';
import Compiler from './lib/Compiler';
import IgnorePlugin from './lib/IgnorePlugin';
import ExternalsPlugin from './lib/ExternalsPlugin';
import ConstDependency from './lib/dependencies/ConstDependency';
import EntryOptionPlugin from './lib/EntryOptionPlugin';
import DefinePlugin from './lib/DefinePlugin';
import EvalSourceMapDevToolPlugin from './lib/EvalSourceMapDevToolPlugin';
import EnableChunkLoadingPlugin from './lib/javascript/EnableChunkLoadingPlugin';
import EvalDevToolModulePlugin from './lib/EvalDevToolModulePlugin';
import EnableWasmLoadingPlugin from './lib/wasm/EnableWasmLoadingPlugin';
import DelegatedPlugin from './lib/DelegatedPlugin';
import EnableLibraryPlugin from './lib/library/EnableLibraryPlugin';
import ElectronTargetPlugin from './lib/electron/ElectronTargetPlugin';
import { ResolveContext, ResolveRequest } from './lib/ResolverFactory';
import { WebpackOptions as Configuration } from '../declarations/WebpackOptions';
import EnvironmentPlugin from './lib/EnvironmentPlugin';
import {
  Environment,
  Externals,
  ExternalsType,
  ExternalItem,
} from './declarations/WebpackOptions';
import { EntryNormalized } from './declarations/WebpackOptions';
import Entrypoint, { EntryOptions, EntryDescription } from './lib/Entrypoint';
import DeterministicModuleIdsPlugin from './lib/ids/DeterministicModuleIdsPlugin';
import NamedModuleIdsPlugin from './lib/ids/NamedModuleIdsPlugin';
import DeterministicChunkIdsPlugin from './lib/ids/DeterministicChunkIdsPlugin';
import OccurrenceModuleIdsPlugin from './lib/ids/OccurrenceModuleIdsPlugin';
import FileSystemInfo from './lib/FileSystemInfo';
import DynamicEntryPlugin from './lib/DynamicEntryPlugin';
import SplitChunksPlugin from './lib/optimize/SplitChunksPlugin';
import ContextReplacementPlugin from './lib/ContextReplacementPlugin';
import Cache from './lib/Cache';
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
import { Watcher } from './lib/util/fs';
import Watching, { WatchOptions } from './lib/Watching';
import JavascriptModulesPlugin, {
  RenderContext,
} from './lib/javascript/JavascriptModulesPlugin';
import CleanPlugin from './lib/CleanPlugin';
import DllPlugin from './lib/DllPlugin';
import DllReferencePlugin from './lib/DllReferencePlugin';
import { Output } from './declarations/WebpackOptions';
import ChunkPrefetchPreloadPlugin from './lib/prefetch/ChunkPrefetchPreloadPlugin';
import SourceMapDevToolPlugin from './lib/SourceMapDevToolPlugin';
import {
  WebpackOptionsNormalized,
  RuleSetRule,
  RuleSetCondition,
  RuleSetConditionAbsolute,
  ResolveOptions as ResolveOptionsWebpackOptions,
  WebpackPluginFunction,
} from './declarations/WebpackOptions';
import AutomaticPrefetchPlugin from './lib/AutomaticPrefetchPlugin';
import BannerPlugin from './lib/BannerPlugin';
import AsyncWebAssemblyModulesPlugin from './lib/wasm-async/AsyncWebAssemblyModulesPlugin';
import EntryPlugin from './lib/EntryPlugin';
import { EntryData } from './lib/Compilation';
import { MainRenderContext } from './lib/javascript/JavascriptModulesPlugin';
import { StatsOptions } from './declarations/WebpackOptions';
import BasicEvaluatedExpression from './lib/javascript/BasicEvaluatedExpression';
import { ChunkRenderContext } from './lib/Template';
import ChunkModuleIdRangePlugin from './lib/ids/ChunkModuleIdRangePlugin';
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
import AggressiveSplittingPlugin from './lib/optimize/AggressiveSplittingPlugin';
import AggressiveMergingPlugin from './lib/optimize/AggressiveMergingPlugin';
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
import RuntimeGlobalsTypes from './lib/RuntimeGlobals';
import { Asset } from './lib/Compilation';

export const RuntimeGlobals = RuntimeGlobalsTypes;
declare interface AdditionalData {
  [index: string]: any;

  webpackAST: object;
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

declare abstract class ByTypeGenerator extends Generator {
  map: Record<string, Generator>;
}

declare const CIRCULAR_CONNECTION: unique symbol;

declare interface CallbackFunction<T> {
  (err?: null | Error, result?: T): any;
}

declare interface CallbackWebpack<T> {
  (err?: Error, stats?: T): void;
}

type Cell<T> = undefined | T;

declare interface Comparator<T> {
  (arg0: T, arg1: T): 0 | 1 | -1;
}

declare interface CompilationHooksRealContentHashPlugin {
  updateHash: SyncBailHook<[Buffer[], string], string>;
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

type ConnectionState =
  | boolean
  | typeof TRANSITIVE_ONLY
  | typeof CIRCULAR_CONNECTION;

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

declare class ContextExclusionPlugin {
  constructor(negativeMatcher: RegExp);

  negativeMatcher: RegExp;

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
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

/**
 * No generator options are supported for this module type.
 */
declare interface EmptyGeneratorOptions {}

/**
 * No parser options are supported for this module type.
 */
declare interface EmptyParserOptions {}

type Entry =
  | string
  | (() => string | EntryObject | string[] | Promise<EntryStatic>)
  | EntryObject
  | string[];

/**
 * Multiple entry bundles are created. The key is the entry name. The value can be a string, an array or an entry description object.
 */
declare interface EntryObject {
  [index: string]: string | string[] | EntryDescription;
}

type EntryStatic = string | EntryObject | string[];

type ErrorWithDetail = Error & { details?: string };

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

declare interface ExtensionAliasOption {
  alias: string | string[];
  extension: string;
}

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

/**
 * These properties are added by the HotModuleReplacementPlugin
 */
declare interface HotModuleReplacementPluginLoaderContext {
  hot?: boolean;
}

declare class HotUpdateChunk extends Chunk {
  constructor();
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

declare const MEASURE_END_OPERATION: unique symbol;
declare const MEASURE_START_OPERATION: unique symbol;

declare interface MatchObject {
  test?: string | RegExp | (string | RegExp)[];
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
}

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

declare interface ModuleFactoryCreateDataContextInfo {
  issuer: string;
  issuerLayer?: null | string;
  compiler: string;
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

declare class NaturalModuleIdsPlugin {
  constructor();

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}

declare class NoEmitOnErrorsPlugin {
  constructor();

  /**
   * Apply the plugin
   */
  apply(compiler: Compiler): void;
}

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

declare abstract class OptionsApply {
  process(options?: any, compiler?: any): void;
}

/**
 * Options affecting the output of the compilation. `output` options tell webpack how to write the compiled files to disk.
 */

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

type ResolverWithOptions = Resolver & WithOptions;

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

declare interface SourceMap {
  version: number;
  sources: string[];
  mappings: string;
  file?: string;
  sourceRoot?: string;
  sourcesContent?: string[];
  names?: string[];
}

declare interface SourcePosition {
  line: number;
  column?: number;
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

type StatsAsset = KnownStatsAsset & Record<string, any>;
type StatsChunk = KnownStatsChunk & Record<string, any>;
type StatsChunkGroup = KnownStatsChunkGroup & Record<string, any>;
type StatsChunkOrigin = KnownStatsChunkOrigin & Record<string, any>;
type StatsCompilation = KnownStatsCompilation & Record<string, any>;
type StatsError = KnownStatsError & Record<string, any>;

type StatsLogging = KnownStatsLogging & Record<string, any>;
type StatsLoggingEntry = KnownStatsLoggingEntry & Record<string, any>;
type StatsModule = KnownStatsModule & Record<string, any>;
type StatsModuleIssuer = KnownStatsModuleIssuer & Record<string, any>;
type StatsModuleReason = KnownStatsModuleReason & Record<string, any>;
type StatsModuleTraceDependency = KnownStatsModuleTraceDependency &
  Record<string, any>;
type StatsModuleTraceItem = KnownStatsModuleTraceItem & Record<string, any>;

type StatsProfile = KnownStatsProfile & Record<string, any>;

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

declare const UNDEFINED_MARKER: unique symbol;

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

declare abstract class VariableInfo {
  declaredScope: ScopeInfo;
  freeName?: string | true;
  tagInfo?: TagInfo;
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

declare interface WithOptions {
  /**
   * create a resolver with additional/different options
   */
  withOptions: (
    arg0: Partial<ResolveOptionsWithDependencyType>,
  ) => ResolverWithOptions;
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

  export {
    WebpackPluginFunction,
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
