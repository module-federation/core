export = EnableLibraryPlugin;
declare class EnableLibraryPlugin {
    /**
     * Updates enabled using the provided compiler.
     * @param {Compiler} compiler the compiler instance
     * @param {LibraryType} type type of library
     * @returns {void}
     */
    static setEnabled(compiler: Compiler, type: LibraryType): void;
    /**
     * Checks enabled.
     * @param {Compiler} compiler the compiler instance
     * @param {LibraryType} type type of library
     * @returns {void}
     */
    static checkEnabled(compiler: Compiler, type: LibraryType): void;
    /**
     * Creates an instance of EnableLibraryPlugin.
     * @param {LibraryType} type library type that should be available
     * @param {EnableLibraryPluginOptions} options options of EnableLibraryPlugin
     */
    constructor(type: LibraryType, options?: EnableLibraryPluginOptions);
    /** @type {LibraryType} */
    type: LibraryType;
    /** @type {EnableLibraryPluginOptions} */
    options: EnableLibraryPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace EnableLibraryPlugin {
    export { LibraryTypes, EnableLibraryPluginOptions };
}
import type { LibraryType } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
type LibraryTypes = Set<LibraryType>;
/**
 * Defines the enable library plugin options type used by this module.
 */
type EnableLibraryPluginOptions = {
    /**
     * function that runs when applying the current plugin.
     */
    additionalApply?: (() => void) | undefined;
};
