import { promises as fs } from 'node:fs';
import util from 'node:util';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { ModuleFederationConfigNormalized } from '../types';

export type FederatedTypesMeta = {
  zipName: string;
  apiFileName: string;
};

export async function maybeGenerateFederatedRemoteTypes(opts: {
  federationConfig: ModuleFederationConfigNormalized;
  projectRoot: string;
  outputDir: string;
  logger: Pick<Console, 'info' | 'warn'>;
}): Promise<FederatedTypesMeta | undefined> {
  const { federationConfig, projectRoot, outputDir, logger } = opts;

  if (federationConfig.dts === false) {
    return;
  }

  const dtsPlugin = await import('@module-federation/dts-plugin');
  const dtsPluginCore = await import('@module-federation/dts-plugin/core');

  // Safer default for Metro: do not fetch remote types unless explicitly configured.
  const dtsConfig =
    federationConfig.dts === true
      ? { consumeTypes: false }
      : typeof federationConfig.dts === 'object' &&
          federationConfig.dts !== null &&
          !Object.prototype.hasOwnProperty.call(
            federationConfig.dts,
            'consumeTypes',
          )
        ? { ...federationConfig.dts, consumeTypes: false }
        : federationConfig.dts;

  const mfOptions: moduleFederationPlugin.ModuleFederationPluginOptions = {
    name: federationConfig.name,
    filename: federationConfig.filename,
    remotes: federationConfig.remotes,
    exposes: federationConfig.exposes,
    shared: federationConfig.shared as any,
    dts: dtsConfig as any,
  };

  const normalizedDtsOptions = dtsPlugin.normalizeDtsOptions(
    mfOptions,
    projectRoot,
    {
      defaultGenerateOptions: {
        generateAPITypes: true,
        compileInChildProcess: false,
        abortOnError: false,
        extractThirdParty: false,
        extractRemoteTypes: false,
      },
      defaultConsumeOptions: {
        abortOnError: true,
        consumeAPITypes: true,
      },
    },
  );

  if (!normalizedDtsOptions) {
    return;
  }

  const dtsManagerOptions = dtsPlugin.normalizeGenerateTypesOptions({
    context: projectRoot,
    outputDir,
    dtsOptions: normalizedDtsOptions,
    pluginOptions: mfOptions,
  });

  if (!dtsManagerOptions) {
    return;
  }

  // If the remote consumes types from other remotes, fetch first so generateTypes can succeed.
  if (dtsManagerOptions.host) {
    let remoteTypeUrls = dtsManagerOptions.host.remoteTypeUrls as any;
    if (typeof remoteTypeUrls === 'function') {
      remoteTypeUrls = await remoteTypeUrls();
    }
    await dtsPluginCore.consumeTypes({
      ...dtsManagerOptions,
      host: {
        ...dtsManagerOptions.host,
        remoteTypeUrls,
      },
    });
  }

  logger.info(`${util.styleText('blue', 'Generating federated types (d.ts)')}`);
  await dtsPlugin.generateTypesAPI({ dtsManagerOptions });

  const { zipTypesPath, apiTypesPath, zipName, apiFileName } =
    dtsPluginCore.retrieveTypesAssetsInfo(dtsManagerOptions.remote);

  const produced: { zipName?: string; apiFileName?: string } = {};
  const fileExists = async (p: string) => {
    try {
      await fs.stat(p);
      return true;
    } catch {
      return false;
    }
  };

  if (zipTypesPath && zipName && (await fileExists(zipTypesPath))) {
    produced.zipName = zipName;
  }
  if (apiTypesPath && apiFileName && (await fileExists(apiTypesPath))) {
    produced.apiFileName = apiFileName;
  }
  if (process.env['FEDERATION_DEBUG']) {
    logger.info(
      `dts debug: zipTypesPath=${zipTypesPath} zipExists=${String(
        Boolean(produced.zipName),
      )} apiTypesPath=${apiTypesPath} apiExists=${String(
        Boolean(produced.apiFileName),
      )}`,
    );
  }

  if (!produced.zipName && !produced.apiFileName) {
    logger.warn(
      `${util.styleText('yellow', 'Federated types enabled, but no types files were produced.')}`,
    );
    return;
  }

  logger.info(
    `Done writing federated types:\n${util.styleText(
      'dim',
      [produced.zipName, produced.apiFileName].filter(Boolean).join('\n'),
    )}`,
  );

  return {
    zipName: produced.zipName ?? '',
    apiFileName: produced.apiFileName ?? '',
  };
}

export function applyTypesMetaToManifest(
  manifest: Record<string, any>,
  typesMeta: FederatedTypesMeta | undefined,
) {
  if (!typesMeta?.zipName && !typesMeta?.apiFileName) {
    return manifest;
  }

  manifest.metaData = manifest.metaData || {};
  manifest.metaData.types = manifest.metaData.types || {};

  if (typesMeta.zipName) {
    manifest.metaData.types.zip = typesMeta.zipName;
  }
  if (typesMeta.apiFileName) {
    manifest.metaData.types.api = typesMeta.apiFileName;
  }

  return manifest;
}
