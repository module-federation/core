import bundleFederatedHost, { bundleFederatedHostOptions } from './bundle-host';
import bundleFederatedRemote, { bundleFederatedRemoteOptions } from './bundle-remote';
import loadMetroConfig from './utils/load-metro-config';
export { bundleFederatedHost, bundleFederatedHostOptions, bundleFederatedRemote, bundleFederatedRemoteOptions, loadMetroConfig, };
declare const _default: {
    bundleFederatedHost: typeof bundleFederatedHost;
    bundleFederatedHostOptions: {
        name: string;
        description: string;
    }[];
    bundleFederatedRemote: typeof bundleFederatedRemote;
    bundleFederatedRemoteOptions: ({
        name: string;
        description: string;
        default: string;
        parse?: undefined;
    } | {
        name: string;
        description: string;
        parse: (val: string) => boolean;
        default: boolean;
    } | {
        name: string;
        description: string;
        parse: (val: string) => boolean;
        default?: undefined;
    } | {
        name: string;
        description: string;
        default?: undefined;
        parse?: undefined;
    } | {
        name: string;
        description: string;
        default: boolean;
        parse?: undefined;
    } | {
        name: string;
        description: string;
        parse: (val: string) => string;
        default?: undefined;
    })[];
    loadMetroConfig: typeof loadMetroConfig;
};
export default _default;
export type { BundleFederatedHostArgs } from './bundle-host/types';
export type { BundleFederatedRemoteArgs } from './bundle-remote/types';
export type { Config } from './types';
