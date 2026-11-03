import React, { useContext, useMemo } from 'react';
import { BridgeSSRContext } from '../ssr';
import { collectSSRAssetDescriptors } from '../lazy/createLazyComponent';
import { DelayedLoading } from '../lazy/AwaitDataFetch';
import type { UseRemoteEnvironment } from '../reactRemote.shared';
function ServerLoading({
  loading,
  delayLoading,
}: {
  loading: React.ReactNode;
  delayLoading?: number;
}) {
  return <DelayedLoading delayLoading={delayLoading}>{loading}</DelayedLoading>;
}
export const useServerEnvironment: UseRemoteEnvironment = (
  getOptions,
  attempt,
  instance,
) => {
  const options = getOptions();
  const ssr = useContext(BridgeSSRContext);
  const reactId = React.useId?.();
  const instanceId = reactId ? `mf-bridge-${reactId}` : undefined;
  const reservation = useMemo(
    () => (!options.noSSR && instanceId ? ssr?.reserve(instanceId) : undefined),
    [ssr, instanceId, options.noSSR, attempt],
  );
  return useMemo(
    () => ({
      server: true,
      instanceId,
      ClientOnlyRemote: ServerLoading,
      skip: () => reservation?.skip(),
      fail: (error: unknown) => reservation?.fail(error),
      wait: <T,>(promise: Promise<T>) =>
        reservation ? reservation.wait(promise) : promise,
      async prepareBridge(id, loadProvider, match) {
        if (!reservation) return;
        const factory = await loadProvider();
        const provider = await factory();
        if (typeof provider?.renderStream !== 'function') {
          reservation.skip();
          return;
        }
        ssr?.registerStyles(
          instanceId!,
          collectSSRAssetDescriptors(
            { id, instance: instance!, injectLink: getOptions().injectLink },
            match?.remoteInfo && {
              ...match.remoteInfo,
              snapshot: match.remoteSnapshot,
              expose: match.expose,
            },
          ).stylesheetHrefs,
        );
        return provider;
      },
    }),
    [ssr, instanceId, reservation, instance, getOptions],
  );
};
