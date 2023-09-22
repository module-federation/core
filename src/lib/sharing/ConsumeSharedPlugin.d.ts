export = ConsumeSharedPlugin;
declare class ConsumeSharedPlugin {
    /**
     * @param {ConsumeSharedPluginOptions} options options
     */
    constructor(options: ConsumeSharedPluginOptions);
    /** @type {[string, ConsumeOptions][]} */
    _consumes: [string, ConsumeOptions][];
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ConsumeSharedPlugin {
    export { ConsumeSharedPluginOptions, ConsumesConfig, Compiler, ResolveOptionsWithDependencyType, ConsumeOptions };
}
type ConsumeOptions = import("./ConsumeSharedModule").ConsumeOptions;
type Compiler = import("webpack/lib/Compiler");
type ConsumeSharedPluginOptions = import("webpack/declarations/plugins/sharing/ConsumeSharedPlugin").ConsumeSharedPluginOptions;
type ConsumesConfig = import("webpack/declarations/plugins/sharing/ConsumeSharedPlugin").ConsumesConfig;
type ResolveOptionsWithDependencyType = import("webpack/lib/ResolverFactory").ResolveOptionsWithDependencyType;
