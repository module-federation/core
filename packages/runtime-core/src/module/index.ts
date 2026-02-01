import { getFMId, assert, error, processModuleAlias } from '../utils';
import { safeToString, ModuleInfo } from '@module-federation/sdk';
import {
  getShortErrorMsg,
  RUNTIME_002,
  RUNTIME_008,
  runtimeDescMap,
} from '@module-federation/error-codes';
import { getRemoteEntry } from '../utils/load';
import { ModuleFederation } from '../core';
import {
  RemoteEntryExports,
  RemoteInfo,
  InitScope,
  ShareScopeMap,
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

  // Help to find host instance
  Object.defineProperty(remoteEntryInitOptions, 'shareScopeMap', {
    value: localShareScopeMap,
    // remoteEntryInitOptions will be traversed and assigned during container init, so this attribute is not allowed to be traversed
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

// --- Effect programs ---

const getEntryEffect = (mod: Module): Effect.Effect<RemoteEntryExports> =>
  Effect.gen(function* () {
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

const initEffect = (
  mod: Module,
  id?: string,
  remoteSnapshot?: ModuleInfo,
): Effect.Effect<RemoteEntryExports> =>
  Effect.gen(function* () {
    const remoteEntryExports = yield* getEntryEffect(mod);

    if (!mod.inited) {
      const { remoteEntryInitOptions, shareScope, initScope } =
        createRemoteEntryInitOptions(mod.remoteInfo, mod.host.shareScopeMap);

      const initContainerOptions = yield* Effect.promise(() =>
        mod.host.hooks.lifecycle.beforeInitContainer.emit({
          shareScope,
          // @ts-ignore shareScopeMap will be set by Object.defineProperty
          remoteEntryInitOptions,
          initScope,
          remoteInfo: mod.remoteInfo,
          origin: mod.host,
        }),
      );

      if (typeof remoteEntryExports?.init === 'undefined') {
        error(
          getShortErrorMsg(RUNTIME_002, runtimeDescMap, {
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

const getModuleEffect = (
  mod: Module,
  id: string,
  expose: string,
  options?: { loadFactory?: boolean },
  remoteSnapshot?: ModuleInfo,
): Effect.Effect<any> =>
  Effect.gen(function* () {
    const { loadFactory = true } = options || { loadFactory: true };

    const remoteEntryExports = yield* initEffect(mod, id, remoteSnapshot);
    mod.lib = remoteEntryExports;

    let moduleFactory;
    moduleFactory = yield* Effect.promise(async () => {
      const result = await mod.host.loaderHook.lifecycle.getModuleFactory.emit({
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
    return Effect.runPromise(getEntryEffect(this));
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

  async init(id?: string, remoteSnapshot?: ModuleInfo) {
    return Effect.runPromise(initEffect(this, id, remoteSnapshot));
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async get(
    id: string,
    expose: string,
    options?: { loadFactory?: boolean },
    remoteSnapshot?: ModuleInfo,
  ) {
    return Effect.runPromise(
      getModuleEffect(this, id, expose, options, remoteSnapshot),
    );
  }

  wraperFactory(moduleFactory: () => any | (() => Promise<any>), id: string) {
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
