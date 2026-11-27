export = DefaultStatsPresetPlugin;
declare class DefaultStatsPresetPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DefaultStatsPresetPlugin {
    export { NamedPresets, DefaultsKeys, Defaults, NormalizeFunction, NormalizerKeys, Normalizers, WarningFilterFn };
}
import type Compiler from "../Compiler";
type NamedPresets = { [Key in Exclude<StatsValue, boolean | StatsOptions | "normal">]: StatsOptions; };
type DefaultsKeys = keyof Compilation.NormalizedStatsOptions;
type Defaults = { [Key in DefaultsKeys]: (options: Partial<Compilation.NormalizedStatsOptions>, context: Compilation.CreateStatsOptionsContext, compilation: Compilation) => Compilation.NormalizedStatsOptions[Key] | RequestShortener; };
/**
 * Defines the normalize function type used by this module.
 */
type NormalizeFunction<T> = (value: T, ...args: EXPECTED_ANY[]) => boolean;
type NormalizerKeys = keyof (Compilation.KnownNormalizedStatsOptions | StatsOptions);
type Normalizers = { [Key in NormalizerKeys]?: (value: StatsOptions[Key]) => Compilation.KnownNormalizedStatsOptions[Key]; };
/**
 * Defines the warning filter fn callback.
 */
type WarningFilterFn = (warning: StatsError, warningString: string) => boolean;
import type { StatsValue } from "../../declarations/WebpackOptions";
import type { StatsOptions } from "../../declarations/WebpackOptions";
import type Compilation from "../Compilation";
import RequestShortener = require("../util/RequestShortener");
import type { StatsError } from "./DefaultStatsFactoryPlugin";
