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
  const instanceId = `mf-bridge-${React.useId()}`;
  const session = useMemo(
    () =>
      !options.noSSR && ssr
        ? { context: ssr, reservation: ssr.reserve(instanceId) }
        : undefined,
    [ssr, instanceId, options.noSSR, attempt],
  );
  return useMemo(
    () => ({
      target: 'server' as const,
      instanceId,
      ClientOnlyRemote: ServerLoading,
      skip: () => session?.reservation.skip(),
      fail: (error: unknown) => session?.reservation.fail(error),
      wait: <T,>(promise: Promise<T>) =>
        session ? session.reservation.wait(promise) : promise,
      async prepareBridge(id, loadProvider, match) {
        if (!session) return;
        if (!instance)
          throw new Error('An initialized MF runtime instance is required.');
        const factory = await session.reservation.wait(loadProvider());
        const provider = await factory();
        if (typeof provider?.renderStream !== 'function') {
          session.reservation.skip();
          return;
        }
        session.context.registerStyles(
          instanceId,
          collectSSRAssetDescriptors(
            { id, instance, injectLink: getOptions().injectLink },
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
    [instanceId, session, instance, getOptions],
  );
};
