/**
 * Base version of RemoteAppWrapper without react-router-dom dependencies
 * This file is used by the /base entry point to avoid bundling router code
 * when it's not needed.
 */
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { LoggerInstance, getRootDomDefaultClassName } from '../utils';
import { federationRuntime } from '../provider/plugin';
import { RemoteComponentProps, RemoteAppParams } from '../types';

const RemoteAppWrapper = forwardRef(function (
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
    <div className={rootComponentClassName} style={style} ref={rootRef}>
      {loading}
    </div>
  );
});

/**
 * Base version without router data injection
 * Users must manually provide basename prop if needed
 */
export default RemoteAppWrapper;
