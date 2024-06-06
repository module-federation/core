import AdmZip from 'adm-zip';
import ansiColors from 'ansi-colors';
import axios from 'axios';
import { createHash } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { HostOptions } from '../interfaces/HostOptions';
import { RemoteOptions } from '../interfaces/RemoteOptions';

const retrieveTestsZipPath = (remoteOptions: Required<RemoteOptions>) =>
  join(remoteOptions.distFolder, `${remoteOptions.testsFolder}.zip`);

export const createTestsArchive = async (
  remoteOptions: Required<RemoteOptions>,
  compiledFilesFolder: string,
) => {
  const zip = new AdmZip();
  zip.addLocalFolder(compiledFilesFolder);
  return zip.writeZipPromise(retrieveTestsZipPath(remoteOptions));
};

const downloadErrorLogger =
  (destinationFolder: string, fileToDownload: string) => (reason: Error) => {
    throw {
      ...reason,
      message: `Network error: Unable to download federated mocks for '${destinationFolder}' from '${fileToDownload}' because '${reason.message}'`,
    };
  };

export const deleteTestsFolder = async (
  options: Required<HostOptions> | Required<RemoteOptions>,
  destinationPath: string,
) => {
  if (options.deleteTestsFolder) {
    await rm(destinationPath, {
      recursive: true,
      force: true,
    }).catch((error) =>
      console.error(ansiColors.red(`Unable to remove tests folder, ${error}`)),
    );
  }
};

export const downloadTypesArchive = (hostOptions: Required<HostOptions>) => {
  const retriesPerFile: Record<string, number> = {};
  const hashPerFile: Record<string, string> = {};

  return async ([destinationFolder, fileToDownload]: string[]) => {
    retriesPerFile[fileToDownload] = 0;
    const destinationPath = join(hostOptions.mocksFolder, destinationFolder);

    while (retriesPerFile[fileToDownload]++ < hostOptions.maxRetries) {
      try {
        const response = await axios
          .get(fileToDownload, { responseType: 'arraybuffer' })
          .catch(downloadErrorLogger(destinationFolder, fileToDownload));

        const responseBuffer = Buffer.from(response.data);

        const hash = createHash('sha256').update(responseBuffer).digest('hex');

        if (hashPerFile[fileToDownload] !== hash) {
          await deleteTestsFolder(hostOptions, destinationPath);

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
