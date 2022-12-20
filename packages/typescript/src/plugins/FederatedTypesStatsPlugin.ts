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

      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ANALYSE,
        },
        async () => {
          const { typesIndexJsonFileName, publicPath } = this.options;

          const statsJson: TypesStatsJson = {
            publicPath,
            files: generateTypesStats(federatedTypesMap, this.options),
          };

          const source = new sources.RawSource(JSON.stringify(statsJson));

          const asset = compilation.getAsset(typesIndexJsonFileName);

          if (asset) {
            compilation.updateAsset(typesIndexJsonFileName, source);
          } else {
            compilation.emitAsset(typesIndexJsonFileName, source);
          }
        }
      );
    });
  }
}
