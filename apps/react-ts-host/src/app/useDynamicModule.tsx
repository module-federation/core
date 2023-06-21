import { getModule } from '@module-federation/utilities';

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
    getModule({
      remoteContainer: {
        global: name,
        url,
      },
      modulePath,
    }).then((module) => resolve(module as T));
  });
};

export default useDynamicModule;
