export = ESMModulesPlugin;
declare class ESMModulesPlugin {
    /**
     * Creates an instance of ESMModulesPlugin.
     * @param {ESMModulesPluginOptions} options options
     */
    constructor(options: ESMModulesPluginOptions);
    /** @type {ESMModulesPluginOptions} */
    options: ESMModulesPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ESMModulesPlugin {
    export { ESMModulesPluginOptions };
}
import type Compiler from "../../Compiler";
/**
 * Defines the harmony modules plugin options type used by this module.
 */
type ESMModulesPluginOptions = {
    deferImport?: boolean | undefined;
};
