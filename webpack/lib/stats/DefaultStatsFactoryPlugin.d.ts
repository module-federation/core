export = DefaultStatsFactoryPlugin;
declare class DefaultStatsFactoryPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DefaultStatsFactoryPlugin {
    export { Comparator, GroupConfig, StatsJsonValue, StatsJsonArray, StatsCompilation, KnownStatsCompilation, StatsLogging, KnownStatsLogging, StatsLoggingEntry, KnownStatsLoggingEntry, StatsAsset, ChunkIdHints, KnownStatsAsset, StatsChunkGroup, KnownStatsChunkGroup, ModuleIssuerPath, StatsModule, KnownStatsModule, StatsProfile, KnownStatsProfile, StatsModuleIssuer, KnownStatsModuleIssuer, StatsModuleReason, KnownStatsModuleReason, StatsChunk, KnownStatsChunk, StatsChunkOrigin, KnownStatsChunkOrigin, StatsModuleTraceItem, KnownStatsModuleTraceItem, StatsModuleTraceDependency, KnownStatsModuleTraceDependency, StatsError, KnownStatsError, PreprocessedAsset, ExtractorsByOption, ChunkGroupInfoWithName, ModuleTrace, SimpleExtractors, MappedValues, FilterItemTypeFn, Children, ModuleGroupBySizeResult, BaseGroup, BaseGroupWithChildren, AssetFilterItemFn, AssetsGroupers, ModulesGroupers, ModuleFilterItemTypeFn, ModuleReasonsGroupers, AssetSorters, ExtractFunction, NamedObject };
}
import type Compiler from "../Compiler";
/**
 * <T>
 */
type Comparator<T_1> = import("../util/comparators").Comparator<T_1>;
/**
 * Defines the group config type used by this module.
 */
type GroupConfig<I, G> = import("./smartGrouping").GroupConfig<I, G>;
/**
 * A value stats JSON holds; `undefined` stands for a field left out and `Buffer` for a binary module source.
 */
type StatsJsonValue = string | number | boolean | null | undefined | Buffer | StatsJsonArray | {
    [key: string]: StatsJsonValue;
};
type StatsJsonArray = StatsJsonValue[];
type StatsCompilation = KnownStatsCompilation & Record<string, StatsJsonValue>;
/**
 * Defines the known stats compilation type used by this module.
 */
type KnownStatsCompilation = {
    env?: StatsJsonValue | undefined;
    name?: string | undefined;
    hash?: string | undefined;
    version?: string | undefined;
    time?: number | undefined;
    builtAt?: number | undefined;
    needAdditionalPass?: boolean | undefined;
    publicPath?: string | undefined;
    outputPath?: string | undefined;
    assetsByChunkName?: Record<string, string[]> | undefined;
    assets?: StatsAsset[] | undefined;
    filteredAssets?: number | undefined;
    chunks?: StatsChunk[] | undefined;
    modules?: StatsModule[] | undefined;
    filteredModules?: number | undefined;
    entrypoints?: Record<string, StatsChunkGroup> | undefined;
    namedChunkGroups?: Record<string, StatsChunkGroup> | undefined;
    errors?: StatsError[] | undefined;
    errorsCount?: number | undefined;
    warnings?: StatsError[] | undefined;
    warningsCount?: number | undefined;
    hints?: StatsError[] | undefined;
    hintsCount?: number | undefined;
    children?: StatsCompilation[] | undefined;
    logging?: Record<string, StatsLogging> | undefined;
    filteredWarningDetailsCount?: number | undefined;
    filteredErrorDetailsCount?: number | undefined;
};
type StatsLogging = KnownStatsLogging & Record<string, StatsJsonValue>;
/**
 * Defines the known stats logging type used by this module.
 */
type KnownStatsLogging = {
    entries: StatsLoggingEntry[];
    filteredEntries: number;
    debug: boolean;
};
type StatsLoggingEntry = KnownStatsLoggingEntry & Record<string, StatsJsonValue>;
/**
 * Defines the known stats logging entry type used by this module.
 */
type KnownStatsLoggingEntry = {
    type: string;
    message?: string | undefined;
    trace?: string[] | undefined;
    children?: StatsLoggingEntry[] | undefined;
    args?: EXPECTED_ANY[] | undefined;
    time?: number | undefined;
};
type StatsAsset = KnownStatsAsset & Record<string, StatsJsonValue>;
type ChunkIdHints = string[];
/**
 * Defines the known stats asset type used by this module.
 */
