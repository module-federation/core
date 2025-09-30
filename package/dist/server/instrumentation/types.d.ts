export type RequestErrorContext = {
    routerKind: 'Pages Router' | 'App Router';
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'middleware';
    renderSource?: 'react-server-components' | 'react-server-components-payload' | 'server-rendering';
    revalidateReason: 'on-demand' | 'stale' | undefined;
};
export type InstrumentationOnRequestError = (error: unknown, errorRequest: Readonly<{
    path: string;
    method: string;
    headers: NodeJS.Dict<string | string[]>;
}>, errorContext: Readonly<RequestErrorContext>) => void | Promise<void>;
export type InstrumentationModule = {
    register?(): void;
    onRequestError?: InstrumentationOnRequestError;
};
export declare namespace Instrumentation {
    type onRequestError = InstrumentationOnRequestError;
}
