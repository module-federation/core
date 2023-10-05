import { Compilation, Compiler, sources } from 'webpack';
import { generateTypesStats } from '../lib/generateTypesStats';
import fs from 'fs';
import path from 'path';
import { NormalizeOptions } from '../lib/normalizeOptions';
import { CompilationParams, TypesStatsJson } from '../types';

const PLUGIN_NAME = 'FederatedTypesStatsPlugin';

export class FederatedTypesStatsPlugin {
  constructor(private options: NormalizeOptions) {}

  apply(compiler: Compiler) {
    compiler.hooks.afterEmit.tap(PLUGIN_NAME, (compilation) => {
      const federatedTypesMap = (compilation.params as CompilationParams)
        .federated_types;

      const { typesIndexJsonFilePath, publicPath } = this.options;

      const statsJson: TypesStatsJson = {
        publicPath,
        files: generateTypesStats(federatedTypesMap, this.options),
      };

      const source = new sources.RawSource(JSON.stringify(statsJson));

      const asset = compilation.getAsset(typesIndexJsonFilePath);

      const dest = path.join(compiler.outputPath, typesIndexJsonFilePath);

      const writeStream = fs.createWriteStream(dest);
      writeStream.write(JSON.stringify(statsJson));
      writeStream.end();
    });
  }
}