type KnownStatsAsset = {
    type: string;
    name: string;
    info: Compilation.AssetInfo;
    size: number;
    emitted: boolean;
    comparedForEmit: boolean;
    cached: boolean;
    related?: StatsAsset[] | undefined;
    chunks?: Chunk.ChunkId[] | undefined;
    chunkNames?: Chunk.ChunkName[] | undefined;
    chunkIdHints?: ChunkIdHints | undefined;
    auxiliaryChunks?: Chunk.ChunkId[] | undefined;
    auxiliaryChunkNames?: Chunk.ChunkName[] | undefined;
    auxiliaryChunkIdHints?: ChunkIdHints | undefined;
    filteredRelated?: number | undefined;
    isOverSizeLimit?: boolean | undefined;
};
type StatsChunkGroup = KnownStatsChunkGroup & Record<string, StatsJsonValue>;
/**
 * Defines the known stats chunk group type used by this module.
 */
type KnownStatsChunkGroup = {
    name?: Chunk.ChunkName | undefined;
    chunks?: Chunk.ChunkId[] | undefined;
    assets?: ({
        name: string;
        size?: number;
    })[] | undefined;
    filteredAssets?: number | undefined;
    assetsSize?: number | undefined;
    auxiliaryAssets?: ({
        name: string;
        size?: number;
    })[] | undefined;
    filteredAuxiliaryAssets?: number | undefined;
    auxiliaryAssetsSize?: number | undefined;
    children?: Record<string, StatsChunkGroup[]> | undefined;
    childAssets?: Record<string, string[]> | undefined;
    isOverSizeLimit?: boolean | undefined;
};
type ModuleIssuerPath = Module[];
type StatsModule = KnownStatsModule & Record<string, StatsJsonValue>;
/**
 * Defines the known stats module type used by this module.
 */
type KnownStatsModule = {
    type?: string | undefined;
    moduleType?: string | undefined;
    layer?: (string | null) | undefined;
    identifier?: string | undefined;
    name?: string | undefined;
    nameForCondition?: (Module.NameForCondition | null) | undefined;
    index?: number | undefined;
    preOrderIndex?: number | undefined;
    index2?: number | undefined;
    postOrderIndex?: number | undefined;
    size?: number | undefined;
    sizes?: Record<string, number> | undefined;
    cacheable?: boolean | undefined;
    notCacheableReasons?: string[] | undefined;
    built?: boolean | undefined;
    codeGenerated?: boolean | undefined;
    buildTimeExecuted?: boolean | undefined;
    cached?: boolean | undefined;
    optional?: boolean | undefined;
    orphan?: boolean | undefined;
    id?: ModuleId | undefined;
    issuerId?: (ModuleId | null) | undefined;
    chunks?: Chunk.ChunkId[] | undefined;
    assets?: string[] | undefined;
    dependent?: boolean | undefined;
    issuer?: (string | null) | undefined;
    issuerName?: (string | null) | undefined;
    issuerPath?: (StatsModuleIssuer[] | null) | undefined;
    failed?: boolean | undefined;
    errors?: number | undefined;
    warnings?: number | undefined;
    profile?: StatsProfile | undefined;
    reasons?: StatsModuleReason[] | undefined;
    usedExports?: (boolean | null | Dependency.ExportInfoName[]) | undefined;
    providedExports?: (Dependency.ExportInfoName[] | null) | undefined;
    optimizationBailout?: string[] | undefined;
    depth?: (number | null) | undefined;
    modules?: StatsModule[] | undefined;
    filteredModules?: number | undefined;
    source?: ReturnType<Source["source"]> | undefined;
};
type StatsProfile = KnownStatsProfile & Record<string, StatsJsonValue>;
/**
 * Defines the known stats profile type used by this module.
 */
type KnownStatsProfile = {
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
};
type StatsModuleIssuer = KnownStatsModuleIssuer & Record<string, StatsJsonValue>;
/**
 * Defines the known stats module issuer type used by this module.
 */
type KnownStatsModuleIssuer = {
    identifier: string;
    name: string;
    id?: ModuleId | undefined;
    profile: StatsProfile;
};
type StatsModuleReason = KnownStatsModuleReason & Record<string, StatsJsonValue>;
/**
 * Defines the known stats module reason type used by this module.
 */
type KnownStatsModuleReason = {
    moduleIdentifier: string | null;
    module: string | null;
    moduleName: string | null;
    resolvedModuleIdentifier: string | null;
    resolvedModule: string | null;
    type: string | null;
    active: boolean;
    explanation: string | null;
    userRequest: string | null;
    loc?: (string | null) | undefined;
    moduleId?: (ModuleId | null) | undefined;
    resolvedModuleId?: (ModuleId | null) | undefined;
};
type StatsChunk = KnownStatsChunk & Record<string, StatsJsonValue>;
/**
 * Defines the known stats chunk type used by this module.
 */
