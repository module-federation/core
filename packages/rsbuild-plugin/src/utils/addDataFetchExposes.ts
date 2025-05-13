import fs from 'fs';
import path from 'path';
import { TEMP_DIR } from '@module-federation/sdk';

import type { moduleFederationPlugin } from '@module-federation/sdk';

export const DATA_FETCH_IDENTIFIER = 'data';

const addDataFetchExpose = (
  exposes: moduleFederationPlugin.ExposesObject,
  key: string,
  filepath: string,
) => {
  if (!fs.existsSync(filepath)) {
    return false;
  }

  const dataFetchKey =
    key === '.'
      ? `./${DATA_FETCH_IDENTIFIER}`
      : `${key}.${DATA_FETCH_IDENTIFIER}`;
  if (!exposes[dataFetchKey]) {
    exposes[dataFetchKey] = filepath;
  }
  return dataFetchKey;
};

export function addDataFetchExposes(
  exposes: moduleFederationPlugin.ModuleFederationPluginOptions['exposes'],
  isServer: boolean,
) {
  if (typeof exposes !== 'object' || Array.isArray(exposes)) {
    return;
  }

  Object.keys(exposes).forEach((key) => {
    const expose = exposes[key];
    if (typeof expose !== 'string') {
      return;
    }
    const absPath = path.resolve(process.cwd(), expose);
    const dataFetchPath = `${absPath.replace(path.extname(absPath), '')}.${DATA_FETCH_IDENTIFIER}.ts`;

    const dataFetchClientPath = `${absPath.replace(path.extname(absPath), '')}.${DATA_FETCH_IDENTIFIER}.client.ts`;

    if (!isServer && addDataFetchExpose(exposes, key, dataFetchClientPath)) {
      return;
    }

    const dataFetchKey = addDataFetchExpose(exposes, key, dataFetchPath);
    if (!isServer && dataFetchKey) {
      const tempDataFetchFilepath = path.resolve(
        process.cwd(),
        `node_modules/${TEMP_DIR}/data-fetch.ts`,
      );
      const content = `export const fetchData=()=>{throw new Error('should not be called')};`;
      fs.writeFileSync(tempDataFetchFilepath, content);
      exposes[dataFetchKey] = tempDataFetchFilepath;
    }
    return;
  });
}
