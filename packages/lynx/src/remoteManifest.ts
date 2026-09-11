import { getManifestFileName } from '@module-federation/sdk';
import type {
  Compiler,
  ModuleFederationPluginOptions,
  WebpackPluginInstance,
} from '@rspack/core';

import { MAIN_THREAD_EXPOSE_SUFFIX } from './runtimeCore';

interface RemoteEntryRecord extends Record<string, unknown> {
  name: string;
  path: string;
  type: string;
}

interface FederationMetadata extends Record<string, unknown> {
  remoteEntry: RemoteEntryRecord;
}

interface FederationManifest extends Record<string, unknown> {
  exposes?: unknown;
  metaData: FederationMetadata;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseManifest = (
  source: string,
  assetName: string,
): FederationManifest => {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    throw new Error(
      `@module-federation/lynx could not parse generated manifest asset "${assetName}".`,
    );
  }

  if (
    !isRecord(value) ||
    !isRecord(value.metaData) ||
    !isRecord(value.metaData.remoteEntry)
  ) {
    throw new Error(
      `@module-federation/lynx generated manifest asset "${assetName}" has no metaData.remoteEntry.`,
    );
  }

  return value as FederationManifest;
};

const getBundleResource = (
  bundleFileName: string,
): Pick<RemoteEntryRecord, 'name' | 'path' | 'type'> => {
  const lastSlash = bundleFileName.lastIndexOf('/');
  return {
    path: lastSlash === -1 ? '' : bundleFileName.slice(0, lastSlash + 1),
    name: bundleFileName.slice(lastSlash + 1),
    type: 'lynx',
  };
};

export const retargetRemoteEntry = (
  source: string,
  assetName: string,
  bundleFileName: string,
): string => {
  const manifest = parseManifest(source, assetName);
  manifest.metaData.remoteEntry = {
    ...manifest.metaData.remoteEntry,
    ...getBundleResource(bundleFileName),
  };
  if (Array.isArray(manifest.exposes)) {
    const exposes = manifest.exposes.filter(
      (expose) =>
        !isRecord(expose) ||
        ![expose.name, expose.path].some(
          (value) =>
            typeof value === 'string' &&
            value.endsWith(MAIN_THREAD_EXPOSE_SUFFIX),
        ),
    );
    manifest.exposes = exposes;
    for (const expose of exposes) {
      if (!isRecord(expose) || !isRecord(expose.assets)) {
        continue;
      }

      for (const type of ['js', 'css']) {
        const assets = expose.assets[type];
        if (isRecord(assets)) {
          expose.assets[type] = { ...assets, sync: [], async: [] };
        }
      }
    }
  }
  return JSON.stringify(manifest, null, 2);
};

export const createLynxRemoteManifestPlugin = (
  manifest: ModuleFederationPluginOptions['manifest'],
  bundleFileName: string,
): WebpackPluginInstance => {
  const { manifestFileName, statsFileName } = getManifestFileName(manifest);
  const assetNames = [manifestFileName, statsFileName];

  return {
    apply(compiler: Compiler) {
      const pluginName = 'LynxModuleFederationRemoteManifest';
      compiler.hooks.emit.tap(pluginName, (compilation) => {
        for (const assetName of assetNames) {
          const asset = compilation.getAsset(assetName);
          if (!asset) {
            const emittedAssets = compilation
              .getAssets()
              .map(({ name }) => name)
              .sort()
              .join(', ');
            throw new Error(
              `@module-federation/lynx could not find generated manifest asset "${assetName}". Emitted assets: ${emittedAssets || '(none)'}.`,
            );
          }
          compilation.updateAsset(
            assetName,
            new compiler.webpack.sources.RawSource(
              retargetRemoteEntry(
                asset.source.source().toString(),
                assetName,
                bundleFileName,
              ),
            ),
          );
        }
      });
    },
  };
};
