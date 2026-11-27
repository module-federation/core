export = NodeStuffPlugin;
declare class NodeStuffPlugin {
    /**
     * Creates an instance of NodeStuffPlugin.
     * @param {NodeOptions} options options
     */
    constructor(options: NodeOptions);
    /** @type {NodeOptions} */
    options: NodeOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type { NodeOptions } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
