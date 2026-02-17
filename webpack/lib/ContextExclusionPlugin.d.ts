export = ContextExclusionPlugin;
declare class ContextExclusionPlugin {
    /**
     * @param {RegExp} negativeMatcher Matcher regular expression
     */
    constructor(negativeMatcher: RegExp);
    negativeMatcher: RegExp;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ContextExclusionPlugin {
    export { Compiler };
}
type Compiler = import("./Compiler");
