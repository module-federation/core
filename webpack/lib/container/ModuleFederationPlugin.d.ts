export = ModuleFederationPlugin;
declare class ModuleFederationPlugin {
  /**
   * @param {ModuleFederationPluginOptions} options options
   */
  constructor(options: ModuleFederationPluginOptions);
  _options: import('../../declarations/plugins/container/ModuleFederationPlugin').ModuleFederationPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ModuleFederationPlugin {
  export { ExternalsType, ModuleFederationPluginOptions, Shared, Compiler };
}
type Compiler = import('../Compiler');
type ModuleFederationPluginOptions =
  import('../../declarations/plugins/container/ModuleFederationPlugin').ModuleFederationPluginOptions;
type ExternalsType =
  import('../../declarations/plugins/container/ModuleFederationPlugin').ExternalsType;
type Shared =
  import('../../declarations/plugins/container/ModuleFederationPlugin').Shared;
