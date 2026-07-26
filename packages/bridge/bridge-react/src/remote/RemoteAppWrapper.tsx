/**
 * Shared RemoteAppWrapper component used by both base and router versions
 * This component handles the lifecycle of remote Module Federation apps
 */
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { startBridgeOperation } from '@module-federation/bridge-shared';
import { LoggerInstance, getRootDomDefaultClassName } from '../utils';
import { federationRuntime } from '../provider/plugin';
import { RemoteComponentProps, RemoteAppParams } from '../types';

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
        const operation = startBridgeOperation(instance, {
          side: 'consumer',
          framework: 'react',
          operation: 'destroy',
          args: destroyInfo,
          moduleName,
          reason: 'unmount',
        });

        try {
          instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
            destroyInfo,
          );
          const result = providerInfoRef.current.destroy({
            moduleName,
            dom: renderDom.current,
          });
          instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(
            destroyInfo,
          );
          void operation.finish(result);
        } catch (error) {
          operation.fail(error);
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
    const operation = startBridgeOperation(instance, {
      side: 'consumer',
      framework: 'react',
      operation: hasRenderedRef.current ? 'update' : 'render',
      args: renderProps,
      moduleName,
      reason: hasRenderedRef.current ? 'props-update' : 'mount',
    });

    try {
      const beforeBridgeRenderRes =
        instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
          renderProps,
        ) || {};
      // @ts-ignore
      renderProps = { ...renderProps, ...beforeBridgeRenderRes.extraProps };
      operation.invoked();
      const result = providerInfoRef.current.render(renderProps);
      hasRenderedRef.current = true;
      instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(renderProps);
      void operation.finish(result);
    } catch (error) {
      operation.fail(error);
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
