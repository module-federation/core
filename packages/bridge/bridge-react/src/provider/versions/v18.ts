/**
 * Entry point for React 18 specific bridge components
 */
import React from 'react';
import { createRoot as createReactRoot, hydrateRoot } from 'react-dom/client';
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
}

export interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

export function createReact18Root(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  return createReactRoot(container, options);
}

export function hydrateReact18Root(
  container: Element | DocumentFragment,
  initialChildren: React.ReactNode,
  options?: CreateRootOptions,
) {
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
    () => {
      // Note: at this point `applyCreateBridge` has already re-run (if it re-ran at
      // all, which happens when the user's top-level exporter file is re-executed by
      // HMR) and `registerLatest` above wrote the new rootComponent. When the file
      // doesn't re-run (e.g. HMR only replaced a child dep and bubbled up without
      // re-executing this entry), the refreshAllBridges call still matters: any
      // user-supplied `rootComponentGetter` is re-invoked per render, so a getter
      // like `() => require('./App').default` will pick up child dep changes too.
      refreshAllBridges();
    },
    {
      acceptViaImportMetaHot: () => {
        // NOTE: Runtime-only access via the Function constructor — TypeScript's DTS pass
        // compiles with module=commonjs and would otherwise emit TS1343. At runtime the
        // final bundle is transformed by Vite/Rspack (module=esnext) where import.meta
        // genuinely exists. Strictly use property-only access to avoid Rspack's
        // "Critical dependency: Accessing import.meta directly is unsupported".
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
  return applyCreateBridge(bridgeInfo, createReact18Root);
}
