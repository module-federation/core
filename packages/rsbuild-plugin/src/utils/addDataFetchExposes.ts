import fs from 'fs-extra';
import path from 'path';
import { TEMP_DIR } from '@module-federation/sdk';

import type { moduleFederationPlugin } from '@module-federation/sdk';
import { DATA_FETCH_CLIENT_SUFFIX, DATA_FETCH_IDENTIFIER } from './constant';

const addDataFetchExpose = (
  exposes: moduleFederationPlugin.ExposesObject,
  key: string,
  filepath: string,
  suffix = '',
) => {
  if (!fs.existsSync(filepath)) {
    return false;
  }

  const dataFetchKey =
    key === '.'
      ? `./${DATA_FETCH_IDENTIFIER}${suffix}`
      : `${key}.${DATA_FETCH_IDENTIFIER}${suffix}`;
  if (!exposes[dataFetchKey]) {
    exposes[dataFetchKey] = filepath;
  }
  return dataFetchKey;
};

export function addDataFetchExposes(
  exposes: moduleFederationPlugin.ModuleFederationPluginOptions['exposes'],
  isServer: boolean,
  enableSSR: boolean,
) {
  if (typeof exposes !== 'object' || Array.isArray(exposes)) {
    return;
  }

  if (Object.keys(exposes).length === 0) {
    return;
  }

  const tempDataFetchFilepath = path.resolve(
    process.cwd(),
    `node_modules/${TEMP_DIR}/data-fetch-fallback.js`,
  );
  const content = `export const fetchData=()=>{throw new Error('should not be called')};`;
  fs.ensureDirSync(path.dirname(tempDataFetchFilepath));
  fs.writeFileSync(tempDataFetchFilepath, content);

  Object.keys(exposes).forEach((key, index) => {
    const expose = exposes[key];
    if (typeof expose !== 'string') {
      return;
    }
    const absPath = path.resolve(process.cwd(), expose);
    const dataFetchPath = `${absPath.replace(path.extname(absPath), '')}.${DATA_FETCH_IDENTIFIER}.ts`;

    const dataFetchClientPath = `${absPath.replace(path.extname(absPath), '')}.${DATA_FETCH_IDENTIFIER}.client.ts`;

    const dateFetchClientKey = addDataFetchExpose(
      exposes,
      key,
      dataFetchClientPath,
      DATA_FETCH_CLIENT_SUFFIX,
    );
    if (!isServer && dateFetchClientKey) {
      exposes[dateFetchClientKey.replace(DATA_FETCH_CLIENT_SUFFIX, '')] =
        tempDataFetchFilepath;
      return;
    }

    const dataFetchKey = addDataFetchExpose(exposes, key, dataFetchPath);
    if (dataFetchKey && fs.existsSync(dataFetchClientPath)) {
      exposes[`${dataFetchKey}${DATA_FETCH_CLIENT_SUFFIX}`] =
        tempDataFetchFilepath;
    }
  });
}
