export = MemoryWithGcCachePlugin;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../Cache").Etag} Etag */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
declare class MemoryWithGcCachePlugin {
    constructor({ maxGenerations }: {
        maxGenerations: any;
    });
    _maxGenerations: any;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace MemoryWithGcCachePlugin {
    export { Source, Etag, Compiler, Module };
}
type Compiler = import("../Compiler");
type Source = any;
type Etag = import("../Cache").Etag;
type Module = import("../Module");
