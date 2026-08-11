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
  BridgeSSRError,
  getMatchingBridgeSSRPayload,
  MF_BRIDGE_INSTANCE_ATTR,
  MF_BRIDGE_MODULE_ATTR,
  MF_BRIDGE_MOUNT_ATTR,
  MF_BRIDGE_SSR_ATTR,
  MF_BRIDGE_VERSION_ATTR,
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

const pendingBridgeDestroys: Array<() => void> = [];

function scheduleBridgeDestroy(destroy: () => void) {
  pendingBridgeDestroys.push(destroy);
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(flushBridgeDestroys);
  } else {
    void Promise.resolve().then(flushBridgeDestroys);
  }
}

function flushBridgeDestroys() {
  while (pendingBridgeDestroys.length > 0) {
    const destroy = pendingBridgeDestroys.shift();
    destroy?.();
  }
}

function clearBridgeSSRMountAttrs(dom: HTMLElement) {
  dom.removeAttribute(MF_BRIDGE_SSR_ATTR);
  dom.removeAttribute(MF_BRIDGE_MOUNT_ATTR);
  dom.removeAttribute(MF_BRIDGE_VERSION_ATTR);
  dom.removeAttribute(MF_BRIDGE_MODULE_ATTR);
  dom.removeAttribute(MF_BRIDGE_INSTANCE_ATTR);
}

function destroyProviderRoot(
  provider: { destroy?: (info: { dom: HTMLElement }) => void } | null,
  dom: HTMLElement | null,
  destroyInfo: Record<string, unknown>,
) {
  if (!provider?.destroy || !dom) return;
  try {
    federationRuntime.instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
      destroyInfo,
    );
    provider.destroy({ dom });
    federationRuntime.instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(
      destroyInfo,
    );
  } catch (error) {
    LoggerInstance.error('Bridge remote destroy failed', error);
  }
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
  if (reference && !registry) {
    throw new BridgeSSRError(
      'Bridge SSR references require BridgeHydrationProvider before hydrateRoot',
    );
  }
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
      snapshot: registry!.peek(reference!.moduleName, instanceId!),
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
    // StrictMode remounts schedule destroy on a microtask; flush first so the
    // new provider never createRoots on a DOM that still owns the prior root.
    flushBridgeDestroys();
    destroyedRef.current = false;
    lastRenderInputsRef.current = undefined;
    try {
      providerInfoRef.current = providerInfo();
      mountControllerRef.current = new AbortController();
      setProviderReady(true);
    } catch (error) {
      if (snapshot && instanceId)
        registry?.fail(reference?.moduleName || moduleName, instanceId);
      setRenderError(error);
    }

    return () => {
      const provider = providerInfoRef.current;
      const dom = renderDom.current;
      const releaseUnclaimedSnapshot =
        Boolean(snapshot && instanceId) &&
        consumedIdentityRef.current !== hydrationIdentity;
      mountControllerRef.current?.abort();
      providerInfoRef.current = null;
      mountControllerRef.current = null;
      // Drop unclaimed snapshots synchronously so a fast SPA remount cannot
      // peek the same identity. StrictMode remounts keep the peeked snapshot in
      // this instance's ref and can still hydrate after a lost registry claim.
      if (releaseUnclaimedSnapshot) {
        registry?.fail(reference?.moduleName || moduleName, instanceId!);
      }
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
        destroyProviderRoot(provider, dom, destroyInfo);
      });
    };
  }, [moduleName, providerInfo]);

  useEffect(() => {
    flushBridgeDestroys();
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

    const previousDom = renderDom.current;
    if (previousDom && previousDom !== dom) {
      // SSR slot <-> CSR mount transitions replace the ref target. Destroy the
      // previous provider root before rendering into the new DOM node.
      destroyProviderRoot(provider, previousDom, {
        moduleName,
        dom: previousDom,
        basename,
        memoryRoute,
        fallback,
        ...resProps,
      });
    }
    renderDom.current = dom;

    // Claim the registry snapshot before any await so a cancelled mount cannot
    // leave it peekable for a later SPA visit. This instance may still hydrate
    // from the peeked snapshot object after a StrictMode remount.
    let ssrState = serverPayload?.dehydratedState;
    if (snapshot && instanceId && registry) {
      if (consumedIdentityRef.current !== hydrationIdentity) {
        const claimed = registry.consume(
          reference?.moduleName || moduleName,
          instanceId,
        );
        if (Object.is(claimed, snapshot)) {
          consumedIdentityRef.current = hydrationIdentity;
          ssrState = snapshot.state;
        } else {
          // Another consumer already claimed this identity — force CSR.
          consumedIdentityRef.current = hydrationIdentity;
          ssrState = undefined;
          clearBridgeSSRMountAttrs(dom);
        }
      } else {
        ssrState = snapshot.state;
      }
    }

    const renderProps = {
      moduleName,
      dom,
      basename,
      memoryRoute,
      fallback,
      instanceId,
      ssrState,
      signal,
      ...resProps,
    };

    renderQueueRef.current = renderQueueRef.current
      .then(async () => {
        if (signal.aborted || !dom.isConnected) return;
        const beforeBridgeRenderRes = (await Promise.resolve(
          instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
            renderProps,
          ) || {},
        )) as { extraProps?: Record<string, unknown> };
        if (signal.aborted || !dom.isConnected) return;
        const currentRenderProps = {
          ...renderProps,
          ...beforeBridgeRenderRes.extraProps,
        };
        await provider.render(currentRenderProps);
        if (signal.aborted || !dom.isConnected) {
          if (!destroyedRef.current) {
            destroyedRef.current = true;
            provider.destroy?.({ dom });
          }
          return;
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(
          currentRenderProps,
        );
      })
      .catch((error) => {
        if (signal.aborted) return;
        if (
          snapshot &&
          instanceId &&
          consumedIdentityRef.current !== hydrationIdentity
        ) {
          registry?.fail(reference?.moduleName || moduleName, instanceId);
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
