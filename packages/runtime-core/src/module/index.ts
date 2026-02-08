import { ModuleInfo } from '@module-federation/sdk';
import { ModuleFederation } from '../core';
import { RemoteEntryExports, RemoteInfo } from '../type';
import { Effect } from '@module-federation/micro-effect';

export type ModuleOptions = ConstructorParameters<typeof Module>[0];

const MF_MODULE_ID = Symbol.for('mf_module_id');

class Module {
  remoteInfo: RemoteInfo;
  inited = false;
  initing = false;
  initPromise?: Promise<void>;
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
    return Effect.runPromise(this.host.remoteHandler._ensureEntry(this));
  }

  async init(id?: string, remoteSnapshot?: ModuleInfo) {
    // Get remoteEntry.js
    const remoteEntryExports = await this.getEntry();

    if (this.inited) {
      return remoteEntryExports;
    }

    if (this.initPromise) {
      await this.initPromise;
      return remoteEntryExports;
    }

    this.initing = true;
    this.initPromise = (async () => {
      const { remoteEntryInitOptions, shareScope, initScope } =
        createRemoteEntryInitOptions(this.remoteInfo, this.host.shareScopeMap);

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
      this.inited = true;
    })();

    try {
      await this.initPromise;
    } finally {
      this.initing = false;
      this.initPromise = undefined;
    }

    return remoteEntryExports;
  }

  async get(
    id: string,
    expose: string,
    options?: { loadFactory?: boolean },
    remoteSnapshot?: ModuleInfo,
  ) {
    return Effect.runPromise(
      this.host.remoteHandler._getModule(
        this,
        id,
        expose,
        options,
        remoteSnapshot,
      ),
    );
  }

  wraperFactory(moduleFactory: any, id: string) {
    const tag = (res: any) => {
      if (
        res &&
        typeof res === 'object' &&
        Object.isExtensible(res) &&
        !Object.getOwnPropertyDescriptor(res, MF_MODULE_ID)
      ) {
        Object.defineProperty(res, MF_MODULE_ID, {
          value: id,
          enumerable: false,
        });
      }
      return res;
    };
    if (moduleFactory instanceof Promise) {
      return async () => {
        const factory = await moduleFactory;
        return tag(factory());
      };
    }
    return () => tag(moduleFactory());
  }
}

export { Module };
