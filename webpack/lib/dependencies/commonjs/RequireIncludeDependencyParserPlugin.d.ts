export = RequireIncludeDependencyParserPlugin;
declare class RequireIncludeDependencyParserPlugin {
    /**
     * Creates an instance of RequireIncludeDependencyParserPlugin.
     * @param {boolean} warn true: warn about deprecation, false: don't warn
     */
    constructor(warn: boolean);
    /** @type {boolean} */
    warn: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
import type JavascriptParser from "../../javascript/JavascriptParser";
