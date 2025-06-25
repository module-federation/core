import type { getInstance } from '@module-federation/runtime';
import {
  getDataFetchInfo,
  getDataFetchMap,
  getDataFetchMapKey,
  isServerEnv,
} from '../utils';
import helpers from '@module-federation/runtime/helpers';
import { DataFetchParams } from '../types';
import { MF_DATA_FETCH_TYPE } from '../constant';

type PrefetchOptions = {
  id: string;
  instance: ReturnType<typeof getInstance>;
  dataFetchParams?: DataFetchParams;
  preloadComponentResource?: boolean;
};

export async function prefetch(options: PrefetchOptions) {
  const { instance, id, dataFetchParams, preloadComponentResource } = options;
  if (!id) {
    throw new Error('id is required for prefetch!');
  }
  if (!instance) {
    throw new Error('instance is required for prefetch!');
  }
  const matchedRemoteInfo = helpers.utils.matchRemoteWithNameAndExpose(
    instance.options.remotes,
    id,
  );
  if (!matchedRemoteInfo) {
    throw new Error(`Can not found '${id}' in instance.options.remotes!`);
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

  const [getDataFetchGetter, type, getDataFetchPromise] = dataFetchItem[0];

  if (type === MF_DATA_FETCH_TYPE.FETCH_CLIENT && !isServerEnv()) {
    return;
  }

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
