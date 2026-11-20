export type MinimizerCompiler = Parameters<import("minimizer-webpack-plugin")["apply"]>[0];
/**
 * Defines the recursive non nullable type used by this module.
 */
export type RecursiveNonNullable<T> = { [P in keyof T]-?: T[P] extends object ? RecursiveNonNullable<NonNullable<T[P]>> : NonNullable<T[P]>; };
/**
 * Defines the shared type used by this module.
 */
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
    workerChunkFilename: NonNullable<Output["workerChunkFilename"]>;
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
    strictModuleResolution: NonNullable<Output["strictModuleResolution"]>;
    importFunctionName: NonNullable<Output["importFunctionName"]>;
    importMetaName: NonNullable<Output["importMetaName"]>;
    environment: RecursiveNonNullable<Output["environment"]>;
    crossOriginLoading: NonNullable<Output["crossOriginLoading"]>;
    wasmLoading: NonNullable<Output["wasmLoading"]>;
};
/**
 * Defines the shared type used by this module.
 */
export type SnapshotNormalizedWithDefaults = SnapshotOptions & {
    managedPaths: NonNullable<SnapshotOptions["managedPaths"]>;
    unmanagedPaths: NonNullable<SnapshotOptions["unmanagedPaths"]>;
    immutablePaths: NonNullable<SnapshotOptions["immutablePaths"]>;
    resolveBuildDependencies: NonNullable<SnapshotOptions["resolveBuildDependencies"]>;
    buildDependencies: NonNullable<SnapshotOptions["buildDependencies"]>;
    module: NonNullable<SnapshotOptions["module"]>;
    resolve: NonNullable<SnapshotOptions["resolve"]>;
};
/**
 * Defines the shared type used by this module.
 */
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
    inlineExports: NonNullable<Optimization["inlineExports"]>;
    concatenateModules: NonNullable<Optimization["concatenateModules"]>;
    avoidEntryIife: NonNullable<Optimization["avoidEntryIife"]>;
    emitOnErrors: NonNullable<Optimization["emitOnErrors"]>;
    checkWasmTypes: NonNullable<Optimization["checkWasmTypes"]>;
    mangleWasmImports: NonNullable<Optimization["mangleWasmImports"]>;
    portableRecords: NonNullable<Optimization["portableRecords"]>;
    realContentHash: NonNullable<Optimization["realContentHash"]>;
    minimize: NonNullable<Optimization["minimize"]>;
    minimizeOptions: NonNullable<Optimization["minimizeOptions"]>;
    minimizer: NonNullable<Exclude<Optimization["minimizer"], "...">>;
    nodeEnv: NonNullable<Optimization["nodeEnv"]>;
};
/**
 * Defines the shared type used by this module.
 */
export type ExternalsPresetsNormalizedWithDefaults = ExternalsPresets & {
    web: NonNullable<ExternalsPresets["web"]>;
    node: NonNullable<ExternalsPresets["node"]>;
    nwjs: NonNullable<ExternalsPresets["nwjs"]>;
    electron: NonNullable<ExternalsPresets["electron"]>;
    electronMain: NonNullable<ExternalsPresets["electronMain"]>;
    electronPreload: NonNullable<ExternalsPresets["electronPreload"]>;
    electronRenderer: NonNullable<ExternalsPresets["electronRenderer"]>;
};
/**
 * Defines the shared type used by this module.
 */
export type InfrastructureLoggingNormalizedWithDefaults = InfrastructureLogging & {
    stream: NonNullable<InfrastructureLogging["stream"]>;
    level: NonNullable<InfrastructureLogging["level"]>;
    debug: NonNullable<InfrastructureLogging["debug"]>;
    colors: NonNullable<InfrastructureLogging["colors"]>;
    appendOnly: NonNullable<InfrastructureLogging["appendOnly"]>;
};
/**
 * Defines the webpack options normalized with base defaults type used by this module.
 */
export type WebpackOptionsNormalizedWithBaseDefaults = WebpackOptionsNormalized & {
    context: NonNullable<WebpackOptionsNormalized["context"]>;
} & {
    infrastructureLogging: InfrastructureLoggingNormalizedWithDefaults;
};
/**
 * Defines the webpack options normalized with defaults type used by this module.
 */
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
    recordsOutputPath: NonNullable<WebpackOptionsNormalized["recordsOutputPath"]>;
} & {
    dotenv: NonNullable<WebpackOptionsNormalized["dotenv"]>;
};
/**
 * Defines the resolved options type used by this module.
 */
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
 * Apply webpack options base defaults.
 * @param {WebpackOptionsNormalized} options options to be modified
 * @returns {void}
 */
export function applyWebpackOptionsBaseDefaults(options: WebpackOptionsNormalized): void;
/**
 * Apply webpack options defaults.
 * @param {WebpackOptionsNormalized} options options to be modified
 * @param {number=} compilerIndex index of compiler
 * @returns {ResolvedOptions} Resolved options after apply defaults
 */
export function applyWebpackOptionsDefaults(options: WebpackOptionsNormalized, compilerIndex?: number | undefined): ResolvedOptions;
import type { OutputNormalized as Output } from "../../declarations/WebpackOptions";
import type { SnapshotOptions } from "../../declarations/WebpackOptions";
import type { OptimizationNormalized as Optimization } from "../../declarations/WebpackOptions";
import type { ExternalsPresets } from "../../declarations/WebpackOptions";
import type { InfrastructureLogging } from "../../declarations/WebpackOptions";
import type { WebpackOptionsNormalized } from "../../declarations/WebpackOptions";
import type { PlatformTargetProperties } from "./target";
