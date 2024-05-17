import fs from 'fs';
import { resolve, getExports } from './collect-exports.js';
import path from 'path';
import { federationBuilder } from '../../lib/core/federation-builder';
import { writeRemoteManifest } from './manifest.js';
import { createContainerPlugin } from './containerPlugin';

// Creates a virtual module for sharing dependencies
export const createVirtualShareModule = (name, ref, exports) => `

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

export const createVirtualRemoteModule = (name, ref, exports) => `
export * from ${JSON.stringify('federationRemote/' + ref)}
`;

// Builds the federation host code
const buildFederationHost = () => {
  const { name, remotes, shared } = federationBuilder.config;

  const remoteConfigs = remotes
    ? JSON.stringify(
        Object.entries(remotes).map(([remoteAlias, remote]) => ({
          name: remoteAlias,
          entry: remote,
          alias: remoteAlias,
          type: 'esm',
        })),
      )
    : '[]';

  const sharedConfig =
    Object.entries(shared).reduce((acc, [pkg, config]) => {
      const version = config.requiredVersion?.replace(/^[^0-9]/, '') || '';
      acc += `${JSON.stringify(pkg)}: {
      "package": "${pkg}",
      "version": "${version}",
      "scope": "default",
      "get": async () => await import('federationShare/${pkg}'),
      "shareConfig": {
        "singleton": ${config.singleton},
        "requiredVersion": "${config.requiredVersion}",
        "eager": ${config.eager},
        "strictVersion": ${config.strictVersion}
      }
    },\n`;
      return acc;
    }, '{') + '}';
  return `
    import { init as initFederationHost } from "@module-federation/runtime";

    export const createVirtualRemoteModule = (name, ref, exports) => {
      const genExports = exports.map(e =>
        e === 'default'
          ? 'export default mfLsZJ92.default;'
          : \`export const \${e} = mfLsZJ92[\${JSON.stringify(e)}];\`
      ).join('');

      const loadRef = \`const mfLsZJ92 = await container.loadRemote(\${JSON.stringify(ref)});\`;

      return \`
        const container = __FEDERATION__.__INSTANCES__.find(container => container.name === name) || __FEDERATION__.__INSTANCES__[0];
        \${loadRef}
        \${genExports}
      \`;
    };

    function encodeInlineESM(code) {
      return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(code);
    }

    const runtimePlugin = () => ({
      name: 'import-maps-plugin',
      async init(args) {
        const remotePrefetch = args.options.remotes.map(async (remote) => {
          console.log('remote', remote);
          if (remote.type === 'esm') {
            await import(remote.entry);
          }
        });

        await Promise.all(remotePrefetch);

        if (typeof moduleMap !== 'undefined') {
          const map = Object.keys(moduleMap).reduce((acc, expose) => {
            const importMap = importShim.getImportMap().imports;
            const key = args.origin.name + expose.replace('.', '');
            if (!importMap[key]) {
              const encodedModule = encodeInlineESM(
                createVirtualRemoteModule(args.origin.name, key, moduleMap[expose].exports)
              );
              acc[key] = encodedModule;
            }
            return acc;
          }, {});

          await importShim.addImportMap({ imports: map });
        }
        console.log('final map', importShim.getImportMap());

        return args;
      }
    });

     initFederationHost({
      name: ${JSON.stringify(name)},
      remotes: ${remoteConfigs},
      shared: ${sharedConfig},
      plugins: [runtimePlugin()],
    });



  `;
};

// Plugin to initialize the federation host
const initializeHostPlugin = {
  name: 'host-initialization',
  setup(build) {
    build.onResolve({ filter: /federation-host/ }, (args) => ({
      path: args.path,
      namespace: 'federation-host',
      pluginData: { kind: args.kind, resolveDir: args.resolveDir },
    }));

    build.onLoad(
      { filter: /.*/, namespace: 'federation-host' },
      async (args) => ({
        contents: buildFederationHost(),
        resolveDir: args.pluginData.resolveDir,
      }),
    );

    build.onLoad(
      { filter: /.*\.(ts|js|mjs)$/, namespace: 'file' },
      async (args) => {
        if (
          !build.initialOptions.entryPoints.some((e) => args.path.includes(e))
        )
          return;
        const contents = await fs.promises.readFile(args.path, 'utf8');
        return { contents: buildFederationHost() + contents };
      },
    );
  },
};

// Plugin to transform CommonJS modules to ESM
const cjsToEsmPlugin = {
  name: 'cjs-to-esm',
  setup(build) {
    build.onLoad({ filter: /.*/, namespace: 'esm-shares' }, async (args) => {
      const { transform } = await eval("import('@chialab/cjs-to-esm')");
      const resolver = await resolve(args.pluginData.resolveDir, args.path);
      const fileContent = fs.readFileSync(resolver, 'utf-8');
      const { code } = await transform(fileContent);
      return {
        contents: code,
        loader: 'js',
        resolveDir: path.dirname(resolver),
        pluginData: { ...args.pluginData, path: resolver.path },
      };
    });
  },
};

// Plugin to link shared dependencies
const linkSharedPlugin = {
  name: 'linkShared',
  setup(build) {
    const filter = new RegExp(
      federationBuilder.externals.map((name) => `${name}$`).join('|'),
    );

    build.onLoad(
      { filter, namespace: 'virtual-share-module' },
      async (args) => {
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

const linkRemotesPlugin = {
  name: 'linkRemotes',
  setup(build) {
    // const filter = new RegExp(
    //   federationBuilder.externals.map((name) => `${name}$`).join('|'),
    // );

    const ext = federationBuilder.externals;
    const remotes = federationBuilder.config.remotes;
    const filter = new RegExp(
      Object.keys(remotes)
        .reduce((acc, key) => {
          if (!key) return acc;
          acc.push(`^${key}`);
          // acc.push(key + '/*');
          return acc;
        }, [])
        .join('|'),
    );

    build.onResolve({ filter: filter }, async (args) => {
      // const parent = await build.resolve(args.importer, {resolveDir: args.resolveDir, kind: args.kind})
      return { path: args.path, namespace: 'remote-module' };
    });

    build.onResolve({ filter: /^federationRemote/ }, async (args) => {
      // const parent = await build.resolve(args.importer, {resolveDir: args.resolveDir, kind: args.kind})
      return {
        path: args.path.replace('federationRemote/', ''),
        external: true,
        namespace: 'externals',
      };
    });

    build.onLoad({ filter, namespace: 'remote-module' }, async (args) => {
      return {
        contents: createVirtualRemoteModule(
          federationBuilder.config.name,
          args.path,
        ),
        loader: 'js',
        resolveDir: path.dirname(args.path),
      };
    });
  },
};

// Main module federation plugin
export const moduleFederationPlugin = (config) => ({
  name: 'module-federation',
  setup(build) {
    build.initialOptions.metafile = true;

    const pluginStack = [];
    const remotes = Object.keys(federationBuilder.config.remotes).length;
    const shared = Object.keys(federationBuilder.config.shared).length;
    const exposes = Object.keys(federationBuilder.config.exposes).length;

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

    build.onEnd(async (result) => {
      if (exposes) {
        const exposedConfig = federationBuilder.config.exposes;
        const remoteFile = federationBuilder.config.filename;
        const exposedEntries = {};
        for (const [expose, value] of Object.entries(exposedConfig)) {
          const output = Object.values(result.metafile.outputs).find((o) => {
            if (!o.entryPoint) return false;
            const found = o.entryPoint.startsWith(value.replace(/^\.\//, ''));
            return found;
          });
          if (output) {
            exposedEntries[expose] = {
              entryPoint: output.entryPoint,
              exports: output.exports,
            };
          }
        }

        console.log('writing', federationBuilder.config, result, build);

        for (const [outputPath, value] of Object.entries(
          result.metafile.outputs,
        )) {
          if (!value.entryPoint) continue;

          if (!value.entryPoint.startsWith('container:')) continue;

          if (!value.entryPoint.endsWith(remoteFile)) continue;

          const container = fs.readFileSync(outputPath, 'utf-8');

          let withExports = container
            .replace('"__MODULE_MAP__"', `${JSON.stringify(exposedEntries)}`)
            .replace("'__MODULE_MAP__'", `${JSON.stringify(exposedEntries)}`);

          fs.writeFileSync(outputPath, withExports, 'utf-8');
        }
      }
      await writeRemoteManifest(federationBuilder.config, result, build);

      console.log(`build ended with ${result.errors.length} errors`);
    });
  },
});
