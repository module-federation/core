/** Shared lifecycle for isolated remote application roots. */
import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from 'react';
import type { BridgeOperationContext } from '@module-federation/bridge-shared';
import { getRootDomDefaultClassName } from '../utils';
import { federationRuntime } from '../provider/plugin';
import { BridgeSSRContext, getBridgeSSRRenderParams } from '../ssr';
import { collectSSRAssets } from '../lazy/createLazyComponent';
import { HydratedStylesheetAssets } from '../lazy/HydratedStylesheetAssets';
import type { BridgeSSRBrowserRuntime } from '../ssr';
import type {
  BridgeProvider,
  RemoteComponentProps,
  RemoteAppParams,
  RenderParams,
} from '../types';

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

export const RemoteAppWrapper = forwardRef<
  HTMLDivElement,
  RemoteAppParams & RemoteComponentProps
>(function (props, ref) {
  const {
    moduleName,
    ssrInstanceId,
    memoryRoute,
    basename,
    providerInfo,
    exportName: _exportName,
    className,
    style,
    fallback,
    loading,
    ...resProps
  } = props;
  const federation = federationRuntime.instance;
  const ssr = useContext(BridgeSSRContext);
  // React's version is fixed for this consumer. Legacy consumers keep the CSR path.
  const reactId = React.useId?.();
  const instanceId =
    ssrInstanceId || (reactId ? `mf-bridge-${reactId}` : undefined);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current!, []);
  const currentInstance = useRef<RemoteInstance | null>(null);
  const latestParams = useRef<RenderParams | null>(null);
  const [failure, setFailure] = useState<unknown>(null);
  const [serverHTML] = useState(() => {
    if (typeof document === 'undefined' || !instanceId) return null;
    if (!window.__MF_BRIDGE_SSR__?.get(instanceId)) return null;
    const container = document.getElementById(instanceId);
    return container ? { __html: container.innerHTML } : null;
  });

  if (ssr) {
    if (!instanceId) {
      throw new Error(
        'Independent Bridge SSR requires React 18 or newer in the host.',
      );
    }
    ssr.register(instanceId, providerInfo, getBridgeSSRRenderParams(props));
  }

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
      const runtime = instanceId ? window.__MF_BRIDGE_SSR__ : undefined;
      const session = instanceId ? runtime?.claim(instanceId, dom) : undefined;
      mounted.runtime = session ? runtime : undefined;
      mounted.queue = Promise.resolve()
        .then(async () => {
          if (session) {
            if (!mounted.provider.hydrate) {
              throw new Error(
                `Bridge provider ${moduleName} does not support hydration.`,
              );
            }
            const { snapshot, identifierPrefix } = await session.done;
            if (!mounted.active || mounted.disposed) return;
            await mounted.provider.hydrate({
              ...initialParams,
              snapshot,
              rootOptions: {
                ...initialParams.rootOptions,
                identifierPrefix,
                onRecoverableError(error) {
                  try {
                    initialParams.rootOptions?.onRecoverableError?.(error);
                  } finally {
                    if (mounted.active && !mounted.disposed) {
                      mounted.failed = true;
                      mounted.runtime?.fallback?.(error);
                    }
                  }
                },
              },
            });
            mounted.lastParams = initialParams;
          }
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
  const rootComponentClassName = `${getRootDomDefaultClassName(moduleName)} ${className || ''}`;
  const containerProps = {
    id: instanceId,
    'data-mf-bridge-root': instanceId,
    className: rootComponentClassName,
    style,
    ref: rootRef,
  };
  const stylesheetHrefs =
    (ssr || serverHTML) && federation && moduleName
      ? collectSSRAssets({
          id: moduleName,
          instance: federation,
          injectLink: true,
          injectScript: false,
        })
          .filter(
            (asset): asset is React.ReactElement<{ href: string }> =>
              React.isValidElement(asset) && asset.type === 'link',
          )
          .map((asset) => asset.props.href)
      : [];
  return (
    <>
      <HydratedStylesheetAssets hrefs={stylesheetHrefs} />
      {serverHTML ? (
        <div
          {...containerProps}
          suppressHydrationWarning
          dangerouslySetInnerHTML={serverHTML}
        />
      ) : (
        <div {...containerProps}>{loading}</div>
      )}
    </>
  );
});
