export = EvalSourceMapDevToolPlugin;
declare class EvalSourceMapDevToolPlugin {
  /**
   * @param {SourceMapDevToolPluginOptions|string} inputOptions Options object
   */
  constructor(inputOptions: SourceMapDevToolPluginOptions | string);
  sourceMapComment: string;
  moduleFilenameTemplate: string | Function;
  namespace: string;
  options: import('../declarations/plugins/SourceMapDevToolPlugin').SourceMapDevToolPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace EvalSourceMapDevToolPlugin {
  export {
    Source,
    DevToolOptions,
    SourceMapDevToolPluginOptions,
    Compiler,
    SourceMap,
  };
}
type Compiler = import('./Compiler');
type SourceMapDevToolPluginOptions =
  import('../declarations/plugins/SourceMapDevToolPlugin').SourceMapDevToolPluginOptions;
type Source = any;
type DevToolOptions = import('../declarations/WebpackOptions').DevTool;
type SourceMap = import('./NormalModule').SourceMap;
