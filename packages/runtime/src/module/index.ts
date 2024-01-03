import { getFMId, safeToString, assert } from '../utils';
import { getRemoteEntry } from '../utils/load';
import { FederationHost } from '../core';
import { Global } from '../global';
import { RemoteEntryExports, RemoteInfo, InitScope } from '../type';

export type ModuleOptions = ConstructorParameters<typeof Module>[0];

class Module {
  remoteInfo: RemoteInfo;
  inited = false;
  remoteEntryExports?: RemoteEntryExports;
  lib: RemoteEntryExports | undefined = undefined;
  host: FederationHost;

  constructor({
    remoteInfo,
    host,
  }: {
    remoteInfo: RemoteInfo;
    host: FederationHost;
  }) {
    this.remoteInfo = remoteInfo;
    this.host = host;
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
        const res = this.host.loaderHook.lifecycle.createScript.emit({ url });
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

    // Get remoteEntry.js
    const remoteEntryExports = await this.getEntry();

    if (!this.inited) {
      const globalShareScope = Global.__FEDERATION__.__SHARE__;
      const remoteShareScope = this.remoteInfo.shareScope || 'default';

      if (!globalShareScope[remoteShareScope]) {
        globalShareScope[remoteShareScope] = {};
      }
      const shareScope = globalShareScope[remoteShareScope];
      const initScope: InitScope = [];

      const remoteEntryInitOptions = {
        version: this.remoteInfo.version || '',
      };

      const initContainerOptions =
        await this.host.hooks.lifecycle.beforeInitContainer.emit({
          shareScope,
          remoteEntryInitOptions,
          initScope,
          remoteInfo: this.remoteInfo,
          origin: this.host,
        });

      remoteEntryExports.init(
        initContainerOptions.shareScope,
        initContainerOptions.initScope,
        initContainerOptions.remoteEntryInitOptions,
      );

      await this.host.hooks.lifecycle.initContainer.emit({
        ...initContainerOptions,
        remoteEntryExports,
      });
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
