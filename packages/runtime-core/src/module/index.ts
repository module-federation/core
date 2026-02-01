import {
  getFMId,
  assert,
  error,
  processModuleAlias,
  runtimeError,
} from '../utils';
import { safeToString, ModuleInfo } from '@module-federation/sdk';
import { RUNTIME_002 } from '@module-federation/error-codes';
import { getRemoteEntry } from '../utils/load';
import { ModuleFederation } from '../core';
import {
  RemoteEntryExports,
  RemoteInfo,
  InitScope,
  ShareScopeMap,
  RemoteEntryInitOptions,
} from '../type';
import { Effect } from '@module-federation/micro-effect';

export type ModuleOptions = ConstructorParameters<typeof Module>[0];

export function createRemoteEntryInitOptions(
  remoteInfo: RemoteInfo,
  hostShareScopeMap: ShareScopeMap,
): Record<string, any> {
  const localShareScopeMap = hostShareScopeMap;

  const shareScopeKeys = Array.isArray(remoteInfo.shareScope)
    ? remoteInfo.shareScope
    : [remoteInfo.shareScope];

  if (!shareScopeKeys.length) {
    shareScopeKeys.push('default');
  }
  shareScopeKeys.forEach((shareScopeKey) => {
    if (!localShareScopeMap[shareScopeKey]) {
      localShareScopeMap[shareScopeKey] = {};
    }
  });

  const remoteEntryInitOptions = {
    version: remoteInfo.version || '',
    shareScopeKeys: Array.isArray(remoteInfo.shareScope)
      ? shareScopeKeys
      : remoteInfo.shareScope || 'default',
  };

  Object.defineProperty(remoteEntryInitOptions, 'shareScopeMap', {
    value: localShareScopeMap,
    enumerable: false,
  });

  // TODO: compate legacy init params, should use shareScopeMap if exist
  const shareScope = localShareScopeMap[shareScopeKeys[0]];
  const initScope: InitScope = [];

  return {
    remoteEntryInitOptions,
    shareScope,
    initScope,
  };
}

const MF_MODULE_ID = Symbol.for('mf_module_id');

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
    return Effect.runPromise(this._getEntryEffect());
  }

  async init(id?: string, remoteSnapshot?: ModuleInfo) {
    return Effect.runPromise(this._initEffect(id, remoteSnapshot));
  }

  async get(
    id: string,
    expose: string,
    options?: { loadFactory?: boolean },
    remoteSnapshot?: ModuleInfo,
  ) {
    return Effect.runPromise(
      this._getModuleEffect(id, expose, options, remoteSnapshot),
    );
  }

  wraperFactory(moduleFactory: () => any | (() => Promise<any>), id: string) {
    if (moduleFactory instanceof Promise) {
      return async () => {
        const res = await moduleFactory();
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
    } else {
      return () => {
        const res = moduleFactory();
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
    }
  }

  private _getEntryEffect(): Effect.Effect<RemoteEntryExports> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const mod = this;
    return Effect.gen(function* () {
      if (mod.remoteEntryExports) {
        return mod.remoteEntryExports;
      }

      const remoteEntryExports = yield* Effect.promise(() =>
        getRemoteEntry({
          origin: mod.host,
          remoteInfo: mod.remoteInfo,
          remoteEntryExports: mod.remoteEntryExports,
        }),
      );

      assert(
        remoteEntryExports,
        `remoteEntryExports is undefined \n ${safeToString(mod.remoteInfo)}`,
      );

      mod.remoteEntryExports = remoteEntryExports;
      return mod.remoteEntryExports;
    });
  }

  private _initEffect(
    id?: string,
    remoteSnapshot?: ModuleInfo,
  ): Effect.Effect<RemoteEntryExports> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const mod = this;
    return Effect.gen(function* () {
      const remoteEntryExports = yield* mod._getEntryEffect();

      if (!mod.inited) {
        const { remoteEntryInitOptions, shareScope, initScope } =
          createRemoteEntryInitOptions(mod.remoteInfo, mod.host.shareScopeMap);

        const initContainerOptions = (yield* Effect.promise(() =>
          mod.host.hooks.lifecycle.beforeInitContainer.emit({
            shareScope,
            // @ts-ignore shareScopeMap will be set by Object.defineProperty
            remoteEntryInitOptions,
            initScope,
            remoteInfo: mod.remoteInfo,
            origin: mod.host,
          }),
        )) as {
          shareScope: ShareScopeMap[string];
          initScope: InitScope;
          remoteEntryInitOptions: RemoteEntryInitOptions;
          remoteInfo: RemoteInfo;
          origin: ModuleFederation;
        };

        if (typeof remoteEntryExports?.init === 'undefined') {
          error(
            runtimeError(RUNTIME_002, {
              hostName: mod.host.name,
              remoteName: mod.remoteInfo.name,
              remoteEntryUrl: mod.remoteInfo.entry,
              remoteEntryKey: mod.remoteInfo.entryGlobalName,
            }),
          );
        }

        yield* Effect.promise(async () => {
          await remoteEntryExports.init(
            initContainerOptions.shareScope,
            initContainerOptions.initScope,
            initContainerOptions.remoteEntryInitOptions,
          );
        });

        yield* Effect.promise(() =>
          mod.host.hooks.lifecycle.initContainer.emit({
            ...initContainerOptions,
            id,
            remoteSnapshot,
            remoteEntryExports,
          }),
        );
        mod.inited = true;
      }

      return remoteEntryExports;
    });
  }

  private _getModuleEffect(
    id: string,
    expose: string,
    options?: { loadFactory?: boolean },
    remoteSnapshot?: ModuleInfo,
  ): Effect.Effect<any> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const mod = this;
    return Effect.gen(function* () {
      const { loadFactory = true } = options || { loadFactory: true };

      const remoteEntryExports = yield* mod._initEffect(id, remoteSnapshot);
      mod.lib = remoteEntryExports;

      let moduleFactory;
      moduleFactory = yield* Effect.promise(async () => {
        const result =
          await mod.host.loaderHook.lifecycle.getModuleFactory.emit({
            remoteEntryExports,
            expose,
            moduleInfo: mod.remoteInfo,
          });
        // AsyncHook<[T], Promise<R>> emits Promise<void | false | Promise<R>>
        // Double-await flattens the inner Promise
        return await result;
      });

      if (!moduleFactory) {
        moduleFactory = yield* Effect.promise(async () =>
          remoteEntryExports.get(expose),
        );
      }

      assert(
        moduleFactory,
        `${getFMId(mod.remoteInfo)} remote don't export ${expose}.`,
      );

      const symbolName = processModuleAlias(mod.remoteInfo.name, expose);
      const wrapModuleFactory = mod.wraperFactory(moduleFactory, symbolName);

      if (!loadFactory) {
        return wrapModuleFactory;
      }
      const exposeContent = yield* Effect.promise(async () =>
        wrapModuleFactory(),
      );

      return exposeContent;
    });
  }
}

export { Module };
