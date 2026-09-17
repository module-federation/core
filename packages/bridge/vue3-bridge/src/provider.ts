import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import {
  RenderFnParams,
  type BridgeOperationContext,
} from '@module-federation/bridge-shared';
import { LoggerInstance } from './utils';
import { getInstance } from '@module-federation/runtime';
import { processRoutes } from './routeUtils';

declare const __APP_VERSION__: string;

type AddOptionsFnParams = {
  app: Vue.App<Vue.Component>;
  basename: RenderFnParams['basename'];
  memoryRoute: RenderFnParams['memoryRoute'];
  [key: string]: any;
};

export type ProviderFnParams = {
  rootComponent: Vue.Component;
  appOptions?: (params: AddOptionsFnParams) => {
    router?: VueRouter.Router;
    /** Called with the bridge's internal router after creation but before navigation.
     *  Use this to register global guards (beforeEach, afterEach, etc.) that would
     *  otherwise be lost when the bridge recreates the router. */
    afterRouterCreate?: (router: VueRouter.Router) => void;
  } | void;
};

export function createBridgeComponent(bridgeInfo: ProviderFnParams) {
  const instance = getInstance();
  return () => {
    // A provider instance owns the roots it mounts. Keeping this map here
    // prevents roots from leaking across independently created providers.
    const rootMap = new Map<HTMLElement, Vue.App<Vue.Component>>();
    const renderGenerations = new WeakMap<HTMLElement, number>();

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
        const renderGeneration = (renderGenerations.get(dom) ?? 0) + 1;
        renderGenerations.set(dom, renderGeneration);
        const isCurrentRender = () =>
          renderGenerations.get(dom) === renderGeneration;
        const operationContext: BridgeOperationContext = {
          side: 'producer',
          framework: 'vue',
          operation: rootMap.has(dom) ? 'update' : 'render',
          reason: 'direct',
        };

        const app = Vue.createApp(bridgeInfo.rootComponent, propsInfo);

        const beforeBridgeRenderRes =
          await instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
            info,
            operationContext,
          );

        if (!isCurrentRender()) {
          return;
        }

        const extraProps =
          beforeBridgeRenderRes &&
          typeof beforeBridgeRenderRes === 'object' &&
          beforeBridgeRenderRes?.extraProps
            ? beforeBridgeRenderRes?.extraProps
            : {};

        const bridgeOptions = bridgeInfo.appOptions?.({
          app,
          basename,
          memoryRoute,
          hashRoute,
          ...propsInfo,
          ...extraProps,
        });
        if (bridgeOptions?.router) {
          const { history, routes, patchRouter } = processRoutes({
            router: bridgeOptions.router,
            basename: info.basename,
            memoryRoute: info.memoryRoute,
            hashRoute: info.hashRoute,
          });

          const router = VueRouter.createRouter({
            ...bridgeOptions.router.options,
            history,
            routes,
          });

          if (patchRouter) {
            patchRouter(router);
          }

          if (bridgeOptions.afterRouterCreate) {
            bridgeOptions.afterRouterCreate(router);
          }

          LoggerInstance.debug(`createBridgeComponent render router info>>>`, {
            moduleName,
            router,
          });
          // memory route Initializes the route
          if (memoryRoute) {
            const route = {
              action: 'memory-route-init' as const,
              to: memoryRoute.entryPath,
              basename,
            };
            const routeContext: BridgeOperationContext = {
              side: 'producer',
              framework: 'vue',
              operation: 'route-sync',
              moduleName,
              route,
            };
            const result = await router.push(memoryRoute.entryPath);
            if (!isCurrentRender()) {
              return;
            }
            instance?.bridgeHook?.lifecycle?.afterBridgeRouteSync?.emit({
              context: routeContext,
              result,
            });
          }

          app.use(router);
        }

        const previousApp = rootMap.get(dom);
        if (previousApp) {
          // Vue apps cannot be mounted twice. Recreate the app for updates,
          // but release the previous root before mounting the replacement.
          previousApp.unmount();
          rootMap.delete(dom);
        }
        if (!isCurrentRender()) {
          return;
        }
        app.mount(dom);
        rootMap.set(dom, app);
        instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info, {
          context: operationContext,
        });
      },
      destroy(info: { dom: HTMLElement; moduleName?: string }) {
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        if (info?.dom) {
          renderGenerations.set(
            info.dom,
            (renderGenerations.get(info.dom) ?? 0) + 1,
          );
        }
        const root = rootMap.get(info?.dom);
        const operationContext: BridgeOperationContext = {
          side: 'producer',
          framework: 'vue',
          operation: 'destroy',
          reason: 'direct',
        };

        instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
          info,
          operationContext,
        );
        root?.unmount();
        if (root) {
          rootMap.delete(info.dom);
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info, {
          context: operationContext,
        });
      },
    };
  };
}
