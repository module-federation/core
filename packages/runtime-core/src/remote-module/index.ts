import type { ModuleInfo } from '@module-federation/sdk';
import { RUNTIME_014, runtimeDescMap } from '@module-federation/error-codes';
import type { Module, RemoteModuleFactory } from '../module';
import { error, optionsToMFContext, processModuleAlias } from '../utils';

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

function wrapModuleFactory(moduleFactory: RemoteModuleFactory, id: string) {
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
        defineModuleId(asyncRes, id);
        return asyncRes;
      });
    }

    defineModuleId(res, id);
    return res;
  };
}

export class RemoteModuleHandler {
  async get(
    module: Module,
    id: string,
    expose: string,
    options?: { loadFactory?: boolean },
    remoteSnapshot?: ModuleInfo,
  ) {
    const { loadFactory = true } = options || { loadFactory: true };
    const { host, remoteInfo } = module;

    const remoteEntryExports = await module.init(
      id,
      remoteSnapshot,
      undefined,
      expose,
    );
    module.lib = remoteEntryExports;

    await host.loaderHook.lifecycle.beforeGetExpose.emit({
      id,
      expose,
      moduleInfo: remoteInfo,
      remoteEntryExports,
      origin: host,
    });

    let moduleFactory: RemoteModuleFactory | undefined;
    try {
      const hookModuleFactory =
        await host.loaderHook.lifecycle.getModuleFactory.emit({
          remoteEntryExports,
          expose,
          moduleInfo: remoteInfo,
        });
      moduleFactory =
        typeof hookModuleFactory === 'function' ? hookModuleFactory : undefined;

      if (!moduleFactory) {
        moduleFactory = await remoteEntryExports.get(expose);
      }

      if (!moduleFactory) {
        error(
          RUNTIME_014,
          runtimeDescMap,
          {
            hostName: host.name,
            remoteName: remoteInfo.name,
            remoteEntryUrl: remoteInfo.entry,
            expose,
            requestId: id,
            availableExposes: getAvailableExposeNames(remoteSnapshot),
          },
          undefined,
          optionsToMFContext(host.options),
        );
      }

      await host.loaderHook.lifecycle.afterGetExpose.emit({
        id,
        expose,
        moduleInfo: remoteInfo,
        remoteEntryExports,
        moduleFactory,
        origin: host,
      });
    } catch (getExposeError) {
      await host.loaderHook.lifecycle.afterGetExpose.emit({
        id,
        expose,
        moduleInfo: remoteInfo,
        remoteEntryExports,
        error: getExposeError,
        origin: host,
      });
      throw getExposeError;
    }

    const symbolName = processModuleAlias(remoteInfo.name, expose);
    const wrappedModuleFactory = wrapModuleFactory(moduleFactory, symbolName);

    if (!loadFactory) {
      return wrappedModuleFactory;
    }

    await host.loaderHook.lifecycle.beforeExecuteFactory.emit({
      id,
      expose,
      moduleInfo: remoteInfo,
      loadFactory,
      origin: host,
    });

    try {
      const exposeContent = await wrappedModuleFactory();

      await host.loaderHook.lifecycle.afterExecuteFactory.emit({
        id,
        expose,
        moduleInfo: remoteInfo,
        loadFactory,
        exposeModule: exposeContent,
        origin: host,
      });

      return exposeContent;
    } catch (executeFactoryError) {
      await host.loaderHook.lifecycle.afterExecuteFactory.emit({
        id,
        expose,
        moduleInfo: remoteInfo,
        loadFactory,
        error: executeFactoryError,
        origin: host,
      });
      throw executeFactoryError;
    }
  }
}
