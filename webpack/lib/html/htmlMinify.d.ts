export = htmlMinify;
/** @import { HtmlPrintOptions, HtmlTransformOptions } from "../html/syntax-printer" */
/** @import { CssEnvironment, CssTransformOptions } from "../css/syntax-parser" */
/**
 * What a renderer made of one embedded body: the minified text, and anything it
 * has to report about it. A bare string is the text alone.
 * @typedef {{ code?: string, warnings?: (Error | string)[], errors?: (Error | string)[] }} EmbeddedSourceResult
 */
/**
 * Minifies source a document embeds; may answer asynchronously.
 * @typedef {(source: string, info: { type: string, hostType: string, as?: string }) => Promise<string | EmbeddedSourceResult | undefined> | string | EmbeddedSourceResult | undefined} AsyncEmbeddedSourceRenderer
 */
/** @import { RawSourceMap } from "webpack-sources" */
/** @import { DeferredEmbeddedSource } from "../util/dataURL" */
/** @import { HtmlPath } from "./syntax-parser" */
/** @typedef {import("../util/extractComments").PluginExtractComments} ExtractCommentsOption */
/** @typedef {import("../../declarations/WebpackOptions").OptimizationMinimizeExtractComments} MinimizeExtractComments */
/**
 * A `minify` function for `minimizer-webpack-plugin` (passed as its `minify`
 * option): safely serializes one HTML asset's minimized form. Every node is
 * rebuilt from its parsed form to the same DOM (text whitespace and attribute
 * values preserved); the transforms are dropping inert comments (conditional /
 * SSI comments are kept) and rewriting opening tags to their shortest equivalent
 * spelling. HTML minification thus reuses that plugin's pipeline — caching and
 * worker-thread parallelization.
 *
 * The parser is read from the public `webpack.html.syntax` API inside the body, not
 * imported at module scope: `minimizer-webpack-plugin` ships this function to its
 * worker pool as source (a top-level import wouldn't survive), and `require("webpack")`
 * re-resolves in the worker — via the installed package, or the dev self-link.
 * @param {{ [file: string]: string | Buffer }} input a single `{ filename: code }` entry; a `Buffer` is read as UTF-8
 * @param {(RawSourceMap | undefined)=} sourceMap input source map (unused: safe serialize keeps positions token-coarse, so no map is produced yet)
 * @param {Omit<HtmlPrintOptions, "renderEmbeddedSource" | "deferEmbeddedSource"> & { environment?: CssEnvironment, css?: { convertLengthUnits?: boolean, convertApproximateColors?: boolean, dropOverriddenDeclarations?: boolean, rewriteCustomProperties?: boolean, unusedSymbols?: string[], pseudoClasses?: { [name: string]: string } } & CssTransformOptions, minifyConditionalComments?: boolean, extractComments?: MinimizeExtractComments, renderEmbeddedSource?: AsyncEmbeddedSourceRenderer, svg?: boolean } & HtmlTransformOptions=} minimizerOptions minimizer options — `environment` and `css` (`optimization.minimize.css`, whole) reach the CSS minifier this runs over inline CSS; the rest is `optimization.minimize.html`. The two stand apart rather than merged: both languages name a `quotes` and a `comments`, and one flat object would hand each the other's answer. `renderEmbeddedSource` minifies source this document embeds and may be asynchronous — one parse serves both it and the output. What it declines this minifies itself, for the languages webpack ships a minifier for, SVG `data:` URLs among them when `svg` is set
 * @param {ExtractCommentsOption=} extractComments the plugin's `extractComments`, read where `minimize.html.extractComments` is not set
 * @returns {Promise<{ code: string, extractedComments?: string[], warnings?: (Error | string)[], errors?: (Error | string)[] }>} the minified HTML, the comments taken out of it, and what a renderer reported over what it embeds
 */
declare function htmlMinify(input: {
    [file: string]: string | Buffer;
}, sourceMap?: (RawSourceMap | undefined) | undefined, minimizerOptions?: (Omit<HtmlPrintOptions, "renderEmbeddedSource" | "deferEmbeddedSource"> & {
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
    minifyConditionalComments?: boolean;
    extractComments?: MinimizeExtractComments;
    renderEmbeddedSource?: AsyncEmbeddedSourceRenderer;
    svg?: boolean;
} & HtmlTransformOptions) | undefined, extractComments?: ExtractCommentsOption | undefined): Promise<{
    code: string;
    extractedComments?: string[];
    warnings?: (Error | string)[];
    errors?: (Error | string)[];
}>;
declare namespace htmlMinify {
    export { supportsWorkerThreads, getTypes, getEmbeddedTypes, filter, formatBanner, getBannerPosition, EmbeddedSourceResult, AsyncEmbeddedSourceRenderer, ExtractCommentsOption, MinimizeExtractComments };
}
import type { RawSourceMap } from "webpack-sources";
import type { HtmlPrintOptions } from "../html/syntax-printer";
import type { CssEnvironment } from "../css/syntax-parser";
import type { CssTransformOptions } from "../css/syntax-parser";
import type { HtmlTransformOptions } from "../html/syntax-printer";
declare function supportsWorkerThreads(): boolean;
/**
 * The language this minifies, for a caller dispatching source that carries no
 * filename — HTML a module embeds in a JavaScript string literal.
 * @returns {string[]} the languages
 */
declare function getTypes(): string[];
/**
 * The languages this can offer a caller through `renderEmbeddedSource` — an
 * inline `<style>`, a `<script>`, every event handler attribute (as the
 * function body it is), an `<svg>` subtree and the document an
 * `<iframe srcdoc>` holds, and every `style=""` as the block's contents it is.
 * @returns {string[]} the languages
 */
declare function getEmbeddedTypes(): string[];
/**
 * @param {string} name asset filename
 * @returns {boolean} true for HTML assets
 */
declare function filter(name: string): boolean;
/**
 * The comment the minimizer plugin writes its `extractComments` banner as: a
 * `/*!` line would be text in the document.
 * @param {string} banner the banner's text
 * @returns {string} the banner as an HTML comment
 */
declare function formatBanner(banner: string): string;
/**
 * Where the minimizer plugin puts its `extractComments` banner: at the end, so
 * the doctype stays first for an engine that reads anything before it oddly.
 * @returns {"end"} the position
 */
declare function getBannerPosition(): "end";
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
 * Minifies source a document embeds; may answer asynchronously.
 */
type AsyncEmbeddedSourceRenderer = (source: string, info: {
    type: string;
    hostType: string;
    as?: string;
}) => Promise<string | EmbeddedSourceResult | undefined> | string | EmbeddedSourceResult | undefined;
type ExtractCommentsOption = import("../util/extractComments").PluginExtractComments;
type MinimizeExtractComments = import("../../declarations/WebpackOptions").OptimizationMinimizeExtractComments;
