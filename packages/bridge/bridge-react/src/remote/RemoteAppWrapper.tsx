/** Shared Bridge lifecycle used by legacy and unified consumers. */
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import type { ModuleFederation } from '@module-federation/enhanced/runtime';
import type { BridgeOperationContext } from '@module-federation/bridge-shared';
import { getRootDomDefaultClassName } from '../utils';
import { federationRuntime } from '../provider/plugin';
import { BRIDGE_ROUTING, type BridgeRouting } from '../provider/routing';
import type { ErrorFallbackProps, RenderParams } from '../types';

type Provider = {
  render: (info: RenderParams) => unknown;
  destroy: (info: { dom: HTMLElement; moduleName: string }) => unknown;
};
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
    let destroyed = false;
    const getRenderInfo = () => {
      const { remoteProps, routing, fallback } = latest.current;
      const info: RenderParams = {
        ...remoteProps,
        moduleName,
        dom: element,
      };
      if (fallback) info.fallback = fallback;
      // Keep the legacy flat mount fields for existing provider artifacts.
      if (routing?.basename !== undefined) info.basename = routing.basename;
      if (routing?.memoryRoute !== undefined)
        info.memoryRoute = routing.memoryRoute;
      if (routing?.navigation !== undefined) info[BRIDGE_ROUTING] = routing;
      return info;
    };
    const owner = {
      active: true,
      canRender: false,
      provider: undefined as Provider | undefined,
      queue: Promise.resolve() as Promise<unknown>,
      update: () => {
        owner.queue = owner.queue
          .then(async () => {
            if (!owner.active || !owner.canRender || !owner.provider) return;
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
        if (!owner.active) await destroy();
        else setPrepared(owner);
      })
      .catch((failure) => {
        if (owner.active) setError(asError(failure));
      });
    return () => {
      owner.active = false;
      void owner.queue.then(destroy).catch((failure) => console.error(failure));
    };
  }, [moduleName, providerInfo, loadProvider, instance]);

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
    <div
      ref={(element) => {
        dom.current = element;
        if (typeof ref === 'function') ref(element);
        else if (ref) ref.current = element;
      }}
      data-mf-bridge={moduleName}
      className={`${getRootDomDefaultClassName(moduleName)} ${className || ''}`}
      style={style}
    >
      {prepared?.active ? null : loading}
    </div>
  );
});
