import bundleFederatedHost, { bundleFederatedHostOptions } from './bundle-host';
import bundleFederatedRemote, {
  bundleFederatedRemoteOptions,
} from './bundle-remote';
import loadMetroConfig from './utils/load-metro-config';

export {
  bundleFederatedHost,
  bundleFederatedHostOptions,
  bundleFederatedRemote,
  bundleFederatedRemoteOptions,
  loadMetroConfig,
};

export default {
  bundleFederatedHost,
  bundleFederatedHostOptions,
  bundleFederatedRemote,
  bundleFederatedRemoteOptions,
  loadMetroConfig,
};

export type { BundleFederatedHostArgs } from './bundle-host/types';
export type { BundleFederatedRemoteArgs } from './bundle-remote/types';
export type { Config } from './types';
