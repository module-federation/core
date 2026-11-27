export = WarnDeprecatedOptionPlugin;
declare class WarnDeprecatedOptionPlugin {
    /**
     * Create an instance of the plugin
     * @param {string} option the target option
     * @param {string | number} value the deprecated option value
     * @param {string} suggestion the suggestion replacement
     */
    constructor(option: string, value: string | number, suggestion: string);
    /** @type {string} */
    option: string;
    /** @type {string | number} */
    value: string | number;
    /** @type {string} */
    suggestion: string;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
