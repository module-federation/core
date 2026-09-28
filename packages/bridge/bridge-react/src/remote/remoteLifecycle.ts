import { useEffect, useRef, useState } from 'react';
import type { BridgeOperationContext } from '@module-federation/bridge-shared';
import { federationRuntime } from '../provider/plugin';
import type { BridgeSSRBrowserRuntime } from '../ssr';
import type { BridgeProvider, RemoteAppParams, RenderParams } from '../types';
import {
  claimRemoteHydration,
  hasRemoteSSRSession,
  hydrateRemoteRoot,
  readRemoteSSRHTML,
} from './hydration';
import { collectRemoteStylesheetHrefs } from './stylesheetAssets';
import type {
  UseRemoteLifecycle,
  UseRemoteSSRRegistration,
} from './lifecycleTypes';

interface RemoteInstance {
  provider: BridgeProvider;
  factory: RemoteAppParams['providerInfo'];
  dom: HTMLElement;
  active: boolean;
  disposed: boolean;
  failed: boolean;
  controller: AbortController;
  queue: Promise<void>;
  lastParams?: RenderParams;
  runtime?: BridgeSSRBrowserRuntime;
}

function sameParams(previous: RenderParams | undefined, next: RenderParams) {
  if (!previous) return false;
  const keys = Object.keys(previous);
  return (
    keys.length === Object.keys(next).length &&
    keys.every((key) => Object.is(previous[key], next[key]))
  );
}

/** Ordinary CSR does not register server rendering tasks. */
export const useRemoteSSRRegistration: UseRemoteSSRRegistration = () => {};

/** Default browser entry; effects also make it safe to render a shell on Node. */
export const useRemoteLifecycle: UseRemoteLifecycle = (
  props,
  instanceId,
  rootRef,
) => {
  const {
    moduleName,
    ssrInstanceId: _ssrInstanceId,
    memoryRoute,
    basename,
    providerInfo,
    exportName: _exportName,
    className: _className,
    style: _style,
    fallback,
    loading: _loading,
    ...resProps
  } = props;
  const federation = federationRuntime.instance;
  const currentInstance = useRef<RemoteInstance | null>(null);
  const latestParams = useRef<RenderParams | null>(null);
  const [failure, setFailure] = useState<unknown>(null);
  const [serverHTML] = useState(() => readRemoteSSRHTML(instanceId));

  latestParams.current = {
    moduleName,
    dom: rootRef.current!,
    basename,
    memoryRoute,
    fallback,
    ...resProps,
  };

  useEffect(() => {
    const dom = rootRef.current;
    if (!dom) return;
    let record = currentInstance.current;
    if (
      !record ||
      record.disposed ||
      record.factory !== providerInfo ||
      record.dom !== dom
    ) {
      record = {
        provider: providerInfo(),
        factory: providerInfo,
        dom,
        active: true,
        disposed: false,
        failed: false,
        controller: new AbortController(),
        queue: Promise.resolve(),
      };
      currentInstance.current = record;
      const mounted = record;
      const initialParams = {
        ...latestParams.current!,
        dom,
        signal: mounted.controller.signal,
      };
      const hydration = claimRemoteHydration(instanceId, dom);
      mounted.runtime = hydration?.runtime;
      mounted.queue = Promise.resolve()
        .then(async () => {
          if (!hydration) return;
          const hydrated = await hydrateRemoteRoot(
            mounted.provider,
            hydration.session,
            initialParams,
            () => mounted.active && !mounted.disposed,
            (error) => {
              if (mounted.active && !mounted.disposed) {
                mounted.failed = true;
                mounted.runtime?.fallback?.(error);
              }
            },
          );
          if (hydrated) mounted.lastParams = initialParams;
        })
        .catch((error: unknown) => {
          mounted.failed = true;
          if (mounted.active && !mounted.disposed) {
            mounted.runtime?.fallback?.(error);
            setFailure(error);
          }
        });
    }
    record.active = true;
    const mounted = record;
    return () => {
      mounted.active = false;
      // StrictMode immediately replays effects against the same DOM and root.
      queueMicrotask(() => {
        if (mounted.active || mounted.disposed) return;
        mounted.disposed = true;
        mounted.controller.abort();
        if (instanceId) mounted.runtime?.release(instanceId, dom);
        const destroyInfo = { moduleName, dom };
        const operationContext: BridgeOperationContext = {
          side: 'consumer',
          framework: 'react',
          operation: 'destroy',
          reason: 'unmount',
        };
        federation?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
          destroyInfo,
          operationContext,
        );
        mounted.provider.destroy(destroyInfo);
        federation?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(
          destroyInfo,
          { context: operationContext },
        );
        if (currentInstance.current === mounted) currentInstance.current = null;
      });
    };
  }, [moduleName, providerInfo, instanceId]);

  useEffect(() => {
    const record = currentInstance.current;
    if (!record) return;
    record.queue = record.queue
      .then(async () => {
        if (!record.active || record.disposed || record.failed) return;
        const renderParams = {
          ...latestParams.current!,
          dom: record.dom,
          signal: record.controller.signal,
        };
        if (sameParams(record.lastParams, renderParams)) return;
        const operationContext: BridgeOperationContext = {
          side: 'consumer',
          framework: 'react',
          operation: record.lastParams ? 'update' : 'render',
        };
        const beforeResult =
          federation?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
            renderParams,
            operationContext,
          ) || {};
        await record.provider.render({
          ...renderParams,
          ...(beforeResult as any).extraProps,
        });
        record.lastParams = renderParams;
        federation?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(
          renderParams,
          { context: operationContext },
        );
      })
      .catch((error: unknown) => {
        record.failed = true;
        if (record.active && !record.disposed) setFailure(error);
      });
  }, [providerInfo, moduleName, ...Object.values(props)]);

  if (failure) throw failure;
  const stylesheetHrefs = serverHTML
    ? collectRemoteStylesheetHrefs(moduleName)
    : [];
  return {
    serverHTML,
    stylesheetHrefs: hasRemoteSSRSession(instanceId) ? [] : stylesheetHrefs,
  };
};
