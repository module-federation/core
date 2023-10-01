export = ProfilingPlugin;
declare class ProfilingPlugin {
  /**
   * @param {ProfilingPluginOptions=} options options object
   */
  constructor(options?: ProfilingPluginOptions | undefined);
  outputPath: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ProfilingPlugin {
  export {
    Profiler,
    ProfilingPluginOptions,
    Compiler,
    IntermediateFileSystem,
    Trace,
    PluginFunction,
  };
}
type Compiler = import('../Compiler');
type ProfilingPluginOptions =
  import('../../declarations/plugins/debug/ProfilingPlugin').ProfilingPluginOptions;
declare class Profiler {
  constructor(inspector: any);
  session: any;
  inspector: any;
  _startTime: number;
  hasSession(): boolean;
  startProfiling(): Promise<void> | Promise<[any, any, any]>;
  /**
   * @param {string} method method name
   * @param {object} [params] params
   * @returns {Promise<TODO>} Promise for the result
   */
  sendCommand(method: string, params?: object): Promise<TODO>;
  destroy(): Promise<void>;
  stopProfiling(): Promise<{
    profile: TODO;
  }>;
}
type IntermediateFileSystem = import('../util/fs').IntermediateFileSystem;
/**
 * an object that wraps Tracer and Profiler with a counter
 */
type Trace = {
  /**
   * instance of Tracer
   */
  trace: Tracer;
  /**
   * Counter
   */
  counter: number;
  /**
   * instance of Profiler
   */
  profiler: Profiler;
  /**
   * the end function
   */
  end: Function;
};
type PluginFunction = (...args: TODO[]) => void | Promise<TODO>;
import { Tracer } from 'chrome-trace-event';
