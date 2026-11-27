export = xmlMinify;
/** @import { CssEnvironment, CssTransformOptions } from "../css/syntax-parser" */
/** @import { OptimizationMinimizeXml } from "../../declarations/WebpackOptions" */
/** @import { RawSourceMap } from "webpack-sources" */
/**
 * A `minify` function for `minimizer-webpack-plugin`: prints one `.svg` or `.xml`
 * asset minified, reading it as XML 1.0 and minifying each SVG or XHTML stylesheet
 * it holds with the CSS minifier.
 * @param {{ [file: string]: string | Buffer }} input a single `{ filename: code }` entry; a `Buffer` is read as UTF-8
 * @param {(RawSourceMap | undefined)=} sourceMap input source map (unused: the printer is token-coarse, so no map is produced)
 * @param {OptimizationMinimizeXml & { environment?: CssEnvironment, css?: { convertLengthUnits?: boolean, convertApproximateColors?: boolean, dropOverriddenDeclarations?: boolean, rewriteCustomProperties?: boolean, unusedSymbols?: string[], pseudoClasses?: { [name: string]: string } } & CssTransformOptions }=} minimizerOptions `environment` and `css` (`optimization.minimizeOptions.css`, whole) reach the CSS minifier this runs over each stylesheet
 * @returns {Promise<{ code: string }>} the minified document
 */
declare function xmlMinify(input: {
    [file: string]: string | Buffer;
}, sourceMap?: (RawSourceMap | undefined) | undefined, minimizerOptions?: (OptimizationMinimizeXml & {
    environment?: CssEnvironment;
    css?: {
        convertLengthUnits?: boolean;
        convertApproximateColors?: boolean;
        dropOverriddenDeclarations?: boolean;
        rewriteCustomProperties?: boolean;
        unusedSymbols?: string[];
        pseudoClasses?: {
            [name: string]: string;
        };
    } & CssTransformOptions;
}) | undefined): Promise<{
    code: string;
}>;
declare namespace xmlMinify {
    function supportsWorkerThreads(): boolean;
    /**
     * The language this minifies, for a caller dispatching source with no filename.
     * @returns {string[]} the languages
     */
    function getTypes(): string[];
    /**
     * @param {string} name asset filename
     * @returns {boolean} true for SVG and XML assets
     */
    function filter(name: string): boolean;
}
import type { RawSourceMap } from "webpack-sources";
import type { OptimizationMinimizeXml } from "../../declarations/WebpackOptions";
import type { CssEnvironment } from "../css/syntax-parser";
import type { CssTransformOptions } from "../css/syntax-parser";
