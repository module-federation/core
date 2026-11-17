export = FlagAllModulesAsUsedPlugin;
declare class FlagAllModulesAsUsedPlugin {
    /**
     * Creates an instance of FlagAllModulesAsUsedPlugin.
     * @param {string} explanation explanation
     */
    constructor(explanation: string);
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
