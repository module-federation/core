export = MemoryWithGcCachePlugin;
declare class MemoryWithGcCachePlugin {
    /**
     * @param {MemoryWithGcCachePluginOptions} options options
     */
    constructor({ maxGenerations }: MemoryWithGcCachePluginOptions);
    _maxGenerations: number;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace MemoryWithGcCachePlugin {
    export { Data, Etag, Compiler, MemoryWithGcCachePluginOptions };
}
type Data = import("../Cache").Data;
type Etag = import("../Cache").Etag;
type Compiler = import("../Compiler");
type MemoryWithGcCachePluginOptions = {
    /**
     * max generations
     */
    maxGenerations: number;
};
