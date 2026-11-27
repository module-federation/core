export = jsMinify;
/** @typedef {import("./syntax-printer").MinifyOptions} MinifyOptions */
/** @typedef {import("./syntax-printer").MinifyOutput} MinifyOutput */
/** @typedef {import("./syntax-printer").Minify} Minify */
/** @typedef {import("./syntax-printer").PrintNode} PrintNode */
/**
 * Which production of JavaScript the source is: a classic script, a module, or
 * the body of an event handler, which is a function body and nothing the
 * minifier parses on its own.
 * @typedef {"script" | "module" | "event-handler"} JavascriptProduction
 */
/** @typedef {import("minimizer-webpack-plugin").ExtractCommentsFunction} CommentCondition */
/** @typedef {import("minimizer-webpack-plugin").ExtractCommentsOptions} ExtractCommentsOption */
/**
 * A condition as it may be written, which is what the plugin names plus the
 * pattern any other string is.
 * @typedef {import("minimizer-webpack-plugin").ExtractCommentsCondition | string} CommentConditionOption
 */
/**
 * A `minify` function for `minimizer-webpack-plugin` (passed as its `minify`
 * option): minifies one JavaScript asset with webpack's own printer, which
 * writes what terser writes without loading it, so JavaScript minification
 * reuses that plugin's pipeline — source maps, caching and worker-thread
 * parallelization.
 *
 * The printer is read inside the body rather than imported at module scope:
 * `minimizer-webpack-plugin` ships this function to its worker pool as source,
 * where this module's own scope is gone.
 * @param {{ [file: string]: string | Buffer }} input a single `{ filename: code }` entry; a `Buffer` is read as UTF-8
 * @param {object=} sourceMap the asset's input source map — the plugin chains it onto the map returned here, so it isn't read directly
 * @param {(MinifyOptions & { as?: JavascriptProduction })=} minimizerOptions `optimization.minimize.javascript`; `as` names the production the source is written in, which is the source's own rather than the configuration's
 * @param {ExtractCommentsOption=} extractComments which comments to move into a separate file
 * @returns {Promise<{ code: string, map?: MinifyOutput["map"], extractedComments?: string[], errors?: Error[] }>} the minified code, its input->output source map, and the comments taken out of it
 */
declare function jsMinify(input: {
    [file: string]: string | Buffer;
}, sourceMap?: object | undefined, minimizerOptions?: (MinifyOptions & {
    as?: JavascriptProduction;
}) | undefined, extractComments?: ExtractCommentsOption | undefined): Promise<{
    code: string;
    map?: MinifyOutput["map"];
    extractedComments?: string[];
    errors?: Error[];
}>;
declare namespace jsMinify {
    export { supportsWorkerThreads, getMinimizerVersion, getTypes, filter, MinifyOptions, MinifyOutput, Minify, PrintNode, JavascriptProduction, CommentCondition, ExtractCommentsOption, CommentConditionOption };
}
declare function supportsWorkerThreads(): boolean;
/**
 * The version minified output is cached against, so an upgrade of the printer —
 * which ships inside webpack — invalidates what it minified.
 * @returns {string} webpack's version
 */
declare function getMinimizerVersion(): string;
/**
 * The language this minifies, for a caller dispatching source that carries no
 * filename — a `<script>` an HTML document embeds.
 * @returns {string[]} the languages
 */
declare function getTypes(): string[];
/**
 * @param {string} name asset filename
 * @returns {boolean} true for JavaScript assets
 */
declare function filter(name: string): boolean;
type MinifyOptions = import("./syntax-printer").MinifyOptions;
type MinifyOutput = import("./syntax-printer").MinifyOutput;
type Minify = import("./syntax-printer").Minify;
type PrintNode = import("./syntax-printer").PrintNode;
/**
 * Which production of JavaScript the source is: a classic script, a module, or
 * the body of an event handler, which is a function body and nothing the
 * minifier parses on its own.
 */
type JavascriptProduction = "script" | "module" | "event-handler";
type CommentCondition = import("minimizer-webpack-plugin").ExtractCommentsFunction;
type ExtractCommentsOption = import("minimizer-webpack-plugin").ExtractCommentsOptions;
/**
 * A condition as it may be written, which is what the plugin names plus the
 * pattern any other string is.
 */
type CommentConditionOption = import("minimizer-webpack-plugin").ExtractCommentsCondition | string;
