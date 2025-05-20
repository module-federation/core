import { DATA_FETCH_QUERY, DOWNGRADE_KEY } from '../constant';
import { MF_DATA_FETCH_STATUS, MF_DOWNGRADE_TYPE } from '../constant';
import { getDataFetchMap } from '../utils';

import type { DataFetchParams, MF_SSR_DOWNGRADE } from '../interfaces/global';

export function getDowngradeTag() {
  return globalThis[DOWNGRADE_KEY] as MF_SSR_DOWNGRADE;
}

export function callAllDowngrade() {
  const dataFetchMap = getDataFetchMap();
  if (!dataFetchMap) {
    return;
  }
  Object.keys(dataFetchMap).forEach((key) => {
    callDowngrade(key);
  });
}

export async function callDowngrade(id: string, params?: DataFetchParams) {
  const dataFetchMap = getDataFetchMap();
  if (!dataFetchMap) {
    return;
  }
  const mfDataFetch = dataFetchMap[id];
  if (mfDataFetch[2] === MF_DATA_FETCH_STATUS.AWAIT) {
    mfDataFetch[2] = MF_DATA_FETCH_STATUS.LOADING;
    let promise, res, rej;
    if (mfDataFetch[1]) {
      promise = mfDataFetch[1][0];
      res = mfDataFetch[1][1];
      rej = mfDataFetch[1][2];
    } else {
      promise = new Promise((resolve, reject) => {
        res = resolve;
        rej = reject;
      });
      mfDataFetch[1] = [promise, res, rej];
    }
    const downgradeType = mfDataFetch[0][1];
    if (downgradeType === MF_DOWNGRADE_TYPE.FETCH_CLIENT) {
      try {
        mfDataFetch[0][0]().then((getDataFetchFn) => {
          return getDataFetchFn({
            ...params,
            isDowngrade: true,
          }).then((data) => {
            mfDataFetch[2] = MF_DATA_FETCH_STATUS.LOADED;
            res(data);
          });
        });
      } catch (e) {
        mfDataFetch[2] = MF_DATA_FETCH_STATUS.ERROR;
        rej(e);
      }
    } else if (downgradeType === MF_DOWNGRADE_TYPE.FETCH_SERVER) {
      try {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set(DATA_FETCH_QUERY, id);
        if (params) {
          currentUrl.searchParams.set('params', JSON.stringify(params));
        }
        const fetchUrl = currentUrl.toString();
        const data = await fetch(fetchUrl).then((res) => res.json());
        mfDataFetch[2] = MF_DATA_FETCH_STATUS.LOADED;
        res(data);
      } catch (e) {
        mfDataFetch[2] = MF_DATA_FETCH_STATUS.ERROR;
        rej(e);
      }
    }

    return promise;
  }
}
