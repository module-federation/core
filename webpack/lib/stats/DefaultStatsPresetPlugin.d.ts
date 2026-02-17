export = DefaultStatsPresetPlugin;
declare class DefaultStatsPresetPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DefaultStatsPresetPlugin {
    export { StatsOptions, StatsValue, Compilation, CreateStatsOptionsContext, KnownNormalizedStatsOptions, NormalizedStatsOptions, Compiler, StatsError, NamedPresets, DefaultsKeys, Defaults, NormalizeFunction, NormalizerKeys, Normalizers, WarningFilterFn };
}
type StatsOptions = import("../../declarations/WebpackOptions").StatsOptions;
type StatsValue = import("../../declarations/WebpackOptions").StatsValue;
type Compilation = import("../Compilation");
type CreateStatsOptionsContext = import("../Compilation").CreateStatsOptionsContext;
type KnownNormalizedStatsOptions = import("../Compilation").KnownNormalizedStatsOptions;
type NormalizedStatsOptions = import("../Compilation").NormalizedStatsOptions;
type Compiler = import("../Compiler");
type StatsError = import("./DefaultStatsFactoryPlugin").StatsError;
type NamedPresets = { [Key in Exclude<StatsValue, boolean | EXPECTED_OBJECT | "normal">]: StatsOptions; };
type DefaultsKeys = keyof NormalizedStatsOptions;
type Defaults = { [Key in DefaultsKeys]: (options: Partial<NormalizedStatsOptions>, context: CreateStatsOptionsContext, compilation: Compilation) => NormalizedStatsOptions[Key] | RequestShortener; };
type NormalizeFunction<T> = (value: T, ...args: EXPECTED_ANY[]) => boolean;
type NormalizerKeys = keyof (KnownNormalizedStatsOptions | StatsOptions);
type Normalizers = { [Key in NormalizerKeys]?: (value: StatsOptions[Key]) => KnownNormalizedStatsOptions[Key]; };
type WarningFilterFn = (warning: StatsError, warningString: string) => boolean;
import RequestShortener = require("../RequestShortener");
