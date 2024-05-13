import _path from 'path';
import { bundle } from '../utils/build-utils';
import {
  createBuildResultMap,
  lookupInResultMap,
} from '../utils/build-result-map';
import { logger } from '../utils/logger';
import { normalize } from '../utils/normalize';
import fs from 'fs';
import path from 'path';
import { createContainerCode } from './createContainerTemplate';
import {
  collectExports,
  getExports,
  resolve,
} from '../../adapters/lib/collect-exports';

const virtualModule = (options = {}) => {
  const namespace = 'virtual';
  const filter = new RegExp(
    Object.keys(options)
      .map((name) => `^${name}$`)
      .join('|'),
  );
  return {
    name: namespace,
    setup(build) {
      build.onResolve({ filter }, (args) => ({ path: args.path, namespace }));
      build.onLoad({ filter: /.*/, namespace }, (args) => ({
        contents: options[args.path],
        loader: 'js',
      }));
    },
  };
};

function createVirtualModuleShare(name, ref, exports) {
  const code = `
// find this FederationHost instance.
console.log(__FEDERATION__.__INSTANCES__[0],${JSON.stringify(
    name,
  )}, ${JSON.stringify(ref)})

// Each virtual module needs to know what FederationHost to connect to for loading modules
const container = __FEDERATION__.__INSTANCES__.find(container=>{
  return container.name === ${JSON.stringify(name)}
}) || __FEDERATION__.__INSTANCES__[0]

// Federation Runtime takes care of script injection
const mfLsZJ92 = await container.loadShare(${JSON.stringify(ref)})

${exports
  .map((e) => {
    if (e === 'default') return `export default mfLsZJ92.default`;
    return `export const ${e} = mfLsZJ92[${JSON.stringify(e)}];`;
  })
  .join('\n')}
`;
  return code;
}

export const buildContainerHost = (config) => {
  const { name, remotes = {}, shared = {}, exposes = {} } = config;

  const remoteConfigs = remotes
    ? Object.entries(remotes).map(([remoteAlias, remote]) => ({
        type: 'esm',
        name: remoteAlias,
        entry: remote.entry,
        alias: remoteAlias,
      }))
    : [];

  const shareConfig =
    Object.entries(shared).reduce((acc, [pkg, config]) => {
      const version = config.requiredVersion?.replace(/^[^0-9]/, '') || '';

      // const referencedChunk = federationBuilder.federationInfo.shared.find((chunk)=>{
      //  return chunk.packageName === pkg
      // })

      // const relPath = path.resolve(outputPath,'mf_' + referencedChunk.outFileName)

      acc += `${JSON.stringify(pkg)}: {
        "package": "${pkg}",
        "version": "${version}",
        "scope": "default",
        "get": async () => import('federationShare/${pkg}'),
        "shareConfig": {
          "singleton": ${config.singleton},
          "requiredVersion": "${config.requiredVersion}",
          "eager": ${config.eager},
          "strictVersion": ${config.strictVersion}
        }
      },\n`;

      return acc;
    }, '{') + '}';

  const exposesConfig =
    Object.entries(exposes).reduce((acc, [exposeName, exposePath]) => {
      acc += `${JSON.stringify(
        exposeName,
      )}: async () => await import('${exposePath}'),\n`;
      return acc;
    }, '{') + '}';

  const injectedContent = `
    const createdContainer = await createContainer({
      name: ${JSON.stringify(name)},
      exposes: ${exposesConfig},
      remotes: ${JSON.stringify(remoteConfigs)},
      shared: ${shareConfig},
    });

    export const get = createdContainer.get
    export const init = createdContainer.init
  `;
  return [createContainerCode, injectedContent].join('\n');
};

