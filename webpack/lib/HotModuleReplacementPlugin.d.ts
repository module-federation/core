export = HotModuleReplacementPlugin;
declare class HotModuleReplacementPlugin {
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {HMRJavascriptParserHooks} the attached hooks
   */
  static getParserHooks(parser: JavascriptParser): HMRJavascriptParserHooks;
  constructor(options: any);
  options: any;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace HotModuleReplacementPlugin {
  export {
    Chunk,
    AssetInfo,
    Compiler,
    Module,
    RuntimeModule,
    RuntimeSpec,
    HMRJavascriptParserHooks,
  };
}
type Compiler = import('./Compiler');
import JavascriptParser = require('./javascript/JavascriptParser');
type HMRJavascriptParserHooks = {
  hotAcceptCallback: SyncBailHook<[TODO, string[]], void>;
  hotAcceptWithoutCallback: SyncBailHook<[TODO, string[]], void>;
};
type Chunk = import('./Chunk');
type AssetInfo = import('./Compilation').AssetInfo;
type Module = import('./Module');
type RuntimeModule = import('./RuntimeModule');
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
import { SyncBailHook } from 'tapable';
