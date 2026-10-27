import type { GetSharedFallbackGetterOptions } from './types';

export const getSharedFallbackGetter = ({
  shareKey,
  factory,
  version,
  scope = 'default',
  layer,
  webpackRequire,
  libraryType = 'global',
}: GetSharedFallbackGetterOptions) => {
  const { runtime, bundlerRuntime, sharedFallback } =
    webpackRequire.federation!;
  if (!sharedFallback) {
    return factory;
  }
  const fallbackItems = sharedFallback[shareKey];
  if (!fallbackItems) {
    return factory;
  }
  const scopes = Array.isArray(scope) ? scope : [scope];
  const candidates = scopes.flatMap((shareScope) =>
    fallbackItems.filter((item) => {
      const identity = item[3];
      if (!identity) return true;
      const itemScopes = Array.isArray(identity.shareScope)
        ? identity.shareScope
        : [identity.shareScope];
      return (
        (identity.layer ?? undefined) === (layer ?? undefined) &&
        itemScopes.includes(shareScope)
      );
    }),
  );
  if (!candidates.length) return factory;
  const fallbackItem = version
    ? candidates.find((item) => item[1] === version)
    : candidates[0];
  if (!fallbackItem) {
    throw new Error(
      `No fallback item found for shareKey: ${shareKey} and version: ${version}`,
    );
  }
  return () =>
    runtime!
      .getRemoteEntry({
        origin: webpackRequire.federation.instance!,
        remoteInfo: {
          name: fallbackItem[2],
          entry: `${webpackRequire.p}${fallbackItem[0]}`,
          type: libraryType,
          entryGlobalName: fallbackItem[2],
          // current not used
          shareScope: 'default',
        },
      })
      // @ts-ignore
      .then((shareEntry) => {
        if (!shareEntry) {
          throw new Error(
            `Failed to load fallback entry for shareKey: ${shareKey} and version: ${version}`,
          );
        }
        return (
          shareEntry
            // @ts-ignore
            .init(webpackRequire.federation.instance!, bundlerRuntime)
            // @ts-ignore
            .then(() => shareEntry.get())
        );
      });
};
