export = FlagDependencyUsagePlugin;
declare class FlagDependencyUsagePlugin {
    /**
     * Creates an instance of FlagDependencyUsagePlugin.
     * @param {boolean} global do a global analysis instead of per runtime
     * @param {boolean=} mangleEscapingNamespaces keep exports mangleable when a module's namespace object escapes
     */
    constructor(global: boolean, mangleEscapingNamespaces?: boolean | undefined);
    /** @type {boolean} */
    global: boolean;
    /** @type {boolean} */
    mangleEscapingNamespaces: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
