// import bundler_runtime_base from './index';
// import type { UserOptions } from '@module-federation/runtime/types';

// interface ExtendedOptions extends UserOptions {
//   exposes: { [key: string]: () => Promise<() => any> };
// }

// export const createContainer = (federationOptions: ExtendedOptions) => {
//   const { exposes, name, remotes = [], shared, plugins } = federationOptions;

//   const __webpack_modules__ = {
//     './node_modules/.federation/entry.1f2288102e035e2ed66b2efaf60ad043.js': (
//       //@ts-ignore
//       module,
//       //@ts-ignore
//       __webpack_exports__,
//       //@ts-ignore
//       __webpack_require__,
//     ) => {
//       __webpack_require__.r(__webpack_exports__);
//       const bundler_runtime = __webpack_require__.n(bundler_runtime_base);
//       const prevFederation = __webpack_require__.federation;
//       __webpack_require__.federation = {};
//       for (const key in bundler_runtime()) {
//         __webpack_require__.federation[key] = bundler_runtime()[key];
//       }
//       for (const key in prevFederation) {
//         __webpack_require__.federation[key] = prevFederation[key];
//       }
//       if (!__webpack_require__.federation.instance) {
//         const pluginsToAdd = plugins || [];
//         __webpack_require__.federation.initOptions.plugins = __webpack_require__
//           .federation.initOptions.plugins
//           ? __webpack_require__.federation.initOptions.plugins.concat(
//               pluginsToAdd,
//             )
//           : pluginsToAdd;
//         __webpack_require__.federation.instance =
//           __webpack_require__.federation.runtime.init(
//             __webpack_require__.federation.initOptions,
//           );
//         if (__webpack_require__.federation.attachShareScopeMap) {
//           __webpack_require__.federation.attachShareScopeMap(
//             __webpack_require__,
//           );
//         }
//         if (__webpack_require__.federation.installInitialConsumes) {
//           __webpack_require__.federation.installInitialConsumes();
//         }
//       }
//     },
//     //@ts-ignore
//     'webpack/container/entry/createContainer': (
//       //@ts-ignore

//       module,
//       //@ts-ignore
//       exports,
//       //@ts-ignore
//       __webpack_require__,
//     ) => {
//       const moduleMap = {};
//       for (const key in exposes) {
//         if (Object.prototype.hasOwnProperty.call(exposes, key)) {
//           //@ts-ignore
//           moduleMap[key] = () =>
//             Promise.resolve(exposes[key]()).then((m) => () => m);
//         }
//       }
//       //@ts-ignore
//       const get = (module, getScope) => {
//         __webpack_require__.R = getScope;
//         getScope = __webpack_require__.o(moduleMap, module)
//           ? //@ts-ignore
//             moduleMap[module]()
//           : Promise.resolve().then(() => {
//               throw new Error(
//                 `Module "${module}" does not exist in container.`,
//               );
//             });
//         __webpack_require__.R = undefined;
//         return getScope;
//       };
//       //@ts-ignore
//       const init = (shareScope, initScope, remoteEntryInitOptions) => {
//         return __webpack_require__.federation.bundlerRuntime.initContainerEntry(
//           {
//             webpackRequire: __webpack_require__,
//             shareScope: shareScope,
//             initScope: initScope,
//             remoteEntryInitOptions: remoteEntryInitOptions,
//             shareScopeKey: 'default',
//           },
//         );
//       };
//       __webpack_require__(
//         './node_modules/.federation/entry.1f2288102e035e2ed66b2efaf60ad043.js',
//       );

//       // This exports getters to disallow modifications
//       __webpack_require__.d(exports, {
//         get: () => get,
//         init: () => init,
//         moduleMap: () => moduleMap,
//       });
//     },
//   };

//   const __webpack_module_cache__ = {};

