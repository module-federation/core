export type ParsedImportMetaGlobOptions = {
    /**
     * patterns
     */
    patterns: string[];
    /**
     * request context
     */
    requestContext: string;
    /**
     * base directory
     */
    baseDir: string;
    /**
     * recursive
     */
    recursive: boolean;
    /**
     * mode
     */
    mode: ContextModuleOptions["mode"];
    /**
     * import name
     */
    importName: string | undefined;
    /**
     * query
     */
    query: string;
    /**
     * exhaustive
     */
    exhaustive: boolean;
    /**
     * case sensitive
     */
    caseSensitive: boolean;
    /**
     * referenced exports
     */
    referencedExports: RawReferencedExports | undefined;
    /**
     * range
     */
    range: JavascriptParser.Range;
};
/**
 * @param {CallExpression} expr call expression
 * @param {JavascriptParser} parser parser
 * @returns {{ options: ParsedImportMetaGlobOptions | undefined, errors: WebpackError[], warnings: UnsupportedFeatureWarning[] }} parse result
 */
export function parseImportMetaGlobCall(expr: CallExpression, parser: JavascriptParser): {
    options: ParsedImportMetaGlobOptions | undefined;
    errors: WebpackError[];
    warnings: UnsupportedFeatureWarning[];
};
import type { ContextModuleOptions } from "../../context/ContextModule";
import type { RawReferencedExports } from "../../graph/Dependency";
import type JavascriptParser from "../../javascript/JavascriptParser";
import type { CallExpression } from "estree";
import WebpackError = require("../../errors/WebpackError");
import type UnsupportedFeatureWarning from "../../errors/UnsupportedFeatureWarning";