type KnownStatsChunk = {
    rendered: boolean;
    initial: boolean;
    entry: boolean;
    recorded: boolean;
    reason?: string | undefined;
    size: number;
    sizes: Record<string, number>;
    names: string[];
    idHints: string[];
    runtime?: string[] | undefined;
    files: string[];
    auxiliaryFiles: string[];
    hash: string;
    childrenByOrder: Record<string, Chunk.ChunkId[]>;
    id?: Chunk.ChunkId | undefined;
    siblings?: Chunk.ChunkId[] | undefined;
    parents?: Chunk.ChunkId[] | undefined;
    children?: Chunk.ChunkId[] | undefined;
    modules?: StatsModule[] | undefined;
    filteredModules?: number | undefined;
    origins?: StatsChunkOrigin[] | undefined;
};
type StatsChunkOrigin = KnownStatsChunkOrigin & Record<string, StatsJsonValue>;
/**
 * Defines the known stats chunk origin type used by this module.
 */
type KnownStatsChunkOrigin = {
    module: string;
    moduleIdentifier: string;
    moduleName: string;
    loc: string;
    request: string;
    moduleId?: ModuleId | undefined;
};
type StatsModuleTraceItem = KnownStatsModuleTraceItem & Record<string, StatsJsonValue>;
/**
 * Defines the known stats module trace item type used by this module.
 */
type KnownStatsModuleTraceItem = {
    originIdentifier?: string | undefined;
    originName?: string | undefined;
    moduleIdentifier?: string | undefined;
    moduleName?: string | undefined;
    dependencies?: StatsModuleTraceDependency[] | undefined;
    originId?: ModuleId | undefined;
    moduleId?: ModuleId | undefined;
};
type StatsModuleTraceDependency = KnownStatsModuleTraceDependency & Record<string, StatsJsonValue>;
/**
 * Defines the known stats module trace dependency type used by this module.
 */
type KnownStatsModuleTraceDependency = {
    loc?: string | undefined;
};
type StatsError = KnownStatsError & Record<string, StatsJsonValue>;
/**
 * Defines the known stats error type used by this module.
 */
type KnownStatsError = {
    message: string;
    chunkName?: string | undefined;
    chunkEntry?: boolean | undefined;
    chunkInitial?: boolean | undefined;
    file?: string | undefined;
    moduleIdentifier?: string | undefined;
    moduleName?: string | undefined;
    loc?: string | undefined;
    chunkId?: Chunk.ChunkId | undefined;
    moduleId?: ModuleId | undefined;
    moduleTrace?: StatsModuleTraceItem[] | undefined;
    details?: string | undefined;
    stack?: string | undefined;
    cause?: KnownStatsError | undefined;
    errors?: KnownStatsError[] | undefined;
    compilerPath?: string | undefined;
};
type PreprocessedAsset = Compilation.Asset & {
    type: string;
    related: PreprocessedAsset[] | undefined;
};
/**
 * Defines the extractors by option type used by this module.
 */
type ExtractorsByOption<T_1, O> = Record<string, (object: O, data: T_1, context: StatsFactory.StatsFactoryContext, options: Compilation.NormalizedStatsOptions, factory: StatsFactory) => void>;
type ChunkGroupInfoWithName = {
    name: string;
    chunkGroup: ChunkGroup;
};
type ModuleTrace = {
    origin: Module;
    module: Module;
};
/**
 * Defines the simple extractors type used by this module.
 */
type SimpleExtractors = {
    compilation: ExtractorsByOption<Compilation, StatsCompilation>;
    asset: ExtractorsByOption<PreprocessedAsset, StatsAsset>;
    asset$visible: ExtractorsByOption<PreprocessedAsset, StatsAsset>;
    chunkGroup: ExtractorsByOption<ChunkGroupInfoWithName, StatsChunkGroup>;
    module: ExtractorsByOption<Module, StatsModule>;
    module$visible: ExtractorsByOption<Module, StatsModule>;
    moduleIssuer: ExtractorsByOption<Module, StatsModuleIssuer>;
    profile: ExtractorsByOption<ModuleProfile, StatsProfile>;
    moduleReason: ExtractorsByOption<ModuleGraphConnection, StatsModuleReason>;
    chunk: ExtractorsByOption<Chunk, StatsChunk>;
    chunkOrigin: ExtractorsByOption<ChunkGroup.OriginRecord, StatsChunkOrigin>;
    error: ExtractorsByOption<WebpackError, StatsError>;
    warning: ExtractorsByOption<WebpackError, StatsError>;
    cause: ExtractorsByOption<WebpackError, StatsError>;
    moduleTraceItem: ExtractorsByOption<ModuleTrace, StatsModuleTraceItem>;
    moduleTraceDependency: ExtractorsByOption<Dependency, StatsModuleTraceDependency>;
};
/**
 * <T, R>
 */
