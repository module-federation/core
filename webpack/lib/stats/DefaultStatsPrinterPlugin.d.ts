export = DefaultStatsPrinterPlugin;
declare class DefaultStatsPrinterPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DefaultStatsPrinterPlugin {
    export { WithRequired, DefineStatsPrinterContext, SimplePrinter, Unpacked, PropertyName, ArrayPropertyName, Exclamation, Printers, CompilationSimplePrinters, AssetSimplePrinters, ModuleSimplePrinters, ModuleIssuerPrinters, ModuleReasonsPrinters, ModuleProfilePrinters, ChunkGroupPrinters, ChunkPrinters, ErrorPrinters, LogEntryPrinters, ModuleTraceItemPrinters, ModuleTraceDependencyPrinters, SimpleItemsJoiner, Item, SimpleElementJoiner, Tail, TailParameters, AvailableFormats, ResultModifierFn };
}
import type Compiler from "../Compiler";
/**
 * Defines the with required type used by this module.
 */
type WithRequired<T, K extends keyof T> = { [P in K]-?: T[P]; };
/**
 * Defines the define stats printer context type used by this module.
 */
type DefineStatsPrinterContext<RequiredStatsPrinterContextKeys extends keyof StatsPrinter.StatsPrinterContext> = StatsPrinter.StatsPrinterContextWithExtra & WithRequired<StatsPrinter.StatsPrinterContext, "compilation" | RequiredStatsPrinterContextKeys>;
/**
 * Defines the simple printer type used by this module.
 */
type SimplePrinter<T, RequiredStatsPrinterContextKeys extends keyof StatsPrinter.StatsPrinterContext> = (thing: Exclude<T, undefined>, context: DefineStatsPrinterContext<RequiredStatsPrinterContextKeys>, printer: StatsPrinter) => string | undefined;
/**
 * Defines the unpacked type used by this module.
 */
type Unpacked<T> = T extends (infer U)[] ? U : T;
/**
 * Defines the property name type used by this module.
 */
type PropertyName<O extends unknown, K extends keyof O, B extends string> = K extends string ? `${B}.${K}` : never;
/**
 * Defines the array property name type used by this module.
 */
type ArrayPropertyName<O extends unknown, K extends keyof O, B extends string> = K extends string ? `${B}.${K}[]` : never;
/**
 * Defines the exclamation type used by this module.
 */
type Exclamation<O extends unknown, K extends string, E extends string> = { [property in `${K}!`]?: SimplePrinter<O, "compilation" | E>; };
/**
 * Defines the shared type used by this module.
 */
type Printers<O extends unknown, B extends string, R extends string = B> = { [K in keyof O as PropertyName<O, K, B>]?: SimplePrinter<O[K], R>; } & { [K in keyof O as ArrayPropertyName<O, K, B>]?: Exclude<O[K], undefined> extends (infer I)[] ? SimplePrinter<I, R> : never; };
/**
 * Defines the shared type used by this module.
 */
type CompilationSimplePrinters = Printers<KnownStatsCompilation, "compilation"> & {
    ["compilation.summary!"]?: SimplePrinter<KnownStatsCompilation, "compilation">;
} & {
    ["compilation.errorsInChildren!"]?: SimplePrinter<KnownStatsCompilation, "compilation">;
} & {
    ["compilation.warningsInChildren!"]?: SimplePrinter<KnownStatsCompilation, "compilation">;
};
/**
 * Defines the shared type used by this module.
 */
type AssetSimplePrinters = Printers<KnownStatsAsset, "asset"> & Printers<KnownStatsAsset["info"], "asset.info"> & Exclamation<KnownStatsAsset, "asset.separator", "asset"> & {
    ["asset.filteredChildren"]?: SimplePrinter<number, "asset">;
} & {
    assetChunk?: SimplePrinter<ChunkId, "asset">;
} & {
    assetChunkName?: SimplePrinter<ChunkName, "asset">;
} & {
    assetChunkIdHint?: SimplePrinter<string, "asset">;
};
/**
 * Defines the shared type used by this module.
 */
type ModuleSimplePrinters = Printers<KnownStatsModule, "module"> & Exclamation<KnownStatsModule, "module.separator", "module"> & {
    ["module.filteredChildren"]?: SimplePrinter<number, "module">;
} & {
    ["module.filteredReasons"]?: SimplePrinter<number, "module">;
};
/**
 * Defines the module issuer printers type used by this module.
 */
type ModuleIssuerPrinters = Printers<KnownStatsModuleIssuer, "moduleIssuer"> & Printers<KnownStatsProfile, "moduleIssuer.profile", "moduleIssuer">;
/**
 * Defines the module reasons printers type used by this module.
 */
