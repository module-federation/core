export = NodeEnvironmentPlugin;
declare class NodeEnvironmentPlugin {
    /**
     * Creates an instance of NodeEnvironmentPlugin.
     * @param {NodeEnvironmentPluginOptions} options options
     */
    constructor(options: NodeEnvironmentPluginOptions);
    /** @type {NodeEnvironmentPluginOptions} */
    options: NodeEnvironmentPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NodeEnvironmentPlugin {
    export { NodeEnvironmentPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the node environment plugin options type used by this module.
 */
type NodeEnvironmentPluginOptions = {
    /**
     * infrastructure logging options
     */
    infrastructureLogging: InfrastructureLogging;
};
import type { InfrastructureLogging } from "../../declarations/WebpackOptions";
