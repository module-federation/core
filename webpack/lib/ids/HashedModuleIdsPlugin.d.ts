export = HashedModuleIdsPlugin;
declare class HashedModuleIdsPlugin {
    /**
     * @param {HashedModuleIdsPluginOptions=} options options object
     */
    constructor(options?: HashedModuleIdsPluginOptions | undefined);
    /** @type {Required<Omit<HashedModuleIdsPluginOptions, "context">> & { context?: string | undefined }} */
    options: Required<Omit<HashedModuleIdsPluginOptions, "context">> & {
        context?: string | undefined;
    };
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace HashedModuleIdsPlugin {
    export { HashedModuleIdsPluginOptions, Compiler };
}
type HashedModuleIdsPluginOptions = import("../../declarations/plugins/ids/HashedModuleIdsPlugin").HashedModuleIdsPluginOptions;
type Compiler = import("../Compiler");
