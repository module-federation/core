export = webpack;
declare const webpack: WebpackFunctionSingle & WebpackFunctionMulti;
declare namespace webpack {
  export {
    WebpackOptions,
    WatchOptions,
    MultiCompilerOptions,
    MultiStats,
    Stats,
    Callback,
    WebpackFunctionSingle,
    WebpackFunctionMulti,
  };
}
type WebpackFunctionSingle = (
  options: WebpackOptions,
  callback?: Callback<Stats> | undefined,
) => Compiler;
type WebpackFunctionMulti = (
  options: ReadonlyArray<WebpackOptions> & MultiCompilerOptions,
  callback?: Callback<MultiStats> | undefined,
) => MultiCompiler;
type WebpackOptions = import('../declarations/WebpackOptions').WebpackOptions;
type WatchOptions = import('./Compiler').WatchOptions;
type MultiCompilerOptions = import('./MultiCompiler').MultiCompilerOptions;
type MultiStats = import('./MultiStats');
type Stats = import('./Stats');
type Callback<T> = (err?: Error | undefined, stats?: T | undefined) => void;
import Compiler = require('./Compiler');
import MultiCompiler = require('./MultiCompiler');
