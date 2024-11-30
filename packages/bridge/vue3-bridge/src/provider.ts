import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import { RenderFnParams } from '@module-federation/bridge-shared';
import { LoggerInstance } from './utils';
import { getInstance } from '@module-federation/runtime';

declare const __APP_VERSION__: string;

type AddOptionsFnParams = {
  rootComponent: Vue.Component;
  appOptions: (params: {
    app: Vue.App<Vue.Component>;
    basename: RenderFnParams['basename'];
    memoryRoute: RenderFnParams['memoryRoute'];
    [key: string]: any;
  }) => { router?: VueRouter.Router };
};

export type ProviderFnParams = {
  rootComponent: Vue.Component;
  appOptions: (params: AddOptionsFnParams) => { router?: VueRouter.Router };
};

export function createBridgeComponent(bridgeInfo: ProviderFnParams) {
  const rootMap = new Map();
  const instance = getInstance();
  return () => {
    return {
      __APP_VERSION__,
      async render(info: RenderFnParams) {
        LoggerInstance.log(`createBridgeComponent render Info`, info);
        const app = Vue.createApp(bridgeInfo.rootComponent);
        rootMap.set(info.dom, app);

        const beforeBridgeRenderRes =
          await instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(info);

        const extraProps =
          beforeBridgeRenderRes &&
          typeof beforeBridgeRenderRes === 'object' &&
          beforeBridgeRenderRes?.extraProps
            ? beforeBridgeRenderRes?.extraProps
            : {};

        const { router: remoteRouter } = bridgeInfo.appOptions({
          app,
          basename: info.basename,
          memoryRoute: info.memoryRoute,
          ...extraProps,
        });

        if (remoteRouter) {
          const history = info.memoryRoute
            ? VueRouter.createMemoryHistory(info.basename)
            : VueRouter.createWebHistory(info.basename);

          const router = VueRouter.createRouter({
            ...remoteRouter.options,
            history,
            routes: remoteRouter.getRoutes(),
          });

          LoggerInstance.log(`createBridgeComponent render router info>>>`, {
            name: info.moduleName,
            router,
          });
          // memory route Initializes the route
          if (info.memoryRoute) {
            await router.push(info.memoryRoute.entryPath);
          }

          app.use(router);
        }

        app.mount(info.dom);
        instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info);
      },
      destroy(info: { dom: HTMLElement }) {
        LoggerInstance.log(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(info?.dom);

        instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(info);
        root?.unmount();
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
      },
    };
  };
}
