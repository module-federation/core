export function resolveMatchedConfigs<T>(compilation: Compilation, configs: [string, T][]): Promise<MatchedConfigs<T>>;
/**
 * Defines the matched configs item type used by this module.
 */
export type MatchedConfigsItem<T> = Map<string, T>;
/**
 * Defines the matched configs type used by this module.
 */
export type MatchedConfigs<T> = {
    resolved: MatchedConfigsItem<T>;
    unresolved: MatchedConfigsItem<T>;
    prefixed: MatchedConfigsItem<T>;
};
import type Compilation from "../Compilation";
