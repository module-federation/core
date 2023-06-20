import type { Remotes, RuntimeRemote, WebpackRemoteContainer, RemoteData, GetModuleOptions } from '../types';
export declare const extractUrlAndGlobal: (urlAndGlobal: string) => [string, string];
export declare const importDelegatedModule: (keyOrRuntimeRemoteItem: string | RuntimeRemote) => Promise<any>;
export declare const createDelegatedModule: (delegate: string, params: {
    [key: string]: any;
}) => string;
/**
 * Return initialized remote container by remote's key or its runtime remote item data.
 *
 * `runtimeRemoteItem` might be
 *    { global, url } - values obtained from webpack remotes option `global@url`
 * or
 *    { asyncContainer } - async container is a promise that resolves to the remote container
 */
export declare const injectScript: (keyOrRuntimeRemoteItem: string | RuntimeRemote) => Promise<WebpackRemoteContainer>;
export declare const createRuntimeVariables: (remotes: Remotes) => Record<string, string>;
/**
 * Returns initialized webpack RemoteContainer.
 * If its' script does not loaded - then load & init it firstly.
 */
export declare const getContainer: (remoteContainer: string | RemoteData) => Promise<WebpackRemoteContainer | undefined>;
/**
 * Return remote module from container.
 * If you provide `exportName` it automatically return exact property value from module.
 *
 * @example
 *   remote.getModule('./pages/index', 'default')
 */
export declare const getModule: ({ remoteContainer, modulePath, exportName, }: GetModuleOptions) => Promise<any>;
