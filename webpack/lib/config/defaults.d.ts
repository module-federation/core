export type CacheOptionsNormalized = import("../../declarations/WebpackOptions").CacheOptionsNormalized;
export type Context = import("../../declarations/WebpackOptions").Context;
export type CssGeneratorOptions = import("../../declarations/WebpackOptions").CssGeneratorOptions;
export type EntryDescription = import("../../declarations/WebpackOptions").EntryDescription;
export type Entry = import("../../declarations/WebpackOptions").EntryNormalized;
export type Environment = import("../../declarations/WebpackOptions").Environment;
export type Experiments = import("../../declarations/WebpackOptions").Experiments;
export type ExperimentsNormalized = import("../../declarations/WebpackOptions").ExperimentsNormalized;
export type ExternalsPresets = import("../../declarations/WebpackOptions").ExternalsPresets;
export type ExternalsType = import("../../declarations/WebpackOptions").ExternalsType;
export type FileCacheOptions = import("../../declarations/WebpackOptions").FileCacheOptions;
export type GeneratorOptionsByModuleTypeKnown = import("../../declarations/WebpackOptions").GeneratorOptionsByModuleTypeKnown;
export type InfrastructureLogging = import("../../declarations/WebpackOptions").InfrastructureLogging;
export type JavascriptParserOptions = import("../../declarations/WebpackOptions").JavascriptParserOptions;
export type JsonGeneratorOptions = import("../../declarations/WebpackOptions").JsonGeneratorOptions;
export type Library = import("../../declarations/WebpackOptions").Library;
export type LibraryName = import("../../declarations/WebpackOptions").LibraryName;
export type LibraryType = import("../../declarations/WebpackOptions").LibraryType;
export type Loader = import("../../declarations/WebpackOptions").Loader;
export type Mode = import("../../declarations/WebpackOptions").Mode;
export type HashSalt = import("../../declarations/WebpackOptions").HashSalt;
export type HashDigest = import("../../declarations/WebpackOptions").HashSalt;
export type HashDigestLength = import("../../declarations/WebpackOptions").HashDigestLength;
export type ModuleOptions = import("../../declarations/WebpackOptions").ModuleOptionsNormalized;
export type WebpackNode = import("../../declarations/WebpackOptions").Node;
export type Optimization = import("../../declarations/WebpackOptions").OptimizationNormalized;
export type OptimizationSplitChunksOptions = import("../../declarations/WebpackOptions").OptimizationSplitChunksOptions;
export type Output = import("../../declarations/WebpackOptions").OutputNormalized;
export type ParserOptionsByModuleTypeKnown = import("../../declarations/WebpackOptions").ParserOptionsByModuleTypeKnown;
export type Performance = import("../../declarations/WebpackOptions").Performance;
export type ResolveOptions = import("../../declarations/WebpackOptions").ResolveOptions;
export type RuleSetRules = import("../../declarations/WebpackOptions").RuleSetRules;
export type SnapshotOptions = import("../../declarations/WebpackOptions").SnapshotOptions;
export type WebpackOptionsNormalized = import("../../declarations/WebpackOptions").WebpackOptionsNormalized;
export type Module = import("../Module");
export type PlatformTargetProperties = import("./target").PlatformTargetProperties;
export type TargetProperties = import("./target").TargetProperties;
export type RecursiveNonNullable<T> = { [P in keyof T]-?: T[P] extends object ? RecursiveNonNullable<NonNullable<T[P]>> : NonNullable<T[P]>; };
export type OutputNormalizedWithDefaults = Output & {
    uniqueName: NonNullable<Output["uniqueName"]>;
    filename: NonNullable<Output["filename"]>;
    cssFilename: NonNullable<Output["cssFilename"]>;
    chunkFilename: NonNullable<Output["chunkFilename"]>;
    cssChunkFilename: NonNullable<Output["cssChunkFilename"]>;
    hotUpdateChunkFilename: NonNullable<Output["hotUpdateChunkFilename"]>;
    hotUpdateGlobal: NonNullable<Output["hotUpdateGlobal"]>;
    assetModuleFilename: NonNullable<Output["assetModuleFilename"]>;
    webassemblyModuleFilename: NonNullable<Output["webassemblyModuleFilename"]>;
    sourceMapFilename: NonNullable<Output["sourceMapFilename"]>;
    hotUpdateMainFilename: NonNullable<Output["hotUpdateMainFilename"]>;
    devtoolNamespace: NonNullable<Output["devtoolNamespace"]>;
    publicPath: NonNullable<Output["publicPath"]>;
    workerPublicPath: NonNullable<Output["workerPublicPath"]>;
    workerWasmLoading: NonNullable<Output["workerWasmLoading"]>;
    workerChunkLoading: NonNullable<Output["workerChunkLoading"]>;
    chunkFormat: NonNullable<Output["chunkFormat"]>;
    module: NonNullable<Output["module"]>;
    asyncChunks: NonNullable<Output["asyncChunks"]>;
    charset: NonNullable<Output["charset"]>;
    iife: NonNullable<Output["iife"]>;
    globalObject: NonNullable<Output["globalObject"]>;
    scriptType: NonNullable<Output["scriptType"]>;
    path: NonNullable<Output["path"]>;
    pathinfo: NonNullable<Output["pathinfo"]>;
    hashFunction: NonNullable<Output["hashFunction"]>;
    hashDigest: NonNullable<Output["hashDigest"]>;
    hashDigestLength: NonNullable<Output["hashDigestLength"]>;
    chunkLoadTimeout: NonNullable<Output["chunkLoadTimeout"]>;
    chunkLoading: NonNullable<Output["chunkLoading"]>;
    chunkLoadingGlobal: NonNullable<Output["chunkLoadingGlobal"]>;
    compareBeforeEmit: NonNullable<Output["compareBeforeEmit"]>;
    strictModuleErrorHandling: NonNullable<Output["strictModuleErrorHandling"]>;
    strictModuleExceptionHandling: NonNullable<Output["strictModuleExceptionHandling"]>;
    importFunctionName: NonNullable<Output["importFunctionName"]>;
    importMetaName: NonNullable<Output["importMetaName"]>;
    environment: RecursiveNonNullable<Output["environment"]>;
    crossOriginLoading: NonNullable<Output["crossOriginLoading"]>;
    wasmLoading: NonNullable<Output["wasmLoading"]>;
};
export type SnapshotNormalizedWithDefaults = SnapshotOptions & {
    managedPaths: NonNullable<SnapshotOptions["managedPaths"]>;
    unmanagedPaths: NonNullable<SnapshotOptions["unmanagedPaths"]>;
    immutablePaths: NonNullable<SnapshotOptions["immutablePaths"]>;
    resolveBuildDependencies: NonNullable<SnapshotOptions["resolveBuildDependencies"]>;
    buildDependencies: NonNullable<SnapshotOptions["buildDependencies"]>;
    module: NonNullable<SnapshotOptions["module"]>;
    resolve: NonNullable<SnapshotOptions["resolve"]>;
};
export type OptimizationNormalizedWithDefaults = Optimization & {
    runtimeChunk: NonNullable<Optimization["runtimeChunk"]>;
    splitChunks: NonNullable<Optimization["splitChunks"]>;
    mergeDuplicateChunks: NonNullable<Optimization["mergeDuplicateChunks"]>;
    removeAvailableModules: NonNullable<Optimization["removeAvailableModules"]>;
    removeEmptyChunks: NonNullable<Optimization["removeEmptyChunks"]>;
    flagIncludedChunks: NonNullable<Optimization["flagIncludedChunks"]>;
    moduleIds: NonNullable<Optimization["moduleIds"]>;
    chunkIds: NonNullable<Optimization["chunkIds"]>;
    sideEffects: NonNullable<Optimization["sideEffects"]>;
    providedExports: NonNullable<Optimization["providedExports"]>;
    usedExports: NonNullable<Optimization["usedExports"]>;
    mangleExports: NonNullable<Optimization["mangleExports"]>;
    innerGraph: NonNullable<Optimization["innerGraph"]>;
    concatenateModules: NonNullable<Optimization["concatenateModules"]>;
    avoidEntryIife: NonNullable<Optimization["avoidEntryIife"]>;
    emitOnErrors: NonNullable<Optimization["emitOnErrors"]>;
    checkWasmTypes: NonNullable<Optimization["checkWasmTypes"]>;
    mangleWasmImports: NonNullable<Optimization["mangleWasmImports"]>;
    portableRecords: NonNullable<Optimization["portableRecords"]>;
    realContentHash: NonNullable<Optimization["realContentHash"]>;
    minimize: NonNullable<Optimization["minimize"]>;
    minimizer: NonNullable<Exclude<Optimization["minimizer"], "...">>;
    nodeEnv: NonNullable<Optimization["nodeEnv"]>;
};
export type ExternalsPresetsNormalizedWithDefaults = ExternalsPresets & {
    web: NonNullable<ExternalsPresets["web"]>;
    node: NonNullable<ExternalsPresets["node"]>;
    nwjs: NonNullable<ExternalsPresets["nwjs"]>;
    electron: NonNullable<ExternalsPresets["electron"]>;
    electronMain: NonNullable<ExternalsPresets["electronMain"]>;
    electronPreload: NonNullable<ExternalsPresets["electronPreload"]>;
    electronRenderer: NonNullable<ExternalsPresets["electronRenderer"]>;
};
export type InfrastructureLoggingNormalizedWithDefaults = InfrastructureLogging & {
    stream: NonNullable<InfrastructureLogging["stream"]>;
    level: NonNullable<InfrastructureLogging["level"]>;
    debug: NonNullable<InfrastructureLogging["debug"]>;
    colors: NonNullable<InfrastructureLogging["colors"]>;
    appendOnly: NonNullable<InfrastructureLogging["appendOnly"]>;
};
export type WebpackOptionsNormalizedWithBaseDefaults = WebpackOptionsNormalized & {
    context: NonNullable<WebpackOptionsNormalized["context"]>;
} & {
    infrastructureLogging: InfrastructureLoggingNormalizedWithDefaults;
};
export type WebpackOptionsNormalizedWithDefaults = WebpackOptionsNormalizedWithBaseDefaults & {
    target: NonNullable<WebpackOptionsNormalized["target"]>;
} & {
    output: OutputNormalizedWithDefaults;
} & {
    optimization: OptimizationNormalizedWithDefaults;
} & {
    devtool: NonNullable<WebpackOptionsNormalized["devtool"]>;
} & {
    stats: NonNullable<WebpackOptionsNormalized["stats"]>;
} & {
    node: NonNullable<WebpackOptionsNormalized["node"]>;
} & {
    profile: NonNullable<WebpackOptionsNormalized["profile"]>;
} & {
    parallelism: NonNullable<WebpackOptionsNormalized["parallelism"]>;
} & {
    snapshot: SnapshotNormalizedWithDefaults;
} & {
    externalsPresets: ExternalsPresetsNormalizedWithDefaults;
} & {
    externalsType: NonNullable<WebpackOptionsNormalized["externalsType"]>;
} & {
    watch: NonNullable<WebpackOptionsNormalized["watch"]>;
} & {
    performance: NonNullable<WebpackOptionsNormalized["performance"]>;
} & {
    recordsInputPath: NonNullable<WebpackOptionsNormalized["recordsInputPath"]>;
} & {
    recordsOutputPath: NonNullable<WebpackOptionsNormalized["recordsOutputPath"]> & {
        dotenv: NonNullable<WebpackOptionsNormalized["dotenv"]>;
    };
};
export type ResolvedOptions = {
    /**
     * - platform target properties
     */
    platform: PlatformTargetProperties | false;
};
export namespace DEFAULTS {
    let HASH_FUNCTION: string;
}
/**
 * @param {WebpackOptionsNormalized} options options to be modified
 * @returns {void}
 */
export function applyWebpackOptionsBaseDefaults(options: WebpackOptionsNormalized): void;
/**
 * @param {WebpackOptionsNormalized} options options to be modified
 * @param {number=} compilerIndex index of compiler
 * @returns {ResolvedOptions} Resolved options after apply defaults
 */
export function applyWebpackOptionsDefaults(options: WebpackOptionsNormalized, compilerIndex?: number | undefined): ResolvedOptions;
