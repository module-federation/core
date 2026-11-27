export = TopLevelThisParserPlugin;
declare class TopLevelThisParserPlugin {
    /**
     * Creates an instance of TopLevelThisParserPlugin.
     * @param {boolean | undefined} hasGlobalThis whether the target has a `globalThis` binding
     */
    constructor(hasGlobalThis: boolean | undefined);
    /** @type {boolean} */
    hasGlobalThis: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
import type JavascriptParser from "../../javascript/JavascriptParser";
