import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import { RenderFnParams } from '@module-federation/bridge-shared';
import { LoggerInstance } from './utils';

declare const __APP_VERSION__: string;

type DestroyParams = {
  dom: HTMLElement;
};

type BridgeHooks = {
  beforeBridgeRender?: (params: RenderFnParams) => void | Record<string, any>;
  afterBridgeRender?: (params: RenderFnParams) => void | Record<string, any>;
  beforeBridgeDestroy?: (params: DestroyParams) => void | Record<string, any>;
  afterBridgeDestroy?: (params: DestroyParams) => void | Record<string, any>;
};

export function createBridgeComponent(bridgeInfo: any) {
  const rootMap = new Map();
  return (params: { hooks?: BridgeHooks }) => {
    return {
      __APP_VERSION__,
      render(info: RenderFnParams) {
        LoggerInstance.log(`createBridgeComponent render Info`, info);
        const app = Vue.createApp(bridgeInfo.rootComponent);
        rootMap.set(info.dom, app);
        // bridgeInfo?.renderLifecycle?.(info);
        const beforeBridgeRender =
          (bridgeInfo?.hooks && bridgeInfo?.hooks.beforeBridgeRender) ||
          params?.hooks?.beforeBridgeRender;

        // you can return a props object through beforeBridgeRender to pass additional props parameters
        const beforeBridgeRenderRes =
          beforeBridgeRender && beforeBridgeRender(info);
        const extraProps =
          beforeBridgeRenderRes &&
          typeof beforeBridgeRenderRes === 'object' &&
          beforeBridgeRenderRes?.extraProps
            ? beforeBridgeRenderRes?.extraProps
            : {};

        const appOptions = bridgeInfo.appOptions({
          basename: info.basename,
          memoryRoute: info.memoryRoute,
          ...extraProps,
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
          name: info.moduleName,
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

        const afterBridgeRender =
          (bridgeInfo?.hooks && bridgeInfo?.hooks.afterBridgeDestroy) ||
          params?.hooks?.afterBridgeRender;
        afterBridgeRender && afterBridgeRender(info);
      },
      destroy(info: { dom: HTMLElement }) {
        LoggerInstance.log(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(info?.dom);

        const beforeBridgeDestroy =
          (bridgeInfo?.hooks && bridgeInfo?.hooks.beforeBridgeDestroy) ||
          params?.hooks?.beforeBridgeDestroy;
        beforeBridgeDestroy && beforeBridgeDestroy(info);

        root?.unmount();
        const afterBridgeDestroy =
          (bridgeInfo?.hooks && bridgeInfo?.hooks.afterBridgeDestroy) ||
          params?.hooks?.afterBridgeDestroy;
        afterBridgeDestroy && afterBridgeDestroy(info);
      },
    };
  };
}
