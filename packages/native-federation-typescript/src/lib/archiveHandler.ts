import AdmZip from 'adm-zip';
import ansiColors from 'ansi-colors';
import axios from 'axios';
import { createHash } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import typescript from 'typescript';

import { HostOptions } from '../interfaces/HostOptions';
import { RemoteOptions } from '../interfaces/RemoteOptions';
import { retrieveMfTypesPath } from './typeScriptCompiler';

const retrieveTypesZipPath = (
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

export const deleteTypesFolder = async (
  options: Required<HostOptions> | Required<RemoteOptions>,
  destinationPath: string,
) => {
  if (options.deleteTypesFolder) {
    await rm(destinationPath, {
      recursive: true,
      force: true,
    }).catch((error) =>
      console.error(ansiColors.red(`Unable to remove types folder, ${error}`)),
    );
  }
};

export const downloadTypesArchive = (hostOptions: Required<HostOptions>) => {
  const retriesPerFile: Record<string, number> = {};
  const hashPerFile: Record<string, string> = {};

  return async ([destinationFolder, fileToDownload]: string[]) => {
    retriesPerFile[fileToDownload] = 0;
    const destinationPath = join(hostOptions.typesFolder, destinationFolder);

    while (retriesPerFile[fileToDownload]++ < hostOptions.maxRetries) {
      try {
        const response = await axios
          .get(fileToDownload, { responseType: 'arraybuffer' })
          .catch(downloadErrorLogger(destinationFolder, fileToDownload));

        const responseBuffer = Buffer.from(response.data);

        const hash = createHash('sha256').update(responseBuffer).digest('hex');

        if (hashPerFile[fileToDownload] !== hash) {
          await deleteTypesFolder(hostOptions, destinationPath);

          const zip = new AdmZip(responseBuffer);
          zip.extractAllTo(destinationPath, true);

          hashPerFile[fileToDownload] = hash;
        }

        break;
      } catch (error: any) {
        console.error(
          ansiColors.red(
            `Error during types archive download: ${
              error?.message || 'unknown error'
            }`,
          ),
        );
        if (retriesPerFile[fileToDownload] >= hostOptions.maxRetries) {
          throw error;
        }
      }
    }
  };
};
