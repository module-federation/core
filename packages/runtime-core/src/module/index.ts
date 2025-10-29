import { getFMId, assert, error, processModuleAlias } from '../utils';
import { safeToString, ModuleInfo } from '@module-federation/sdk';
import {
  getShortErrorMsg,
  RUNTIME_002,
  RUNTIME_008,
  runtimeDescMap,
} from '@module-federation/error-codes';
import { getRemoteEntry, getRemoteEntryUniqueKey } from '../utils/load';
import { ModuleFederation } from '../core';
import { RemoteEntryExports, RemoteInfo, InitScope } from '../type';
import { globalLoading } from '../global';

export type ModuleOptions = ConstructorParameters<typeof Module>[0];

class Module {
  remoteInfo: RemoteInfo;
  inited = false;
  remoteEntryExports?: RemoteEntryExports;
  lib: RemoteEntryExports | undefined = undefined;
  host: ModuleFederation;

  constructor({
    remoteInfo,
    host,
  }: {
    remoteInfo: RemoteInfo;
    host: ModuleFederation;
  }) {
    this.remoteInfo = remoteInfo;
    this.host = host;
  }

  async getEntry(): Promise<RemoteEntryExports> {
    if (this.remoteEntryExports) {
      return this.remoteEntryExports;
    }

    const remoteEntryExports = await getRemoteEntry({
      origin: this.host,
      remoteInfo: this.remoteInfo,
      remoteEntryExports: this.remoteEntryExports,
    });

    assert(
      remoteEntryExports,
      `remoteEntryExports is undefined \n ${safeToString(this.remoteInfo)}`,
    );

    this.remoteEntryExports = remoteEntryExports as RemoteEntryExports;
    return this.remoteEntryExports;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

  async init(id?: string, remoteSnapshot?: ModuleInfo) {
    // Get remoteEntry.js
    const remoteEntryExports = await this.getEntry();

    if (!this.inited) {
      const localShareScopeMap = this.host.shareScopeMap;
      const shareScopeKeys = Array.isArray(this.remoteInfo.shareScope)
        ? this.remoteInfo.shareScope
        : [this.remoteInfo.shareScope];
      if (!shareScopeKeys.length) {
        shareScopeKeys.push('default');
      }

      shareScopeKeys.forEach((shareScopeKey) => {
        if (!localShareScopeMap[shareScopeKey]) {
          localShareScopeMap[shareScopeKey] = {};
        }
      });

      // TODO: compate legacy init params, should use shareScopeMap if exist
      const shareScope = localShareScopeMap[shareScopeKeys[0]];
      const initScope: InitScope = [];

      const remoteEntryInitOptions = {
        version: this.remoteInfo.version || '',
        shareScopeKeys: Array.isArray(this.remoteInfo.shareScope)
          ? shareScopeKeys
          : this.remoteInfo.shareScope || 'default',
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

      if (typeof remoteEntryExports?.init === 'undefined') {
        error(
          getShortErrorMsg(RUNTIME_002, runtimeDescMap, {
            hostName: this.host.name,
            remoteName: this.remoteInfo.name,
            remoteEntryUrl: this.remoteInfo.entry,
            remoteEntryKey: this.remoteInfo.entryGlobalName,
          }),
        );
      }

      await remoteEntryExports.init(
        initContainerOptions.shareScope,
        initContainerOptions.initScope,
        initContainerOptions.remoteEntryInitOptions,
      );

      await this.host.hooks.lifecycle.initContainer.emit({
        ...initContainerOptions,
        id,
        remoteSnapshot,
        remoteEntryExports,
      });
    }

    return remoteEntryExports;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async get(
    id: string,
    expose: string,
    options?: { loadFactory?: boolean },
    remoteSnapshot?: ModuleInfo,
  ) {
    const { loadFactory = true } = options || { loadFactory: true };

    const remoteEntryExports = await this.init(id, remoteSnapshot);
    this.lib = remoteEntryExports;
    this.inited = true;

    let moduleFactory;
    moduleFactory = await this.host.loaderHook.lifecycle.getModuleFactory.emit({
      remoteEntryExports,
      expose,
      moduleInfo: this.remoteInfo,
    });

    // get exposeGetter
    if (!moduleFactory) {
      moduleFactory = await remoteEntryExports.get(expose);
    }

    assert(
      moduleFactory,
      `${getFMId(this.remoteInfo)} remote don't export ${expose}.`,
    );

    // keep symbol for module name always one format
    const symbolName = processModuleAlias(this.remoteInfo.name, expose);
    const wrapModuleFactory = this.wraperFactory(moduleFactory, symbolName);

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
        Object.isExtensible(res) &&
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