export async function bundleExposedAndMappings(config, fedOptions, externals) {
  const shared = config.sharedMappings.map((sm) => {
    const entryPoint = sm.path;
    const tmp = sm.key.replace(/[^A-Za-z0-9]/g, '_');
    const outFilePath = tmp + '.js';
    return { fileName: entryPoint, outName: outFilePath, key: sm.key };
  });

  const exposes = Object.keys(config.exposes).map((key) => {
    const entryPoint = config.exposes[key];
    const outFilePath = key + '.js';
    return { fileName: entryPoint, outName: outFilePath, key };
  });

  const cachePath = path.join(
    fedOptions.workspaceRoot,
    'node_modules/.cache/native-federation',
  );
  const virtualRemote = path.join(cachePath, 'remoteEntry.js');
  fs.mkdirSync(cachePath, {
    recursive: true,
  });

  // fs.writeFileSync(virtualRemote, [createContainerCode,buildContainerHost(fedOptions.outputPath)].join('\n'), 'utf-8')

  const entryPoints = [
    { fileName: './remoteEntry', outName: 'remoteEntry' },
    ...exposes,
  ];
  const hash = !fedOptions.dev;
  logger.info('Building federation artefacts');
  const esmResolve = (await eval("import('./resolve/esm-resolver.mjs')"))
    .default;
  collectExports;
  const result = await bundle({
    entryPoints,
    outdir: fedOptions.outputPath,
    tsConfigPath: fedOptions.tsConfig,
    external: externals,
    dev: true,
    watch: fedOptions.watch,
    mappedPaths: config.sharedMappings,
    kind: 'mapping-or-exposed',
    hash,
    name: config.name,
    plugins: [
      {
        name: 'createContainer',
        setup(build) {
          const filter = new RegExp(
            ['remoteEntry'].map((name) => `${name}$`).join('|'),
          );

          build.onResolve({ filter: filter }, async (args) => {
            return {
              path: args.path,
              namespace: 'container',
              pluginData: { kind: args.kind, resolveDir: args.resolveDir },
            };
          });

          build.onLoad({ filter, namespace: 'container' }, async (args) => {
            const code = [buildContainerHost(config)].join('\n');
            return {
              contents: code,
              loader: 'js',
              resolveDir: args.pluginData.resolveDir,
            };
          });
        },
      },
      {
        name: 'cjs-to-esm',
        setup(build) {
          const sharedExternals = new RegExp(
            externals.map((name) => `${name}$`).join('|'),
          );
          build.onResolve({ filter: /.*/, namespace: 'esm-shares' }, (args) => {
            const shouldExternalize = sharedExternals.test(args.path);
            if (shouldExternalize) {
              return {
                path: args.path,
                namespace: 'virtual-share-module',
                pluginData: { kind: args.kind, resolveDir: args.resolveDir },
              };
            }
            return {
              path: args.path,
              namespace: 'esm-shares',
              pluginData: { kind: args.kind, resolveDir: args.resolveDir },
            };
          });

          build.onLoad(
            { filter: /.*/, namespace: 'esm-shares' },
            async (args) => {
              const { transform } = await eval("import('@chialab/cjs-to-esm')");

              const resolver = await resolve(
                args.pluginData.resolveDir,
                args.path,
              );

              const fileContent = fs.readFileSync(resolver, 'utf-8');
              const { code } = await transform(fileContent);

              return {
                contents: code,
                loader: 'js',
                resolveDir: path.dirname(resolver),
                pluginData: { ...args.pluginData, path: resolver },
              };
            },
          );
        },
      },
      {
        name: 'linkShared',
        setup(build) {
          const filter = new RegExp(
            externals.map((name) => `${name}$`).join('|'),
          );

          const realShares = new RegExp(
            ['federationShare'].map((name) => `^${name}`).join('|'),
          );

          build.onResolve({ filter: realShares }, async (args) => {
            return {
              path: args.path.replace('federationShare/', ''),
              namespace: 'esm-shares',
              pluginData: { kind: args.kind, resolveDir: args.resolveDir },
            };
          });

          build.onResolve({ filter: filter }, (args) => {
            if (args.namespace === 'esm-shares') return null;

            return {
              path: args.path,
              namespace: 'virtual-share-module',
              pluginData: { kind: args.kind, resolveDir: args.resolveDir },
            };
          });

          build.onLoad(
            { filter, namespace: 'virtual-share-module' },
            async (args) => {
              const exp = await getExports(args.path);
              const virtualShare = createVirtualModuleShare(
                config.name,
                args.path,
                exp,
              );
              return {
                contents: virtualShare,
                loader: 'js',
                resolveDir: path.dirname(args.path),
              };
            },
          );
        },
      },
    ],
  });

  // Use result to go over the output files and write them the same way esbuild would
  // for (const file of result) {
  //   fs.writeFileSync(path.join(fedOptions.outputPath, file.path), file.text);
  // }

  const resultMap = createBuildResultMap(result, hash);

  const sharedResult = [];
  for (const item of shared) {
    sharedResult.push({
      packageName: item.key,
      outFileName: lookupInResultMap(resultMap, item.outName),
      requiredVersion: '',
      singleton: true,
      strictVersion: false,
      version: '',
      dev: !fedOptions.dev
        ? undefined
        : {
            entryPoint: normalize(_path.normalize(item.fileName)),
          },
    });
  }

  const exposedResult = [];
  for (const item of exposes) {
    exposedResult.push({
      key: item.key,
      outFileName: lookupInResultMap(resultMap, item.outName),
      dev: !fedOptions.dev
        ? undefined
        : {
            entryPoint: normalize(
              _path.join(fedOptions.workspaceRoot, item.fileName),
            ),
          },
    });
  }

  return { mappings: sharedResult, exposes: exposedResult };
}

export function describeExposed(config, options) {
  const result = [];
  for (const key in config.exposes) {
    const localPath = normalize(
      _path.normalize(_path.join(options.workspaceRoot, config.exposes[key])),
    );
    result.push({
      key,
      outFileName: '',
      dev: !options.dev ? undefined : { entryPoint: localPath },
    });
  }
  return result;
}

export function describeSharedMappings(config, fedOptions) {
  const result = [];
  for (const m of config.sharedMappings) {
    result.push({
      packageName: m.key,
      outFileName: '',
      requiredVersion: '',
      singleton: true,
      strictVersion: false,
      version: '',
      dev: !fedOptions.dev
        ? undefined
        : {
            entryPoint: normalize(_path.normalize(m.path)),
          },
    });
  }
  return result;
}
