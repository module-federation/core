export = IgnorePlugin;
declare class IgnorePlugin {
    /**
     * Creates an instance of IgnorePlugin.
     * @param {IgnorePluginOptions} options IgnorePlugin options
     */
    constructor(options: IgnorePluginOptions);
    /** @type {IgnorePluginOptions} */
    options: IgnorePluginOptions;
    /**
     * Note that if "contextRegExp" is given, both the "resourceRegExp" and "contextRegExp" have to match.
     * @param {ResolveData | BeforeContextResolveData} resolveData resolve data
     * @returns {false | undefined} returns false when the request should be ignored, otherwise undefined
     */
    checkIgnore(resolveData: ResolveData | BeforeContextResolveData): false | undefined;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace IgnorePlugin {
    export { CheckResourceFn, IgnorePluginPatternOptions, IgnorePluginCheckOptions, IgnorePluginOptions };
}
import type { ResolveData } from "../module/NormalModuleFactory";
import type { BeforeContextResolveData } from "../context/ContextModuleFactory";
import type Compiler from "../Compiler";
type CheckResourceFn = (resource: string, context: string) => boolean;
type IgnorePluginPatternOptions = {
    /**
     * A RegExp to test the context (directory) against.
     */
    contextRegExp?: RegExp | undefined;
    /**
     * A RegExp to test the request against.
     */
    resourceRegExp: RegExp;
};
type IgnorePluginCheckOptions = {
    /**
     * A filter function for resource and context.
     */
    checkResource: CheckResourceFn;
};
type IgnorePluginOptions = IgnorePluginPatternOptions | IgnorePluginCheckOptions;
