export = ContextExclusionPlugin;
declare class ContextExclusionPlugin {
    /**
     * Creates an instance of ContextExclusionPlugin.
     * @param {RegExp} negativeMatcher Matcher regular expression
     */
    constructor(negativeMatcher: RegExp);
    /** @type {RegExp} */
    negativeMatcher: RegExp;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
