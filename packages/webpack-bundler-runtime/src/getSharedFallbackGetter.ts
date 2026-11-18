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
  const versionMatches = version
    ? candidates.filter((item) => item[1] === version)
    : candidates;
  const fallbackItem =
    versionMatches.find((item) => {
      const itemScope = item[3]?.shareScope;
      return Array.isArray(scope) && Array.isArray(itemScope)
        ? scope.length === itemScope.length &&
            scope.every((value, index) => value === itemScope[index])
        : scope === itemScope;
    }) ??
    versionMatches.find((item) => item[3]) ??
    versionMatches[0];
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
