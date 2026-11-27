export = ProfilingPlugin;
declare class ProfilingPlugin {
    /**
     * Creates an instance of ProfilingPlugin.
     * @param {ProfilingPluginOptions=} options options object
     */
    constructor(options?: ProfilingPluginOptions | undefined);
    /** @type {ProfilingPluginOptions} */
    options: ProfilingPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ProfilingPlugin {
    export { Profiler, AbsolutePath, ProfilingPluginOptions, HookInterceptor, Inspector, Trace, TapInterceptor, HookWithInterceptor, HookMapWithInterceptor, Hooks, PluginFunction, TapCallback, AsyncPluginFunction };
}
import type Compiler from "../Compiler";
declare class Profiler {
    /**
     * Creates an instance of Profiler.
     * @param {Inspector} inspector inspector
     */
    constructor(inspector: Inspector);
    /** @type {undefined | Session} */
    session: undefined | Session;
    /** @type {Inspector} */
    inspector: Inspector;
    /** @type {number} */
    _startTime: number;
    hasSession(): boolean;
    startProfiling(): Promise<void> | Promise<[void | Partial<import("node:inspector").Profiler.StopReturnType>, void | Partial<import("node:inspector").Profiler.StopReturnType>, void | Partial<import("node:inspector").Profiler.StopReturnType>]>;
    /**
     * Returns promise for the result.
     * @param {string} method method name
     * @param {import("inspector").Profiler.SetSamplingIntervalParameterType=} params params
     * @returns {Promise<Partial<import("inspector").Profiler.StopReturnType> | void>} Promise for the result, `{}` for commands without one
     */
    sendCommand(method: string, params?: import("inspector").Profiler.SetSamplingIntervalParameterType | undefined): Promise<Partial<import("inspector").Profiler.StopReturnType> | void>;
    destroy(): Promise<void>;
    /**
     * Returns }>} profile result.
     * @returns {Promise<{ profile: { startTime: number, endTime: number } }>} profile result
     */
    stopProfiling(): Promise<{
        profile: {
            startTime: number;
            endTime: number;
        };
    }>;
}
type AbsolutePath = string;
type ProfilingPluginOptions = {
    /**
     * Path to the output file e.g. `path.resolve(__dirname, 'profiling/events.json')`. Defaults to `events.json`.
     */
    outputPath?: AbsolutePath | undefined;
};
/**
 * Defines the hook interceptor type used by this module.
 */
type HookInterceptor<T, R> = import("tapable").HookInterceptor<T, R>;
type Inspector = {
    Session: typeof import("inspector").Session;
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
/**
 * The part of a tapable `HookInterceptor` this plugin sets: it rewraps each tap.
 */
type TapInterceptor = {
    register?(tap: FullTap): FullTap;
};
/**
 * What intercepting a tapable `Hook` needs of it. Methods, so every hook fits
 * whatever its arguments, result and additional tap options.
 */
type HookWithInterceptor = {
    intercept(interceptor: TapInterceptor): void;
    _fakeHook?: undefined;
};
/**
 * What intercepting a tapable `HookMap` needs of it, whatever hook it holds.
 */
type HookMapWithInterceptor = {
    for(key: string): HookWithInterceptor;
    intercept(interceptor: {
        factory?(key: string, hook: HookWithInterceptor): HookWithInterceptor;
    }): void;
    _fakeHook?: undefined;
};
type Hooks = Record<string, HookWithInterceptor | HookMapWithInterceptor | FakeHookMarker>;
/**
 * A `sync` tap's function, or a `promise` tap's when `R` is a promise.
 */
type PluginFunction<A extends unknown[], R> = (...args: A) => R;
/**
 * The callback an `async` tap reports its error or result through.
 */
type TapCallback<R> = (error?: Error | null, result?: R) => void;
/**
 * An `async` tap's function, the hook's callback after its arguments.
 */
type AsyncPluginFunction<A extends unknown[], R> = (...args: [...A, TapCallback<R>]) => void;
import type { Session } from "inspector";
import { Tracer } from "chrome-trace-event";
import type { FullTap } from "tapable";
import type { FakeHookMarker } from "../util/deprecation";
