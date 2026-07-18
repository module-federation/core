/**
 * Base bridge component implementation
 * This file contains bridge component logic shared across all React versions
 */
import type {
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
  CreateRootOptions,
} from '../../types';
import { LoggerInstance } from '../../utils';
import { federationRuntime } from '../plugin';
import {
  hasBridgeSSRMarkup,
  type BridgeJSONValue,
} from '@module-federation/bridge-shared';
import { createBridgeReactElement, omitHostFallback } from './bridge-render';

export function createBaseBridgeComponent<T>({
  createRoot,
  hydrateRoot,
  defaultRootOptions,
  ...bridgeInfo
}: ProviderFnParams<T>) {
  return () => {
    const rootMap = new Map<any, RootType>();
    const instance = federationRuntime.instance;
    LoggerInstance.debug(
      `createBridgeComponent instance from props >>>`,
      instance,
    );

    const hydrateState =
      bridgeInfo.ssr && typeof bridgeInfo.ssr === 'object'
        ? bridgeInfo.ssr.hydrate
        : undefined;

    return {
      async render(info: RenderParams) {
        if (info.signal?.aborted) return;
        LoggerInstance.debug(`createBridgeComponent render Info`, info);
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          rootOptions,
          instanceId,
          ssrState,
          ...propsInfo
        } = info;

        const mergedRootOptions: CreateRootOptions | undefined = {
          ...defaultRootOptions,
          ...(rootOptions as CreateRootOptions),
          ...(instanceId
            ? { identifierPrefix: `mf-${encodeURIComponent(instanceId)}-` }
            : {}),
        };

        const isFirstRender = !rootMap.has(dom);
        const shouldHydrate =
          isFirstRender &&
          hasBridgeSSRMarkup(dom, {
            moduleName,
            instanceId,
          });
        const hydratedProps =
          shouldHydrate && hydrateState
            ? hydrateState(ssrState as BridgeJSONValue | undefined)
            : {};

        const beforeBridgeRenderRes =
          instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(info) || {};

        const rootComponentWithErrorBoundary = createBridgeReactElement({
          rootComponent: bridgeInfo.rootComponent,
          basename,
          moduleName,
          memoryRoute,
          propsInfo: {
            ...hydratedProps,
            ...omitHostFallback(propsInfo as Record<string, unknown>),
            basename,
            ...(beforeBridgeRenderRes as any)?.extraProps,
          } as T,
        });

        if (bridgeInfo.render) {
          const renderer = shouldHydrate
            ? bridgeInfo.hydrate
            : bridgeInfo.render;
          if (!renderer) {
            throw new Error(
              'A custom Bridge renderer must provide hydrate when SSR is enabled',
            );
          }
          await Promise.resolve(
            renderer(rootComponentWithErrorBoundary, dom),
          ).then((root: RootType) => rootMap.set(dom, root));
        } else {
          let root = rootMap.get(dom);
          let didHydrate = false;
          if (shouldHydrate && hydrateRoot) {
            root = hydrateRoot!(
              dom,
              rootComponentWithErrorBoundary,
              mergedRootOptions,
            );
            rootMap.set(dom, root as RootType);
            didHydrate = true;
          }
          // Do not call createRoot multiple times
          if (!root && createRoot) {
            root = createRoot(dom, mergedRootOptions);
            rootMap.set(dom, root as any);
          }

          if (root && 'render' in root) {
            if (!didHydrate) root.render(rootComponentWithErrorBoundary);
          }
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info) || {};
      },

      destroy(info: DestroyParams) {
        const { dom } = info;
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(dom);
        if (root) {
          if ('unmount' in root) {
            root.unmount();
          } else {
            LoggerInstance.warn('Root does not have unmount method');
          }
          rootMap.delete(dom);
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
      },
    };
  };
}
