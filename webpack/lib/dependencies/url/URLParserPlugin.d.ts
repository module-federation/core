export = URLParserPlugin;
/**
 * @typedef {object} ResolvedResourceHints
 * @property {boolean=} prefetch project-wide prefetch default
 * @property {boolean=} preload project-wide preload default
 * @property {("low" | "high" | "auto" | false)=} fetchPriority project-wide fetchPriority default
 */
declare class URLParserPlugin {
    /**
     * Creates an instance of URLParserPlugin.
     * @param {JavascriptParserOptions} options options
     */
    constructor(options: JavascriptParserOptions);
    /** @type {JavascriptParserOptions} */
    options: JavascriptParserOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace URLParserPlugin {
    export { ResolvedResourceHints };
}
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
import type JavascriptParser from "../../javascript/JavascriptParser";
type ResolvedResourceHints = {
    /**
     * project-wide prefetch default
     */
    prefetch?: boolean | undefined;
    /**
     * project-wide preload default
     */
    preload?: boolean | undefined;
    /**
     * project-wide fetchPriority default
     */
    fetchPriority?: ("low" | "high" | "auto" | false) | undefined;
};
