/**
 * Base bridge component implementation
 * This file contains bridge component logic shared across all React versions
 */
import * as React from 'react';
import type { BridgeOperationContext } from '@module-federation/bridge-shared';
import type {
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
  CreateRootOptions,
  HydrateParams,
  BridgeProvider,
} from '../../types';
import { BRIDGE_ROUTING } from '../routing';
import { LoggerInstance } from '../../utils';
import { federationRuntime } from '../plugin';
import { createBridgeElement } from '../create-element';

export function createBaseBridgeComponent<T>({
  createRoot,
  hydrateRoot,
  defaultRootOptions,
  renderStream: _renderStream,
  ...bridgeInfo
}: ProviderFnParams<T>): BridgeProvider<T, Promise<void>> {
  return () => {
    const rootMap = new Map<any, RootType>();
    const instance = federationRuntime.instance;
    LoggerInstance.debug(
      `createBridgeComponent instance from props >>>`,
      instance,
    );

    const createElement = createBridgeElement(
      bridgeInfo.rootComponent,
      instance,
    );

    const render = async (info: RenderParams, hydrate = false) => {
      LoggerInstance.debug(`createBridgeComponent render Info`, info);
      const {
        moduleName,
        dom,
        basename,
        memoryRoute,
        [BRIDGE_ROUTING]: routing,
        rootOptions,
        snapshot: _snapshot,
        updates: _updates,
        signal,
        ...propsInfo
      } = info;
      if (signal?.aborted) return;
      const operationContext: BridgeOperationContext = {
        side: 'producer',
        framework: 'react',
        operation: rootMap.has(dom) ? 'update' : 'render',
        reason: 'direct',
      };

      const mergedRootOptions: CreateRootOptions | undefined = {
        ...defaultRootOptions,
        ...(rootOptions as CreateRootOptions),
      };
      const rootComponentWithErrorBoundary = createElement(
        { moduleName, basename, memoryRoute, navigation: routing?.navigation },
        propsInfo,
        info,
        operationContext,
      );

      if (hydrate && !rootMap.has(dom)) {
        let root: RootType;
        if (bridgeInfo.hydrate) {
          root = await bridgeInfo.hydrate(rootComponentWithErrorBoundary, dom, {
            ...info,
            rootComponent: bridgeInfo.rootComponent,
          } as HydrateParams & { rootComponent: React.ComponentType<T> });
          if (signal?.aborted) {
            if ('unmount' in root) root.unmount();
            return;
          }
        } else if (hydrateRoot) {
          root = hydrateRoot(
            dom,
            rootComponentWithErrorBoundary,
            mergedRootOptions,
          );
        } else {
          throw new Error(
            'This Bridge provider does not support hydration. Use the React 18 or React 19 entry point.',
          );
        }
        rootMap.set(dom, root);
      } else if (bridgeInfo.render) {
        const root = await Promise.resolve(
          bridgeInfo.render(rootComponentWithErrorBoundary, dom, {
            ...info,
            rootComponent: bridgeInfo.rootComponent,
          }),
        );
        if (signal?.aborted) {
          if (root && 'unmount' in root) root.unmount();
          return;
        }
        rootMap.set(dom, root as RootType);
      } else {
        let root = rootMap.get(dom);
        // Do not call createRoot multiple times
        if (!root && createRoot) {
          root = createRoot(dom, mergedRootOptions);
          rootMap.set(dom, root as any);
        }

        if (root && 'render' in root) {
          root.render(rootComponentWithErrorBoundary);
        }
      }
      instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info, {
        context: operationContext,
      }) || {};
    };

    return {
      render,
      hydrate: (info: HydrateParams) => render(info, true),

      destroy(info: DestroyParams) {
        const { dom } = info;
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(dom);
        const operationContext: BridgeOperationContext = {
          side: 'producer',
          framework: 'react',
          operation: 'destroy',
          reason: 'direct',
        };

        instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
          info,
          operationContext,
        );
        if (root) {
          if ('unmount' in root) {
            root.unmount();
          } else {
            LoggerInstance.warn('Root does not have unmount method');
          }
          rootMap.delete(dom);
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info, {
          context: operationContext,
        });
      },
    };
  };
}
