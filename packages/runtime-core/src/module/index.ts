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
    return Effect.runPromise(
      this.host.remoteHandler._ensureEntry(this, {
        init: true,
        id,
        remoteSnapshot,
      }),
    );
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
