export = ESMExportDependencyParserPlugin;
declare class ESMExportDependencyParserPlugin {
    /**
     * Creates an instance of ESMExportDependencyParserPlugin.
     * @param {JavascriptParserOptions} options options
     */
    constructor(options: JavascriptParserOptions);
    /** @type {JavascriptParserOptions} */
    options: JavascriptParserOptions;
    exportPresenceMode: import("./ESMImportDependency").ExportPresenceMode;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
import type JavascriptParser from "../../javascript/JavascriptParser";
