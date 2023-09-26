export = SharePlugin;
/** @typedef {import("../../declarations/plugins/sharing/ConsumeSharedPlugin").ConsumeSharedPluginOptions} ConsumeSharedPluginOptions */
/** @typedef {import("../../declarations/plugins/sharing/ConsumeSharedPlugin").ConsumesConfig} ConsumesConfig */
/** @typedef {import("../../declarations/plugins/sharing/ProvideSharedPlugin").ProvideSharedPluginOptions} ProvideSharedPluginOptions */
/** @typedef {import("../../declarations/plugins/sharing/ProvideSharedPlugin").ProvidesConfig} ProvidesConfig */
/** @typedef {import("../../declarations/plugins/sharing/SharePlugin").SharePluginOptions} SharePluginOptions */
/** @typedef {import("../../declarations/plugins/sharing/SharePlugin").SharedConfig} SharedConfig */
/** @typedef {import("../Compiler")} Compiler */
declare class SharePlugin {
  /**
   * @param {SharePluginOptions} options options
   */
  constructor(options: SharePluginOptions);
  _shareScope: string;
  _consumes: Record<
    string,
    import('../../declarations/plugins/sharing/ConsumeSharedPlugin').ConsumesConfig
  >[];
  _provides: Record<
    string,
    import('../../declarations/plugins/sharing/ProvideSharedPlugin').ProvidesConfig
  >[];
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
type Compiler = import('../Compiler');
type SharePluginOptions =
  import('../../declarations/plugins/sharing/SharePlugin').SharePluginOptions;
type ConsumeSharedPluginOptions =
  import('../../declarations/plugins/sharing/ConsumeSharedPlugin').ConsumeSharedPluginOptions;
type ConsumesConfig =
  import('../../declarations/plugins/sharing/ConsumeSharedPlugin').ConsumesConfig;
type ProvideSharedPluginOptions =
  import('../../declarations/plugins/sharing/ProvideSharedPlugin').ProvideSharedPluginOptions;
type ProvidesConfig =
  import('../../declarations/plugins/sharing/ProvideSharedPlugin').ProvidesConfig;
type SharedConfig =
  import('../../declarations/plugins/sharing/SharePlugin').SharedConfig;
