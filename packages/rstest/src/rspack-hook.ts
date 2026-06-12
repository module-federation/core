import type { EnvironmentConfig, Rspack } from '@rsbuild/core';

export type RspackConfigPatcher = (rspackConfig: Rspack.Configuration) => void;

export const appendRspackHook = (
  config: EnvironmentConfig,
  patchRspackConfig: RspackConfigPatcher,
): void => {
  config.tools ||= {};

  const existing = config.tools.rspack;
  if (!existing) {
    config.tools.rspack = patchRspackConfig;
    return;
  }

  config.tools.rspack = Array.isArray(existing)
    ? [...existing, patchRspackConfig]
    : [existing, patchRspackConfig];
};

export const applyNodeRspackDefaults = (
  rspackConfig: Rspack.Configuration,
): void => {
  rspackConfig.target = 'async-node';
  rspackConfig.optimization ??= {};
  rspackConfig.optimization.splitChunks = false;

  rspackConfig.experiments ??= {};
  rspackConfig.experiments.outputModule = false;
  rspackConfig.output ??= {};
  rspackConfig.output.module = false;
};
