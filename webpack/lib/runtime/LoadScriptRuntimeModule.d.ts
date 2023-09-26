export = LoadScriptRuntimeModule;
declare class LoadScriptRuntimeModule extends HelperRuntimeModule {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {LoadScriptCompilationHooks} hooks
   */
  static getCompilationHooks(
    compilation: Compilation,
  ): LoadScriptCompilationHooks;
  /**
   * @param {boolean=} withCreateScriptUrl use create script url for trusted types
   * @param {boolean=} withFetchPriority use `fetchPriority` attribute
   */
  constructor(
    withCreateScriptUrl?: boolean | undefined,
    withFetchPriority?: boolean | undefined,
  );
  _withCreateScriptUrl: boolean;
  _withFetchPriority: boolean;
}
declare namespace LoadScriptRuntimeModule {
  export { Chunk, Compiler, LoadScriptCompilationHooks };
}
import HelperRuntimeModule = require('./HelperRuntimeModule');
import Compilation = require('../Compilation');
type LoadScriptCompilationHooks = {
  createScript: SyncWaterfallHook<[string, Chunk]>;
};
type Chunk = import('../Chunk');
type Compiler = import('../Compiler');
import { SyncWaterfallHook } from 'tapable';
