import { type AsyncComponentOptions, defineAsyncComponent, h } from 'vue';
import { useRoute } from 'vue-router';
import { resolveRemoteBasename } from './basename.js';
import RemoteApp from './remoteApp.jsx';
import { LoggerInstance } from './utils.js';

declare const __APP_VERSION__: string;

export function createRemoteAppComponent(info: {
  loader: () => Promise<any>;
  export?: string;
  asyncComponentOptions?: Omit<AsyncComponentOptions, 'loader'>;
  rootAttrs?: Record<string, unknown>;
  memoryRoute?: { entryPath: string };
  hashRoute?: boolean;
  /**
   * Host mount prefix for the remote router.
   * When set, skips route-based basename derivation (recommended for Nuxt /
   * other meta-framework catch-all pages).
   */
  basename?: string;
}) {
  return defineAsyncComponent({
    // @ts-ignore
    __APP_VERSION__,
    ...info.asyncComponentOptions,
    //@ts-ignore
    loader: async () => {
      const route = useRoute();
      const basename = resolveRemoteBasename({
        basename: info.basename,
        route,
      });

      const exportName = info?.export || 'default';
      LoggerInstance.debug(
        `createRemoteAppComponent LazyComponent create >>>`,
        {
          basename,
          info,
        },
      );

      const module: any = await info.loader();
      const moduleName = module && module[Symbol.for('mf_module_id')];
      const exportFn = module[exportName];

      LoggerInstance.debug(
        `createRemoteAppComponent LazyComponent loadRemote info >>>`,
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
              memoryRoute: info.memoryRoute,
              hashRoute: info.hashRoute,
            });
          },
        };
      }
      throw new Error('module not found');
    },
  });
}

/**
 * @deprecated createRemoteComponent is deprecated, please use createRemoteAppComponent instead!
 */
export function createRemoteComponent(info: {
  loader: () => Promise<any>;
  export?: string;
  asyncComponentOptions?: Omit<AsyncComponentOptions, 'loader'>;
  rootAttrs?: Record<string, unknown>;
}) {
  LoggerInstance.warn(
    'createRemoteComponent is deprecated, please use createRemoteAppComponent instead!',
  );
  return createRemoteAppComponent(info);
}
