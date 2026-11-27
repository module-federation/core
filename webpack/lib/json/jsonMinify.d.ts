export = jsonMinify;
/**
 * A `minify` function for `minimizer-webpack-plugin` that drops the whitespace
 * between a JSON asset's tokens and keeps every token as written. Source that is
 * not valid JSON is returned unchanged rather than failing the build.
 * @param {{ [file: string]: string | Buffer }} input a single `{ filename: code }` entry; a `Buffer` is read as UTF-8
 * @returns {Promise<{ code: string }>} the minified JSON
 */
declare function jsonMinify(input: {
    [file: string]: string | Buffer;
}): Promise<{
    code: string;
}>;
declare namespace jsonMinify {
    function supportsWorkerThreads(): boolean;
    /**
     * The language this minifies, for a caller dispatching source that carries no
     * filename of its own.
     * @returns {string[]} the languages
     */
    function getTypes(): string[];
    /**
     * @param {string} name asset filename
     * @returns {boolean} true for JSON assets, a web app manifest included
     */
    function filter(name: string): boolean;
}
