// import type { Plugin, RuntimeContext } from '@modern-js/runtime';
// import {} from '@mod'
// // eslint-disable-next-line max-lines-per-function
// export const mfPluginSSR = ({
//   routerConfig,
//   serverBase,
//   entryName,
//   localIpV4,
// }: {
//   entryName: string;
//   localIpV4: string;
//   routerConfig: {
//     routes: any[];
//   };
//   serverBase: string[];
// }): Plugin => ({
//   name: '@module-federation/modern-js',

//   // eslint-disable-next-line max-lines-per-function
//   setup: () => ({
//     // eslint-disable-next-line max-lines-per-function
//     async init({ context }, next) {
//       if (typeof window !== 'undefined') {
//         console.error('revalidate should only be called server-side');
//         return Promise.resolve(false);
//       }
//       return import('@module-federation/node/utils').then((utils) => {
//         return utils.revalidate(fetchModule, force);
//       });
//     },
//   }),
// });
