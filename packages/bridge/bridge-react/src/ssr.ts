import React from 'react';
import type { BridgeProviderInstance, BridgeSSRRenderParams } from './types';

export interface BridgeSSRReservation {
  readonly signal: AbortSignal;
  /** Bound preparation and its Suspense promise by the request deadline. */
  wait<T>(promise: Promise<T>): Promise<T>;
  activate(
    factory: () => BridgeProviderInstance | Promise<BridgeProviderInstance>,
    params: BridgeSSRRenderParams,
  ): void;
  /** Ordinary components and CSR-only providers do not own a Bridge session. */
  skip(): void;
  fail(error: unknown): void;
}

/** A fresh value belongs to exactly one Host SSR request. */
export interface BridgeSSRContextValue {
  reserve(instanceId: string): BridgeSSRReservation;
  registerStyles(instanceId: string, hrefs: string[]): void;
  register(
    instanceId: string,
    factory: () => BridgeProviderInstance | Promise<BridgeProviderInstance>,
    params: BridgeSSRRenderParams,
  ): void;
}

export const BridgeSSRContext =
  React.createContext<BridgeSSRContextValue | null>(null);

export interface BridgeSSRBrowserSnapshot {
  updates?: ReadableStream<unknown>;
  snapshot: unknown;
  identifierPrefix: string;
}

export interface BridgeSSRBrowserSession {
  ready?: Promise<BridgeSSRBrowserSnapshot>;
  done: Promise<BridgeSSRBrowserSnapshot>;
}

export interface BridgeSSRBrowserRuntime {
  expect(instanceId: string): void;
  get(instanceId: string): BridgeSSRBrowserSession | undefined;
  claim(
    instanceId: string,
    container: HTMLElement,
  ): BridgeSSRBrowserSession | undefined;
  release(instanceId: string, container: HTMLElement): void;
  fallback?(error?: unknown): void;
}

declare global {
  interface Window {
    __MF_BRIDGE_SSR__?: BridgeSSRBrowserRuntime;
  }
}

export type {
  BridgeProviderInstance,
  BridgeSSRRenderParams,
  BridgeSSRRequest,
  BridgeSSRResult,
  BridgeSSRMessage,
  BridgeSSRMessageResult,
  HydrateParams,
} from './types';
