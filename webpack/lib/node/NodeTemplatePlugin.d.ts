export = NodeTemplatePlugin;
/** @import Compiler from "../Compiler" */
/**
 * Represents the node template plugin runtime component.
 * @typedef {object} NodeTemplatePluginOptions
 * @property {boolean=} asyncChunkLoading enable async chunk loading
 */
declare class NodeTemplatePlugin {
    /**
     * Creates an instance of NodeTemplatePlugin.
     * @param {NodeTemplatePluginOptions=} options options object
     */
    constructor(options?: NodeTemplatePluginOptions | undefined);
    /** @type {NodeTemplatePluginOptions} */
    _options: NodeTemplatePluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NodeTemplatePlugin {
    export { NodeTemplatePluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Represents the node template plugin runtime component.
 */
type NodeTemplatePluginOptions = {
    /**
     * enable async chunk loading
     */
    asyncChunkLoading?: boolean | undefined;
};
