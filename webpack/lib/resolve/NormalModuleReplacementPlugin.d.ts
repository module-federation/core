export = NormalModuleReplacementPlugin;
declare class NormalModuleReplacementPlugin {
    /**
     * Create an instance of the plugin
     * @param {RegExp} resourceRegExp the resource matcher
     * @param {string | ModuleReplacer} newResource the resource replacement
     */
    constructor(resourceRegExp: RegExp, newResource: string | ModuleReplacer);
    /** @type {RegExp} */
    resourceRegExp: RegExp;
    /** @type {string | ModuleReplacer} */
    newResource: string | ModuleReplacer;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NormalModuleReplacementPlugin {
    export { ModuleReplacer };
}
import type Compiler from "../Compiler";
type ModuleReplacer = (resolveData: ResolveData) => void;
import type { ResolveData } from "../module/NormalModuleFactory";
