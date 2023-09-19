export = SharePlugin;
/** @typedef {import("../../declarations/plugins/sharing/ConsumeSharedPlugin").ConsumeSharedPluginOptions} ConsumeSharedPluginOptions */
/** @typedef {import("../../declarations/plugins/sharing/ConsumeSharedPlugin").ConsumesConfig} ConsumesConfig */
/** @typedef {import("../../declarations/plugins/sharing/ProvideSharedPlugin").ProvideSharedPluginOptions} ProvideSharedPluginOptions */
/** @typedef {import("../../declarations/plugins/sharing/ProvideSharedPlugin").ProvidesConfig} ProvidesConfig */
/** @typedef {import("../../declarations/plugins/sharing/SharePlugin").SharePluginOptions} SharePluginOptions */
/** @typedef {import("../../declarations/plugins/sharing/SharePlugin").SharedConfig} SharedConfig */
/** @typedef {import("webpack/lib/Compiler")} Compiler */
declare class SharePlugin {
  /**
   * @param {SharePluginOptions} options options
   */
  constructor(options: any);
  _shareScope: any;
  _consumes: Record<string, any>[];
  _provides: Record<string, any>[];
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace SharePlugin {
  export {
    ConsumeSharedPluginOptions,
    ConsumesConfig,
    ProvideSharedPluginOptions,
    ProvidesConfig,
    SharePluginOptions,
    SharedConfig,
    Compiler,
  };
}
type Compiler = import('webpack/lib/Compiler');
type ConsumeSharedPluginOptions = any;
type ConsumesConfig = any;
type ProvideSharedPluginOptions = any;
type ProvidesConfig = any;
type SharePluginOptions = any;
type SharedConfig = any;
