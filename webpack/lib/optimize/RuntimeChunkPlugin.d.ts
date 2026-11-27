export = RuntimeChunkPlugin;
/** @typedef {(entrypoint: { name: string }) => string} RuntimeChunkFunction */
declare class RuntimeChunkPlugin {
    /**
     * Creates an instance of RuntimeChunkPlugin.
     * @param {{ name?: RuntimeChunkFunction }=} options options
     */
    constructor(options?: {
        name?: RuntimeChunkFunction;
    } | undefined);
    /** @type {{ name: string | RuntimeChunkFunction }} */
    options: {
        name: string | RuntimeChunkFunction;
    };
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace RuntimeChunkPlugin {
    export { RuntimeChunkFunction };
}
import type Compiler from "../Compiler";
type RuntimeChunkFunction = (entrypoint: {
    name: string;
}) => string;
