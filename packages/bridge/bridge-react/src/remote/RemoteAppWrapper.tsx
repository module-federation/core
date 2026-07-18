/**
 * Shared RemoteAppWrapper component used by both base and router versions
 * This component handles the lifecycle of remote Module Federation apps
 */
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
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

function areRenderInputsEqual(
  previous: readonly unknown[] | undefined,
  next: readonly unknown[],
) {
  return (
    previous?.length === next.length &&
    next.every((value, index) => Object.is(value, previous[index]))
  );
}

function scheduleBridgeDestroy(destroy: () => void) {
  if (typeof queueMicrotask === 'function') queueMicrotask(destroy);
  else void Promise.resolve().then(destroy);
}

export const RemoteAppWrapper = forwardRef<HTMLDivElement, any>(function (
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
  const hydrationSnapshotRef = useRef<{
    identity: string;
    snapshot: ReturnType<NonNullable<typeof registry>['peek']>;
  }>();
  const hydrationIdentity =
    reference && instanceId ? `${reference.moduleName}\0${instanceId}` : '';
  if (
    hydrationIdentity &&
    hydrationSnapshotRef.current?.identity !== hydrationIdentity
  ) {
    hydrationSnapshotRef.current = {
      identity: hydrationIdentity,
      snapshot: registry?.peek(reference!.moduleName, instanceId!),
    };
  }
  const snapshot = hydrationIdentity
    ? hydrationSnapshotRef.current?.snapshot
    : undefined;
  const hasSSRPayload = Boolean((serverPayload || snapshot) && instanceId);

  const instance = federationRuntime.instance;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const renderDom = useRef<HTMLElement | null>(null);
  const providerInfoRef = useRef<ReturnType<typeof providerInfo> | null>(null);
  const mountControllerRef = useRef<AbortController | null>(null);
  const renderQueueRef = useRef<Promise<void>>(Promise.resolve());
  const lastRenderInputsRef = useRef<readonly unknown[]>();
  const consumedIdentityRef = useRef('');
  const destroyedRef = useRef(false);
  const [providerReady, setProviderReady] = useState(false);
  const [renderError, setRenderError] = useState<unknown>();

  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);
  if (renderError) throw renderError;

  LoggerInstance.debug(`RemoteAppWrapper instance from props >>>`, instance);

  useEffect(() => {
    destroyedRef.current = false;
    lastRenderInputsRef.current = undefined;
    try {
      providerInfoRef.current = providerInfo();
      mountControllerRef.current = new AbortController();
      setProviderReady(true);
    } catch (error) {
      if (snapshot && instanceId) registry?.fail(moduleName, instanceId);
      setRenderError(error);
    }

    return () => {
      const provider = providerInfoRef.current;
      const dom = renderDom.current;
      mountControllerRef.current?.abort();
      providerInfoRef.current = null;
      mountControllerRef.current = null;
      if (!provider?.destroy || !dom || destroyedRef.current) return;
      destroyedRef.current = true;
      const destroyInfo = {
        moduleName,
        dom,
        basename,
        memoryRoute,
        fallback,
        ...resProps,
      };
      scheduleBridgeDestroy(() => {
        try {
          instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
            destroyInfo,
          );
          provider.destroy({ dom });
          instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(
            destroyInfo,
          );
        } catch (error) {
          LoggerInstance.error('Bridge remote destroy failed', error);
        }
      });
    };
  }, [moduleName, providerInfo]);

  useEffect(() => {
    const provider = providerInfoRef.current;
    const dom = rootRef.current;
    const signal = mountControllerRef.current?.signal;
    if (!providerReady || !provider || !dom || !signal || signal.aborted)
      return;

    const applicationPropEntries = Object.entries(resProps).sort(
      ([left], [right]) => left.localeCompare(right),
    );
    const renderInputs = [
      providerInfo,
      moduleName,
      basename,
      memoryRoute,
      fallback,
      instanceId,
      serverPayload?.dehydratedState,
      snapshot?.state,
      ...applicationPropEntries.flat(),
    ];
    if (areRenderInputsEqual(lastRenderInputsRef.current, renderInputs)) return;
    lastRenderInputsRef.current = renderInputs;

    const renderProps = {
      moduleName,
      dom,
      basename,
      memoryRoute,
      fallback,
      instanceId,
      ssrState: serverPayload?.dehydratedState ?? snapshot?.state,
      signal,
      ...resProps,
    };
    renderDom.current = dom;

    renderQueueRef.current = renderQueueRef.current
      .then(async () => {
        if (signal.aborted || !dom.isConnected) return;
        const beforeBridgeRenderRes = (await Promise.resolve(
          instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
            renderProps,
          ) || {},
        )) as { extraProps?: Record<string, unknown> };
        const currentRenderProps = {
          ...renderProps,
          ...beforeBridgeRenderRes.extraProps,
        };
        await provider.render(currentRenderProps);
        if (signal.aborted || !dom.isConnected) return;
        if (
          snapshot &&
          instanceId &&
          consumedIdentityRef.current !== hydrationIdentity
        ) {
          registry?.consume(moduleName, instanceId);
          consumedIdentityRef.current = hydrationIdentity;
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(
          currentRenderProps,
        );
      })
      .catch((error) => {
        if (signal.aborted) return;
        if (snapshot && instanceId) {
          registry?.fail(moduleName, instanceId);
        }
        setRenderError(error);
      });
  });

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
