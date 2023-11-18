import { getFMId, safeToString } from '../utils';
import { assert } from '../utils/logger';
import { getRemoteEntry } from '../utils/load';
import { FederationHost } from '../core';
import { Global } from '../global';
import {
  RemoteEntryExports,
  Options,
  Remote,
  ShareInfos,
  RemoteInfo,
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
  // loading: Record<string, undefined | Promise<RemoteEntryExports | void>> = {};

  constructor({
    hostInfo,
    remoteInfo,
    shared,
    loaderHook,
  }: {
    hostInfo: HostInfo;
    remoteInfo: RemoteInfo;
    shared: ShareInfos;
    plugins: Options['plugins'];
    loaderHook: FederationHost['loaderHook'];
  }) {
    this.hostInfo = hostInfo;
    this.remoteInfo = remoteInfo;
    this.shared = shared;
    this.loaderHook = loaderHook;
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

    // Get remoteEntry.js
    const remoteEntryExports = await this.getEntry();

    if (!this.inited) {
      const globalShareScope = Global.__FEDERATION__.__SHARE__;
      const remoteShareScope = this.remoteInfo.shareScope || 'default';

      if (!globalShareScope[remoteShareScope]) {
        globalShareScope[remoteShareScope] = {};
      }
      const shareScope = globalShareScope[remoteShareScope];

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
        federationInstance.initOptions({
          ...remoteEntryInitOptions,
          remotes: [],
          name: this.remoteInfo.name,
        });
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
