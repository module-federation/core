import fs from 'fs';
//@ts-ignore
import { resolve, getExports } from './collect-exports.js';
import path from 'path';
import { federationBuilder } from '../../lib/core/federation-builder';
//@ts-ignore
import { writeRemoteManifest } from './manifest.js';
import { createContainerPlugin } from './containerPlugin';
import { initializeHostPlugin } from './containerReference';
import { linkRemotesPlugin } from './linkRemotesPlugin';

// Creates a virtual module for sharing dependencies
export const createVirtualShareModule = (
  name: string,
  ref: string,
  exports: string[],
): string => `
  const container = __FEDERATION__.__INSTANCES__.find(container => container.name === ${JSON.stringify(
    name,
  )}) || __FEDERATION__.__INSTANCES__[0]

  const mfLsZJ92 = await container.loadShare(${JSON.stringify(ref)})

  ${exports
    .map((e) =>
      e === 'default'
        ? `export default mfLsZJ92.default`
        : `export const ${e} = mfLsZJ92[${JSON.stringify(e)}];`,
    )
    .join('\n')}
`;

export const createVirtualRemoteModule = (
  name: string,
  ref: string,
): string => `
export * from ${JSON.stringify('federationRemote/' + ref)}
`;

// Plugin to initialize the federation host

// Plugin to transform CommonJS modules to ESM
const cjsToEsmPlugin = {
  name: 'cjs-to-esm',
  setup(build: any) {
    build.onLoad(
      { filter: /.*/, namespace: 'esm-shares' },
      async (args: any) => {
        const { transform } = await eval("import('@chialab/cjs-to-esm')");
        const resolver = await resolve(args.pluginData.resolveDir, args.path);
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
};

// Plugin to link shared dependencies
const linkSharedPlugin = {
  name: 'linkShared',
  setup(build: any) {
    const filter = new RegExp(
      federationBuilder.externals.map((name: string) => `${name}$`).join('|'),
    );

    build.onLoad(
      { filter, namespace: 'virtual-share-module' },
      async (args: any) => {
        const exp = await getExports(args.path);
        return {
          contents: createVirtualShareModule(
            federationBuilder.config.name,
            args.path,
            exp,
          ),
          loader: 'js',
          resolveDir: path.dirname(args.path),
        };
      },
    );
  },
};

// Main module federation plugin
export const moduleFederationPlugin = (config: any) => ({
  name: 'module-federation',
  setup(build: any) {
    build.initialOptions.metafile = true;

    const pluginStack: any[] = [];
    const remotes = Object.keys(federationBuilder.config.remotes || {}).length;
    const shared = Object.keys(federationBuilder.config.shared || {}).length;
    const exposes = Object.keys(federationBuilder.config.exposes || {}).length;

    if (remotes) {
      pluginStack.push(linkRemotesPlugin);
    }

    if (shared) {
      pluginStack.push(linkSharedPlugin);
    }

    [
      initializeHostPlugin,
      createContainerPlugin(config),
      cjsToEsmPlugin,
      ...pluginStack,
    ].forEach((plugin) => plugin.setup(build));

    build.onEnd(async (result: any) => {
      if (!result.metafile) return;
      if (exposes) {
        const exposedConfig = federationBuilder.config.exposes;
        const remoteFile = (federationBuilder.config as any).filename;
        const exposedEntries: Record<string, any> = {};
        const outputMapWithoutExt = Object.entries(
          result.metafile.outputs,
        ).reduce((acc, [chunkKey, chunkValue]) => {
          //@ts-ignore
          const { entryPoint } = chunkValue;
          const key = entryPoint || chunkKey;
          const trimKey = key.substring(0, key.lastIndexOf('.')) || key;
          //@ts-ignore
          acc[trimKey] = { ...chunkValue, chunk: chunkKey };
          return acc;
        }, {});

        for (const [expose, value] of Object.entries(exposedConfig)) {
          //@ts-ignore
          const exposedFound = outputMapWithoutExt[value.replace('./', '')];

          if (exposedFound) {
            exposedEntries[expose] = {
              entryPoint: exposedFound.entryPoint,
              exports: exposedFound.exports,
            };
          }
        }

        for (const [outputPath, value] of Object.entries(
          result.metafile.outputs,
        )) {
          if (!(value as any).entryPoint) continue;

          if (!(value as any).entryPoint.startsWith('container:')) continue;

          if (!(value as any).entryPoint.endsWith(remoteFile)) continue;

          const container = fs.readFileSync(outputPath, 'utf-8');

          const withExports = container
            .replace('"__MODULE_MAP__"', `${JSON.stringify(exposedEntries)}`)
            .replace("'__MODULE_MAP__'", `${JSON.stringify(exposedEntries)}`);

          fs.writeFileSync(outputPath, withExports, 'utf-8');
        }
      }
      await writeRemoteManifest(federationBuilder.config, result);

      console.log(`build ended with ${result.errors.length} errors`);
    });
  },
});
