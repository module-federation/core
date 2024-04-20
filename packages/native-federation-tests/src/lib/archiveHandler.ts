import AdmZip from 'adm-zip';
import ansiColors from 'ansi-colors';
import axios from 'axios';
import { join } from 'path';

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

export const downloadTypesArchive = (hostOptions: Required<HostOptions>) => {
  const retriesPerFile: Record<string, number> = {};
  return async ([destinationFolder, fileToDownload]: string[]) => {
    retriesPerFile[fileToDownload] = 0;
    const destinationPath = join(hostOptions.mocksFolder, destinationFolder);

    while (retriesPerFile[fileToDownload]++ < hostOptions.maxRetries) {
      try {
        const response = await axios
          .get(fileToDownload, { responseType: 'arraybuffer' })
          .catch(downloadErrorLogger(destinationFolder, fileToDownload));

        const zip = new AdmZip(Buffer.from(response.data));
        zip.extractAllTo(destinationPath, true);
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
