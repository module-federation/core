export = AssetModulesPlugin;
/**
 * Represents the asset modules plugin runtime component.
 * @typedef {object} AssetModulesPluginOptions
 * @property {boolean=} sideEffectFree
 */
declare class AssetModulesPlugin {
    /**
     * Creates an instance of AssetModulesPlugin.
     * @param {AssetModulesPluginOptions} options options
     */
    constructor(options: AssetModulesPluginOptions);
    /** @type {AssetModulesPluginOptions} */
    options: AssetModulesPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace AssetModulesPlugin {
    export { AssetModulesPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Represents the asset modules plugin runtime component.
 */
type AssetModulesPluginOptions = {
    sideEffectFree?: boolean | undefined;
};
