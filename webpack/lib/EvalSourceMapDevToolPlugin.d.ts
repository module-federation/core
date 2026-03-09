export = EvalSourceMapDevToolPlugin;
declare class EvalSourceMapDevToolPlugin {
  /**
   * @param {SourceMapDevToolPluginOptions | string=} inputOptions Options object
   */
  constructor(
    inputOptions?: (SourceMapDevToolPluginOptions | string) | undefined,
  );
  sourceMapComment: string;
  moduleFilenameTemplate:
    | string
    | ModuleFilenameHelpers.ModuleFilenameTemplateFunction;
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
    RawSourceMap,
    Source,
    SourceMapDevToolPluginOptions,
    Rules,
    ModuleId,
    Compiler,
  };
}
import ModuleFilenameHelpers = require('./ModuleFilenameHelpers');
type RawSourceMap = import('webpack-sources').RawSourceMap;
type Source = import('webpack-sources').Source;
type SourceMapDevToolPluginOptions =
  import('../declarations/plugins/SourceMapDevToolPlugin').SourceMapDevToolPluginOptions;
type Rules = import('../declarations/plugins/SourceMapDevToolPlugin').Rules;
type ModuleId = import('./ChunkGraph').ModuleId;
type Compiler = import('./Compiler');
