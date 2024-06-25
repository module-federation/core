import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import { RenderFnParams } from '@module-federation/bridge-shared';
import { LoggerInstance } from './utils';

declare const __APP_VERSION__: string;

export function createBridgeComponent(bridgeInfo: any) {
  const rootMap = new Map();
  return () => {
    return {
      __APP_VERSION__,
      render(info: RenderFnParams) {
        LoggerInstance.log(`createBridgeComponent render Info`, info);
        const app = Vue.createApp(bridgeInfo.rootComponent);
        rootMap.set(info.dom, app);
        const appOptions = bridgeInfo.appOptions({
          basename: info.basename,
          memoryRoute: info.memoryRoute,
        });

        const history = info.memoryRoute
          ? VueRouter.createMemoryHistory(info.basename)
          : VueRouter.createWebHistory(info.basename);
        const router = VueRouter.createRouter({
          ...appOptions.router.options,
          history,
          routes: appOptions.router.getRoutes(),
        });

        LoggerInstance.log(`createBridgeComponent render router info>>>`, {
          name: info.name,
          router,
        });
        // memory route Initializes the route
        if (info.memoryRoute) {
          router.push(info.memoryRoute.entryPath).then(() => {
            app.use(router);
            app.mount(info.dom);
          });
        } else {
          app.use(router);
          app.mount(info.dom);
        }
      },
      destroy(info: { dom: HTMLElement }) {
        LoggerInstance.log(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(info?.dom);
        root?.unmount();
      },
    };
  };
}
