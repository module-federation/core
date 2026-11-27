export = FlagEntryExportAsUsedPlugin;
declare class FlagEntryExportAsUsedPlugin {
    /**
     * Creates an instance of FlagEntryExportAsUsedPlugin.
     * @param {boolean} nsObjectUsed true, if the ns object is used
     * @param {string} explanation explanation for the reason
     */
    constructor(nsObjectUsed: boolean, explanation: string);
    /** @type {boolean} */
    nsObjectUsed: boolean;
    /** @type {string} */
    explanation: string;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
