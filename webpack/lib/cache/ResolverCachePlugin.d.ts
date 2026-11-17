export = ResolverCachePlugin;
declare class ResolverCachePlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ResolverCachePlugin {
    export { SyncHook, Dependencies, Yield };
}
import type Compiler from "../Compiler";
/**
 * Defines the sync hook type used by this module.
 */
type SyncHook<T> = import("tapable").SyncHook<T>;
type Dependencies = Set<string>;
type Yield = NonNullable<ResolveContext["yield"]>;
import type { ResolveContext } from "enhanced-resolve";
