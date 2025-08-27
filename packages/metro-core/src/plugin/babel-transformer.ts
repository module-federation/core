import fs from 'node:fs';
import path from 'node:path';
import type { ModuleFederationConfigNormalized } from '../types';

interface CreateBabelTransformerOptions {
  blacklistedPaths: string[];
  federationConfig: ModuleFederationConfigNormalized;
  originalBabelTransformerPath: string;
  tmpDirPath: string;
  enableInitializeCorePatching: boolean;
  enableRuntimeRequirePatching: boolean;
}

export function createBabelTransformer({
  blacklistedPaths,
  federationConfig,
  originalBabelTransformerPath,
  tmpDirPath,
  enableInitializeCorePatching,
  enableRuntimeRequirePatching,
}: CreateBabelTransformerOptions) {
  const outputPath = path.join(tmpDirPath, 'babel-transformer.js');
  const templatePath = require.resolve('../babel/transformer.js');
  const transformerTemplate = fs.readFileSync(templatePath, 'utf-8');

  const plugins = [
    [
      '@module-federation/metro/babel-plugin',
      {
        blacklistedPaths,
        remotes: federationConfig.remotes,
        shared: federationConfig.shared,
      },
    ],
    enableInitializeCorePatching
      ? '@module-federation/metro/babel-plugin/patch-initialize-core'
      : undefined,
    enableRuntimeRequirePatching
      ? '@module-federation/metro/babel-plugin/patch-require'
      : undefined,
  ].filter(Boolean);

  const babelTransformer = transformerTemplate
    .replaceAll('__BABEL_TRANSFORMER_PATH__', originalBabelTransformerPath)
    .replaceAll('__BABEL_PLUGINS__', JSON.stringify(plugins));

  fs.writeFileSync(outputPath, babelTransformer, 'utf-8');

  return outputPath;
}
