/**
 * Shared RemoteAppWrapper component used by both base and router versions
 * This component handles the lifecycle of remote Module Federation apps
 */
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { LoggerInstance, getRootDomDefaultClassName } from '../utils';
import { federationRuntime } from '../provider/plugin';
import { RemoteComponentProps, RemoteAppParams } from '../types';
import {
  attachBridgeOperationContext,
  completeBridgeOperation,
  createBridgeId,
  createBridgeOperationContext,
  emitBridgeLifecycle,
} from '@module-federation/bridge-shared';

export const RemoteAppWrapper = forwardRef(function (
  props: RemoteAppParams & RemoteComponentProps,
  ref,
) {
  const {
    moduleName,
    memoryRoute,
    basename,
    providerInfo,
    className,
    style,
    fallback,
    loading,
    ...resProps
  } = props;

  const instance = federationRuntime.instance;
  const rootRef: React.MutableRefObject<HTMLDivElement | null> =
    ref && 'current' in ref
      ? (ref as React.MutableRefObject<HTMLDivElement | null>)
      : useRef(null);

  const renderDom: React.MutableRefObject<HTMLElement | null> = useRef(null);
  const providerInfoRef = useRef<any>(null);
  const [bridgeId] = useState(createBridgeId);
  const hasRenderedRef = useRef(false);
  const [initialized, setInitialized] = useState(false);

  LoggerInstance.debug(`RemoteAppWrapper instance from props >>>`, instance);

  // 初始化远程组件
  useEffect(() => {
    if (initialized) return;
    const providerReturn = providerInfo();
    providerInfoRef.current = providerReturn;
    setInitialized(true);

    return () => {
      if (providerInfoRef.current?.destroy) {
        LoggerInstance.debug(
          `createRemoteAppComponent LazyComponent destroy >>>`,
          { moduleName, basename, dom: renderDom.current },
        );

        const destroyInfo = {
          moduleName,
          dom: renderDom.current,
          basename,
          memoryRoute,
          fallback,
          ...resProps,
        };
        const operationContext = createBridgeOperationContext({
          side: 'consumer',
          framework: 'react',
          operation: 'destroy',
          bridgeId,
          moduleName,
          reason: 'unmount',
        });
        attachBridgeOperationContext(destroyInfo, operationContext);
        emitBridgeLifecycle(
          instance,
          'beforeBridgeOperation',
          operationContext,
        );

        try {
          instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
            destroyInfo,
          );
          const result = providerInfoRef.current?.destroy(destroyInfo);
          instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(
            destroyInfo,
          );
          if (result && typeof result.then === 'function') {
            void result.then(
              () =>
                emitBridgeLifecycle(
                  instance,
                  'afterBridgeOperation',
                  completeBridgeOperation(operationContext, 'success'),
                ),
              (error: unknown) => {
                emitBridgeLifecycle(
                  instance,
                  'afterBridgeOperation',
                  completeBridgeOperation(operationContext, 'error', error),
                );
                throw error;
              },
            );
          } else {
            emitBridgeLifecycle(
              instance,
              'afterBridgeOperation',
              completeBridgeOperation(operationContext, 'success'),
            );
          }
        } catch (error) {
          emitBridgeLifecycle(
            instance,
            'afterBridgeOperation',
            completeBridgeOperation(operationContext, 'error', error),
          );
          throw error;
        }

        hasRenderedRef.current = false;
      }
    };
  }, [moduleName]);

  // trigger render after props updated
  useEffect(() => {
    if (!initialized || !providerInfoRef.current) return;

    let renderProps = {
      moduleName,
      dom: rootRef.current,
      basename,
      memoryRoute,
      fallback,
      ...resProps,
    };
    renderDom.current = rootRef.current;
    const operationContext = createBridgeOperationContext({
      side: 'consumer',
      framework: 'react',
      operation: hasRenderedRef.current ? 'update' : 'render',
      bridgeId,
      moduleName,
      reason: hasRenderedRef.current ? 'props-update' : 'mount',
    });
    attachBridgeOperationContext(renderProps, operationContext);
    emitBridgeLifecycle(instance, 'beforeBridgeOperation', operationContext);

    try {
      const beforeBridgeRenderRes =
        instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
          renderProps,
        ) || {};
      // @ts-ignore
      renderProps = { ...renderProps, ...beforeBridgeRenderRes.extraProps };
      attachBridgeOperationContext(renderProps, operationContext);
      emitBridgeLifecycle(instance, 'bridgeRenderInvoked', operationContext);
      const result = providerInfoRef.current.render(renderProps);
      hasRenderedRef.current = true;
      instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(renderProps);
      if (result && typeof result.then === 'function') {
        void result.then(
          () =>
            emitBridgeLifecycle(
              instance,
              'afterBridgeOperation',
              completeBridgeOperation(operationContext, 'success'),
            ),
          (error: unknown) => {
            emitBridgeLifecycle(
              instance,
              'afterBridgeOperation',
              completeBridgeOperation(operationContext, 'error', error),
            );
            throw error;
          },
        );
      } else {
        emitBridgeLifecycle(
          instance,
          'afterBridgeOperation',
          completeBridgeOperation(operationContext, 'success'),
        );
      }
    } catch (error) {
      emitBridgeLifecycle(
        instance,
        'afterBridgeOperation',
        completeBridgeOperation(operationContext, 'error', error),
      );
      throw error;
    }
  }, [initialized, ...Object.values(props)]);

  // bridge-remote-root
  const rootComponentClassName = `${getRootDomDefaultClassName(moduleName)} ${className || ''}`;
  return (
    <div className={rootComponentClassName} style={style} ref={rootRef}>
      {loading}
    </div>
  );
});
