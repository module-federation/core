import React from 'react';
import type { BridgeProvider, BridgeSSRRenderParams } from './types';

/** A fresh value must be provided for every host SSR request. */
export interface BridgeSSRContextValue {
  register(
    instanceId: string,
    providerFactory: () => BridgeProvider | Promise<BridgeProvider>,
    params: BridgeSSRRenderParams,
    options?: { deferRender?: boolean },
  ): void;
}

export const BridgeSSRContext =
  React.createContext<BridgeSSRContextValue | null>(null);

export interface BridgeSSRBrowserSnapshot {
  snapshot: unknown;
  identifierPrefix: string;
}

export interface BridgeSSRBrowserSession {
  identifierPrefix?: string;
  done: Promise<BridgeSSRBrowserSnapshot>;
}

/** Implemented by the framework's early, React-free streaming bootstrap. */
export interface BridgeSSRBrowserRuntime {
  get(instanceId: string): BridgeSSRBrowserSession | undefined;
  claim(
    instanceId: string,
    container: HTMLElement,
  ): BridgeSSRBrowserSession | undefined;
  release(instanceId: string, container: HTMLElement): void;
  /** Retry this document in CSR mode after a terminal SSR/hydration failure. */
  fallback?(error?: unknown): void;
}

declare global {
  interface Window {
    __MF_BRIDGE_SSR__?: BridgeSSRBrowserRuntime;
  }
}

export type {
  BridgeProvider,
  BridgeSSRRenderParams,
  BridgeSSRRequest,
  BridgeSSRResult,
  HydrateParams,
} from './types';

/** Consumer-only UI/lifecycle values must not cross the server application boundary. */
export function getBridgeSSRRenderParams(
  input: Record<string, unknown>,
): BridgeSSRRenderParams {
  const {
    moduleName,
    basename,
    memoryRoute,
    providerInfo: _providerInfo,
    exportName: _exportName,
    fallback: _fallback,
    loading: _loading,
    className: _className,
    style: _style,
    ssrInstanceId: _instanceId,
    rootOptions: _rootOptions,
    signal: _signal,
    ...props
  } = input;
  const data = JSON.parse(
    JSON.stringify(props, (_key, value) =>
      React.isValidElement(value) || typeof value === 'function'
        ? undefined
        : value,
    ),
  );
  return {
    moduleName: moduleName as string | undefined,
    basename: basename as string | undefined,
    memoryRoute: memoryRoute as BridgeSSRRenderParams['memoryRoute'],
    props: data,
  };
}
