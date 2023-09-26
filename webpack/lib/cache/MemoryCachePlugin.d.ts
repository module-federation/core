export = MemoryCachePlugin;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../Cache").Etag} Etag */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
declare class MemoryCachePlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace MemoryCachePlugin {
    export { Source, Etag, Compiler, Module };
}
type Compiler = import("../Compiler");
type Source = any;
type Etag = import("../Cache").Etag;
type Module = import("../Module");
