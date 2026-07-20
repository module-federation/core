import React from 'react';
import {
  BRIDGE_SSR_PROTOCOL_VERSION,
  MF_BRIDGE_STATE_ATTR,
  getBridgeSSRContainerAttrs,
  getBridgeSSRSlotAttrs,
  serializeBridgeSSRStateEnvelope,
  type BridgeHydrationRegistry,
  type BridgeHydrationSnapshot,
  type BridgeSSRResult,
} from '@module-federation/bridge-shared';
import { getRootDomDefaultClassName } from './utils';

const BridgeHydrationContext = React.createContext<
  BridgeHydrationRegistry | undefined
>(undefined);

export function BridgeHydrationProvider({
  registry,
  children,
}: {
  registry: BridgeHydrationRegistry;
  children: React.ReactNode;
}) {
  return (
    <BridgeHydrationContext.Provider value={registry}>
      {children}
    </BridgeHydrationContext.Provider>
  );
}

export function useBridgeHydrationRegistry() {
  return React.useContext(BridgeHydrationContext);
}

export function BridgeRemoteSlot({
  moduleName,
  instanceId,
  payload,
  snapshot,
  className,
  style,
  mountRef,
}: {
  moduleName: string;
  instanceId: string;
  payload?: BridgeSSRResult;
  snapshot?: BridgeHydrationSnapshot;
  className?: string;
  style?: React.CSSProperties;
  mountRef?: React.Ref<HTMLDivElement>;
}) {
  const html = payload?.html ?? snapshot?.html ?? '';
  const state = payload?.dehydratedState ?? snapshot?.state;
  const rootClassName =
    `${getRootDomDefaultClassName(moduleName)} ${className || ''}`.trim();

  return (
    <div {...getBridgeSSRSlotAttrs({ moduleName, instanceId })}>
      <div
        className={rootClassName}
        style={style}
        ref={mountRef}
        {...getBridgeSSRContainerAttrs({ moduleName, instanceId })}
        dangerouslySetInnerHTML={{ __html: html }}
        suppressHydrationWarning
      />
      <script
        type="application/json"
        {...{ [MF_BRIDGE_STATE_ATTR]: 'true' }}
        dangerouslySetInnerHTML={{
          __html: serializeBridgeSSRStateEnvelope({
            protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
            moduleName,
            instanceId,
            ...(state === undefined ? {} : { state }),
          }),
        }}
        suppressHydrationWarning
      />
    </div>
  );
}
