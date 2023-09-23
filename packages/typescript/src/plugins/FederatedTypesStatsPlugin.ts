import { Compilation, Compiler, sources } from 'webpack';
import { generateTypesStats } from '../lib/generateTypesStats';

import { NormalizeOptions } from '../lib/normalizeOptions';
import { CompilationParams, TypesStatsJson } from '../types';

const PLUGIN_NAME = 'FederatedTypesStatsPlugin';

export class FederatedTypesStatsPlugin {
  constructor(private options: NormalizeOptions) {}

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation, params) => {
      const federatedTypesMap = (params as CompilationParams).federated_types;

      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ANALYSE,
        },
        () => {
          const { typesIndexJsonFilePath, publicPath } = this.options;

          const statsJson: TypesStatsJson = {
            publicPath,
            files: generateTypesStats(federatedTypesMap, this.options),
          };

          const source = new sources.RawSource(JSON.stringify(statsJson));

          const asset = compilation.getAsset(typesIndexJsonFilePath);

          if (asset) {
            compilation.updateAsset(typesIndexJsonFilePath, source);
          } else {
            compilation.emitAsset(typesIndexJsonFilePath, source);
          }
        },
      );
    });
  }
}
