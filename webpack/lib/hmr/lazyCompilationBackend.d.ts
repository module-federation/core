declare namespace _exports {
    export { RequestListener, HttpServerOptions, HttpServer, HttpsServerOptions, HttpsServer, AddressInfo, BackendHandler, LazyCompilationDefaultBackendOptions, Server, Listen, CreateServerFunction };
}
declare function _exports(options: Omit<LazyCompilationDefaultBackendOptions, "client"> & {
    client: NonNullable<LazyCompilationDefaultBackendOptions["client"]>;
}): BackendHandler;
export = _exports;
type RequestListener = import("http").RequestListener;
type HttpServerOptions = import("http").ServerOptions;
type HttpServer = import("http").Server;
type HttpsServerOptions = import("https").ServerOptions;
type HttpsServer = import("https").Server;
type AddressInfo = import("net").AddressInfo;
type BackendHandler = import("./LazyCompilationPlugin").BackendHandler;
type LazyCompilationDefaultBackendOptions = import("../../declarations/WebpackOptions").LazyCompilationDefaultBackendOptions;
type Server = HttpServer | HttpsServer;
type Listen = (server: Server) => void;
type CreateServerFunction = () => Server;
