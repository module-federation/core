export = RequireEnsureDependenciesBlockParserPlugin;
declare class RequireEnsureDependenciesBlockParserPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
import type JavascriptParser from "../../javascript/JavascriptParser";
