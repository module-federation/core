import type { Rspack } from '@rsbuild/core';
import { logger } from './logger';

const isNodeTarget = (target: Rspack.Configuration['target']): boolean => {
  const targets = Array.isArray(target) ? target : [target];
  return targets.some(
    (value) =>
      typeof value === 'string' &&
      (value === 'async-node' || value === 'node' || /^node\d/.test(value)),
  );
};

const formatConfigValue = (value: unknown): string =>
  typeof value === 'string'
    ? `"${value}"`
    : (JSON.stringify(value) ?? String(value));

export const applyNodeRspackDefaults = (
  rspackConfig: Rspack.Configuration,
): void => {
  if (rspackConfig.target != null && !isNodeTarget(rspackConfig.target)) {
    logger.warn(
      `target ${formatConfigValue(rspackConfig.target)} may not support Node federation chunk loading; use "async-node" unless the custom target is intentional.`,
    );
  }
  rspackConfig.target = 'async-node';

  if (rspackConfig.output?.module === true) {
    logger.warn(
      'output.module is enabled, but Rstest federation requires its CommonJS worker loader; it is overridden with false.',
    );
  }

  const chunkLoading = rspackConfig.output?.chunkLoading;
  if (
    chunkLoading != null &&
    chunkLoading !== 'async-node' &&
    chunkLoading !== 'require'
  ) {
    logger.warn(
      `output.chunkLoading ${formatConfigValue(chunkLoading)} is incompatible with Node federation test workers; it is overridden with "async-node".`,
    );
  }

  rspackConfig.output ??= {};
  rspackConfig.output.module = false;
  rspackConfig.output.chunkLoading = 'async-node';

  rspackConfig.experiments ??= {};
  // `experiments.outputModule` only exists on rspack/rsbuild 1.x (the peer
  // range still allows it); there `output.module` alone is not enough when
  // the experiment is enabled. On 2.x the assignment is a harmless no-op.
  (rspackConfig.experiments as { outputModule?: boolean }).outputModule = false;
};
