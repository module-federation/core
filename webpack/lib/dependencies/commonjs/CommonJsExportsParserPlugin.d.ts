export = CommonJsExportsParserPlugin;
declare class CommonJsExportsParserPlugin {
    /**
     * Creates an instance of CommonJsExportsParserPlugin.
     * @param {JavascriptParserOptions["topLevelThis"]} topLevelThis what top-level `this` refers to
     */
    constructor(topLevelThis: JavascriptParserOptions["topLevelThis"]);
    /** @type {boolean} */
    thisAsExports: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace CommonJsExportsParserPlugin {
    export { NodeFieldValue };
}
import type JavascriptParser from "../../javascript/JavascriptParser";
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
type NodeFieldValue = Node extends infer N ? (N extends Node ? N[keyof N] : never) : never;
import type { Node } from "estree";
