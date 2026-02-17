export = NodeTemplatePlugin;
/** @typedef {import("../Compiler")} Compiler */
/**
 * @typedef {object} NodeTemplatePluginOptions
 * @property {boolean=} asyncChunkLoading enable async chunk loading
 */
declare class NodeTemplatePlugin {
    /**
     * @param {NodeTemplatePluginOptions=} options options object
     */
    constructor(options?: NodeTemplatePluginOptions | undefined);
    _options: NodeTemplatePluginOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NodeTemplatePlugin {
    export { Compiler, NodeTemplatePluginOptions };
}
type Compiler = import("../Compiler");
type NodeTemplatePluginOptions = {
    /**
     * enable async chunk loading
     */
    asyncChunkLoading?: boolean | undefined;
};
