declare namespace _exports {
    export { HttpServerOptions, HttpsServerOptions, Server, Listen, CreateServerFunction };
}
declare function _exports(options: Omit<LazyCompilationDefaultBackendOptions, "client"> & {
    client: NonNullable<LazyCompilationDefaultBackendOptions["client"]>;
}): BackendHandler;
export = _exports;
type HttpServerOptions = import("http").ServerOptions;
type HttpsServerOptions = import("https").ServerOptions;
type Server = HttpServer | HttpsServer;
type Listen = (server: Server) => void;
type CreateServerFunction = () => Server;
import type { LazyCompilationDefaultBackendOptions } from "../../declarations/WebpackOptions";
import type { BackendHandler } from "./LazyCompilationPlugin";
import type { Server as HttpServer } from "http";
import type { Server as HttpsServer } from "https";
