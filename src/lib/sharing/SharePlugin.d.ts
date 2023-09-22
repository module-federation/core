export = SharePlugin;
/** @typedef {import("webpack/declarations/plugins/sharing/ConsumeSharedPlugin").ConsumeSharedPluginOptions} ConsumeSharedPluginOptions */
/** @typedef {import("webpack/declarations/plugins/sharing/ConsumeSharedPlugin").ConsumesConfig} ConsumesConfig */
/** @typedef {import("webpack/declarations/plugins/sharing/ProvideSharedPlugin").ProvideSharedPluginOptions} ProvideSharedPluginOptions */
/** @typedef {import("webpack/declarations/plugins/sharing/ProvideSharedPlugin").ProvidesConfig} ProvidesConfig */
/** @typedef {import("webpack/declarations/plugins/sharing/SharePlugin").SharePluginOptions} SharePluginOptions */
/** @typedef {import("webpack/declarations/plugins/sharing/SharePlugin").SharedConfig} SharedConfig */
/** @typedef {import("webpack/lib/Compiler")} Compiler */
declare class SharePlugin {
    /**
     * @param {SharePluginOptions} options options
     */
    constructor(options: SharePluginOptions);
    _shareScope: string;
    _consumes: Record<string, import("webpack/declarations/plugins/sharing/ConsumeSharedPlugin").ConsumesConfig>[];
    _provides: Record<string, import("webpack/declarations/plugins/sharing/ProvideSharedPlugin").ProvidesConfig>[];
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace SharePlugin {
    export { ConsumeSharedPluginOptions, ConsumesConfig, ProvideSharedPluginOptions, ProvidesConfig, SharePluginOptions, SharedConfig, Compiler };
}
type Compiler = import("webpack/lib/Compiler");
type SharePluginOptions = import("webpack/declarations/plugins/sharing/SharePlugin").SharePluginOptions;
type ConsumeSharedPluginOptions = import("webpack/declarations/plugins/sharing/ConsumeSharedPlugin").ConsumeSharedPluginOptions;
type ConsumesConfig = import("webpack/declarations/plugins/sharing/ConsumeSharedPlugin").ConsumesConfig;
type ProvideSharedPluginOptions = import("webpack/declarations/plugins/sharing/ProvideSharedPlugin").ProvideSharedPluginOptions;
type ProvidesConfig = import("webpack/declarations/plugins/sharing/ProvideSharedPlugin").ProvidesConfig;
type SharedConfig = import("webpack/declarations/plugins/sharing/SharePlugin").SharedConfig;
