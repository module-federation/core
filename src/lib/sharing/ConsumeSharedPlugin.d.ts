export = ConsumeSharedPlugin;
declare class ConsumeSharedPlugin {
    /**
     * @param {ConsumeSharedPluginOptions} options options
     */
    constructor(options: any);
    /** @type {[string, ConsumeOptions][]} */
    _consumes: [string, ConsumeOptions][];
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: any): void;
}
declare namespace ConsumeSharedPlugin {
    export { ConsumeSharedPluginOptions, ConsumesConfig, Compiler, ResolveOptionsWithDependencyType, ConsumeOptions };
}
type ConsumeOptions = import("./ConsumeSharedModule").ConsumeOptions;
type ConsumeSharedPluginOptions = any;
type ConsumesConfig = any;
type Compiler = any;
type ResolveOptionsWithDependencyType = any;
