import { loadAndInitializeRemote, getModule } from '@module-federation/core';

type ModuleOptions = {
  name: string;
  url: string;
  modulePath: string;
};

const useDynamicModule = <T,>({
  name,
  url,
  modulePath,
}: ModuleOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    loadAndInitializeRemote({
      global: name,
      url,
    }).then((container) => {
      getModule<T>({
        remoteContainer: container,
        modulePath,
      }).then((module) => {
        resolve(module as T);
      });
    });
  });
};

export default useDynamicModule;
