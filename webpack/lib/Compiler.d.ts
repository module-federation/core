export = Compiler;
declare class Compiler {
  constructor(context: string, options?: WebpackOptionsNormalized);
  hooks: Readonly<{
    initialize: SyncHook<[]>;
    shouldEmit: SyncBailHook<[Compilation], undefined | boolean>;
    done: AsyncSeriesHook<[Stats]>;
    afterDone: SyncHook<[Stats]>;
    additionalPass: AsyncSeriesHook<[]>;
    beforeRun: AsyncSeriesHook<[Compiler]>;
    run: AsyncSeriesHook<[Compiler]>;
    emit: AsyncSeriesHook<[Compilation]>;
    assetEmitted: AsyncSeriesHook<[string, AssetEmittedInfo]>;
    afterEmit: AsyncSeriesHook<[Compilation]>;
    thisCompilation: SyncHook<[Compilation, CompilationParams]>;
    compilation: SyncHook<[Compilation, CompilationParams]>;
    normalModuleFactory: SyncHook<[NormalModuleFactory]>;
    contextModuleFactory: SyncHook<[ContextModuleFactory]>;
    beforeCompile: AsyncSeriesHook<[CompilationParams]>;
    compile: SyncHook<[CompilationParams]>;
    make: AsyncParallelHook<[Compilation]>;
    finishMake: AsyncParallelHook<[Compilation]>;
    afterCompile: AsyncSeriesHook<[Compilation]>;
    readRecords: AsyncSeriesHook<[]>;
    emitRecords: AsyncSeriesHook<[]>;
    watchRun: AsyncSeriesHook<[Compiler]>;
    failed: SyncHook<[Error]>;
    invalid: SyncHook<[null | string, number]>;
    watchClose: SyncHook<[]>;
    shutdown: AsyncSeriesHook<[]>;
    infrastructureLog: SyncBailHook<[string, string, any[]], true>;
    environment: SyncHook<[]>;
    afterEnvironment: SyncHook<[]>;
    afterPlugins: SyncHook<[Compiler]>;
    afterResolvers: SyncHook<[Compiler]>;
    entryOption: SyncBailHook<[string, EntryNormalized], boolean>;
  }>;
  webpack: typeof import('../types');
  name?: string;
  parentCompilation?: Compilation;
  root: Compiler;
  outputPath: string;
  watching?: Watching;
  outputFileSystem: null | OutputFileSystem;
  intermediateFileSystem: null | IntermediateFileSystem;
  inputFileSystem: null | InputFileSystem;
  watchFileSystem: null | WatchFileSystem;
  recordsInputPath: null | string;
  recordsOutputPath: null | string;
  records: Record<string, any>;
  managedPaths: Set<string | RegExp>;
  unmanagedPaths: Set<string | RegExp>;
  immutablePaths: Set<string | RegExp>;
  modifiedFiles?: ReadonlySet<string>;
  removedFiles?: ReadonlySet<string>;
  fileTimestamps?: ReadonlyMap<string, null | FileSystemInfoEntry | 'ignore'>;
  contextTimestamps?: ReadonlyMap<
    string,
    null | FileSystemInfoEntry | 'ignore'
  >;
  fsStartTime?: number;
  resolverFactory: ResolverFactory;
  infrastructureLogger?: (arg0: string, arg1: LogTypeEnum, arg2: any[]) => void;
  platform: Readonly<PlatformTargetProperties>;
  options: WebpackOptions;
  context: string;
  requestShortener: RequestShortener;
  cache: Cache;
  moduleMemCaches?: Map<
    Module,
    {
      buildInfo: BuildInfo;
      references?: WeakMap<Dependency, Module>;
      memCache: WeakTupleMap<any, any>;
    }
  >;
  compilerPath: string;
  running: boolean;
  idle: boolean;
  watchMode: boolean;
  getCache(name: string): CacheFacade;
  getInfrastructureLogger(name: string | (() => string)): WebpackLogger;
  watch(watchOptions: WatchOptions, handler: RunCallback<Stats>): Watching;
  run(callback: RunCallback<Stats>): void;
  runAsChild(
    callback: (
      err: null | Error,
      entries?: Chunk[],
      compilation?: Compilation,
    ) => any,
  ): void;
  purgeInputFileSystem(): void;
  emitAssets(
    compilation: Compilation,
    callback: CallbackFunction_2<void>,
  ): void;
  emitRecords(callback: CallbackFunction_2<void>): void;
  readRecords(callback: CallbackFunction_2<void>): void;
  createChildCompiler(
    compilation: Compilation,
    compilerName: string,
    compilerIndex: number,
    outputOptions?: OutputNormalized,
    plugins?: WebpackPluginInstance[],
  ): Compiler;
  isChild(): boolean;
  createCompilation(params: CompilationParams): Compilation;
  newCompilation(params: CompilationParams): Compilation;
  createNormalModuleFactory(): NormalModuleFactory;
  createContextModuleFactory(): ContextModuleFactory;
  newCompilationParams(): {
    normalModuleFactory: NormalModuleFactory;
    contextModuleFactory: ContextModuleFactory;
  };
  compile(callback: RunCallback<Compilation>): void;
  close(callback: RunCallback<void>): void;
}
declare namespace Compiler {
  export {
    Source,
    Entry,
    OutputOptions,
    WatchOptions,
    WebpackOptions,
    WebpackPluginInstance,
    Chunk,
    Dependency,
    FileSystemInfoEntry,
    Module,
    WeakTupleMap,
    InputFileSystem,
    IntermediateFileSystem,
    OutputFileSystem,
    WatchFileSystem,
    CompilationParams,
    Callback,
    RunAsChildCallback,
    AssetEmittedInfo,
  };
}
import { SyncHook } from 'tapable';
import { SyncBailHook } from 'tapable';
import Compilation = require('./Compilation');
import { AsyncSeriesHook } from 'tapable';
import Stats = require('./Stats');
type AssetEmittedInfo = {
  content: Buffer;
  source: any;
  compilation: Compilation;
  outputPath: string;
  targetPath: string;
};
type CompilationParams = {
  normalModuleFactory: NormalModuleFactory;
  contextModuleFactory: ContextModuleFactory;
};
import NormalModuleFactory = require('./NormalModuleFactory');
import ContextModuleFactory = require('./ContextModuleFactory');
import { AsyncParallelHook } from 'tapable';
type Entry = import('../declarations/WebpackOptions').EntryNormalized;
import Cache = require('./Cache');
import ChunkGraph = require('./ChunkGraph');
import ModuleGraph = require('./ModuleGraph');
import WebpackError = require('./WebpackError');
import Watching = require('./Watching');
type OutputFileSystem = import('./util/fs').OutputFileSystem;
type IntermediateFileSystem = import('./util/fs').IntermediateFileSystem;
type InputFileSystem = import('./util/fs').InputFileSystem;
type WatchFileSystem = import('./util/fs').WatchFileSystem;
type FileSystemInfoEntry = import('./FileSystemInfo').FileSystemInfoEntry;
import ResolverFactory = require('./ResolverFactory');
import RequestShortener = require('./RequestShortener');
type Dependency = import('./Dependency');
type Module = import('./Module');
import CacheFacade = require('./CacheFacade');
import { Logger } from './logging/Logger';
type WatchOptions = import('../declarations/WebpackOptions').WatchOptions;
type Callback<T> = (
  err?: (Error | null) | undefined,
  result?: T | undefined,
) => any;
type RunAsChildCallback = (
  err?: (Error | null) | undefined,
  entries?: Chunk[] | undefined,
  compilation?: Compilation | undefined,
) => any;
type OutputOptions = import('../declarations/WebpackOptions').OutputNormalized;
type WebpackPluginInstance =
  import('../declarations/WebpackOptions').WebpackPluginInstance;
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type Source = any;
type Chunk = import('./Chunk');
type WeakTupleMap = import('./util/WeakTupleMap')<any, any>;