type ModuleReasonsPrinters = Printers<KnownStatsModuleReason, "moduleReason"> & {
    ["moduleReason.filteredChildren"]?: SimplePrinter<number, "moduleReason">;
};
type ModuleProfilePrinters = Printers<KnownStatsProfile, "module.profile", "profile">;
/**
 * Defines the shared type used by this module.
 */
type ChunkGroupPrinters = Exclamation<KnownStatsChunkGroup, "chunkGroup.kind", "chunkGroupKind"> & Exclamation<KnownStatsChunkGroup, "chunkGroup.separator", "chunkGroup"> & Printers<KnownStatsChunkGroup, "chunkGroup"> & Exclamation<KnownStatsChunkGroup, "chunkGroup.is", "chunkGroup"> & Printers<Exclude<KnownStatsChunkGroup["assets"], undefined>[number], "chunkGroupAsset" | "chunkGroup"> & {
    ["chunkGroupChildGroup.type"]?: SimplePrinter<string, "chunkGroupAsset">;
} & {
    ["chunkGroupChild.assets[]"]?: SimplePrinter<string, "chunkGroupAsset">;
} & {
    ["chunkGroupChild.chunks[]"]?: SimplePrinter<ChunkId, "chunkGroupAsset">;
} & {
    ["chunkGroupChild.name"]?: SimplePrinter<ChunkName, "chunkGroupAsset">;
};
/**
 * Defines the shared type used by this module.
 */
type ChunkPrinters = Printers<KnownStatsChunk, "chunk"> & {
    ["chunk.childrenByOrder[].type"]: SimplePrinter<string, "chunk">;
} & {
    ["chunk.childrenByOrder[].children[]"]: SimplePrinter<ChunkId, "chunk">;
} & Exclamation<KnownStatsChunk, "chunk.separator", "chunk"> & Printers<KnownStatsChunkOrigin, "chunkOrigin">;
/**
 * Defines the shared type used by this module.
 */
type ErrorPrinters = Printers<KnownStatsError, "error"> & {
    ["error.filteredDetails"]?: SimplePrinter<number, "error">;
} & Exclamation<KnownStatsError, "error.separator", "error">;
/**
 * Defines the shared type used by this module.
 */
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
type SimpleElementJoiner = (items: Item[], context: StatsPrinter.StatsPrinterContextWithExtra & Required<StatsPrinter.KnownStatsPrinterContext>) => string;
/**
 * Defines the tail type used by this module.
 */
type Tail<T> = T extends [infer Head, ...infer Tail] ? Tail : undefined;
/**
 * Defines the tail parameters type used by this module.
 */
type TailParameters<T extends (...args: never[]) => string> = T extends (firstArg: never, ...rest: infer R) => string ? R : never;
type AvailableFormats = { [Key in keyof StatsPrinter.KnownStatsPrinterFormatters]: (value: Parameters<NonNullable<StatsPrinter.KnownStatsPrinterFormatters[Key]>>[0], options: Required<StatsPrinter.KnownStatsPrinterColorFunctions> & StatsPrinter.StatsPrinterContextWithExtra, ...args: TailParameters<NonNullable<StatsPrinter.KnownStatsPrinterFormatters[Key]>>) => string; };
type ResultModifierFn = (result: string) => string;
import type StatsPrinter from "./StatsPrinter";
import type { KnownStatsCompilation } from "./DefaultStatsFactoryPlugin";
import type { KnownStatsAsset } from "./DefaultStatsFactoryPlugin";
import type { ChunkId } from "../graph/Chunk";
import type { ChunkName } from "../graph/Chunk";
import type { KnownStatsModule } from "./DefaultStatsFactoryPlugin";
import type { KnownStatsModuleIssuer } from "./DefaultStatsFactoryPlugin";
import type { KnownStatsProfile } from "./DefaultStatsFactoryPlugin";
import type { KnownStatsModuleReason } from "./DefaultStatsFactoryPlugin";
import type { KnownStatsChunkGroup } from "./DefaultStatsFactoryPlugin";
import type { KnownStatsChunk } from "./DefaultStatsFactoryPlugin";
import type { KnownStatsChunkOrigin } from "./DefaultStatsFactoryPlugin";
import type { KnownStatsError } from "./DefaultStatsFactoryPlugin";
import type { KnownStatsLoggingEntry } from "./DefaultStatsFactoryPlugin";
import type { LogTypeEnum } from "../logging/Logger";
import type { KnownStatsLogging } from "./DefaultStatsFactoryPlugin";
import type { KnownStatsModuleTraceItem } from "./DefaultStatsFactoryPlugin";
import type { KnownStatsModuleTraceDependency } from "./DefaultStatsFactoryPlugin";
