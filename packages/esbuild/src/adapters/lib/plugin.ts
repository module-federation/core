import fs from 'fs';
import { resolve, getExports } from './collect-exports.js';
import path from 'path';
import { writeRemoteManifest } from './manifest.js';
import { createContainerPlugin } from './containerPlugin';
import { initializeHostPlugin } from './containerReference';
import { linkRemotesPlugin } from './linkRemotesPlugin';
import { commonjs } from './commonjs';
import {
  BuildOptions,
  PluginBuild,
  Plugin,
  OnResolveArgs,
  OnLoadArgs,
} from 'esbuild';
import { getExternals } from '../../lib/core/get-externals';
import { NormalizedFederationConfig } from '../../lib/config/federation-config.js';

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
        let esbuild_shim: typeof import('esbuild') | undefined;
        const require_esbuild = () =>
          build.esbuild || (esbuild_shim ||= require('esbuild'));

        const packageBuilder = await require_esbuild().build({
          ...build.initialOptions,
          external: build.initialOptions.external?.filter((e) => {
            if (e.includes('*')) {
              const prefix = e.split('*')[0];
              return !args.path.startsWith(prefix);
            }
            return e !== args.path;
          }),
          entryPoints: [args.path],
          plugins: [commonjs({ filter: /.*/ })],
          write: false,
        });
        return {
          contents: packageBuilder.outputFiles[0].text,
          loader: 'js',
          resolveDir: args.pluginData.resolveDir,
        };
      },
    );
  },
};
// Plugin to link shared dependencies
const linkSharedPlugin = (config: NormalizedFederationConfig): Plugin => ({
  name: 'linkShared',
  setup(build: PluginBuild) {
    const filter = new RegExp(
      Object.keys(config.shared || {})
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
        return undefined;
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
          contents: createVirtualShareModule(config.name, args.path, exp),
          loader: 'js',
          resolveDir: path.dirname(args.path),
        };
      },
    );
  },
});

// Main module federation plugin
export const moduleFederationPlugin = (config: NormalizedFederationConfig) => ({
  name: 'module-federation',
  setup(build: PluginBuild) {
    build.initialOptions.metafile = true;
    const externals = getExternals(config);
    if (build.initialOptions.external) {
      build.initialOptions.external = [
        ...new Set([...build.initialOptions.external, ...externals]),
      ];
    } else {
      build.initialOptions.external = externals;
    }
    const pluginStack: Plugin[] = [];
    const remotes = Object.keys(config.remotes || {}).length;
    const shared = Object.keys(config.shared || {}).length;
    const exposes = Object.keys(config.exposes || {}).length;
    const entryPoints = build.initialOptions.entryPoints;
    const filename = config.filename || 'remoteEntry.js';

    if (remotes) {
      pluginStack.push(linkRemotesPlugin(config));
    }

    if (shared) {
      pluginStack.push(linkSharedPlugin(config));
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
      initializeHostPlugin(config),
      createContainerPlugin(config),
      cjsToEsmPlugin,
      ...pluginStack,
    ].forEach((plugin) => plugin.setup(build));

    build.onEnd(async (result: any) => {
      if (!result.metafile) return;
      if (exposes) {
        const exposedConfig = config.exposes || {};
        const remoteFile = config.filename;
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
          const exposedFound =
            //@ts-ignore
            outputMapWithoutExt[value.replace('./', '')] ||
            //@ts-ignore
            outputMapWithoutExt[expose.replace('./', '')];

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
      await writeRemoteManifest(config, result);
      console.log(`build ended with ${result.errors.length} errors`);
    });
  },
});
