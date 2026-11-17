export = CreateRequireParserPlugin;
declare class CreateRequireParserPlugin {
    /**
     * Creates an instance of CreateRequireParserPlugin.
     * @param {JavascriptParserOptions} options parser options
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
declare namespace CreateRequireParserPlugin {
    export { CommonJsImportSettings };
}
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
import type JavascriptParser from "../../javascript/JavascriptParser";
/**
 * Defines the common js import settings type used by this module.
 */
type CommonJsImportSettings = {
    name?: string | undefined;
    context: string;
};
