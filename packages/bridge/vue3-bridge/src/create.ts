import { defineAsyncComponent, h } from 'vue';
import RemoteApp from './remoteApp.jsx';
import { LoggerInstance } from './utils.js';
import { useRoute } from 'vue-router';

declare const __APP_VERSION__: string;

export function createRemoteComponent(info: {
  loader: () => Promise<any>;
  export?: string;
}) {
  return defineAsyncComponent({
    __APP_VERSION__,
    //@ts-ignore
    loader: async () => {
      const route = useRoute();

      let basename = '/';
      const matchPath = route.matched[0]?.path;
      if (matchPath) {
        if (matchPath.endsWith('/:pathMatch(.*)*')) {
          basename = matchPath.replace('/:pathMatch(.*)*', '');
        } else {
          basename = route.matched[0].path;
        }
      }

      const exportName = info?.export || 'default';
      LoggerInstance.log(`createRemoteComponent LazyComponent create >>>`, {
        basename,
        info,
      });

      const module: any = await info.loader();
      const moduleName = module && module[Symbol.for('mf_module_id')];
      const exportFn = module[exportName];

      LoggerInstance.log(
        `createRemoteComponent LazyComponent loadRemote info >>>`,
        { name: moduleName, module, exportName, basename, route },
      );

      if (exportName in module && typeof exportFn === 'function') {
        return {
          render() {
            return h(RemoteApp, {
              moduleName,
              ...info,
              providerInfo: exportFn,
              basename,
            });
          },
        };
      }
      throw new Error('module not found');
    },
    loadingComponent: {
      template: '<div>Loading...</div>',
    },
    errorComponent: {
      template: '<div>Error loading component</div>',
    },
    delay: 200,
    timeout: 3000,
  });
}
