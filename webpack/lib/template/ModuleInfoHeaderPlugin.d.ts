export = ModuleInfoHeaderPlugin;
declare class ModuleInfoHeaderPlugin {
    /**
     * Drop the headers a build wrote at the top of a source that is read back
     * in, so this build's own header heads the module rather than the last
     * build's.
     * @param {string} source source that may have been written by a build
     * @returns {string} the source with any header of ours taken off the front
     */
    static stripHeaders(source: string): string;
    /**
     * Creates an instance of ModuleInfoHeaderPlugin.
     * @param {boolean=} verbose add more information like exports, runtime requirements and bailouts
     */
    constructor(verbose?: boolean | undefined);
    /** @type {boolean} */
    _verbose: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * Returns the header.
     * @param {Module} module the module
     * @param {RequestShortener} requestShortener request shortener
     * @returns {RawSource} the header
     */
    generateHeader(module: Module, requestShortener: RequestShortener): RawSource;
}
declare namespace ModuleInfoHeaderPlugin {
    export { CacheEntry };
}
import type Compiler from "../Compiler";
import type Module from "../module/Module";
import type RequestShortener from "../util/RequestShortener";
import { RawSource } from "webpack-sources";
type CacheEntry = {
    header: RawSource | undefined;
    full: WeakMap<Source, CachedSource>;
};
import type { Source } from "webpack-sources";
import { CachedSource } from "webpack-sources";
