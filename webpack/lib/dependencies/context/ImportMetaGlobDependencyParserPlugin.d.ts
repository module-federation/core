export = ImportMetaGlobDependencyParserPlugin;
declare class ImportMetaGlobDependencyParserPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
import type JavascriptParser from "../../javascript/JavascriptParser";
