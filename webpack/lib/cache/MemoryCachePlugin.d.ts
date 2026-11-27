export = MemoryCachePlugin;
/** @import { Data, Etag } from "./Cache" */
/** @import Compiler from "../Compiler" */
declare class MemoryCachePlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
