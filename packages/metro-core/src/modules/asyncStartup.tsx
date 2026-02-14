import type { Federation } from '@module-federation/runtime';
import React from 'react';

declare global {
  // @ts-ignore Intentional redeclaration for Metro/React Native runtime global.
  // eslint-disable-next-line no-var
  var __DEV__: boolean;
  // eslint-disable-next-line no-var
  var __METRO_GLOBAL_PREFIX__: string;
  // eslint-disable-next-line no-var
  var __FUSEBOX_HAS_FULL_CONSOLE_SUPPORT__: boolean;
  // eslint-disable-next-line no-var
  var __loadBundleAsync: (entry: string) => Promise<void>;
  // eslint-disable-next-line no-var
  var __FEDERATION__: Federation;
}

type LazyComponent = { default: React.ComponentType };

function getFallbackComponent(lazyFallbackFn?: () => LazyComponent) {
  if (!lazyFallbackFn) return () => null;
  const fallback = lazyFallbackFn();
  return fallback.default;
}

export function withAsyncStartup(
  lazyAppFn: () => LazyComponent,
  lazyFallbackFn?: () => LazyComponent,
): () => () => React.JSX.Element {
  const AppComponent = React.lazy(async () => {
    await globalThis.__FEDERATION__.__NATIVE__[__METRO_GLOBAL_PREFIX__].init;
    return lazyAppFn();
  });

  const FallbackComponent = getFallbackComponent(lazyFallbackFn);

  return () => () => {
    return (
      <React.Suspense fallback={<FallbackComponent />}>
        <AppComponent />
      </React.Suspense>
    );
  };
}
