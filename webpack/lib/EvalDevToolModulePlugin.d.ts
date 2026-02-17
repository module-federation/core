export = EvalDevToolModulePlugin;
declare class EvalDevToolModulePlugin {
  /**
   * @param {EvalDevToolModulePluginOptions=} options options
   */
  constructor(options?: EvalDevToolModulePluginOptions | undefined);
  namespace: string;
  sourceUrlComment: string;
  moduleFilenameTemplate: import('../declarations/WebpackOptions').DevtoolModuleFilenameTemplate;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace EvalDevToolModulePlugin {
  export {
    Source,
    DevtoolNamespace,
    DevtoolModuleFilenameTemplate,
    Compiler,
    EvalDevToolModulePluginOptions,
  };
}
type Source = import('webpack-sources').Source;
type DevtoolNamespace =
  import('../declarations/WebpackOptions').DevtoolNamespace;
type DevtoolModuleFilenameTemplate =
  import('../declarations/WebpackOptions').DevtoolModuleFilenameTemplate;
type Compiler = import('./Compiler');
type EvalDevToolModulePluginOptions = {
  /**
   * namespace
   */
  namespace?: DevtoolNamespace | undefined;
  /**
   * source url comment
   */
  sourceUrlComment?: string | undefined;
  /**
   * module filename template
   */
  moduleFilenameTemplate?: DevtoolModuleFilenameTemplate | undefined;
};
