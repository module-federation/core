/** Shared Bridge lifecycle used by legacy and unified consumers. */
import type { receiveBridgeService } from '../service/browser';
import type { BrowserServiceRequest } from '../service/config';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import type { ModuleFederation } from '@module-federation/enhanced/runtime';
import type { BridgeOperationContext } from '@module-federation/bridge-shared';
import { getRootDomDefaultClassName } from '../utils';
import { federationRuntime } from '../provider/plugin';
import { BRIDGE_ROUTING, type BridgeRouting } from '../provider/routing';
import type {
  BridgeProviderInstance,
  ErrorFallbackProps,
  RenderParams,
} from '../types';
import {
  claimRemoteHydration,
  hydrateRemoteRoot,
  readRemoteSSRHTML,
} from './hydration';

type Provider = BridgeProviderInstance;
type ProviderFactory = () => Provider | Promise<Provider>;

export interface RemoteAppWrapperProps {
  moduleName: string;
  providerInfo?: ProviderFactory;
  loadProvider?: () => Promise<ProviderFactory>;
  instance?: ModuleFederation | null;
  remoteProps: Record<string, unknown>;
  routing?: BridgeRouting;
  loading?: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  className?: string;
  style?: React.CSSProperties;
  /** Stable Host React id shared by server composition and browser hydration. */
  ssrInstanceId?: string;
  /** Request-local producer instance, only present during server rendering. */
  ssrProvider?: BridgeProviderInstance;
  service?: BrowserServiceRequest;
}

const asError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error));

export const RemoteAppWrapper = forwardRef<
  HTMLDivElement,
  RemoteAppWrapperProps
