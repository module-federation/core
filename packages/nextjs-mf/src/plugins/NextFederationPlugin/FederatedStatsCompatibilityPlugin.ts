import type { Compiler, WebpackPluginInstance } from 'webpack';
import {
  getManifestFileName,
  simpleJoinRemoteEntry,
  type Manifest,
  type moduleFederationPlugin,
} from '@module-federation/sdk';

type FederatedStatsCompatibilityPluginOptions = {
  filenames: string[];
  manifest: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'];
};

export const createFederatedStats = (manifest: Manifest) => {
  const exposes: Record<string, string[]> = {};

  for (const expose of manifest.exposes) {
    exposes[expose.path || `./${expose.name}`] = [
      ...expose.assets.js.sync,
      ...expose.assets.css.sync,
    ];
  }

  return {
    sharedModules: [],
    federatedModules: [
      {
        remote: manifest.name,
        entry: simpleJoinRemoteEntry(
          manifest.metaData.remoteEntry.path,
          manifest.metaData.remoteEntry.name,
        ),
        sharedModules: [],
        exposes,
        remoteModules: {},
      },
    ],
  };
};

export class FederatedStatsCompatibilityPlugin implements WebpackPluginInstance {
  private readonly options: FederatedStatsCompatibilityPluginOptions;

  constructor(options: FederatedStatsCompatibilityPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'FederatedStatsCompatibilityPlugin',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'FederatedStatsCompatibilityPlugin',
            stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            const manifestFilename = getManifestFileName(
              this.options.manifest,
            ).manifestFileName;
            const manifestAsset = compilation.getAsset(manifestFilename);
            if (!manifestAsset) {
              throw new Error(
                `Cannot emit federated-stats.json because ${manifestFilename} was not generated`,
              );
            }

            const manifest = JSON.parse(
              manifestAsset.source.source().toString(),
            ) as Manifest;
            const source = new compiler.webpack.sources.RawSource(
              JSON.stringify(createFederatedStats(manifest)),
            );

            for (const filename of this.options.filenames) {
              if (compilation.getAsset(filename)) {
                compilation.updateAsset(filename, source);
              } else {
                compilation.emitAsset(filename, source);
              }
            }
          },
        );
      },
    );
  }
}
