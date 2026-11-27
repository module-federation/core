export = defineConfig;
/**
 * @import {
 * 	WebpackOptions as Configuration
 * } from "../../declarations/WebpackOptions"
 */
/**
 * @import {
 * 	MultiWebpackOptions as MultiConfiguration
 * } from "../MultiCompiler"
 */
/**
 * @template T
 * @typedef {T | Promise<T>} MaybePromise
 */
/**
 * Function style configuration, called with the `--env` values and CLI arguments.
 * @typedef {(env: Record<string, EXPECTED_ANY>, argv: Record<string, EXPECTED_ANY>) => MaybePromise<Configuration | MultiConfiguration>} ConfigurationFactory
 */
/** @typedef {MaybePromise<Configuration | MultiConfiguration | ConfigurationFactory | ConfigurationFactory[]>} DefineConfigInput */
/**
 * A type helper for authoring configuration files, no-op at runtime.
 * @template {DefineConfigInput} T
 * @param {T} config webpack configuration
 * @returns {T} the same configuration
 */
declare function defineConfig<T extends DefineConfigInput>(config: T): T;
declare namespace defineConfig {
    export { MaybePromise, ConfigurationFactory, DefineConfigInput };
}
type MaybePromise<T> = T | Promise<T>;
/**
 * Function style configuration, called with the `--env` values and CLI arguments.
 */
type ConfigurationFactory = (env: Record<string, EXPECTED_ANY>, argv: Record<string, EXPECTED_ANY>) => MaybePromise<Configuration | MultiConfiguration>;
type DefineConfigInput = MaybePromise<Configuration | MultiConfiguration | ConfigurationFactory | ConfigurationFactory[]>;
import type { WebpackOptions as Configuration } from "../../declarations/WebpackOptions";
import type { MultiWebpackOptions as MultiConfiguration } from "../MultiCompiler";
