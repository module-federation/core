import type { getInstance } from '@module-federation/runtime';
import {
  getDataFetchInfo,
  getDataFetchMap,
  getDataFetchMapKey,
} from '../utils';
import logger from '../logger';
import helpers from '@module-federation/runtime/helpers';
import { DataFetchParams } from '../types';

export type PrefetchOptions = {
  id: string;
  instance: ReturnType<typeof getInstance>;
  dataFetchParams?: DataFetchParams;
  preloadComponentResource?: boolean;
};

export async function prefetch(options: PrefetchOptions) {
  const { instance, id, dataFetchParams, preloadComponentResource } = options;
  if (!id) {
    logger.error('id is required for prefetch!');
    return;
  }
  if (!instance) {
    logger.error('instance is required for prefetch!');
    return;
  }
  const matchedRemoteInfo = helpers.utils.matchRemoteWithNameAndExpose(
    instance.options.remotes,
    id,
  );
  if (!matchedRemoteInfo) {
    logger.error(`Can not found '${id}' in instance.options.remotes!`);
    return;
  }
  const { remote, expose } = matchedRemoteInfo;
  const { remoteSnapshot, globalSnapshot } =
    await instance.snapshotHandler.loadRemoteSnapshotInfo({
      moduleInfo: remote,
      id,
      expose,
    });

  if (preloadComponentResource) {
    const remoteInfo = helpers.utils.getRemoteInfo(remote);

    Promise.resolve(
      instance.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit({
        origin: instance,
        preloadOptions: {
          remote,
          preloadConfig: {
            nameOrAlias: remote.name,
            exposes: [expose],
          },
        },
        remote,
        remoteInfo,
        globalSnapshot,
        remoteSnapshot,
      }),
    ).then((assets) => {
      if (assets) {
        helpers.utils.preloadAssets(remoteInfo, instance, assets);
      }
    });
  }

  const dataFetchMap = getDataFetchMap();
  if (!dataFetchMap) {
    return;
  }
  const dataFetchInfo = getDataFetchInfo({
    name: remote.name,
    alias: remote.alias,
    id,
    remoteSnapshot,
  });

  const dataFetchMapKey = getDataFetchMapKey(dataFetchInfo, {
    name: instance.name,
    version: instance.options.version,
  });

  if (!dataFetchMapKey) {
    return;
  }

  const dataFetchItem = dataFetchMap[dataFetchMapKey];
  if (!dataFetchItem) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [getDataFetchGetter, _type, getDataFetchPromise] = dataFetchItem[0];

  let _getDataFetchPromise = getDataFetchPromise;
  if (!getDataFetchPromise) {
    if (!getDataFetchGetter) {
      return;
    }
    _getDataFetchPromise = getDataFetchGetter();
  }

  _getDataFetchPromise!.then((dataFetchFn) => {
    return dataFetchFn({
      ...dataFetchParams,
      _id: dataFetchMapKey,
      isDowngrade: false,
    });
  });
}
