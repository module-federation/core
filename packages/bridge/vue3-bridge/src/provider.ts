import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import { RenderFnParams } from '@module-federation/bridge-shared';
import { LoggerInstance } from './utils';
import { getInstance } from '@module-federation/runtime';

declare const __APP_VERSION__: string;

type AddOptionsFnParams = {
  app: Vue.App<Vue.Component>;
  basename: RenderFnParams['basename'];
  memoryRoute: RenderFnParams['memoryRoute'];
  [key: string]: any;
};

export type ProviderFnParams = {
  rootComponent: Vue.Component;
  appOptions: (
    params: AddOptionsFnParams,
  ) => { router?: VueRouter.Router } | void;
};

export function createBridgeComponent(bridgeInfo: ProviderFnParams) {
  const rootMap = new Map();
  const instance = getInstance();
  return () => {
    return {
      __APP_VERSION__,
      async render(info: RenderFnParams) {
        LoggerInstance.debug(`createBridgeComponent render Info`, info);
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          hashRoute,
          ...propsInfo
        } = info;
        const app = Vue.createApp(bridgeInfo.rootComponent, propsInfo);
        rootMap.set(dom, app);

        const beforeBridgeRenderRes =
          await instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(info);

        const extraProps =
          beforeBridgeRenderRes &&
          typeof beforeBridgeRenderRes === 'object' &&
          beforeBridgeRenderRes?.extraProps
            ? beforeBridgeRenderRes?.extraProps
            : {};

        const bridgeOptions = bridgeInfo.appOptions({
          app,
          basename,
          memoryRoute,
          hashRoute,
          ...propsInfo,
          ...extraProps,
        });
        if (bridgeOptions?.router) {
          let history;
          let routes = bridgeOptions.router.getRoutes();

          if (info.memoryRoute) {
            history = VueRouter.createMemoryHistory(info.basename);
          } else if (info.hashRoute) {
            history = VueRouter.createWebHashHistory();
            routes = routes.map((route) => {
              return {
                ...route,
                path: info.basename + route.path,
              };
            });
          } else {
            history = VueRouter.createWebHistory(info.basename);
          }

          const router = VueRouter.createRouter({
            ...bridgeOptions.router.options,
            history,
            routes,
          });

          LoggerInstance.debug(`createBridgeComponent render router info>>>`, {
            moduleName,
            router,
          });
          // memory route Initializes the route
          if (memoryRoute) {
            await router.push(memoryRoute.entryPath);
          }

          app.use(router);
        }

        app.mount(dom);
        instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info);
      },
      destroy(info: { dom: HTMLElement }) {
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(info?.dom);

        instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(info);
        root?.unmount();
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
      },
    };
  };
}
