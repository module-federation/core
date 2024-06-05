import { getFMId, safeToString, assert } from '../utils';
import { getRemoteEntry } from '../utils/load';
import { FederationHost } from '../core';
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

        if (!res) return;

        if (typeof document === 'undefined') {
          //todo: needs real fix
          return res as HTMLScriptElement;
        }

        if (res instanceof HTMLScriptElement) {
          return res;
        }

        if ('script' in res || 'timeout' in res) {
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
  async get(id: string, expose: string, options?: { loadFactory?: boolean }) {
    const { loadFactory = true } = options || { loadFactory: true };

    // Get remoteEntry.js
    const remoteEntryExports = await this.getEntry();

    if (!this.inited) {
      const localShareScopeMap = this.host.shareScopeMap;
      const remoteShareScope = this.remoteInfo.shareScope || 'default';

      if (!localShareScopeMap[remoteShareScope]) {
        localShareScopeMap[remoteShareScope] = {};
      }
      const shareScope = localShareScopeMap[remoteShareScope];
      const initScope: InitScope = [];

      const remoteEntryInitOptions = {
        version: this.remoteInfo.version || '',
      };

      // Help to find host instance
      Object.defineProperty(remoteEntryInitOptions, 'shareScopeMap', {
        value: localShareScopeMap,
        // remoteEntryInitOptions will be traversed and assigned during container init, ,so this attribute is not allowed to be traversed
        enumerable: false,
      });

      const initContainerOptions =
        await this.host.hooks.lifecycle.beforeInitContainer.emit({
          shareScope,
          // @ts-ignore shareScopeMap will be set by Object.defineProperty
          remoteEntryInitOptions,
          initScope,
          remoteInfo: this.remoteInfo,
          origin: this.host,
        });

      await remoteEntryExports.init(
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

    const wrapModuleFactory = this.wraperFactory(moduleFactory, id);

    if (!loadFactory) {
      return wrapModuleFactory;
    }
    const exposeContent = await wrapModuleFactory();

    return exposeContent;
  }

  private wraperFactory(
    moduleFactory: () => any | (() => Promise<any>),
    id: string,
  ) {
    function defineModuleId(res: any, id: string) {
      if (
        res &&
        typeof res === 'object' &&
        !Object.getOwnPropertyDescriptor(res, Symbol.for('mf_module_id'))
      ) {
        Object.defineProperty(res, Symbol.for('mf_module_id'), {
          value: id,
          enumerable: false,
        });
      }
    }

    if (moduleFactory instanceof Promise) {
      return async () => {
        const res = await moduleFactory();
        // This parameter is used for bridge debugging
        defineModuleId(res, id);
        return res;
      };
    } else {
      return () => {
        const res = moduleFactory();
        // This parameter is used for bridge debugging
        defineModuleId(res, id);
        return res;
      };
    }
  }
}

export { Module };
