import fs from 'node:fs';
import path from 'node:path';
import type { Manifest, StatsAssets } from '@module-federation/sdk';
import type { ModuleFederationConfigNormalized } from '../types';
import { MANIFEST_FILENAME } from './constants';

export function createManifest(
  options: ModuleFederationConfigNormalized,
  mfMetroPath: string,
) {
  const manifestPath = path.join(mfMetroPath, MANIFEST_FILENAME);
  const manifest = generateManifest(options);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, undefined, 2));
  return manifestPath;
}

export const updateManifest = (
  manifestPath: string,
  options: ModuleFederationConfigNormalized,
): string => {
  const manifest = generateManifest(options);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, undefined, 2));
  return manifestPath;
};

function generateManifest(config: ModuleFederationConfigNormalized): Manifest {
  return {
    id: config.name,
    name: config.name,
    metaData: generateMetaData(config),
    exposes: generateExposes(config),
    remotes: generateRemotes(config),
    shared: generateShared(config),
  };
}

function generateMetaData(
  config: ModuleFederationConfigNormalized,
): Manifest['metaData'] {
  return {
    name: config.name,
    type: 'app',
    buildInfo: {
      buildVersion: '1.0.0',
      buildName: config.name,
    },
    remoteEntry: {
      name: config.filename,
      path: '',
      type: 'global',
    },
    types: {
      path: '',
      name: '',
      api: '',
      zip: '',
    },
    globalName: config.name,
    pluginVersion: '',
    publicPath: 'auto',
  };
}

function generateExposes(
  config: ModuleFederationConfigNormalized,
): Manifest['exposes'] {
  return Object.keys(config.exposes).map((expose) => {
    const formatKey = expose.replace('./', '');
    const assets = getEmptyAssets();

    assets.js.sync.push(config.exposes[expose]);

    return {
      id: `${config.name}:${formatKey}`,
      name: formatKey,
      path: expose,
      assets,
    };
  });
}

function generateRemotes(
  config: ModuleFederationConfigNormalized,
): Manifest['remotes'] {
  return Object.keys(config.remotes).map((remote) => ({
    federationContainerName: config.remotes[remote],
    moduleName: remote,
    alias: remote,
    entry: '*',
  }));
}

function generateShared(
  config: ModuleFederationConfigNormalized,
): Manifest['shared'] {
  return Object.keys(config.shared).map((sharedName) => {
    const assets = getEmptyAssets();

    if (config.shared[sharedName].eager) {
      assets.js.sync.push(config.filename);
    } else if (config.shared[sharedName].import !== false) {
      assets.js.sync.push(`shared/${sharedName}.bundle`);
    }

    return {
      id: sharedName,
      name: sharedName,
      version: getManifestVersion(config.shared[sharedName].version),
      requiredVersion: getManifestRequiredVersion(
        config.shared[sharedName].requiredVersion,
      ),
      singleton: config.shared[sharedName].singleton,
      hash: '',
      assets,
    };
  });
}

function getManifestVersion(version: unknown): string {
  return typeof version === 'string' ? version : '';
}

function getManifestRequiredVersion(requiredVersion: unknown): string {
  return typeof requiredVersion === 'string' ? requiredVersion : '*';
}

function getEmptyAssets(): StatsAssets {
  return {
    js: {
      sync: [],
      async: [],
    },
    css: {
      sync: [],
      async: [],
    },
  };
}
