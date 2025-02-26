import fs from 'fs';
import path from 'path';
import axios, { type AxiosRequestConfig } from 'axios';
import http from 'http';
import https from 'https';
import { moduleFederationPlugin, getProcessEnv } from '@module-federation/sdk';
import ansiColors from 'ansi-colors';
import { retrieveRemoteConfig } from '../configurations/remotePlugin';
import { HostOptions } from '../interfaces/HostOptions';
import { RemoteOptions } from '../interfaces/RemoteOptions';
import { DTSManager } from './DTSManager';
import { retrieveTypesZipPath } from './archiveHandler';
import {
  retrieveMfAPITypesPath,
  retrieveMfTypesPath,
} from './typeScriptCompiler';
import cloneDeepWith from 'lodash.clonedeepwith';
import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';

export function getDTSManagerConstructor(
  implementation?: string,
): typeof DTSManager {
  if (implementation) {
    const NewConstructor = require(implementation);
    return NewConstructor.default ? NewConstructor.default : NewConstructor;
  }
  return DTSManager;
}
export const validateOptions = (options: HostOptions) => {
  if (!options.moduleFederationConfig) {
    throw new Error('moduleFederationConfig is required');
  }
};

export function retrieveTypesAssetsInfo(options: RemoteOptions) {
  const { moduleFederationConfig } = options;
  let apiTypesPath = '';
  let zipTypesPath = '';

  let zipPrefix = '';

  try {
    const { tsConfig, remoteOptions, mapComponentsToExpose } =
      retrieveRemoteConfig(options);
    if (!Object.keys(mapComponentsToExpose).length) {
      return {
        zipPrefix,
        apiTypesPath,
        zipTypesPath,
        zipName: '',
        apiFileName: '',
      };
    }
    const mfTypesPath = retrieveMfTypesPath(tsConfig, remoteOptions);
    zipTypesPath = retrieveTypesZipPath(mfTypesPath, remoteOptions);
    if (remoteOptions.generateAPITypes) {
      apiTypesPath = retrieveMfAPITypesPath(tsConfig, remoteOptions);
    }

    if (
      typeof moduleFederationConfig.manifest === 'object' &&
      moduleFederationConfig.manifest.filePath
    ) {
      zipPrefix = moduleFederationConfig.manifest.filePath;
    } else if (
      typeof moduleFederationConfig.manifest === 'object' &&
      moduleFederationConfig.manifest.fileName
    ) {
      zipPrefix = path.dirname(moduleFederationConfig.manifest.fileName);
    } else if (moduleFederationConfig.filename) {
      zipPrefix = path.dirname(moduleFederationConfig.filename);
    }

    return {
      zipPrefix,
      apiTypesPath,
      zipTypesPath,
      zipName: path.basename(zipTypesPath),
      apiFileName: path.basename(apiTypesPath),
    };
  } catch (err) {
    console.error(ansiColors.red(`Unable to compile federated types, ${err}`));
    return {
      zipPrefix,
      apiTypesPath: '',
      zipTypesPath: '',
      zipName: '',
      apiFileName: '',
    };
  }
}

export function isDebugMode() {
  return (
    Boolean(process.env['FEDERATION_DEBUG']) ||
    process.env['NODE_ENV'] === 'test'
  );
}

export const isTSProject = (
  dtsOptions: moduleFederationPlugin.ModuleFederationPluginOptions['dts'],
  context = process.cwd(),
) => {
  if (dtsOptions === false) {
    return false;
  }

  try {
    let filepath = '';
    if (typeof dtsOptions === 'object' && dtsOptions.tsConfigPath) {
      filepath = dtsOptions.tsConfigPath;
    } else {
      filepath = path.resolve(context, './tsconfig.json');
    }

    if (!path.isAbsolute(filepath)) {
      filepath = path.resolve(context, filepath);
    }
    return fs.existsSync(filepath);
  } catch (err) {
    return false;
  }
};

export function cloneDeepOptions(options: DTSManagerOptions) {
  const excludeKeys = ['manifest', 'async'];

  return cloneDeepWith(options, (value, key) => {
    // moduleFederationConfig.manifest may have un serialization options
    if (typeof key === 'string' && excludeKeys.includes(key)) {
      return false;
    }
    if (typeof value === 'function') {
      return false;
    }
  });
}

const getEnvHeaders = (): Record<string, string> => {
  const headersStr = getProcessEnv()['MF_ENV_HEADERS'] || '{}';

  return {
    ...JSON.parse(headersStr),
  };
};

export async function axiosGet(url: string, config?: AxiosRequestConfig) {
  const httpAgent = new http.Agent({ family: 4 });
  const httpsAgent = new https.Agent({ family: 4 });
  return axios.get(url, {
    httpAgent,
    httpsAgent,
    ...{
      headers: getEnvHeaders(),
    },
    ...config,
  });
}
