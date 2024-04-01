import { RuntimeRemote, WebpackRemoteContainer } from '../types';
import { loadScript } from './pure';

export const importDelegatedModule = async (
  keyOrRuntimeRemoteItem: string | RuntimeRemote,
) => {
  // @ts-ignore
  return loadScript(keyOrRuntimeRemoteItem)
    .then((asyncContainer: WebpackRemoteContainer) => {
      return asyncContainer;
    })
    .then((asyncContainer: WebpackRemoteContainer) => {
      // most of this is only needed because of legacy promise based implementation
      // can remove proxies once we remove promise based implementations
      if (typeof window === 'undefined') {
        if (!Object.hasOwnProperty.call(keyOrRuntimeRemoteItem, 'globalThis')) {
          return asyncContainer;
        }

        // return asyncContainer;

        //TODO: need to solve chunk flushing with delegated modules
        return {
          get: function (arg: string) {
            //@ts-ignore
            return asyncContainer.get(arg).then((f) => {
              const m = f();
              const result = {
                __esModule: m.__esModule,
              };
              for (const prop in m) {
                if (typeof m[prop] === 'function') {
                  Object.defineProperty(result, prop, {
                    get: function () {
                      return function () {
                        //@ts-ignore
                        if (globalThis.usedChunks) {
                          //@ts-ignore
                          globalThis.usedChunks.add(
                            //@ts-ignore
                            `${keyOrRuntimeRemoteItem.global}->${arg}`,
                          );
                        }
                        //eslint-disable-next-line prefer-rest-params
                        return m[prop](...arguments);
                      };
                    },
                    enumerable: true,
                  });
                } else {
                  Object.defineProperty(result, prop, {
                    get: () => {
                      //@ts-ignore
                      if (globalThis.usedChunks) {
                        //@ts-ignore
                        globalThis.usedChunks.add(
                          //@ts-ignore
                          `${keyOrRuntimeRemoteItem.global}->${arg}`,
                        );
                      }

                      return m[prop];
                    },
                    enumerable: true,
                  });
                }
              }

              if (m.then) {
                return Promise.resolve(() => result);
              }

              return () => result;
            });
          },
          init: asyncContainer.init,
        };
      } else {
        return asyncContainer;
      }
    });
};
