import type { FederationRuntimePlugin } from '@module-federation/runtime/types';
import { ModuleInfo, getResourceUrl } from '@module-federation/sdk';

import { getSignalFromManifest } from './common/runtime-utils';
import { MFDataPrefetch } from './prefetch';
import logger from './logger';
import { SHARED_STRATEGY } from './constant';

interface Loading {
  id: string;
  promise: Promise<
    Array<{
      value: any;
      functionId: string;
    }>
  >;
}
const loadingArray: Array<Loading> = [];
let sharedFlag = SHARED_STRATEGY;
// eslint-disable-next-line max-lines-per-function
export const prefetchPlugin = (): FederationRuntimePlugin => ({
  name: 'data-prefetch-runtime-plugin',
  initContainer(options) {
    const { remoteSnapshot, remoteInfo, id, origin } = options;
    const snapshot = remoteSnapshot as ModuleInfo;
    const { name } = remoteInfo;

    const prefetchOptions = {
      name,
      remote: remoteInfo,
      origin,
      remoteSnapshot: snapshot,
    };
    const signal = getSignalFromManifest(snapshot);
    if (!signal) {
      return options;
    }
    if (sharedFlag !== SHARED_STRATEGY) {
      throw new Error(
        `[Module Federation Data Prefetch]: If you want to use data prefetch, the shared strategy must be 'loaded-first'`,
      );
    }

    const instance =
      MFDataPrefetch.getInstance(name) || new MFDataPrefetch(prefetchOptions);

    let prefetchUrl;
    // @ts-expect-error
    if (snapshot.prefetchEntry) {
      // @ts-expect-error
      prefetchUrl = getResourceUrl(snapshot, snapshot.prefetchEntry as string);
    }

    const exist = loadingArray.find((loading) => loading.id === id);
    if (exist) {
      return options;
    }
    const promise = instance.loadEntry(prefetchUrl).then(async () => {
      const projectExports = instance!.getProjectExports();
      if (projectExports instanceof Promise) {
        await projectExports;
      }
      return Promise.resolve().then(() => {
        const exports = instance!.getExposeExports(id);
        logger.info(
          `1. Start Prefetch initContainer: ${id} - ${performance.now()}`,
        );
        const result = Object.keys(exports).map((k) => {
          const value = instance!.prefetch({
            id,
            functionId: k,
          });
          const functionId = k;

          return {
            value,
            functionId,
          };
        });
        return result;
      });
    });

    loadingArray.push({
      id,
      promise,
    });
    return options;
  },

  afterResolve(options) {
    const { remoteSnapshot, remoteInfo, id, origin } = options;
    const snapshot = remoteSnapshot as ModuleInfo;
    const { name } = remoteInfo;

    const prefetchOptions = {
      name,
      remote: remoteInfo,
      origin,
      remoteSnapshot: snapshot,
    };
    const signal = getSignalFromManifest(snapshot);
    if (!signal) {
      return options;
    }

    const inited = loadingArray.some((info) => info.id === id);
    if (!inited) {
      return options;
    }

    if (sharedFlag !== SHARED_STRATEGY) {
      throw new Error(
        `[Module Federation Data Prefetch]: If you want to use data prefetch, the shared strategy must be 'loaded-first'`,
      );
    }

    const instance =
      MFDataPrefetch.getInstance(name) || new MFDataPrefetch(prefetchOptions);

    let prefetchUrl;
    // @ts-expect-error
    if (snapshot.prefetchEntry) {
      // @ts-expect-error
      prefetchUrl = getResourceUrl(snapshot, snapshot.prefetchEntry as string);
    }

    const index = loadingArray.findIndex((loading) => loading.id === id);
    // clear cache
    if (index !== -1) {
      loadingArray.splice(index, 1);
    }
    const promise = instance.loadEntry(prefetchUrl).then(async () => {
      const projectExports = instance!.getProjectExports();
      if (projectExports instanceof Promise) {
        await projectExports;
      }
      return Promise.resolve().then(() => {
        const exports = instance!.getExposeExports(id);
        logger.info(
          `1. Start Prefetch afterResolve: ${id} - ${performance.now()}`,
        );
        const result = Object.keys(exports).map((k) => {
          const value = instance!.prefetch({
            id,
            functionId: k,
          });
          const functionId = k;

          return {
            value,
            functionId,
          };
        });
        return result;
      });
    });

    loadingArray.push({
      id,
      promise,
    });
    return options;
  },
  async onLoad(options) {
    const { remote, id } = options;
    const { name } = remote;
    const promise = loadingArray.find((loading) => loading.id === id)?.promise;

    if (promise) {
      const prefetch = await promise;
      const prefetchValue = prefetch.map((result) => result.value);
      await Promise.all(prefetchValue);
      const instance = MFDataPrefetch.getInstance(name);

      prefetch.forEach((result: { value: any; functionId: string }) => {
        const { value, functionId } = result;
        instance!.memorize(id + functionId, value);
      });
    }
    return options;
  },

  beforeLoadShare(options) {
    const shareInfo = options.shareInfo;
    sharedFlag = shareInfo?.strategy || sharedFlag;
    return options;
  },
});

export default prefetchPlugin;
