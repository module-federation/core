import type { WebpackRequire } from './types';
// import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

// const buildTreeShakeSharePlugin: ({
//   webpackRequire,
// }: {
//   webpackRequire: WebpackRequire;
// }) => ModuleFederationRuntimePlugin = function ({
//   webpackRequire,
// }: {
//   webpackRequire: WebpackRequire;
// }) {
//     return {
//       name: 'build-tree-shake-plugin',
//       beforeInit(args) {
//         const { fallbackSharedAssets, usedExports, runtime, bundlerRuntime } =
//           webpackRequire.federation;

//         const { userOptions, origin } = args;
//         if (!userOptions.shared) {
//           return args;
//         }
//         Object.entries(userOptions.shared).forEach(([shareName, shareArgs]) => {
//           [...(Array.isArray(shareArgs) ? shareArgs : [shareArgs])].forEach(
//             (shareConfig) => {
//               const fallback = fallbackSharedAssets?.[shareName];
//               if (fallback) {
//                 shareConfig.fallback = async () => {
//                   const shareEntry = await runtime!.getRemoteEntry({
//                     origin,
//                     remoteInfo: {
//                       name: fallback[0],
//                       entry: `${webpackRequire.p}${fallback[1]}`,
//                       type: fallback[2],
//                       entryGlobalName: fallback[0],
//                       shareScope: 'default',
//                     },
//                   });

//                   // @ts-ignore
//                   await shareEntry.init(origin, bundlerRuntime);
//                   // @ts-ignore
//                   const getter = shareEntry.get();
//                   console.log('fallback: ', getter);
//                   return getter;
//                 };
//               }
//               const shareUsedExports = webpackRequire.j
//                 ? usedExports?.[shareName][webpackRequire.j]
//                 : undefined;
//               if (shareUsedExports) {
//                 shareConfig.usedExports = shareUsedExports;
//               }
//             },
//           );
//         });
//         return args;
//       },
//     };
//   };

export function init({ webpackRequire }: { webpackRequire: WebpackRequire }) {
  const { initOptions, runtime, sharedFallback, bundlerRuntime, libraryType } =
    webpackRequire.federation;

  if (!initOptions) {
    throw new Error('initOptions is required!');
  }
  const shared = initOptions.shared;
  if (!shared || !sharedFallback) {
    return runtime!.init(initOptions);
  }
  Object.keys(shared).forEach((sharedName) => {
    const sharedArgs = Array.isArray(shared[sharedName])
      ? shared[sharedName]
      : [shared[sharedName]];
    sharedArgs.forEach((sharedArg) => {
      if ('get' in sharedArg) {
        sharedArg.get = bundlerRuntime!.getSharedFallbackGetter({
          shareKey: sharedName,
          factory: sharedArg.get,
          webpackRequire,
          libraryType,
          version: sharedArg.version,
        });
      }
    });
  });
  return runtime!.init(initOptions);
}
