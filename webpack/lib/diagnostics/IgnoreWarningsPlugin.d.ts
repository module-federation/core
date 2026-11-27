export = IgnoreWarningsPlugin;
declare class IgnoreWarningsPlugin {
    /**
     * Creates an instance of IgnoreWarningsPlugin.
     * @param {IgnoreFn[]} ignoreWarnings conditions to ignore warnings
     */
    constructor(ignoreWarnings: IgnoreFn[]);
    /** @type {IgnoreFn[]} */
    _ignoreWarnings: IgnoreFn[];
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace IgnoreWarningsPlugin {
    export { IgnoreFn };
}
import type Compiler from "../Compiler";
type IgnoreFn = (warning: Error, compilation: Compilation) => boolean;
import type Compilation from "../Compilation";
