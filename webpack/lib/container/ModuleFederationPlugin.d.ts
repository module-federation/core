export = ModuleFederationPlugin;
declare class ModuleFederationPlugin {
    /**
     * Get the compilation hooks associated with this plugin.
     * @param {Compilation} compilation The compilation instance.
     * @returns {CompilationHooks} The hooks for the compilation.
     */
    static getCompilationHooks(compilation: Compilation): CompilationHooks;
    /**
     * @param {ModuleFederationPluginOptions} options options
     */
    constructor(options: ModuleFederationPluginOptions);
    _options: import("../../declarations/plugins/container/ModuleFederationPlugin").ModuleFederationPluginOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ModuleFederationPlugin {
    export { ExternalsType, ModuleFederationPluginOptions, Compiler, Dependency, CompilationHooks };
}
import Compilation = require("../Compilation");
type ExternalsType = import("../../declarations/plugins/container/ModuleFederationPlugin").ExternalsType;
type ModuleFederationPluginOptions = import("../../declarations/plugins/container/ModuleFederationPlugin").ModuleFederationPluginOptions;
type Compiler = import("../Compiler");
type Dependency = import("../Dependency");
type CompilationHooks = {
    addContainerEntryDependency: SyncHook<Dependency>;
    addFederationRuntimeDependency: SyncHook<Dependency>;
};
import { SyncHook } from "tapable";
