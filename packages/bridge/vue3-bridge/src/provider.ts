import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import { LoggerInstance } from './utils';
import { getInstance } from '@module-federation/runtime';
import { processRoutes } from './routeUtils';
import {
  attachBridgeOperationContext,
  completeBridgeOperation,
  createBridgeId,
  createBridgeOperationContext,
  emitBridgeLifecycle,
  getAttachedBridgeOperationContext,
  type RenderFnParams,
  sanitizeBridgePath,
} from '@module-federation/bridge-shared';

declare const __APP_VERSION__: string;

type AddOptionsFnParams = {
  app: Vue.App<Vue.Component>;
  basename: RenderFnParams['basename'];
  memoryRoute: RenderFnParams['memoryRoute'];
  [key: string]: any;
};

export type ProviderFnParams = {
  rootComponent: Vue.Component;
  appOptions: (params: AddOptionsFnParams) => {
    router?: VueRouter.Router;
    /** Called with the bridge's internal router after creation but before navigation.
     *  Use this to register global guards (beforeEach, afterEach, etc.) that would
     *  otherwise be lost when the bridge recreates the router. */
    afterRouterCreate?: (router: VueRouter.Router) => void;
  } | void;
};

export function createBridgeComponent(bridgeInfo: ProviderFnParams) {
  const rootMap = new Map();
  const bridgeIds = new WeakMap<object, string>();
  const destroyedRoots = new WeakSet<object>();
  const instance = getInstance();
  return () => {
    return {
      __APP_VERSION__,
      async render(info: RenderFnParams) {
        LoggerInstance.debug(`createBridgeComponent render Info`, info);
        const parentContext = getAttachedBridgeOperationContext(info);
        const bridgeId =
          parentContext?.bridgeId ||
          bridgeIds.get(info.dom) ||
          createBridgeId();
        bridgeIds.set(info.dom, bridgeId);
        const operationContext = createBridgeOperationContext({
          side: 'producer',
          framework: 'vue',
          operation:
            parentContext?.operation ||
            (rootMap.has(info.dom) ? 'update' : 'render'),
          bridgeId,
          moduleName: info.moduleName,
          parent: parentContext,
          reason: parentContext?.reason || 'direct',
        });
        emitBridgeLifecycle(
          instance,
          'beforeBridgeOperation',
          operationContext,
        );
        attachBridgeOperationContext(info, operationContext);
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          hashRoute,
          ...propsInfo
        } = info;
        let routeContext:
          | ReturnType<typeof createBridgeOperationContext>
          | undefined;
        let routeCompleted = false;

        try {
          const app = Vue.createApp(bridgeInfo.rootComponent, propsInfo);
          rootMap.set(dom, app);
          destroyedRoots.delete(app);

          const beforeBridgeRenderRes =
            await instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
              info,
            );

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
            routeContext = createBridgeOperationContext({
              side: 'producer',
              framework: 'vue',
              operation: 'route-sync',
              bridgeId,
              moduleName,
              route: memoryRoute?.entryPath
                ? {
                    action: 'memory-route-init',
                    to: memoryRoute.entryPath,
                    basename,
                  }
                : { action: 'basename-init', to: basename, basename },
            });
            emitBridgeLifecycle(
              instance,
              'beforeBridgeOperation',
              routeContext,
            );
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

            LoggerInstance.debug(
              `createBridgeComponent render router info>>>`,
              {
                moduleName,
                router,
              },
            );
            // memory route Initializes the route
            if (memoryRoute) {
              const navigationResult = await router.push(memoryRoute.entryPath);
              if (VueRouter.isNavigationFailure(navigationResult)) {
                emitBridgeLifecycle(
                  instance,
                  'afterBridgeOperation',
                  completeBridgeOperation(routeContext, 'skipped'),
                );
                routeCompleted = true;
              }
            }

            const observeNavigation = (method: 'push' | 'replace') => {
              const original = router[method].bind(router);
              router[method] = ((to: VueRouter.RouteLocationRaw) => {
                const navigationContext = createBridgeOperationContext({
                  side: 'producer',
                  framework: 'vue',
                  operation: 'route-sync',
                  bridgeId,
                  moduleName,
                  route: {
                    action: 'remote-to-host',
                    from: router.currentRoute.value.path,
                    to: sanitizeBridgePath(
                      typeof to === 'string'
                        ? to
                        : 'path' in to
                          ? to.path
                          : undefined,
                    ),
                    basename,
                  },
                });
                emitBridgeLifecycle(
                  instance,
                  'beforeBridgeOperation',
                  navigationContext,
                );
                try {
                  const navigation = original(to);
                  return navigation.then(
                    (result) => {
                      emitBridgeLifecycle(
                        instance,
                        'afterBridgeOperation',
                        completeBridgeOperation(
                          navigationContext,
                          VueRouter.isNavigationFailure(result)
                            ? 'skipped'
                            : 'success',
                        ),
                      );
                      return result;
                    },
                    (error) => {
                      emitBridgeLifecycle(
                        instance,
                        'afterBridgeOperation',
                        completeBridgeOperation(
                          navigationContext,
                          'error',
                          error,
                        ),
                      );
                      throw error;
                    },
                  );
                } catch (error) {
                  emitBridgeLifecycle(
                    instance,
                    'afterBridgeOperation',
                    completeBridgeOperation(navigationContext, 'error', error),
                  );
                  throw error;
                }
              }) as (typeof router)[typeof method];
            };
            observeNavigation('push');
            observeNavigation('replace');

            app.use(router);
            if (!routeCompleted) {
              emitBridgeLifecycle(
                instance,
                'afterBridgeOperation',
                completeBridgeOperation(routeContext, 'success'),
              );
              routeCompleted = true;
            }
          }

          emitBridgeLifecycle(
            instance,
            'bridgeRenderInvoked',
            operationContext,
          );
          app.mount(dom);
          instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info);
          emitBridgeLifecycle(
            instance,
            'afterBridgeOperation',
            completeBridgeOperation(operationContext, 'success'),
          );
          void Vue.nextTick().then(() => {
            emitBridgeLifecycle(
              instance,
              'afterBridgeCommit',
              completeBridgeOperation(operationContext, 'success'),
            );
          });
        } catch (error) {
          if (routeContext && !routeCompleted) {
            emitBridgeLifecycle(
              instance,
              'afterBridgeOperation',
              completeBridgeOperation(routeContext, 'error', error),
            );
          }
          emitBridgeLifecycle(
            instance,
            'afterBridgeOperation',
            completeBridgeOperation(operationContext, 'error', error),
          );
          throw error;
        }
      },
      destroy(info: { dom: HTMLElement }) {
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(info?.dom);

        const parentContext = getAttachedBridgeOperationContext(info);
        const operationContext = createBridgeOperationContext({
          side: 'producer',
          framework: 'vue',
          operation: 'destroy',
          bridgeId:
            parentContext?.bridgeId ||
            bridgeIds.get(info.dom) ||
            createBridgeId(),
          moduleName: parentContext?.moduleName,
          parent: parentContext,
          reason: parentContext?.reason || 'direct',
        });
        emitBridgeLifecycle(
          instance,
          'beforeBridgeOperation',
          operationContext,
        );
        attachBridgeOperationContext(info, operationContext);
        try {
          instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(info);
          const alreadyDestroyed = root && destroyedRoots.has(root);
          if (root && !alreadyDestroyed) {
            root.unmount();
            destroyedRoots.add(root);
          }
          instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
          emitBridgeLifecycle(
            instance,
            'afterBridgeOperation',
            completeBridgeOperation(
              operationContext,
              root && !alreadyDestroyed ? 'success' : 'skipped',
            ),
          );
        } catch (error) {
          emitBridgeLifecycle(
            instance,
            'afterBridgeOperation',
            completeBridgeOperation(operationContext, 'error', error),
          );
          throw error;
        }
      },
    };
  };
}
