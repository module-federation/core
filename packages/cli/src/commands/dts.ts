import path from 'path';
import logger from '../utils/logger';
import {
  isTSProject,
  normalizeDtsOptions,
  generateTypesAPI,
  consumeTypesAPI,
  normalizeGenerateTypesOptions,
  normalizeConsumeTypesOptions,
} from '@module-federation/dts-plugin';
import { bundle } from '@modern-js/node-bundle-require';

import type { DtsOptions } from '../types';
import { moduleFederationPlugin } from '@module-federation/sdk';

export async function dts(
  options: DtsOptions,
  { defaultConfig }: { defaultConfig: string },
) {
  const defaultPath = path.resolve(process.cwd(), defaultConfig);
  const {
    fetch = true,
    generate = true,
    root = process.cwd(),
    output,
    config = defaultPath,
  } = options;

  const configPath = path.isAbsolute(config)
    ? config
    : path.resolve(process.cwd(), config);

  const preBundlePath = await bundle(configPath);
  const mfConfig = (await import(preBundlePath)).default
    .default as unknown as moduleFederationPlugin.ModuleFederationPluginOptions;

  if (!isTSProject(mfConfig.dts, root)) {
    logger.error('dts is only supported for TypeScript projects');
    return;
  }

  const normalizedDtsOptions = normalizeDtsOptions(mfConfig, root, {
    defaultGenerateOptions: {
      generateAPITypes: true,
      compileInChildProcess: false,
      abortOnError: true,
      extractThirdParty: false,
      extractRemoteTypes: false,
    },
    defaultConsumeOptions: {
      abortOnError: true,
      consumeAPITypes: true,
    },
  });

  if (!normalizedDtsOptions) {
    logger.error('dts is not enabled in module-federation.config.ts');
    return;
  }

  if (fetch) {
    const dtsManagerOptions = normalizeConsumeTypesOptions({
      context: root,
      dtsOptions: normalizedDtsOptions,
      pluginOptions: mfConfig,
    });
    if (!dtsManagerOptions) {
      logger.warn(
        'dts.consumeTypes is not enabled in module-federation.config.ts, skip fetching remote types',
      );
    } else {
      logger.debug('start fetching remote types...');
      await consumeTypesAPI(dtsManagerOptions);
      logger.debug('fetch remote types success!');
    }
  }

  if (generate) {
    const dtsManagerOptions = normalizeGenerateTypesOptions({
      context: root,
      outputDir: output,
      dtsOptions: normalizedDtsOptions,
      pluginOptions: mfConfig,
    });
    if (!dtsManagerOptions) {
      logger.warn(
        'dts.generateTypes is not enabled in module-federation.config.ts, skip generating types',
      );
      return;
    }

    logger.debug('start generating types...');
    await generateTypesAPI({ dtsManagerOptions });
    logger.debug('generate types success!');
  }
}
