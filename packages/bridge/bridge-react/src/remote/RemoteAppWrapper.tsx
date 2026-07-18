/**
 * Shared RemoteAppWrapper component used by both base and router versions
 * This component handles the lifecycle of remote Module Federation apps
 */
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { LoggerInstance, getRootDomDefaultClassName } from '../utils';
import { federationRuntime } from '../provider/plugin';
import { RemoteComponentProps, RemoteAppParams } from '../types';
import type { RemoteAppSSRProps } from '../types';
import {
  getBridgeSSRContainerAttrs,
  getMatchingBridgeSSRResult,
} from '@module-federation/bridge-shared';

export const RemoteAppWrapper = forwardRef(function (
  props: RemoteAppParams & RemoteComponentProps & RemoteAppSSRProps,
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
    ssr,
    instanceId: suppliedInstanceId,
    ...resProps
  } = props;
  const ssrPayload = getMatchingBridgeSSRResult(ssr, {
    moduleName,
    instanceId: suppliedInstanceId,
  });
  const instanceId = suppliedInstanceId || ssrPayload?.instanceId;
  const hasSSRPayload = Boolean(ssrPayload && instanceId);

  const instance = federationRuntime.instance;
  const rootRef: React.MutableRefObject<HTMLDivElement | null> =
    ref && 'current' in ref
      ? (ref as React.MutableRefObject<HTMLDivElement | null>)
      : useRef(null);

  const renderDom: React.MutableRefObject<HTMLElement | null> = useRef(null);
  const providerInfoRef = useRef<any>(null);
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

        instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit({
          moduleName,
          dom: renderDom.current,
          basename,
          memoryRoute,
          fallback,
          ...resProps,
        });

        providerInfoRef.current?.destroy({
          moduleName,
          dom: renderDom.current,
        });

        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit({
          moduleName,
          dom: renderDom.current,
          basename,
          memoryRoute,
          fallback,
          ...resProps,
        });
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
      instanceId,
      ssrState: ssrPayload?.dehydratedState,
      ...resProps,
    };
    renderDom.current = rootRef.current;

    const beforeBridgeRenderRes =
      instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(renderProps) ||
      {};
    // @ts-ignore
    renderProps = { ...renderProps, ...beforeBridgeRenderRes.extraProps };
    providerInfoRef.current.render(renderProps);
    instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(renderProps);
  }, [initialized, ...Object.values(props)]);

  // bridge-remote-root
  const rootComponentClassName = `${getRootDomDefaultClassName(moduleName)} ${className || ''}`;
  return (
    <div
      className={rootComponentClassName}
      style={style}
      ref={rootRef}
      {...(hasSSRPayload && instanceId
        ? getBridgeSSRContainerAttrs({ moduleName, instanceId })
        : {})}
      {...(hasSSRPayload
        ? {
            dangerouslySetInnerHTML: { __html: ssrPayload!.html },
            suppressHydrationWarning: true,
          }
        : {})}
    >
      {hasSSRPayload ? null : loading}
    </div>
  );
});
