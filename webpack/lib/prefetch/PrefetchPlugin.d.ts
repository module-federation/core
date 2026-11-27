export = PrefetchPlugin;
declare class PrefetchPlugin {
    /**
     * Creates an instance of PrefetchPlugin.
     * @param {string} context context or request if context is not set
     * @param {string=} request request
     */
    constructor(context: string, request?: string | undefined);
    /** @type {string | null} */
    context: string | null;
    /** @type {string} */
    request: string;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
