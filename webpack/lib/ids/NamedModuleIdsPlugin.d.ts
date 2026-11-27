export = NamedModuleIdsPlugin;
declare class NamedModuleIdsPlugin {
    /**
     * Creates an instance of NamedModuleIdsPlugin.
     * @param {NamedModuleIdsPluginOptions=} options options
     */
    constructor(options?: NamedModuleIdsPluginOptions | undefined);
    /** @type {NamedModuleIdsPluginOptions} */
    options: NamedModuleIdsPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NamedModuleIdsPlugin {
    export { NamedModuleIdsPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the named module ids plugin options type used by this module.
 */
type NamedModuleIdsPluginOptions = {
    /**
     * context
     */
    context?: string | undefined;
};
