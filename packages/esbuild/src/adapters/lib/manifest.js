const fs = require('fs');
const path = require('path');
import { resolve } from './collect-exports.js';

export const writeRemoteManifest = async (config, result) => {
  let packageJson;

  try {
    packageJson = await resolve(process.cwd(), '/package.json');
  } catch (e) {
    packageJson = { name: config.name };
  }

  const mfConfig = config;
  const envType =
    process.env.NODE_ENV === 'development' ? 'local' : process.env.NODE_ENV;
  const publicPath = config.publicPath || 'auto';
  const pluginVersion =
    require('@module-federation/esbuild/package.json').version;
  let containerName;

  const outputMap = Object.entries(result.metafile.outputs).reduce(
    (acc, [chunkKey, chunkValue]) => {
      const { entryPoint } = chunkValue;
      const key = entryPoint || chunkKey;
      if (key.startsWith('container:') && key.endsWith(mfConfig.filename)) {
        containerName = key;
      }
      acc[key] = { ...chunkValue, chunk: chunkKey };
      return acc;
    },
    {},
  );

  const outputMapWithoutExt = Object.entries(result.metafile.outputs).reduce(
    (acc, [chunkKey, chunkValue]) => {
      const { entryPoint } = chunkValue;
      const key = entryPoint || chunkKey;
      const trimKey = key.substring(0, key.lastIndexOf('.')) || key;
      acc[trimKey] = { ...chunkValue, chunk: chunkKey };
      return acc;
    },
    {},
  );

  const getChunks = (meta, outputMap) => {
    const assets = {
      js: { async: [], sync: [] },
      css: { async: [], sync: [] },
    };

    if (meta?.imports) {
      meta.imports.forEach((imp) => {
        const importMeta = outputMap[imp.path];
        if (importMeta && importMeta.kind !== 'dynamic-import') {
          const childAssets = getChunks(importMeta, outputMap);
          assets.js.async.push(...childAssets.js.async);
          assets.js.sync.push(...childAssets.js.sync);
          assets.css.async.push(...childAssets.css.async);
          assets.css.sync.push(...childAssets.css.sync);
        }
      });

      const assetType = meta.chunk.endsWith('.js') ? 'js' : 'css';
      const syncOrAsync = meta.kind === 'dynamic-import' ? 'async' : 'sync';
      assets[assetType][syncOrAsync].push(meta.chunk);
    }
    return assets;
  };

  const shared = await Promise.all(
    Object.entries(mfConfig.shared).map(async ([pkg, config]) => {
      const meta = outputMap['esm-shares:' + pkg];
      const chunks = getChunks(meta, outputMap);
      let { version } = config;

      if (!version) {
        try {
          const packageJsonPath = await resolve(
            process.cwd(),
            `${pkg}/package.json`,
          );
          version = JSON.parse(
            fs.readFileSync(packageJsonPath, 'utf-8'),
          ).version;
        } catch (e) {
          console.warn(
            `Can't resolve ${pkg} version automatically, consider setting "version" manually`,
          );
        }
      }

      return {
        id: `${mfConfig.name}:${pkg}`,
        name: pkg,
        version: version || config.version,
        singleton: config.singleton || false,
        requiredVersion: config.requiredVersion || '*',
        assets: chunks,
      };
    }),
  );

  const remotes = Object.entries(mfConfig.remotes).map(([alias, remote]) => {
    if (remote.includes('@')) {
      const [federationContainerName, entry] = remote.split('@');
      return {
        federationContainerName,
        moduleName: '',
        alias,
        entry,
      };
    } else {
      return {
        federationContainerName: alias,
        moduleName: '',
        alias,
        entry: remote,
      };
    }
  });

  const exposes = await Promise.all(
    Object.entries(mfConfig.exposes).map(([expose, value]) => {
      const exposedFound = outputMapWithoutExt[value.replace('./', '')];
      const chunks = getChunks(exposedFound, outputMap);

      return {
        id: `${mfConfig.name}:${expose.replace(/^\.\//, '')}`,
        name: expose.replace(/^\.\//, ''),
        assets: chunks,
        path: expose,
      };
    }),
  );

  const types = {
    path: '',
    name: '',
    zip: '@mf-types.zip',
    api: '@mf-types.d.ts',
  };

  const manifest = {
    id: mfConfig.name,
    name: mfConfig.name,
    metaData: {
      name: mfConfig.name,
      type: 'app',
      buildInfo: {
        buildVersion: envType,
        buildName: packageJson.name.replace(/[^a-zA-Z0-9]/g, '_'),
      },
      remoteEntry: {
        name: mfConfig.filename,
        path: path.dirname(outputMap[containerName].chunk),
        type: 'esm',
      },
      types,
      globalName: mfConfig.name,
      pluginVersion,
      publicPath,
    },
    shared,
    remotes,
    exposes,
  };

  const manifestPath = path.join(
    path.dirname(outputMap[containerName].chunk),
    'mf-manifest.json',
  );
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
};
