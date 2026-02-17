export = BannerPlugin;
declare class BannerPlugin {
    /**
     * @param {BannerPluginArgument} options options object
     */
    constructor(options: BannerPluginArgument);
    options: import("../declarations/plugins/BannerPlugin").BannerPluginOptions;
    /** @type {BannerFunction} */
    banner: BannerFunction;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace BannerPlugin {
    export { BannerFunction, BannerPluginArgument, PathData, Compiler, TemplatePath };
}
type BannerFunction = import("../declarations/plugins/BannerPlugin").BannerFunction;
type BannerPluginArgument = import("../declarations/plugins/BannerPlugin").BannerPluginArgument;
type PathData = import("./Compilation").PathData;
type Compiler = import("./Compiler");
type TemplatePath = import("./TemplatedPathPlugin").TemplatePath;
