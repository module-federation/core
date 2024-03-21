import path from 'path';
import { retrieveRemoteConfig } from '../configurations/remotePlugin';
import { HostOptions } from '../interfaces/HostOptions';
import { RemoteOptions } from '../interfaces/RemoteOptions';
import { DTSManager } from './DTSManager';
import { retrieveTypesZipPath } from './archiveHandler';
import {
  retrieveMfAPITypesPath,
  retrieveMfTypesPath,
} from './typeScriptCompiler';
import ansiColors from 'ansi-colors';

export function getDTSManagerConstructor(
  implementation?: string,
): typeof DTSManager {
  return implementation ? require(implementation) : DTSManager;
}
export const validateOptions = (options: HostOptions) => {
  if (!options.moduleFederationConfig) {
    throw new Error('moduleFederationConfig is required');
  }
};

export function retrieveTypesAssetsInfo(options: RemoteOptions) {
  let apiTypesPath = '';
  let zipTypesPath = '';
  try {
    const { tsConfig, remoteOptions, mapComponentsToExpose } =
      retrieveRemoteConfig(options);
    if (!Object.keys(mapComponentsToExpose).length) {
      return {
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

    return {
      apiTypesPath,
      zipTypesPath,
      zipName: path.basename(zipTypesPath),
      apiFileName: path.basename(apiTypesPath),
    };
  } catch (err) {
    console.error(ansiColors.red(`Unable to compile federated types, ${err}`));
    return {
      apiTypesPath: '',
      zipTypesPath: '',
      zipName: '',
      apiFileName: '',
    };
  }
}
