declare function _exports(
  options: Omit<LazyCompilationDefaultBackendOptions, 'client'> & {
    client: NonNullable<LazyCompilationDefaultBackendOptions['client']>;
  },
): BackendHandler;
export = _exports;
export type HttpServerOptions = import('http').ServerOptions;
export type HttpsServerOptions = import('https').ServerOptions;
export type LazyCompilationDefaultBackendOptions =
  import('../../declarations/WebpackOptions').LazyCompilationDefaultBackendOptions;
export type Compiler = import('../Compiler');
export type BackendHandler = (
  compiler: Compiler,
  callback: (arg0: (Error | null) | undefined, arg1: any | undefined) => void,
) => void;
