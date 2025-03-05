import { type AsyncComponentOptions, defineAsyncComponent, h } from 'vue';
import { useRoute } from 'vue-router';
import RemoteApp from './remoteApp.jsx';
import { LoggerInstance } from './utils.js';

declare const __APP_VERSION__: string;

export function createRemoteComponent(info: {
  loader: () => Promise<any>;
  export?: string;
  asyncComponentOptions?: Omit<AsyncComponentOptions, 'loader'>;
  rootAttrs?: Record<string, unknown>;
}) {
  return defineAsyncComponent({
    __APP_VERSION__,
    ...info.asyncComponentOptions,
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
      LoggerInstance.debug(`createRemoteComponent LazyComponent create >>>`, {
        basename,
        info,
      });

      const module: any = await info.loader();
      const moduleName = module && module[Symbol.for('mf_module_id')];
      const exportFn = module[exportName];

      LoggerInstance.debug(
        `createRemoteComponent LazyComponent loadRemote info >>>`,
        { moduleName, module, exportName, basename, route },
      );

      if (exportName in module && typeof exportFn === 'function') {
        return {
          render() {
            return h(RemoteApp, {
              moduleName,
              providerInfo: exportFn,
              basename,
              rootAttrs: info.rootAttrs,
            });
          },
        };
      }
      throw new Error('module not found');
    },
  });
}
