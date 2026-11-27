export = getResolveOptionsKey;
/**
 * Serializes resolve options into a cache key. Plain JSON values and regular expressions are keyed by content; functions, class instances and `unsafeCache` objects by identity, which holds only within this process.
 * @param {ResolveOptionsWithDependencyType} options resolve options
 * @returns {{ key: string, persistent: boolean }} the key, and whether it means the same in another process
 */
declare function getResolveOptionsKey(options: ResolveOptionsWithDependencyType): {
    key: string;
    persistent: boolean;
};
import type { ResolveOptionsWithDependencyType } from "./ResolverFactory";
