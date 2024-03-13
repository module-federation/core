import ansiColors from 'ansi-colors';
import { rm } from 'fs/promises';
import { retrieveRemoteConfig } from '../configurations/remotePlugin';
import { createTypesArchive, downloadTypesArchive } from './archiveHandler';
import { compileTs, retrieveMfTypesPath } from './typeScriptCompiler';
import { retrieveHostConfig } from '../configurations/hostPlugin';
import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';

class DTSManager {
  options: DTSManagerOptions;

  constructor(options: DTSManagerOptions) {
    this.options = options;
  }

  async generateTypes() {
    try {
      const { options } = this;
      if (!options.remote) {
        throw new Error(
          'options.remote is required if you want to generateTypes',
        );
      }
      const { remoteOptions, tsConfig, mapComponentsToExpose } =
        retrieveRemoteConfig(options.remote);
      compileTs(mapComponentsToExpose, tsConfig, remoteOptions);

      await createTypesArchive(tsConfig, remoteOptions);

      if (remoteOptions.deleteTypesFolder) {
        await rm(retrieveMfTypesPath(tsConfig, remoteOptions), {
          recursive: true,
          force: true,
        });
      }
      console.log(ansiColors.green('Federated types created correctly'));
    } catch (error) {
      console.error(
        ansiColors.red(`Unable to compile federated types, ${error}`),
      );
    }
  }

  async consumeTypes() {
    const { options } = this;
    if (!options.host) {
      throw new Error('options.host is required if you want to consumeTypes');
    }
    const { hostOptions, mapRemotesToDownload } = retrieveHostConfig(
      options.host,
    );

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
    console.log(ansiColors.green('Federated types extraction completed'));
  }
}

export { DTSManager };
