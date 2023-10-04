import { rm } from 'fs/promises';
import { join } from 'path';

import { HostOptions } from '../interfaces/HostOptions';

export const cleanMocksFolder = async (
  hostOptions: Required<HostOptions>,
  remotesList: string[],
) => {
  const deletePromises = remotesList.map((path) => {
    const folderToDelete = join(hostOptions.mocksFolder, path);
    return rm(folderToDelete, { recursive: true, force: true });
  });

  return Promise.allSettled(deletePromises);
};
