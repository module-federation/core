import React, { useEffect, useMemo, useRef, useState } from 'react';
import { transformError, DelayedLoading } from '../lazy/AwaitDataFetch';
import type {
  RemoteResource,
  UseRemoteEnvironment,
} from '../reactRemote.shared';
const asError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error));
function ClientOnlyRemote<P extends object>({
  resource,
  loading,
  delayLoading,
  remoteProps,
}: {
  resource: RemoteResource<P>;
  loading: React.ReactNode;
  delayLoading?: number;
  remoteProps: P;
}) {
  const [state, setState] = useState<{
    resource: RemoteResource<P>;
    Component?: React.ComponentType<P>;
    error?: Error;
  }>();
  const pending = useRef<{
    resource: RemoteResource<P>;
    promise: Promise<React.ComponentType<P>>;
  }>();
  useEffect(() => {
    let active = true;
    // Start work in the first effect, without waiting for a gate render or
    // mounting the legacy consumer's second client-loading effect.
    if (pending.current?.resource !== resource) {
      pending.current = {
        resource,
        promise: resource
          .prepare()
          .then((result) =>
            result.loadClient ? result.loadClient() : result.Component,
          ),
      };
    }
    const commit = (next: NonNullable<typeof state>) => {
      if (!active) return;
      // This effect belongs to the placeholder inside Suspense, so that
      // boundary has hydrated before preparation starts. No gate transition is
      // needed, and ready content can commit at the usual update priority.
      setState(next);
    };
    pending.current.promise.then(
      (Component) => commit({ resource, Component }),
      (error) =>
        commit({ resource, error: transformError(asError(error)).error }),
    );
    return () => {
      active = false;
    };
  }, [resource]);
  if (state?.resource !== resource)
    return (
      <DelayedLoading delayLoading={delayLoading}>{loading}</DelayedLoading>
    );
  if (state.error) throw state.error;
  const Component = state.Component!;
  return <Component {...remoteProps} />;
}

// Select once per React runtime, never from props or SSR context. React 16/17
// retain CSR without invoking a hook they do not provide. Modern SSR hydration
// requires useId; a broken modern runtime must fail instead of losing identity.
const useInstanceId =
  Number.parseInt(React.version, 10) >= 18
    ? function useModernInstanceId() {
        return `mf-bridge-${React.useId()}`;
      }
    : function useLegacyInstanceId() {
        return undefined;
      };

export const useBrowserEnvironment: UseRemoteEnvironment = (
  getOptions,
  attempt,
) => {
  const options = getOptions();
  const instanceId = useInstanceId();
  const [serverBridge] = useState(() => {
    if (typeof document === 'undefined' || !instanceId) return;
    const container = document.getElementById(instanceId);
    const moduleName = container?.getAttribute('data-mf-bridge');
    if (moduleName && container?.hasAttribute('data-mf-bridge-ssr'))
      return { moduleName, remote: options.remote };
  });
  return useMemo(
    () => ({
      target: 'browser' as const,
      instanceId,
      serverBridge,
      ClientOnlyRemote,
    }),
    [instanceId, serverBridge, attempt],
  );
};
