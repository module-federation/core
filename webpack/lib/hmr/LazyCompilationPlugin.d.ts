export = LazyCompilationPlugin;
declare class LazyCompilationPlugin {
    /**
     * Creates an instance of LazyCompilationPlugin.
     * @param {Options} options options
     */
    constructor({ backend, entries, imports, test }: Options);
    /** @type {BackEnd} */
    backend: BackEnd;
    /** @type {boolean | undefined} */
    entries: boolean | undefined;
    /** @type {boolean | undefined} */
    imports: boolean | undefined;
    /** @type {string | RegExp | GlobCondition | TestFn | undefined} */
    test: string | RegExp | GlobCondition | TestFn | undefined;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace LazyCompilationPlugin {
    export { ModuleResult, BackendApi, KnownLazyCompilationProxyModuleBuildInfo, LazyCompilationProxyModuleBuildInfo, BackendHandler, PromiseBackendHandler, BackEnd, TestFn, GlobCondition, Options };
}
import type Compiler from "../Compiler";
type ModuleResult = {
    client: string;
    data: string;
    active: boolean;
};
/**
 * Defines the backend api type used by this module.
 */
type BackendApi = {
    dispose: (callback: (err?: (Error | null)) => void) => void;
    module: (module: Module) => ModuleResult;
};
/**
 * Defines the build info properties specific to lazy compilation proxy modules.
 */
type KnownLazyCompilationProxyModuleBuildInfo = {
    /**
     * whether the proxied module was active when built
     */
    active?: boolean | undefined;
};
type LazyCompilationProxyModuleBuildInfo = Module.BuildInfo & KnownLazyCompilationProxyModuleBuildInfo;
/**
 * Defines the backend handler callback.
 */
type BackendHandler = (compiler: Compiler, callback: (err: Error | null, backendApi?: BackendApi) => void) => void;
/**
 * Defines the promise backend handler callback.
 */
type PromiseBackendHandler = (compiler: Compiler) => Promise<BackendApi>;
type BackEnd = BackendHandler | PromiseBackendHandler;
type TestFn = (module: Module) => boolean;
type GlobCondition = import("../util/globUtils").GlobCondition;
/**
 * options
 */
type Options = {
    /**
     * the backend
     */
    backend: BackEnd;
    entries?: boolean | undefined;
    imports?: boolean | undefined;
    /**
     * additional filter for lazy compiled entrypoint modules
     */
    test?: (RegExp | string | TestFn | GlobCondition) | undefined;
};
import Module = require("../module/Module");
