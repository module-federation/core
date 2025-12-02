import type { GetSharedFallbackGetterOptions } from './types';

export const getSharedFallbackGetter = ({
  shareKey,
  factory,
  version,
  webpackRequire,
  libraryType = 'global',
}: GetSharedFallbackGetterOptions) => {
  const { runtime, instance, bundlerRuntime, sharedFallback } =
    webpackRequire.federation!;
  if (!sharedFallback) {
    return factory;
  }
  // { react: [  [ react/19.0.0/index.js , 19.0.0, react_global_name, var ]  ] }
  const fallbackItems = sharedFallback[shareKey];
  if (!fallbackItems) {
    return factory;
  }
  const fallbackItem = version
    ? fallbackItems.find((item) => item[1] === version)
    : fallbackItems[0];
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
        return shareEntry
          .init(instance, bundlerRuntime)
          .then(() => shareEntry.get());
      });
};
