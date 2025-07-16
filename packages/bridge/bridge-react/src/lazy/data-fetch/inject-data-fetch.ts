import {
  DATA_FETCH_FUNCTION,
  DOWNGRADE_KEY,
  FS_HREF,
  MF_DATA_FETCH_STATUS,
  MF_DATA_FETCH_TYPE,
} from '../constant';
import logger from '../logger';
import {
  dataFetchFunctionOptions,
  MF_DATA_FETCH_MAP_VALUE_PROMISE_SET,
} from '../types';
import {
  callAllDowngrade,
  callDowngrade,
  getDataFetchItem,
  getDataFetchMap,
  getDowngradeTag,
  initDataFetchMap,
} from '../utils';

const dataFetchFunction = async function (options: dataFetchFunctionOptions) {
  const [id, data, downgrade] = options;
  logger.debug('==========call data fetch function!');
  if (data) {
    if (!id) {
      throw new Error('id is required!');
    }
    if (!getDataFetchMap()) {
      initDataFetchMap();
    }
    const dataFetchItem = getDataFetchItem(id);
    if (dataFetchItem) {
      dataFetchItem[1]?.[1]?.(data);
      dataFetchItem[2] = MF_DATA_FETCH_STATUS.LOADED;
      return;
    }
    if (!dataFetchItem) {
      const dataFetchMap = getDataFetchMap();
      let res: MF_DATA_FETCH_MAP_VALUE_PROMISE_SET[1];
      let rej: MF_DATA_FETCH_MAP_VALUE_PROMISE_SET[2];
      const p = new Promise((resolve, reject) => {
        res = resolve;
        rej = reject;
      });

      dataFetchMap[id] = [
        [
          async () => async () => {
            return '';
          },
          MF_DATA_FETCH_TYPE.FETCH_SERVER,
        ],
        [p, res, rej],
        MF_DATA_FETCH_STATUS.LOADED,
      ];
      res && res(data);
      return;
    }
  }

  if (downgrade) {
    const mfDowngrade = getDowngradeTag();
    if (!mfDowngrade) {
      globalThis[DOWNGRADE_KEY] = id ? [id] : true;
    } else if (Array.isArray(mfDowngrade) && id && !mfDowngrade.includes(id)) {
      mfDowngrade.push(id);
    }
  }

  const mfDowngrade = getDowngradeTag();

  if (typeof mfDowngrade === 'boolean') {
    return callAllDowngrade();
  }
  if (Array.isArray(mfDowngrade)) {
    if (!id) {
      globalThis[DOWNGRADE_KEY] = true;
      return callAllDowngrade();
    }

    if (!mfDowngrade.includes(id)) {
      mfDowngrade.push(id);
    }

    return callDowngrade(id);
  }
};

export function injectDataFetch() {
  globalThis[DATA_FETCH_FUNCTION] ||= [];
  const dataFetch = globalThis[DATA_FETCH_FUNCTION];

  //@ts-ignore
  if (dataFetch.push === dataFetchFunction) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  globalThis[FS_HREF] = window.location.href;

  //@ts-ignore
  dataFetch.push = dataFetchFunction;
}

export { dataFetchFunction };