>(function RemoteAppWrapper(props, ref) {
  const { moduleName, providerInfo, loadProvider, className, style, loading } =
    props;
  const instance = props.instance || federationRuntime.instance;
  const instanceId = props.ssrInstanceId;
  const [serverHTML] = useState(() => readRemoteSSRHTML(instanceId));
  const dom = useRef<HTMLDivElement | null>(null);
  const latest = useRef(props);
  latest.current = props;
  type Owner = {
    active: boolean;
    canRender: boolean;
    provider?: Provider;
    update: () => void;
  };
  const ownerRef = useRef<Owner>();
  const [prepared, setPrepared] = useState<Owner>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const element = dom.current!;
    const controller = new AbortController();
    let hydration: ReturnType<typeof claimRemoteHydration>;
    let service: ReturnType<typeof receiveBridgeService> | undefined;
    let renderedProps: RemoteAppWrapperProps | undefined;
    const initialProps = latest.current;
    let destroyed = false;
    const getRenderInfo = () => {
      const { remoteProps, routing, fallback } = latest.current;
      const info: RenderParams = {
        ...remoteProps,
        moduleName,
        dom: element,
        signal: controller.signal,
      };
      if (fallback) info.fallback = fallback;
      // Keep the legacy flat mount fields for existing provider artifacts.
      if (routing?.basename !== undefined) info.basename = routing.basename;
      if (routing?.memoryRoute !== undefined)
        info.memoryRoute = routing.memoryRoute;
      if (routing?.navigation !== undefined) info[BRIDGE_ROUTING] = routing;
      return info;
    };
    const initialParams = getRenderInfo();
    const owner = {
      active: true,
      canRender: false,
      provider: undefined as Provider | undefined,
      queue: Promise.resolve() as Promise<unknown>,
      update: () => {
        owner.queue = owner.queue
          .then(async () => {
            if (!owner.active || !owner.canRender || !owner.provider) return;
            const current = latest.current;
            if (
              renderedProps?.remoteProps === current.remoteProps &&
              renderedProps?.routing === current.routing &&
              renderedProps?.fallback === current.fallback
            )
              return;
            const info = getRenderInfo();
            const context: BridgeOperationContext = {
              side: 'consumer',
              framework: 'react',
              operation: 'render',
            };
            const extra =
              instance?.bridgeHook?.lifecycle.beforeBridgeRender.emit(
                info,
                context,
              );
            await owner.provider.render({
              ...info,
              ...(extra as any)?.extraProps,
            });
            renderedProps = current;
            instance?.bridgeHook?.lifecycle.afterBridgeRender.emit(info, {
              context,
            });
          })
          .catch((failure) => {
            if (owner.active) setError(asError(failure));
          });
      },
    };
    ownerRef.current = owner;
    const destroy = async () => {
      if (destroyed || !owner.provider) return;
      destroyed = true;
      const info = getRenderInfo();
      const context: BridgeOperationContext = {
        side: 'consumer',
        framework: 'react',
        operation: 'destroy',
        reason: 'unmount',
      };
      instance?.bridgeHook?.lifecycle.beforeBridgeDestroy.emit(info, context);
      await owner.provider.destroy({ moduleName, dom: element });
      instance?.bridgeHook?.lifecycle.afterBridgeDestroy.emit(info, {
        context,
      });
    };
    // Defer provider creation so StrictMode replay cannot create an orphan Root.
    owner.queue = Promise.resolve()
      .then(async () => {
        if (!owner.active) return;
        hydration = claimRemoteHydration(instanceId, element);
        if (!hydration && initialProps.service) {
          if (!instanceId)
            throw Error('Service hydration requires React 18 or newer.');
          const { receiveBridgeService } = await import('../service/browser');
          if (!owner.active) return;
          service = receiveBridgeService(
            element,
            instanceId,
            {
              moduleName,
              url: new URL(
                initialProps.routing?.navigation?.getLocation() ||
                  location.href,
                location.href,
              ).href,
              basename: initialProps.routing?.basename,
              memoryRoute: initialProps.routing?.memoryRoute,
              props: initialProps.remoteProps,
              signal: controller.signal,
            },
            initialProps.service,
          );
          hydration = service;
          void service.done.catch((failure) => {
            if (owner.active) setError(asError(failure));
          });
        }
        const factory = loadProvider ? await loadProvider() : providerInfo;
        if (!owner.active) return;
        const provider = await factory?.();
        if (
          !provider ||
          typeof provider.render !== 'function' ||
          typeof provider.destroy !== 'function'
        )
          throw new Error(
            `Bridge '${moduleName}' must provide render and destroy methods.`,
          );
        owner.provider = provider;
        if (!owner.active) {
          await destroy();
          return;
        }
        if (hydration) {
          const claimed = hydration;
          await hydrateRemoteRoot(
            provider,
            claimed.session,
            initialParams,
            () => owner.active,
            (failure) => claimed.runtime.fallback?.(failure),
          );
          renderedProps = initialProps;
        }
        if (owner.active) setPrepared(owner);
      })
      .catch((failure) => {
        if (owner.active) {
          hydration?.runtime.fallback?.(failure);
          setError(asError(failure));
        }
      });
    return () => {
      owner.active = false;
      // Producer abort listeners may synchronously cancel hydration readers.
      // Mark transport cancellation first so that cleanup cannot trigger recovery.
      service?.release();
      if (!service && instanceId)
        hydration?.runtime.release(instanceId, element);
      controller.abort();
      void owner.queue.then(destroy).catch((failure) => console.error(failure));
    };
  }, [moduleName, providerInfo, loadProvider, instance, instanceId]);

  // This effect runs after React commits children=null on the mount container.
  // Only then may the producer Root own its children.
  useEffect(() => {
    if (!prepared?.active) return;
    prepared.canRender = true;
    prepared.update();
  }, [prepared]);

  useEffect(() => {
    if (ownerRef.current?.canRender) ownerRef.current.update();
  }, [props.remoteProps, props.routing, props.fallback]);

  if (error) throw error;
  return (
    <>
      {props.service && !prepared?.active && !serverHTML ? loading : null}
      <div
        ref={(element) => {
          dom.current = element;
          if (typeof ref === 'function') ref(element);
          else if (ref) ref.current = element;
        }}
        data-mf-bridge={moduleName}
        id={instanceId}
        data-mf-bridge-root={instanceId}
        data-mf-bridge-ssr={serverHTML ? '' : undefined}
        className={`${getRootDomDefaultClassName(moduleName)} ${className || ''}`}
        style={style}
        suppressHydrationWarning={Boolean(serverHTML)}
        {...(serverHTML
          ? { dangerouslySetInnerHTML: serverHTML }
          : { children: props.service || prepared?.active ? null : loading })}
      />
    </>
  );
});
