/**
 * Entry point for React 19 specific bridge components
 * This file provides support for React 19 version, using the new ReactDOM.createRoot API
 */
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBaseBridgeComponent } from './bridge-base';
import type { ProviderFnParams } from '../../types';
import {
  callerKeyFromStack,
  installHMRHooks,
  registerLatest,
  refreshAllBridges,
} from './hmr-runtime';

export interface CreateRootOptions {
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown, errorInfo: unknown) => void;
  transitionCallbacks?: unknown;
}

export interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

export function createReact19Root(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  return createRoot(container as Element, options);
}

export function hydrateReact19Root(
  container: Element | DocumentFragment,
  initialChildren: React.ReactNode,
  options?: CreateRootOptions,
): Root {
  return hydrateRoot(
    container as Element,
    initialChildren as React.ReactElement,
    options,
  );
}

function applyCreateBridge<T = any>(
  bridgeInfo: Omit<ProviderFnParams<T>, 'createRoot'>,
  createRootImpl: ProviderFnParams<T>['createRoot'],
) {
  const callerKey =
    bridgeInfo.__callerKey ||
    callerKeyFromStack('applyCreateBridge') ||
    Symbol('mf-bridge-anon');
  registerLatest(
    callerKey,
    bridgeInfo.rootComponent,
    bridgeInfo.rootComponentGetter as any,
  );

  installHMRHooks(
    () => refreshAllBridges(),
    {
      acceptViaImportMetaHot: () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
          const runtimeImportMeta: any = new Function('return import.meta')();
          const wph = runtimeImportMeta && runtimeImportMeta.webpackHot;
          if (wph && typeof wph.accept === 'function') {
            wph.accept(() => refreshAllBridges());
          }
        } catch {}
      },
    },
  );

  const fullBridgeInfo = {
    createRoot: createRootImpl,
    ...bridgeInfo,
    __callerKey: callerKey,
  } as unknown as ProviderFnParams<T>;

  return createBaseBridgeComponent(fullBridgeInfo);
}

export function createBridgeComponent<T = any>(
  bridgeInfo: Omit<ProviderFnParams<T>, 'createRoot'>,
) {
  return applyCreateBridge(bridgeInfo, createReact19Root);
}
