export = cssMinify;
/** @import { CssEnvironment, CssTransformOptions } from "./syntax-parser" */
/**
 * What a renderer made of one embedded body: the minified text, and anything it
 * has to report about it. A bare string is the text alone.
 * @typedef {{ code?: string, warnings?: (Error | string)[], errors?: (Error | string)[] }} EmbeddedSourceResult
 */
/**
 * Minifies source a stylesheet embeds; may answer asynchronously.
 * @typedef {(source: string, info: { type: string, hostType: string }) => Promise<string | EmbeddedSourceResult | undefined> | string | EmbeddedSourceResult | undefined} AsyncEmbeddedSourceRenderer
 */
/** @import { SourceMap } from "../util/SourceProcessor" */
/** @import { DeferredEmbeddedSource } from "../util/dataURL" */
/** @typedef {import("../util/extractComments").PluginExtractComments} ExtractCommentsOption */
/** @typedef {import("../../declarations/WebpackOptions").OptimizationMinimizeExtractComments} MinimizeExtractComments */
/**
 * A `minify` function for `minimizer-webpack-plugin` (passed as its `minify`
 * option): safely serializes one CSS asset's minimized form (collapse
 * whitespace, drop redundant separators and empty rules, shorten colors /
 * numbers / easing functions / identifier escapes, normalize string and `url()`
 * quoting, keep custom-property values verbatim unless asked otherwise), so CSS minification reuses
 * that plugin's pipeline — source maps, caching and worker-thread parallelization.
 *
 * The parser is read from the public `webpack.css.syntax` API inside the body, not
 * imported at module scope: `minimizer-webpack-plugin` ships this function to its
 * worker pool as source (a top-level import wouldn't survive), and `require("webpack")`
 * re-resolves in the worker — via the installed package, or the dev self-link.
 * @param {{ [file: string]: string | Buffer }} input a single `{ filename: code }` entry; a `Buffer` is read as UTF-8
 * @param {object=} sourceMap the asset's input source map — the plugin chains it onto the map returned here, so it isn't read directly
 * @param {{ as?: "stylesheet" | "block-contents", environment?: CssEnvironment, charset?: "auto" | false, convertLengthUnits?: boolean, convertApproximateColors?: boolean, dropOverriddenDeclarations?: boolean, extractComments?: MinimizeExtractComments, mergeDistantRules?: boolean, rewriteCustomProperties?: boolean, unusedSymbols?: string[], pseudoClasses?: { [name: string]: string }, renderEmbeddedSource?: AsyncEmbeddedSourceRenderer, svg?: boolean } & CssTransformOptions=} minimizerOptions minimizer options — `environment` carries the target's CSS abilities (see `output.environment`), so a spelling the target cannot read is not reached for; the rest is `optimization.minimize.css` (e.g. `convertLengthUnits`, and the per-transform switches). `renderEmbeddedSource` minifies source this stylesheet embeds, and may be asynchronous: one parse serves both it and the output; `svg` minifies an SVG `data:` URL it declines as the `.svg` assets are. Its `extractComments` decides which comments move into a separate file, over the plugin's
 * @param {ExtractCommentsOption=} extractComments the plugin's `extractComments`, read where `minimize.css.extractComments` is not set
 * @returns {Promise<{ code: string, map?: SourceMap, extractedComments?: string[], warnings?: (Error | string)[], errors?: (Error | string)[] }>} the minified CSS, its input->output source map (one anchor for the whole of a `block-contents` print, which is emitted as one piece), the comments taken out of it, and what a renderer reported over what this embeds
 */
declare function cssMinify(input: {
    [file: string]: string | Buffer;
}, sourceMap?: object | undefined, minimizerOptions?: ({
    as?: "stylesheet" | "block-contents";
    environment?: CssEnvironment;
    charset?: "auto" | false;
    convertLengthUnits?: boolean;
    convertApproximateColors?: boolean;
    dropOverriddenDeclarations?: boolean;
    extractComments?: MinimizeExtractComments;
    mergeDistantRules?: boolean;
    rewriteCustomProperties?: boolean;
    unusedSymbols?: string[];
    pseudoClasses?: {
        [name: string]: string;
    };
    renderEmbeddedSource?: AsyncEmbeddedSourceRenderer;
    svg?: boolean;
} & CssTransformOptions) | undefined, extractComments?: ExtractCommentsOption | undefined): Promise<{
    code: string;
    map?: SourceMap;
    extractedComments?: string[];
    warnings?: (Error | string)[];
    errors?: (Error | string)[];
}>;
declare namespace cssMinify {
    export { supportsWorkerThreads, getBannerPosition, getTypes, getEmbeddedTypes, filter, EmbeddedSourceResult, AsyncEmbeddedSourceRenderer, ExtractCommentsOption, MinimizeExtractComments };
}
import type { CssEnvironment } from "./syntax-parser";
import type { CssTransformOptions } from "./syntax-parser";
import type { SourceMap } from "../util/SourceProcessor";
declare function supportsWorkerThreads(): boolean;
/**
 * Where the minimizer plugin puts its `extractComments` banner: at the end, so
 * a `@charset` the print opens with stays the stylesheet's opening bytes.
 * @returns {"end"} the position
 */
declare function getBannerPosition(): "end";
/**
 * The language this minifies, for a caller dispatching source that carries no
 * filename — CSS a module embeds in a JavaScript string literal.
 * @returns {string[]} the languages
 */
declare function getTypes(): string[];
/**
 * The languages this can offer a caller through `renderEmbeddedSource` — what a
 * `url()` `data:` payload's media type may name.
 * @returns {string[]} the languages
 */
declare function getEmbeddedTypes(): string[];
/**
 * @param {string} name asset filename
 * @returns {boolean} true for CSS assets
 */
declare function filter(name: string): boolean;
/**
 * What a renderer made of one embedded body: the minified text, and anything it
 * has to report about it. A bare string is the text alone.
 */
type EmbeddedSourceResult = {
    code?: string;
    warnings?: (Error | string)[];
    errors?: (Error | string)[];
};
/**
 * Minifies source a stylesheet embeds; may answer asynchronously.
 */
type AsyncEmbeddedSourceRenderer = (source: string, info: {
    type: string;
    hostType: string;
}) => Promise<string | EmbeddedSourceResult | undefined> | string | EmbeddedSourceResult | undefined;
type ExtractCommentsOption = import("../util/extractComments").PluginExtractComments;
type MinimizeExtractComments = import("../../declarations/WebpackOptions").OptimizationMinimizeExtractComments;
