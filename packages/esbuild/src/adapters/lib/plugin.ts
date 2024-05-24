import fs from 'fs';
import { resolve, getExports } from './collect-exports.js';
import path from 'path';
import { federationBuilder } from '../../lib/core/federation-builder';
import { writeRemoteManifest } from './manifest.js';
import { createContainerPlugin } from './containerPlugin';
import { initializeHostPlugin } from './containerReference';
import { linkRemotesPlugin } from './linkRemotesPlugin';
import {
  BuildOptions,
  PluginBuild,
  Plugin,
  OnResolveArgs,
  OnLoadArgs,
} from 'esbuild';

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

// Plugin to transform CommonJS modules to ESM
const cjsToEsmPlugin: Plugin = {
  name: 'cjs-to-esm',
  setup(build: PluginBuild) {
    build.onLoad(
      { filter: /.*/, namespace: 'esm-shares' },
      async (args: OnLoadArgs) => {
        const { transform } = await import('@chialab/cjs-to-esm');
        const resolver = await resolve(args.pluginData.resolveDir, args.path);
        if (typeof resolver !== 'string') {
          throw new Error(`Unable to resolve path: ${args.path}`);
        }
        const fileContent = fs.readFileSync(resolver, 'utf-8');
        try {
          const result = await transform(fileContent);
          if (result) {
            const { code } = result;
            return {
              contents: code,
              loader: 'js',
              resolveDir: path.dirname(resolver),
              pluginData: { ...args.pluginData, path: resolver },
            };
          }
        } catch {
          return {
            contents: fileContent,
            loader: 'js',
            resolveDir: path.dirname(resolver),
            pluginData: { ...args.pluginData, path: resolver },
          };
        }

        return undefined;
      },
    );
  },
};

// Plugin to link shared dependencies
const linkSharedPlugin: Plugin = {
  name: 'linkShared',
  setup(build: PluginBuild) {
    const filter = new RegExp(
      Object.keys(federationBuilder.config.shared || {})
        .map((name: string) => `${name}$`)
        .join('|'),
    );

    build.onResolve({ filter }, (args: OnResolveArgs) => {
      if (args.namespace === 'esm-shares') return null;
      return {
        path: args.path,
        namespace: 'virtual-share-module',
        pluginData: { kind: args.kind, resolveDir: args.resolveDir },
      };
    });

    build.onResolve(
      { filter: /.*/, namespace: 'esm-shares' },
      (args: OnResolveArgs) => {
        if (filter.test(args.path)) {
          return {
            path: args.path,
            namespace: 'virtual-share-module',
            pluginData: { kind: args.kind, resolveDir: args.resolveDir },
          };
        }

        if (filter.test(args.importer)) {
          return {
            path: args.path,
            namespace: 'esm-shares',
            pluginData: { kind: args.kind, resolveDir: args.resolveDir },
          };
        }
        return {
          path: args.path,
          namespace: 'file',
          pluginData: { kind: args.kind, resolveDir: args.resolveDir },
        };
      },
    );

    build.onResolve(
      { filter: /^federationShare/ },
      async (args: OnResolveArgs) => ({
        path: args.path.replace('federationShare/', ''),
        namespace: 'esm-shares',
        pluginData: { kind: args.kind, resolveDir: args.resolveDir },
      }),
    );

    build.onLoad(
      { filter, namespace: 'virtual-share-module' },
      async (args: OnLoadArgs) => {
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

async function processRemoteFileOutput(result: any, federationBuilder: any) {
  if (!result.metafile) return;
  if (federationBuilder.config.exposes) {
    const exposedConfig = federationBuilder.config.exposes || {};
    const remoteFile = (federationBuilder.config as any).filename;
    const exposedEntries: Record<
      string,
      { entryPoint: string; exports: string[] }
    > = {};
    const outputMapWithoutExt = Object.entries(result.metafile.outputs).reduce(
      (acc, [chunkKey, chunkValue]) => {
        const { entryPoint } = chunkValue as { entryPoint: string };
        const key = entryPoint || chunkKey;
        const trimKey = key.substring(0, key.lastIndexOf('.')) || key;
        if (typeof chunkValue === 'object' && chunkValue !== null) {
          acc[trimKey] = { ...chunkValue, chunk: chunkKey };
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    for (const [expose, value] of Object.entries(exposedConfig)) {
      const exposedFound =
        outputMapWithoutExt[(value as string).replace('./', '')];

      if (exposedFound) {
        exposedEntries[expose] = {
          entryPoint: exposedFound.entryPoint,
          exports: exposedFound.exports || [],
        };
      }
    }

    const remoteFileOutput = result.outputFiles.find((file: { path: string }) =>
      file.path.endsWith(remoteFile),
    );

    if (remoteFileOutput) {
      const container = remoteFileOutput.text;
      const withExports = container
        .replace('"__MODULE_MAP__"', `${JSON.stringify(exposedEntries)}`)
        .replace("'__MODULE_MAP__'", `${JSON.stringify(exposedEntries)}`);

      remoteFileOutput.text = withExports;
    }
  }
  await writeRemoteManifest(federationBuilder.config, result);
}

// Main module federation plugin
export const moduleFederationPlugin = (config: any) => ({
  name: 'module-federation',
  setup(build: PluginBuild) {
    build.initialOptions.metafile = true;

    const pluginStack: Plugin[] = [];
    const remotes = Object.keys(federationBuilder.config.remotes || {}).length;
    const shared = Object.keys(federationBuilder.config.shared || {}).length;
    const exposes = Object.keys(federationBuilder.config.exposes || {}).length;
    const entryPoints = build.initialOptions.entryPoints;
    const filename = federationBuilder.config.filename || 'remoteEntry.js';

    if (remotes) {
      pluginStack.push(linkRemotesPlugin);
    }

    if (shared) {
      pluginStack.push(linkSharedPlugin);
    }

    if (!entryPoints) {
      build.initialOptions.entryPoints = [];
    }

    if (exposes) {
      if (Array.isArray(entryPoints)) {
        (entryPoints as string[]).push(filename);
      } else if (entryPoints && typeof entryPoints === 'object') {
        (entryPoints as Record<string, string>)[filename] = filename;
      } else {
        build.initialOptions.entryPoints = [filename];
      }
    }

    [
      initializeHostPlugin,
      createContainerPlugin(config),
      cjsToEsmPlugin,
      ...pluginStack,
    ].forEach((plugin) => plugin.setup(build));

    build.onEnd(async (result: any) => {
      await processRemoteFileOutput(result, federationBuilder);
      console.log(`build ended with ${result.errors.length} errors`);
    });
  },
});
