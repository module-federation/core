import { attachShareScopeMap } from './attachShareScopeMap';
import type { RemoteEntryExports } from './types';
import { RemotesOptions } from './types';
import { FEDERATION_SUPPORTED_TYPES } from './constant';
import { decodeName, ENCODE_NAME_PREFIX } from '@module-federation/sdk';

export function remotes(options: RemotesOptions) {
  const {
    chunkId,
    promises,
    chunkMapping,
    idToExternalAndNameMapping,
    webpackRequire,
    idToRemoteMap,
  } = options;
  attachShareScopeMap(webpackRequire);

  if (webpackRequire.o(chunkMapping, chunkId)) {
    chunkMapping[chunkId].forEach((id) => {
      let getScope = webpackRequire.R;
      if (!getScope) {
        getScope = [];
      }
      const data = idToExternalAndNameMapping[id];
      const remoteInfos = idToRemoteMap[id];
      // @ts-ignore seems not work
      if (getScope.indexOf(data) >= 0) {
        return;
      }
      // @ts-ignore seems not work
      getScope.push(data);
      if (data.p) {
        return promises.push(data.p as Promise<any>);
      }
      const onError = (error?: Error) => {
        if (!error) {
          error = new Error('Container missing');
        }
        if (typeof error.message === 'string') {
          error.message += `\nwhile loading "${data[1]}" from ${data[2]}`;
        }
        webpackRequire.m[id] = () => {
          throw error;
        };
        data.p = 0;
      };
      const handleFunction = (
        fn: (...args: any[]) => any,
        arg1: any,
        arg2: any,
        d: any,
        next: (...args: any[]) => any,
        first: 1 | 0,
      ) => {
        try {
          const promise = fn(arg1, arg2);
          if (promise && promise.then) {
            const p = promise.then((result: any) => next(result, d), onError);
            if (first) {
              promises.push((data.p = p));
            } else {
              return p;
            }
          } else {
            return next(promise, d, first);
          }
        } catch (error) {
          onError(error as Error);
        }
      };
      const onExternal = (
        external: (...args: any[]) => any,
        _: any,
        first: 1 | 0,
      ) =>
        external
          ? handleFunction(
              webpackRequire.I,
              data[0],
              0,
              external,
              onInitialized,
              first,
            )
          : onError();

      // eslint-disable-next-line no-var
      var onInitialized = (
        _: any,
        external: RemoteEntryExports,
        first: 1 | 0,
      ) => handleFunction(external.get, data[1], getScope, 0, onFactory, first);
      // eslint-disable-next-line no-var
      var onFactory = (factory: () => any) => {
        data.p = 1;
        webpackRequire.m[id] = (module) => {
          module.exports = factory();
        };
      };
      const onRemoteLoaded = () => {
        try {
          const remoteName = decodeName(
            remoteInfos[0].name,
            ENCODE_NAME_PREFIX,
          );

          const remoteModuleName = remoteName + data[1].slice(1);
          const instance = webpackRequire.federation.instance!;
          const loadRemote = () =>
            webpackRequire.federation.instance!.loadRemote(remoteModuleName, {
              loadFactory: false,
              from: 'build',
            });

          if (instance.options.shareStrategy === 'version-first') {
            return Promise.all(
              instance.sharedHandler.initializeSharing(data[0]),
            ).then(() => {
              return loadRemote();
            });
          }

          return loadRemote();
        } catch (error) {
          onError(error as Error);
        }
      };

      const useRuntimeLoad =
        remoteInfos.length === 1 &&
        FEDERATION_SUPPORTED_TYPES.includes(remoteInfos[0].externalType) &&
        remoteInfos[0].name;

      if (useRuntimeLoad) {
        handleFunction(onRemoteLoaded, data[2], 0, 0, onFactory, 1);
      } else {
        handleFunction(webpackRequire, data[2], 0, 0, onExternal, 1);
      }
    });
  }
}
