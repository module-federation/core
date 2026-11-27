export = ImportParserPlugin;
declare class ImportParserPlugin {
    /**
     * Creates an instance of ImportParserPlugin.
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
declare namespace ImportParserPlugin {
    export { ImportSettings, State };
}
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
import type JavascriptParser from "../../javascript/JavascriptParser";
type ImportSettings = {
    references: RawReferencedExports;
    expression: JavascriptParser.ImportExpression;
};
type State = WeakMap<JavascriptParser.ImportExpression, RawReferencedExports>;
import type { RawReferencedExports } from "../../graph/Dependency";
