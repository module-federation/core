import { getFMId, safeToString, assert } from '../utils';
import { getRemoteEntry } from '../utils/load';
import { FederationHost } from '../core';
import { Global } from '../global';
import {
  RemoteEntryExports,
  Options,
  Remote,
  ShareInfos,
  RemoteInfo,
  ShareScopeMap,
} from '../type';
import { composeKeyWithSeparator } from '@module-federation/sdk';

export type ModuleOptions = ConstructorParameters<typeof Module>[0];

type HostInfo = Remote;

class Module {
  hostInfo: HostInfo;
  remoteInfo: RemoteInfo;
  inited = false;
  shared: ShareInfos = {};
  remoteEntryExports?: RemoteEntryExports;
  lib: RemoteEntryExports | undefined = undefined;
  loaderHook: FederationHost['loaderHook'];
  shareScopeMap: ShareScopeMap;
  // loading: Record<string, undefined | Promise<RemoteEntryExports | void>> = {};

  constructor({
    hostInfo,
    remoteInfo,
    shared,
    loaderHook,
    shareScopeMap,
  }: {
    hostInfo: HostInfo;
    remoteInfo: RemoteInfo;
    shared: ShareInfos;
    plugins: Options['plugins'];
    loaderHook: FederationHost['loaderHook'];
    shareScopeMap: ShareScopeMap;
  }) {
    this.hostInfo = hostInfo;
    this.remoteInfo = remoteInfo;
    this.shared = shared;
    this.loaderHook = loaderHook;
    this.shareScopeMap = shareScopeMap;
  }

  async getEntry(): Promise<RemoteEntryExports> {
    if (this.remoteEntryExports) {
      return this.remoteEntryExports;
    }

    // Get remoteEntry.js
    const remoteEntryExports = await getRemoteEntry({
      remoteInfo: this.remoteInfo,
      remoteEntryExports: this.remoteEntryExports,
      createScriptHook: (url: string) => {
        const res = this.loaderHook.lifecycle.createScript.emit({ url });
        if (res instanceof HTMLScriptElement) {
          return res;
        }
        return;
      },
    });
    assert(
      remoteEntryExports,
      `remoteEntryExports is undefined \n ${safeToString(this.remoteInfo)}`,
    );

    this.remoteEntryExports = remoteEntryExports;
    return this.remoteEntryExports;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async get(expose: string, options?: { loadFactory?: boolean }) {
    const { loadFactory = true } = options || { loadFactory: true };
    const hostName = this.hostInfo.name;

    // Get remoteEntry.js
    const remoteEntryExports = await this.getEntry();

    if (!this.inited) {
      const localShareScopeMap = this.shareScopeMap;
      const remoteShareScope = this.remoteInfo.shareScope || 'default';

      if (!localShareScopeMap[remoteShareScope]) {
        localShareScopeMap[remoteShareScope] = {};
      }
      const shareScope = localShareScopeMap[remoteShareScope];

      // TODO: compat logic , it could be moved after providing startup hooks
      const remoteEntryInitOptions = {
        version: this.remoteInfo.version || '',
        // @ts-ignore it will be passed by startup hooks
        region: this.hostInfo.region,
      };
      remoteEntryExports.init(shareScope, [], remoteEntryInitOptions);
      const federationInstance = Global.__FEDERATION__.__INSTANCES__.find(
        (i) =>
          i.options.id ===
          composeKeyWithSeparator(
            this.remoteInfo.name,
            this.remoteInfo.buildVersion,
          ),
      );

      if (federationInstance) {
        // means the instance is prev vmok instance
        if (
          !federationInstance.releaseNumber ||
          Number(federationInstance.releaseNumber) <= 100
        ) {
          // 兼容旧的生产者传参
          federationInstance.initOptions({
            ...remoteEntryInitOptions,
            remotes: [],
            name: this.remoteInfo.name,
          });
          if (
            !__FEDERATION__.__SHARE__['default'] &&
            this.shareScopeMap &&
            this.shareScopeMap['default']
          ) {
            // @ts-ignore compat prev logic , and it will be optimized by supporting startup hook
            __FEDERATION__.__SHARE__['default'] = this.shareScopeMap['default'];
          }
        }
      }
    }

    this.lib = remoteEntryExports;
    this.inited = true;

    // get exposeGetter
    const moduleFactory = await remoteEntryExports.get(expose);
    assert(
      moduleFactory,
      `${getFMId(this.remoteInfo)} remote don't export ${expose}.`,
    );

    if (!loadFactory) {
      return moduleFactory;
    }
    const exposeContent = await moduleFactory();

    return exposeContent;
  }
}

export { Module };
