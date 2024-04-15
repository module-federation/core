import Piscina from 'piscina'
import { isMainThread } from 'worker_threads';
import { rm } from 'fs/promises';
import ansiColors from 'ansi-colors';

import { HostOptions } from '../../interfaces/HostOptions';
import { downloadTypesArchive } from '../archiveHandler';

interface HostWriteBundle {
  hostOptions: Required<HostOptions>
  mapRemotesToDownload: Record<string, string>
}

if (isMainThread) {
  const piscina = new Piscina({ filename: __filename });

  module.exports = piscina.run.bind(piscina)
} else {
  module.exports = async ({ hostOptions, mapRemotesToDownload }: HostWriteBundle) => {
    if (hostOptions.deleteTypesFolder) {
      await rm(hostOptions.typesFolder, {
        recursive: true,
        force: true,
      }).catch((error) =>
        console.error(
          ansiColors.red(`Unable to remove types folder, ${error}`),
        ),
      );
    }

    const typesDownloader = downloadTypesArchive(hostOptions);
    const downloadPromises =
      Object.entries(mapRemotesToDownload).map(typesDownloader);

    await Promise.allSettled(downloadPromises);
  }
}