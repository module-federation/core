export = EnableChunkLoadingPlugin;
declare class EnableChunkLoadingPlugin {
    /**
     * Updates enabled using the provided compiler.
     * @param {Compiler} compiler the compiler instance
     * @param {ChunkLoadingType} type type of library
     * @returns {void}
     */
    static setEnabled(compiler: Compiler, type: ChunkLoadingType): void;
    /**
     * Checks enabled.
     * @param {Compiler} compiler the compiler instance
     * @param {ChunkLoadingType} type type of library
     * @returns {void}
     */
    static checkEnabled(compiler: Compiler, type: ChunkLoadingType): void;
    /**
     * Creates an instance of EnableChunkLoadingPlugin.
     * @param {ChunkLoadingType} type library type that should be available
     */
    constructor(type: ChunkLoadingType);
    /** @type {string} */
    type: string;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace EnableChunkLoadingPlugin {
    export { ChunkLoadingTypes };
}
import type Compiler from "../Compiler";
import type { ChunkLoadingType } from "../../declarations/WebpackOptions";
type ChunkLoadingTypes = Set<ChunkLoadingType>;
