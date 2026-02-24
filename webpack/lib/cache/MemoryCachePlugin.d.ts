export = MemoryCachePlugin;
/** @typedef {import("../Cache").Data} Data */
/** @typedef {import("../Cache").Etag} Etag */
/** @typedef {import("../Compiler")} Compiler */
declare class MemoryCachePlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace MemoryCachePlugin {
    export { Data, Etag, Compiler };
}
type Data = import("../Cache").Data;
type Etag = import("../Cache").Etag;
type Compiler = import("../Compiler");
