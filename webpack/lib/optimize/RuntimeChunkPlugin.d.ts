export = RuntimeChunkPlugin;
/** @typedef {(entrypoint: { name: string }) => string} RuntimeChunkFunction */
declare class RuntimeChunkPlugin {
    /**
     * @param {{ name?: RuntimeChunkFunction }=} options options
     */
    constructor(options?: {
        name?: RuntimeChunkFunction;
    } | undefined);
    options: {
        name: RuntimeChunkFunction;
    };
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace RuntimeChunkPlugin {
    export { EntryData, Compiler, RuntimeChunkFunction };
}
type EntryData = import("../Compilation").EntryData;
type Compiler = import("../Compiler");
type RuntimeChunkFunction = (entrypoint: {
    name: string;
}) => string;