//   //@ts-ignore
//   const __webpack_require__ = (moduleId) => {
//     //@ts-ignore
//     let cachedModule = __webpack_module_cache__[moduleId];
//     if (cachedModule !== undefined) {
//       return cachedModule.exports;
//     }
//     //@ts-ignore
//     let module = (__webpack_module_cache__[moduleId] = {
//       id: moduleId,
//       loaded: false,
//       exports: {},
//     });

//     const execOptions = {
//       id: moduleId,
//       module: module,
//       //@ts-ignore
//       factory: __webpack_modules__[moduleId],
//       require: __webpack_require__,
//     };
//     __webpack_require__.i.forEach((handler) => {
//       handler(execOptions);
//     });
//     module = execOptions.module;
//     execOptions.factory.call(
//       module.exports,
//       module,
//       module.exports,
//       execOptions.require,
//     );

//     module.loaded = true;

//     return module.exports;
//   };

//   __webpack_require__.m = __webpack_modules__;
//   __webpack_require__.c = __webpack_module_cache__;
//   //@ts-ignore
//   __webpack_require__.i = [];

//   //@ts-ignore
//   if (!__webpack_require__.federation) {
//     __webpack_require__.federation = {
//       initOptions: {
//         name: name,
//         //@ts-ignore
//         remotes: remotes.map((remote) => ({
//           type: remote.type,
//           alias: remote.alias,
//           name: remote.name,
//           //@ts-ignore
//           entry: remote.entry,
//           shareScope: remote.shareScope || 'default',
//         })),
//       },
//       chunkMatcher: () => true,
//       rootOutputDir: '',
//       initialConsumes: undefined,
//       bundlerRuntimeOptions: {},
//     };
//   }
//   //@ts-ignore
//   __webpack_require__.n = (module) => {
//     const getter =
//       module && module.__esModule ? () => module['default'] : () => module;
//     __webpack_require__.d(getter, { a: getter });
//     return getter;
//   };

//   //@ts-ignore
//   __webpack_require__.d = (exports, definition) => {
//     for (const key in definition) {
//       if (
//         __webpack_require__.o(definition, key) &&
//         !__webpack_require__.o(exports, key)
//       ) {
//         Object.defineProperty(exports, key, {
//           enumerable: true,
//           get: definition[key],
//         });
//       }
//     }
//   };

//   __webpack_require__.f = {};

//   __webpack_require__.g = (() => {
//     if (typeof globalThis === 'object') return globalThis;
//     try {
//       return this || new Function('return this')();
//     } catch (e) {
//       if (typeof window === 'object') return window;
//     }
//   })();

//   //@ts-ignore
//   __webpack_require__.o = (obj, prop) =>
//     Object.prototype.hasOwnProperty.call(obj, prop);
//   //@ts-ignore
//   __webpack_require__.r = (exports) => {
//     if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
//       Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//     }
//     Object.defineProperty(exports, '__esModule', { value: true });
//   };

//   //@ts-ignore
//   __webpack_require__.federation.initOptions.shared = shared;
//   __webpack_require__.S = {};
//   const initPromises = {};
//   const initTokens = {};
//   //@ts-ignore
//   __webpack_require__.I = (name, initScope) => {
//     //@ts-ignore
//     return __webpack_require__.federation.bundlerRuntime.I({
//       shareScopeName: name,
//       webpackRequire: __webpack_require__,
//       initPromises: initPromises,
//       initTokens: initTokens,
//       initScope: initScope,
//     });
//   };

//   const __webpack_exports__ = __webpack_require__(
//     'webpack/container/entry/createContainer',
//   );
//   const __webpack_exports__get = __webpack_exports__.get;
//   const __webpack_exports__init = __webpack_exports__.init;
//   return __webpack_exports__;
// };
// export const createContainerAsync = async (
//   federationOptions: ExtendedOptions,
// ) => {
//   // todo: consider async startup options here, for "async boundary" provision.
//   return createContainer(federationOptions);
// };
