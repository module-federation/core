export = CommonJsChunkLoadingPlugin;
declare class CommonJsChunkLoadingPlugin {
    /**
     * Creates an instance of CommonJsChunkLoadingPlugin.
     * @param {CommonJsChunkLoadingPluginOptions=} options options
     */
    constructor(options?: CommonJsChunkLoadingPluginOptions | undefined);
    /** @type {CommonJsChunkLoadingPluginOptions} */
    options: CommonJsChunkLoadingPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace CommonJsChunkLoadingPlugin {
    export { CommonJsChunkLoadingPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the common js chunk loading plugin options type used by this module.
 */
type CommonJsChunkLoadingPluginOptions = {
    /**
     * enable async chunk loading
     */
    asyncChunkLoading?: boolean | undefined;
};
