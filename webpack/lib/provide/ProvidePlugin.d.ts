export = ProvidePlugin;
declare class ProvidePlugin {
    /**
     * Creates an instance of ProvidePlugin.
     * @param {Record<string, string | string[]>} definitions the provided identifiers
     */
    constructor(definitions: Record<string, string | string[]>);
    /** @type {Record<string, string | string[]>} */
    definitions: Record<string, string | string[]>;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
