export = NodeEnvironmentPlugin;
/** @typedef {import("../../declarations/WebpackOptions").InfrastructureLogging} InfrastructureLogging */
/** @typedef {import("../Compiler")} Compiler */
declare class NodeEnvironmentPlugin {
  /**
   * @param {Object} options options
   * @param {InfrastructureLogging} options.infrastructureLogging infrastructure logging options
   */
  constructor(options: { infrastructureLogging: InfrastructureLogging });
  options: {
    infrastructureLogging: InfrastructureLogging;
  };
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NodeEnvironmentPlugin {
  export { InfrastructureLogging, Compiler };
}
type InfrastructureLogging =
  import('../../declarations/WebpackOptions').InfrastructureLogging;
type Compiler = import('../Compiler');
