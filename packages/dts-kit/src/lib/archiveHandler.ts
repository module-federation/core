import AdmZip from 'adm-zip';
import ansiColors from 'ansi-colors';
import axios from 'axios';
import { resolve, join } from 'path';
import typescript from 'typescript';

import { HostOptions } from '../interfaces/HostOptions';
import { RemoteOptions } from '../interfaces/RemoteOptions';
import { retrieveMfTypesPath } from './typeScriptCompiler';
import { replaceLocalhost } from './utils';

export const retrieveTypesZipPath = (
  mfTypesPath: string,
  remoteOptions: Required<RemoteOptions>,
) =>
  join(
    mfTypesPath.replace(remoteOptions.typesFolder, ''),
    `${remoteOptions.typesFolder}.zip`,
  );

export const createTypesArchive = async (
  tsConfig: typescript.CompilerOptions,
  remoteOptions: Required<RemoteOptions>,
) => {
  const mfTypesPath = retrieveMfTypesPath(tsConfig, remoteOptions);

  const zip = new AdmZip();
  zip.addLocalFolder(mfTypesPath);
  return zip.writeZipPromise(retrieveTypesZipPath(mfTypesPath, remoteOptions));
};

const downloadErrorLogger =
  (destinationFolder: string, fileToDownload: string) => (reason: Error) => {
    throw {
      ...reason,
      message: `Network error: Unable to download federated mocks for '${destinationFolder}' from '${fileToDownload}' because '${reason.message}'`,
    };
  };

export const retrieveTypesArchiveDestinationPath = (
  hostOptions: Required<HostOptions>,
  destinationFolder: string,
) => {
  return resolve(
    hostOptions.context,
    hostOptions.typesFolder,
    destinationFolder,
  );
};
export const downloadTypesArchive = (hostOptions: Required<HostOptions>) => {
  let retries = 0;
  return async ([destinationFolder, fileToDownload]: string[]): Promise<
    [string, string] | undefined
  > => {
    const destinationPath = retrieveTypesArchiveDestinationPath(
      hostOptions,
      destinationFolder,
    );

    while (retries++ < hostOptions.maxRetries) {
      try {
        const url = replaceLocalhost(fileToDownload);
        const response = await axios
          .get(url, { responseType: 'arraybuffer' })
          .catch(downloadErrorLogger(destinationFolder, url));

        const zip = new AdmZip(Buffer.from(response.data));
        zip.extractAllTo(destinationPath, true);
        return [destinationFolder, destinationPath];
      } catch (error: any) {
        console.error(
          ansiColors.red(
            `Error during types archive download: ${
              error?.message || 'unknown error'
            }`,
          ),
        );
        if (retries >= hostOptions.maxRetries) {
          if (hostOptions.abortOnError !== false) {
            throw error;
          }
          return undefined;
        }
      }
    }
  };
};
