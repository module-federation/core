export = LoaderTargetPlugin;
declare class LoaderTargetPlugin {
    /**
     * Creates an instance of LoaderTargetPlugin.
     * @param {string} target the target
     */
    constructor(target: string);
    /** @type {string} */
    target: string;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