type MappedValues<T_1, R> = { [P in keyof T_1]: R; };
type FilterItemTypeFn = ((value: string) => boolean);
/**
 * Defines the children type used by this module.
 */
type Children<T_1> = T_1 & {
    children?: Children<T_1>[] | undefined;
    filteredChildren?: number;
};
type ModuleGroupBySizeResult = {
    size: number;
    sizes: Record<string, number>;
};
type BaseGroup = {
    type: string;
};
/**
 * Defines the base group with children type used by this module.
 */
type BaseGroupWithChildren<T_1> = BaseGroup & {
    children: T_1[];
    size: number;
};
type AssetFilterItemFn = (name: string, asset: StatsAsset) => boolean;
/**
 * Describes the assets groupers shape.
 */
type AssetsGroupers = {
    _: (groupConfigs: GroupConfig<KnownStatsAsset, (BaseGroup & {
        filteredChildren: number;
        size: number;
    }) | BaseGroupWithChildren<KnownStatsAsset>>[], context: StatsFactory.StatsFactoryContext, options: Compilation.NormalizedStatsOptions) => void;
    groupAssetsByInfo: (groupConfigs: GroupConfig<KnownStatsAsset, BaseGroupWithChildren<KnownStatsAsset>>[], context: StatsFactory.StatsFactoryContext, options: Compilation.NormalizedStatsOptions) => void;
    groupAssetsByChunk: (groupConfigs: GroupConfig<KnownStatsAsset, BaseGroupWithChildren<KnownStatsAsset>>[], context: StatsFactory.StatsFactoryContext, options: Compilation.NormalizedStatsOptions) => void;
    excludeAssets: (groupConfigs: GroupConfig<KnownStatsAsset, BaseGroup & {
        filteredChildren: number;
        size: number;
    }>[], context: StatsFactory.StatsFactoryContext, options: Compilation.NormalizedStatsOptions) => void;
};
/**
 * Describes the modules groupers shape.
 */
type ModulesGroupers = {
    _: (groupConfigs: GroupConfig<KnownStatsModule, BaseGroup & {
        filteredChildren?: number;
        children?: KnownStatsModule[];
        size: number;
        sizes: Record<string, number>;
    }>[], context: StatsFactory.StatsFactoryContext, options: Compilation.NormalizedStatsOptions) => void;
    excludeModules: (groupConfigs: GroupConfig<KnownStatsModule, BaseGroup & {
        filteredChildren: number;
        size: number;
        sizes: Record<string, number>;
    }>[], context: StatsFactory.StatsFactoryContext, options: Compilation.NormalizedStatsOptions) => void;
};
type ModuleFilterItemTypeFn = (name: string, module: StatsModule, type: "module" | "chunk" | "root-of-chunk" | "nested") => boolean;
/**
 * Defines the module reasons groupers type used by this module.
 */
type ModuleReasonsGroupers = {
    groupReasonsByOrigin: (groupConfigs: GroupConfig<KnownStatsModuleReason, BaseGroup & {
        module: string;
        children: KnownStatsModuleReason[];
        active: boolean;
    }>[], context: StatsFactory.StatsFactoryContext, options: Compilation.NormalizedStatsOptions) => void;
};
/**
 * Describes the asset sorters shape.
 */
type AssetSorters = {
    assetsSort: (comparators: Comparator<Compilation.Asset>[], context: StatsFactory.StatsFactoryContext, options: Compilation.NormalizedStatsOptions) => void;
    _: (comparators: Comparator<Compilation.Asset>[], context: StatsFactory.StatsFactoryContext, options: Compilation.NormalizedStatsOptions) => void;
};
/**
 * Defines the extract function type used by this module.
 */
type ExtractFunction<T_1> = T_1 extends Record<string, Record<string, infer F>> ? F : never;
/**
 * Defines the named object type used by this module.
 */
type NamedObject<T_1> = {
    name: T_1;
};
import type Compilation from "../Compilation";
import type Chunk from "../graph/Chunk";
import type Module from "../module/Module";
import type { ModuleId } from "../graph/ChunkGraph";
import type Dependency from "../graph/Dependency";
import type { Source } from "webpack-sources";
import type StatsFactory from "./StatsFactory";
import type ChunkGroup from "../graph/ChunkGroup";
import type ModuleProfile from "../module/ModuleProfile";
import type ModuleGraphConnection from "../graph/ModuleGraphConnection";
import type WebpackError from "../errors/WebpackError";
