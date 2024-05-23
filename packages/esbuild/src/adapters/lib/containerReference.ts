import { federationBuilder } from '../../lib/core/federation-builder';
import fs from 'fs';

// Builds the federation host code
export const buildFederationHost = () => {
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
    Object.entries(shared ?? {}).reduce((acc, [pkg, config]) => {
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

export const initializeHostPlugin = {
  name: 'host-initialization',
  setup(build: any) {
    build.onResolve({ filter: /federation-host/ }, (args: any) => ({
      path: args.path,
      namespace: 'federation-host',
      pluginData: { kind: args.kind, resolveDir: args.resolveDir },
    }));

    build.onLoad(
      { filter: /.*/, namespace: 'federation-host' },
      async (args: any) => ({
        contents: buildFederationHost(),
        resolveDir: args.pluginData.resolveDir,
      }),
    );

    build.onLoad(
      { filter: /.*\.(ts|js|mjs)$/, namespace: 'file' },
      async (args: any) => {
        if (
          !build.initialOptions.entryPoints.some((e: string) =>
            args.path.includes(e),
          )
        )
          return;
        const contents = await fs.promises.readFile(args.path, 'utf8');
        return { contents: buildFederationHost() + contents };
      },
    );
  },
};
