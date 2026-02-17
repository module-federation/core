export = DefaultStatsPrinterPlugin;
declare class DefaultStatsPrinterPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DefaultStatsPrinterPlugin {
    export { Compiler, LogTypeEnum, ChunkId, ChunkName, KnownStatsAsset, KnownStatsChunk, KnownStatsChunkGroup, KnownStatsChunkOrigin, KnownStatsCompilation, KnownStatsError, KnownStatsLogging, KnownStatsLoggingEntry, KnownStatsModule, KnownStatsModuleIssuer, KnownStatsModuleReason, KnownStatsModuleTraceDependency, KnownStatsModuleTraceItem, KnownStatsProfile, StatsCompilation, StatsPrinter, ColorFunction, KnownStatsPrinterColorFunctions, KnownStatsPrinterContext, KnownStatsPrinterFormatters, StatsPrinterContext, StatsPrinterContextWithExtra, WithRequired, DefineStatsPrinterContext, SimplePrinter, Unpacked, PropertyName, ArrayPropertyName, Exclamation, Printers, CompilationSimplePrinters, AssetSimplePrinters, ModuleSimplePrinters, ModuleIssuerPrinters, ModuleReasonsPrinters, ModuleProfilePrinters, ChunkGroupPrinters, ChunkPrinters, ErrorPrinters, LogEntryPrinters, ModuleTraceItemPrinters, ModuleTraceDependencyPrinters, SimpleItemsJoiner, Item, SimpleElementJoiner, Tail, TailParameters, AvailableFormats, ResultModifierFn };
}
type Compiler = import("../Compiler");
type LogTypeEnum = import("../logging/Logger").LogTypeEnum;
type ChunkId = import("./DefaultStatsFactoryPlugin").ChunkId;
type ChunkName = import("./DefaultStatsFactoryPlugin").ChunkName;
type KnownStatsAsset = import("./DefaultStatsFactoryPlugin").KnownStatsAsset;
type KnownStatsChunk = import("./DefaultStatsFactoryPlugin").KnownStatsChunk;
type KnownStatsChunkGroup = import("./DefaultStatsFactoryPlugin").KnownStatsChunkGroup;
type KnownStatsChunkOrigin = import("./DefaultStatsFactoryPlugin").KnownStatsChunkOrigin;
type KnownStatsCompilation = import("./DefaultStatsFactoryPlugin").KnownStatsCompilation;
type KnownStatsError = import("./DefaultStatsFactoryPlugin").KnownStatsError;
type KnownStatsLogging = import("./DefaultStatsFactoryPlugin").KnownStatsLogging;
type KnownStatsLoggingEntry = import("./DefaultStatsFactoryPlugin").KnownStatsLoggingEntry;
type KnownStatsModule = import("./DefaultStatsFactoryPlugin").KnownStatsModule;
type KnownStatsModuleIssuer = import("./DefaultStatsFactoryPlugin").KnownStatsModuleIssuer;
type KnownStatsModuleReason = import("./DefaultStatsFactoryPlugin").KnownStatsModuleReason;
type KnownStatsModuleTraceDependency = import("./DefaultStatsFactoryPlugin").KnownStatsModuleTraceDependency;
type KnownStatsModuleTraceItem = import("./DefaultStatsFactoryPlugin").KnownStatsModuleTraceItem;
type KnownStatsProfile = import("./DefaultStatsFactoryPlugin").KnownStatsProfile;
type StatsCompilation = import("./DefaultStatsFactoryPlugin").StatsCompilation;
type StatsPrinter = import("./StatsPrinter");
type ColorFunction = import("./StatsPrinter").ColorFunction;
type KnownStatsPrinterColorFunctions = import("./StatsPrinter").KnownStatsPrinterColorFunctions;
type KnownStatsPrinterContext = import("./StatsPrinter").KnownStatsPrinterContext;
type KnownStatsPrinterFormatters = import("./StatsPrinter").KnownStatsPrinterFormatters;
type StatsPrinterContext = import("./StatsPrinter").StatsPrinterContext;
type StatsPrinterContextWithExtra = import("./StatsPrinter").StatsPrinterContextWithExtra;
type WithRequired<T, K extends keyof T> = { [P in K]-?: T[P]; };
type DefineStatsPrinterContext<RequiredStatsPrinterContextKeys extends keyof StatsPrinterContext> = StatsPrinterContextWithExtra & WithRequired<StatsPrinterContext, "compilation" | RequiredStatsPrinterContextKeys>;
type SimplePrinter<T, RequiredStatsPrinterContextKeys extends keyof StatsPrinterContext> = (thing: Exclude<T, undefined>, context: DefineStatsPrinterContext<RequiredStatsPrinterContextKeys>, printer: StatsPrinter) => string | undefined;
type Unpacked<T> = T extends (infer U)[] ? U : T;
type PropertyName<O extends unknown, K extends keyof O, B extends string> = K extends string ? `${B}.${K}` : never;
type ArrayPropertyName<O extends unknown, K extends keyof O, B extends string> = K extends string ? `${B}.${K}[]` : never;
type Exclamation<O extends unknown, K extends string, E extends string> = { [property in `${K}!`]?: SimplePrinter<O, "compilation" | E>; };
type Printers<O extends unknown, B extends string, R extends string = B> = { [K in keyof O as PropertyName<O, K, B>]?: SimplePrinter<O[K], R>; } & { [K in keyof O as ArrayPropertyName<O, K, B>]?: Exclude<O[K], undefined> extends (infer I)[] ? SimplePrinter<I, R> : never; };
type CompilationSimplePrinters = Printers<KnownStatsCompilation, "compilation"> & {
    ["compilation.summary!"]?: SimplePrinter<KnownStatsCompilation, "compilation">;
} & {
    ["compilation.errorsInChildren!"]?: SimplePrinter<KnownStatsCompilation, "compilation">;
} & {
    ["compilation.warningsInChildren!"]?: SimplePrinter<KnownStatsCompilation, "compilation">;
};
type AssetSimplePrinters = Printers<KnownStatsAsset, "asset"> & Printers<KnownStatsAsset["info"], "asset.info"> & Exclamation<KnownStatsAsset, "asset.separator", "asset"> & {
    ["asset.filteredChildren"]?: SimplePrinter<number, "asset">;
} & {
    assetChunk?: SimplePrinter<ChunkId, "asset">;
} & {
    assetChunkName?: SimplePrinter<ChunkName, "asset">;
} & {
    assetChunkIdHint?: SimplePrinter<string, "asset">;
};
type ModuleSimplePrinters = Printers<KnownStatsModule, "module"> & Exclamation<KnownStatsModule, "module.separator", "module"> & {
    ["module.filteredChildren"]?: SimplePrinter<number, "module">;
} & {
    ["module.filteredReasons"]?: SimplePrinter<number, "module">;
};
type ModuleIssuerPrinters = Printers<KnownStatsModuleIssuer, "moduleIssuer"> & Printers<KnownStatsModuleIssuer["profile"], "moduleIssuer.profile", "moduleIssuer">;
type ModuleReasonsPrinters = Printers<KnownStatsModuleReason, "moduleReason"> & {
    ["moduleReason.filteredChildren"]?: SimplePrinter<number, "moduleReason">;
};
type ModuleProfilePrinters = Printers<KnownStatsProfile, "module.profile", "profile">;
type ChunkGroupPrinters = Exclamation<KnownStatsChunkGroup, "chunkGroup.kind", "chunkGroupKind"> & Exclamation<KnownStatsChunkGroup, "chunkGroup.separator", "chunkGroup"> & Printers<KnownStatsChunkGroup, "chunkGroup"> & Exclamation<KnownStatsChunkGroup, "chunkGroup.is", "chunkGroup"> & Printers<Exclude<KnownStatsChunkGroup["assets"], undefined>[number], "chunkGroupAsset" | "chunkGroup"> & {
    ["chunkGroupChildGroup.type"]?: SimplePrinter<string, "chunkGroupAsset">;
} & {
    ["chunkGroupChild.assets[]"]?: SimplePrinter<string, "chunkGroupAsset">;
} & {
    ["chunkGroupChild.chunks[]"]?: SimplePrinter<ChunkId, "chunkGroupAsset">;
} & {
    ["chunkGroupChild.name"]?: SimplePrinter<ChunkName, "chunkGroupAsset">;
};
type ChunkPrinters = Printers<KnownStatsChunk, "chunk"> & {
    ["chunk.childrenByOrder[].type"]: SimplePrinter<string, "chunk">;
} & {
    ["chunk.childrenByOrder[].children[]"]: SimplePrinter<ChunkId, "chunk">;
} & Exclamation<KnownStatsChunk, "chunk.separator", "chunk"> & Printers<KnownStatsChunkOrigin, "chunkOrigin">;
type ErrorPrinters = Printers<KnownStatsError, "error"> & {
    ["error.filteredDetails"]?: SimplePrinter<number, "error">;
} & Exclamation<KnownStatsError, "error.separator", "error">;
type LogEntryPrinters = Printers<KnownStatsLoggingEntry, `loggingEntry(${LogTypeEnum}).loggingEntry`> & {
    ["loggingEntry(clear).loggingEntry"]?: SimplePrinter<KnownStatsLoggingEntry, "logging">;
} & {
    ["loggingEntry.trace[]"]?: SimplePrinter<Exclude<KnownStatsLoggingEntry["trace"], undefined>[number], "logging">;
} & {
    loggingGroup?: SimplePrinter<KnownStatsLogging[], "logging">;
} & Printers<KnownStatsLogging & {
    name: string;
}, `loggingGroup`> & Exclamation<KnownStatsLogging, "loggingGroup.separator", "loggingGroup">;
type ModuleTraceItemPrinters = Printers<KnownStatsModuleTraceItem, "moduleTraceItem">;
type ModuleTraceDependencyPrinters = Printers<KnownStatsModuleTraceDependency, "moduleTraceDependency">;
type SimpleItemsJoiner = (items: string[]) => string | undefined;
type Item = {
    element: string;
    content: string | undefined;
};
type SimpleElementJoiner = (items: Item[], context: StatsPrinterContextWithExtra & Required<KnownStatsPrinterContext>) => string;
type Tail<T> = T extends [infer Head, ...infer Tail] ? Tail : undefined;
type TailParameters<T extends (...args: EXPECTED_ANY[]) => EXPECTED_ANY> = T extends (firstArg: EXPECTED_ANY, ...rest: infer R) => EXPECTED_ANY ? R : never;
type AvailableFormats = { [Key in keyof KnownStatsPrinterFormatters]: (value: Parameters<NonNullable<KnownStatsPrinterFormatters[Key]>>[0], options: Required<KnownStatsPrinterColorFunctions> & StatsPrinterContextWithExtra, ...args: TailParameters<NonNullable<KnownStatsPrinterFormatters[Key]>>) => string; };
type ResultModifierFn = (result: string) => string;
