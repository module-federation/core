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
  getMatchingBridgeSSRPayload,
  type BridgeSSRReference,
  type BridgeSSRResult,
} from '@module-federation/bridge-shared';
import { BridgeRemoteSlot, useBridgeHydrationRegistry } from '../hydration';

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
  const ssrPayload = getMatchingBridgeSSRPayload(ssr, {
    moduleName,
    instanceId: suppliedInstanceId,
  });
  const instanceId = suppliedInstanceId || ssrPayload?.instanceId;
  const serverPayload =
    ssrPayload && 'html' in ssrPayload
      ? (ssrPayload as BridgeSSRResult)
      : undefined;
  const reference =
    ssrPayload && !('html' in ssrPayload)
      ? (ssrPayload as BridgeSSRReference)
      : undefined;
  const registry = useBridgeHydrationRegistry();
  const snapshot =
    reference && instanceId
      ? registry?.peek(reference.moduleName, instanceId)
      : undefined;
  const hasSSRPayload = Boolean((serverPayload || snapshot) && instanceId);

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
      ssrState: serverPayload?.dehydratedState ?? snapshot?.state,
      ...resProps,
    };
    renderDom.current = rootRef.current;

    const beforeBridgeRenderRes =
      instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(renderProps) ||
      {};
    // @ts-ignore
    renderProps = { ...renderProps, ...beforeBridgeRenderRes.extraProps };
    void Promise.resolve(providerInfoRef.current.render(renderProps))
      .then(() => {
        if (snapshot && instanceId) {
          registry?.consume(moduleName, instanceId);
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(renderProps);
      })
      .catch(() => {
        if (snapshot && instanceId) registry?.fail(moduleName, instanceId);
      });
  }, [initialized, ...Object.values(props)]);

  // bridge-remote-root
  const rootComponentClassName = `${getRootDomDefaultClassName(moduleName)} ${className || ''}`;
  const mount = (
    <div className={rootComponentClassName} style={style} ref={rootRef}>
      {hasSSRPayload ? null : loading}
    </div>
  );

  if (!hasSSRPayload || !instanceId) return mount;
  return (
    <BridgeRemoteSlot
      moduleName={moduleName}
      instanceId={instanceId}
      payload={serverPayload}
      snapshot={snapshot}
      className={className}
      style={style}
      mountRef={rootRef}
    />
  );
});
