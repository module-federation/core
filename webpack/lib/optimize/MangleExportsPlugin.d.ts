export = MangleExportsPlugin;
declare class MangleExportsPlugin {
    /**
     * Creates an instance of MangleExportsPlugin.
     * @param {boolean} deterministic use deterministic names
     */
    constructor(deterministic: boolean);
    /** @type {boolean} */
    _deterministic: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace MangleExportsPlugin {
    export { Comparator };
}
import type Compiler from "../Compiler";
/**
 * Defines the comparator type used by this module.
 */
type Comparator<T> = import("../util/comparators").Comparator<T>;
