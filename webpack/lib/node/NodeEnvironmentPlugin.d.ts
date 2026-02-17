export = NodeEnvironmentPlugin;
declare class NodeEnvironmentPlugin {
    /**
     * @param {NodeEnvironmentPluginOptions} options options
     */
    constructor(options: NodeEnvironmentPluginOptions);
    options: NodeEnvironmentPluginOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NodeEnvironmentPlugin {
    export { InfrastructureLogging, Compiler, InputFileSystem, NodeEnvironmentPluginOptions };
}
type InfrastructureLogging = import("../../declarations/WebpackOptions").InfrastructureLogging;
type Compiler = import("../Compiler");
type InputFileSystem = import("../util/fs").InputFileSystem;
type NodeEnvironmentPluginOptions = {
    /**
     * infrastructure logging options
     */
    infrastructureLogging: InfrastructureLogging;
};
