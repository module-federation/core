import fs from 'fs';
import { NormalizedFederationConfig } from '../../lib/config/federation-config';

// Builds the federation host code
export const buildFederationHost = (config: NormalizedFederationConfig) => {
  const { name, remotes, shared } = config;

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

    const createVirtualRemoteModule = (name, ref, exports) => {
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
        // Load all remotes and collect their moduleMaps
        const remotesWithModuleMaps = await Promise.all(
          args.options.remotes.map(async (remote) => {
            console.log('remote', remote);
            if (remote.type === 'esm') {
              const remoteModule = await import(remote.entry);
              return { remote, moduleMap: remoteModule.moduleMap };
            }
            return { remote, moduleMap: null };
          })
        );

        // Build import map entries for all remote modules
        const allImports = {};
        for (const { remote, moduleMap } of remotesWithModuleMaps) {
          if (moduleMap && typeof moduleMap === 'object') {
            for (const expose of Object.keys(moduleMap)) {
              const currentImportMap = importShim.getImportMap().imports;
              // Use remote name + expose path (e.g., "mfe1/component")
              const key = remote.name + expose.replace('.', '');
              if (!currentImportMap[key] && !allImports[key]) {
                const encodedModule = encodeInlineESM(
                  createVirtualRemoteModule(remote.name, key, moduleMap[expose].exports)
                );
                allImports[key] = encodedModule;
              }
            }
          }
        }

        if (Object.keys(allImports).length > 0) {
          await importShim.addImportMap({ imports: allImports });
        }

        return args;
      }
    });

     const mfHoZJ92 = initFederationHost({
      name: ${JSON.stringify(name)},
      remotes: ${remoteConfigs},
      shared: ${sharedConfig},
      plugins: [runtimePlugin()],
    });

    await Promise.all(mfHoZJ92.initializeSharing('default', 'version-first'));

    // Ensure import maps are registered before any code that uses remotes runs
    const remotesList = ${remoteConfigs};
    const allImports = {};
    for (const remote of remotesList) {
      if (remote.type === 'esm') {
        try {
          const remoteModule = await import(remote.entry);
          const moduleMap = remoteModule.moduleMap;
          if (moduleMap && typeof moduleMap === 'object') {
            for (const expose of Object.keys(moduleMap)) {
              const key = remote.name + expose.replace('.', '');
              if (!allImports[key]) {
                const encodedModule = encodeInlineESM(
                  createVirtualRemoteModule(remote.name, key, moduleMap[expose].exports)
                );
                allImports[key] = encodedModule;
              }
            }
          }
        } catch (e) {
          console.error('Failed to load remote:', remote.name, e);
        }
      }
    }
    if (Object.keys(allImports).length > 0) {
      await importShim.addImportMap({ imports: allImports });
    }

  `;
};

export const initializeHostPlugin = (config: NormalizedFederationConfig) => ({
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
        contents: buildFederationHost(config),
        resolveDir: args.pluginData.resolveDir,
      }),
    );

    // Add custom loaders
    const loaders = build.initialOptions.loader || {};

    // Apply custom loaders
    for (const [ext, loader] of Object.entries(loaders)) {
      build.onLoad(
        { filter: new RegExp(`\\${ext}$`), namespace: 'file' },
        async (args: any) => {
          const contents = await fs.promises.readFile(args.path, 'utf8');
          return {
            contents: buildFederationHost(config) + contents,
            loader,
          };
        },
      );
    }

    // Fallback loader for files not matched by custom loaders
    const fallbackFilter = new RegExp(
      Object.keys(loaders)
        .map((ext) => `\\${ext}$`)
        .join('|'),
    );

    build.onLoad(
      { filter: /.*\.(ts|js|mjs)$/, namespace: 'file' },
      //@ts-ignore
      async (args: any) => {
        if (!fallbackFilter.test(args.path)) {
          if (
            !build.initialOptions.entryPoints.some((e: string) =>
              args.path.includes(e),
            )
          ) {
            return;
          }
          const contents = await fs.promises.readFile(args.path, 'utf8');
          return { contents: 'import "federation-host"; \n ' + contents };
        }
      },
    );
  },
});
