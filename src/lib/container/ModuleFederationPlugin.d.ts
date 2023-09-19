export = ModuleFederationPlugin;
declare class ModuleFederationPlugin {
    /**
     * @param {ModuleFederationPluginOptions} options options
     */
    constructor(options: ModuleFederationPluginOptions);
    _options: import("webpack/declarations/plugins/container/ModuleFederationPlugin").ModuleFederationPluginOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: any): void;
}
declare namespace ModuleFederationPlugin {
    export { ExternalsType, ModuleFederationPluginOptions, Shared, Compiler };
}
type ModuleFederationPluginOptions = import("webpack/declarations/plugins/container/ModuleFederationPlugin").ModuleFederationPluginOptions;
type ExternalsType = import("webpack/declarations/plugins/container/ModuleFederationPlugin").ExternalsType;
type Shared = import("webpack/declarations/plugins/container/ModuleFederationPlugin").Shared;
type Compiler = any;
