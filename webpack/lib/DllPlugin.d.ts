export = DllPlugin;
declare class DllPlugin {
  /**
   * @param {DllPluginOptions} options options object
   */
  constructor(options: DllPluginOptions);
  options: {
    entryOnly: boolean;
    context?: string;
    format?: boolean;
    name?: string;
    path: string;
    type?: string;
  };
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DllPlugin {
  export { DllPluginOptions, Compiler };
}
type Compiler = import('./Compiler');
type DllPluginOptions =
  import('../declarations/plugins/DllPlugin').DllPluginOptions;
