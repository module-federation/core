export = ModuleFederationPlugin;
declare class ModuleFederationPlugin {
    /**
     * @param {ModuleFederationPluginOptions} options options
     */
    constructor(options: any);
    _options: any;
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
type Compiler = import("webpack/lib/Compiler");
type ExternalsType = any;
type ModuleFederationPluginOptions = any;
type Shared = any;
