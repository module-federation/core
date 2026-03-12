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
    Session,
    FullTap,
    ProfilingPluginOptions,
    Compilation,
    Compiler,
    NormalModuleFactory,
    ResolverFactory,
    IntermediateFileSystem,
    Hook,
    FakeHook,
    HookMap,
    HookInterceptor,
    Inspector,
    Trace,
    Hooks,
    PluginFunction,
  };
}
declare class Profiler {
  /**
   * @param {Inspector} inspector inspector
   */
  constructor(inspector: Inspector);
  /** @type {undefined | Session} */
  session: undefined | Session;
  inspector: Inspector;
  _startTime: number;
  hasSession(): boolean;
  startProfiling(): Promise<any>;
  /**
   * @param {string} method method name
   * @param {EXPECTED_OBJECT=} params params
   * @returns {Promise<EXPECTED_ANY | void>} Promise for the result
   */
  sendCommand(
    method: string,
    params?: EXPECTED_OBJECT | undefined,
  ): Promise<EXPECTED_ANY | void>;
  destroy(): Promise<void>;
  /**
   * @returns {Promise<{ profile: { startTime: number, endTime: number } }>} profile result
   */
  stopProfiling(): Promise<{
    profile: {
      startTime: number;
      endTime: number;
    };
  }>;
}
type Session = import('inspector').Session;
type FullTap = import('tapable').FullTap;
type ProfilingPluginOptions =
  import('../../declarations/plugins/debug/ProfilingPlugin').ProfilingPluginOptions;
type Compilation = import('../Compilation');
type Compiler = import('../Compiler');
type NormalModuleFactory = import('../NormalModuleFactory');
type ResolverFactory = import('../ResolverFactory');
type IntermediateFileSystem = import('../util/fs').IntermediateFileSystem;
type Hook<T, R> = import('tapable').Hook<T, R>;
type FakeHook<T> = import('../util/deprecation').FakeHook<T>;
type HookMap<T> = import('tapable').HookMap<T>;
type HookInterceptor<T, R> = import('tapable').HookInterceptor<T, R>;
type Inspector = {
  Session: typeof import('inspector').Session;
};
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
  end: (callback: (err?: null | Error) => void) => void;
};
type Hooks = Record<
  string,
  | Hook<EXPECTED_ANY, EXPECTED_ANY>
  | FakeHook<EXPECTED_ANY>
  | HookMap<EXPECTED_ANY>
>;
type PluginFunction = (
  ...args: EXPECTED_ANY[]
) => EXPECTED_ANY | Promise<(...args: EXPECTED_ANY[]) => EXPECTED_ANY>;
import { Tracer } from 'chrome-trace-event';
