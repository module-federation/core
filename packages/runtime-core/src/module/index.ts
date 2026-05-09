import {
  assert,
  error,
  processModuleAlias,
  optionsToMFContext,
} from '../utils';
import { safeToString, ModuleInfo } from '@module-federation/sdk';
import {
  RUNTIME_002,
  RUNTIME_014,
  RUNTIME_015,
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

export type ModuleOptions = ConstructorParameters<typeof Module>[0];
export type RemoteModuleFactory = () => unknown | Promise<unknown>;

function getAvailableExposeNames(
  remoteSnapshot?: ModuleInfo,
): string | undefined {
  if (
    !remoteSnapshot ||
    !('modules' in remoteSnapshot) ||
    !Array.isArray(remoteSnapshot.modules)
  ) {
    return undefined;
  }

  const exposes = remoteSnapshot.modules
    .map((module) => module.moduleName)
    .filter(Boolean);

  return exposes.length ? exposes.join(',') : undefined;
}

export function createRemoteEntryInitOptions(
  remoteInfo: RemoteInfo,
  hostShareScopeMap: ShareScopeMap,
  rawInitScope?: InitScope,
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
    // remoteEntryInitOptions will be traversed and assigned during container init, ,so this attribute is not allowed to be traversed
    enumerable: false,
  });

  // TODO: compate legacy init params, should use shareScopeMap if exist
  const shareScope = localShareScopeMap[shareScopeKeys[0]];
  const initScope: InitScope = rawInitScope ?? [];

  return {
    remoteEntryInitOptions,
    shareScope,
    initScope,
  };
}

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

    this.remoteEntryExports = remoteEntryExports;
    return this.remoteEntryExports;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

  async init(
    id?: string,
    remoteSnapshot?: ModuleInfo,
    rawInitScope?: InitScope,
  ) {
    // Get remoteEntry.js
    const remoteEntryExports = await this.getEntry();

    if (this.inited) {
      await this.host.loaderHook.lifecycle.afterInitRemote.emit({
        id,
        remoteInfo: this.remoteInfo,
        remoteSnapshot,
        remoteEntryExports,
        cached: true,
        origin: this.host,
      });
      return remoteEntryExports;
    }

    if (this.initPromise) {
      try {
        await this.initPromise;
        await this.host.loaderHook.lifecycle.afterInitRemote.emit({
          id,
          remoteInfo: this.remoteInfo,
          remoteSnapshot,
          remoteEntryExports,
          cached: true,
          origin: this.host,
        });
      } catch (initError) {
        await this.host.loaderHook.lifecycle.afterInitRemote.emit({
          id,
          remoteInfo: this.remoteInfo,
          remoteSnapshot,
          remoteEntryExports,
          error: initError,
          cached: true,
          origin: this.host,
        });
        throw initError;
      }
      return remoteEntryExports;
    }

    this.initing = true;
    this.initPromise = (async () => {
      await this.host.loaderHook.lifecycle.beforeInitRemote.emit({
        id,
        remoteInfo: this.remoteInfo,
        remoteSnapshot,
        origin: this.host,
      });

      const { remoteEntryInitOptions, shareScope, initScope } =
        createRemoteEntryInitOptions(
          this.remoteInfo,
          this.host.shareScopeMap,
          rawInitScope,
        );

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
          RUNTIME_002,
          runtimeDescMap,
          {
            hostName: this.host.name,
            remoteName: this.remoteInfo.name,
            remoteEntryUrl: this.remoteInfo.entry,
            remoteEntryKey: this.remoteInfo.entryGlobalName,
          },
          undefined,
          optionsToMFContext(this.host.options),
        );
      }

      try {
        await remoteEntryExports.init(
          initContainerOptions.shareScope,
          initContainerOptions.initScope,
          initContainerOptions.remoteEntryInitOptions,
        );
      } catch (initError) {
        error(
          RUNTIME_015,
          runtimeDescMap,
          {
            hostName: this.host.name,
            remoteName: this.remoteInfo.name,
            remoteEntryUrl: this.remoteInfo.entry,
            remoteEntryKey: this.remoteInfo.entryGlobalName,
            shareScope: this.remoteInfo.shareScope,
          },
          `${initError}`,
          optionsToMFContext(this.host.options),
        );
      }

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
      await this.host.loaderHook.lifecycle.afterInitRemote.emit({
        id,
        remoteInfo: this.remoteInfo,
        remoteSnapshot,
        remoteEntryExports,
        origin: this.host,
      });
    } catch (initError) {
      await this.host.loaderHook.lifecycle.afterInitRemote.emit({
        id,
        remoteInfo: this.remoteInfo,
        remoteSnapshot,
        remoteEntryExports,
        error: initError,
        origin: this.host,
      });
      throw initError;
    } finally {
      this.initing = false;
      this.initPromise = undefined;
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

    await this.host.loaderHook.lifecycle.beforeGetExpose.emit({
      id,
      expose,
      moduleInfo: this.remoteInfo,
      remoteEntryExports,
      origin: this.host,
    });

    let moduleFactory: RemoteModuleFactory | undefined;
    try {
      const hookModuleFactory =
        await this.host.loaderHook.lifecycle.getModuleFactory.emit({
          remoteEntryExports,
          expose,
          moduleInfo: this.remoteInfo,
        });
      moduleFactory =
        typeof hookModuleFactory === 'function' ? hookModuleFactory : undefined;

      // get exposeGetter
      if (!moduleFactory) {
        moduleFactory = await remoteEntryExports.get(expose);
      }

      if (!moduleFactory) {
        error(
          RUNTIME_014,
          runtimeDescMap,
          {
            hostName: this.host.name,
            remoteName: this.remoteInfo.name,
            remoteEntryUrl: this.remoteInfo.entry,
            expose,
            requestId: id,
            availableExposes: getAvailableExposeNames(remoteSnapshot),
          },
          undefined,
          optionsToMFContext(this.host.options),
        );
      }

      await this.host.loaderHook.lifecycle.afterGetExpose.emit({
        id,
        expose,
        moduleInfo: this.remoteInfo,
        remoteEntryExports,
        moduleFactory,
        origin: this.host,
      });
    } catch (getExposeError) {
      await this.host.loaderHook.lifecycle.afterGetExpose.emit({
        id,
        expose,
        moduleInfo: this.remoteInfo,
        remoteEntryExports,
        error: getExposeError,
        origin: this.host,
      });
      throw getExposeError;
    }

    // keep symbol for module name always one format
    const symbolName = processModuleAlias(this.remoteInfo.name, expose);
    const wrapModuleFactory = this.wraperFactory(moduleFactory, symbolName);

    if (!loadFactory) {
      return wrapModuleFactory;
    }

    await this.host.loaderHook.lifecycle.beforeExecuteFactory.emit({
      id,
      expose,
      moduleInfo: this.remoteInfo,
      loadFactory,
      origin: this.host,
    });

    try {
      const exposeContent = await wrapModuleFactory();

      await this.host.loaderHook.lifecycle.afterExecuteFactory.emit({
        id,
        expose,
        moduleInfo: this.remoteInfo,
        loadFactory,
        exposeModule: exposeContent,
        origin: this.host,
      });

      return exposeContent;
    } catch (executeFactoryError) {
      await this.host.loaderHook.lifecycle.afterExecuteFactory.emit({
        id,
        expose,
        moduleInfo: this.remoteInfo,
        loadFactory,
        error: executeFactoryError,
        origin: this.host,
      });
      throw executeFactoryError;
    }
  }

  private wraperFactory(moduleFactory: RemoteModuleFactory, id: string) {
    function defineModuleId(res: unknown, id: string) {
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

    return () => {
      const res = moduleFactory();

      if (res instanceof Promise) {
        return res.then((asyncRes) => {
          // This parameter is used for bridge debugging
          defineModuleId(asyncRes, id);
          return asyncRes;
        });
      }

      // This parameter is used for bridge debugging
      defineModuleId(res, id);
      return res;
    };
  }
}

export { Module };
