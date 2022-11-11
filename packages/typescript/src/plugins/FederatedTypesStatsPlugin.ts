import { Compilation, Compiler, sources } from 'webpack';
import { generateTypesStats } from '../lib/generateTypesStats';

import { NormalizeOptions } from '../lib/normalizeOptions';
import { CompilationParams, TypesStatsJson } from '../types';

const PLUGIN_NAME = 'FederatedTypesStatsPlugin';

export class FederatedTypesStatsPlugin {
  constructor(private options: NormalizeOptions) {}

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation, params) => {
      const federatedTypesMap = (params as CompilationParams).federated_types;

      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ANALYSE,
        },
        async () => {
          const { typesStatsFileName, publicPath } = this.options;

          const statsJson: TypesStatsJson = {
            publicPath,
            files: generateTypesStats(federatedTypesMap, this.options),
          };

          const source = new sources.RawSource(JSON.stringify(statsJson));

          const asset = compilation.getAsset(typesStatsFileName);

          if (asset) {
            compilation.updateAsset(typesStatsFileName, source);
          } else {
            compilation.emitAsset(typesStatsFileName, source);
          }
        }
      );
    });
  }
}
