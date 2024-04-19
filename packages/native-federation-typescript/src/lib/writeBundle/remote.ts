import Piscina from 'piscina';
import ts from 'typescript';
import { rm } from 'fs/promises';
import { isMainThread } from 'worker_threads';

import { RemoteOptions } from '../../interfaces/RemoteOptions';
import { compileTs, retrieveMfTypesPath } from '../typeScriptCompiler';
import { createTypesArchive } from '../archiveHandler';

interface RemoteWriteBundle {
  remoteOptions: Required<RemoteOptions>;
  tsConfig: ts.CompilerOptions;
  mapComponentsToExpose: Record<string, string>;
}

if (isMainThread) {
  const piscina = new Piscina({ filename: __filename });

  module.exports = piscina.run.bind(piscina);
} else {
  module.exports = async ({
    remoteOptions,
    tsConfig,
    mapComponentsToExpose,
  }: RemoteWriteBundle) => {
    compileTs(mapComponentsToExpose, tsConfig, remoteOptions);

    await createTypesArchive(tsConfig, remoteOptions);

    if (remoteOptions.deleteTypesFolder) {
      await rm(retrieveMfTypesPath(tsConfig, remoteOptions), {
        recursive: true,
        force: true,
      });
    }
  };
}
