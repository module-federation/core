export = ContainerPlugin;
declare class ContainerPlugin {
  /**
   * @param {ContainerPluginOptions} options options
   */
  constructor(options: ContainerPluginOptions);
  _options: {
    name: string;
    shareScope: string;
    library: import('../../declarations/plugins/container/ContainerPlugin').LibraryOptions;
    runtime: import('../../declarations/plugins/container/ContainerPlugin').EntryRuntime;
    filename: string;
    exposes: [
      string,
      {
        import: string[];
        name: any;
      },
    ][];
  };
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ContainerPlugin {
  export { ContainerPluginOptions, Compiler };
}
type Compiler = import('../Compiler');
type ContainerPluginOptions =
  import('../../declarations/plugins/container/ContainerPlugin').ContainerPluginOptions;
