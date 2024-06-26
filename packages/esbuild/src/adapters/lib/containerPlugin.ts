import { OnResolveArgs, OnLoadArgs, PluginBuild } from 'esbuild';
import { createContainerCode } from '../../lib/core/createContainerTemplate.js';
import { NormalizedFederationConfig } from '../../lib/config/federation-config.js';

const buildContainerHost = (config: NormalizedFederationConfig) => {
  const { name, remotes = {}, shared = {}, exposes = {} } = config;

  const remoteConfigs = Object.entries(remotes).map(
    ([remoteAlias, remote]) => ({
      type: 'esm',
      name: remoteAlias,
      entry: (remote as any).entry,
      alias: remoteAlias,
    }),
  );

  const sharedConfig =
    Object.entries(shared).reduce((acc, [pkg, config]) => {
      const version =
        (config as any).requiredVersion?.replace(/^[^0-9]/, '') || '';
      acc += `${JSON.stringify(pkg)}: {
      "package": "${pkg}",
      "version": "${version}",
      "scope": "default",
      "get": async () => import('federationShare/${pkg}'),
      "shareConfig": {
        "singleton": ${(config as any).singleton},
        "requiredVersion": "${(config as any).requiredVersion}",
        "eager": ${(config as any).eager},
        "strictVersion": ${(config as any).strictVersion}
      }
    },\n`;
      return acc;
    }, '{') + '}';

  let exposesConfig = Object.entries(exposes)
    .map(
      ([exposeName, exposePath]) =>
        `${JSON.stringify(
          exposeName,
        )}: async () => await import('${exposePath}')`,
    )
    .join(',\n');
  exposesConfig = `{${exposesConfig}}`;

  const injectedContent = `
    export const moduleMap = '__MODULE_MAP__';

    function appendImportMap(importMap) {
      const script = document.createElement('script');
      script.type = 'importmap-shim';
      script.innerHTML = JSON.stringify(importMap);
      document.head.appendChild(script);
    }

    export const createVirtualRemoteModule = (name, ref, exports) => {
      const genExports = exports.map(e =>
        e === 'default' ? 'export default mfLsZJ92.default' : \`export const \${e} = mfLsZJ92[\${JSON.stringify(e)}];\`
      ).join('');

      const loadRef = \`const mfLsZJ92 = await container.loadRemote(\${JSON.stringify(ref)});\`;

      return \`
        const container = __FEDERATION__.__INSTANCES__.find(container => container.name === name) || __FEDERATION__.__INSTANCES__[0];
        \${loadRef}
        \${genExports}
      \`;
    };

    function encodeInlineESM(code) {
      const encodedCode = encodeURIComponent(code);
      return \`data:text/javascript;charset=utf-8,\${encodedCode}\`;
    }

    const runtimePlugin = () => ({
        name: 'import-maps-plugin',
        async init(args) {

            const remotePrefetch = args.options.remotes.map(async (remote) => {
                if (remote.type === 'esm') {
                    await import(remote.entry);
                }
            });


            await Promise.all(remotePrefetch);

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

            return args;
        }
    });

    const createdContainer = await createContainer({
      name: ${JSON.stringify(name)},
      exposes: ${exposesConfig},
      remotes: ${JSON.stringify(remoteConfigs)},
      shared: ${sharedConfig},
      plugins: [runtimePlugin()],
    });

    export const get = createdContainer.get;
    export const init = createdContainer.init;
  `;
  //replace with createContainer from bundler runtime - import it in the string as a dep etc

  return [createContainerCode, injectedContent].join('\n');
};

export const createContainerPlugin = (config: NormalizedFederationConfig) => ({
  name: 'createContainer',
  setup(build: PluginBuild) {
    const { filename } = config;

    const filter = new RegExp([filename].map((name) => `${name}$`).join('|'));
    const hasShared = Object.keys(config.shared || {}).length;

    const shared = Object.keys(config.shared || {})
      .map((name: string) => `${name}$`)
      .join('|');
    const sharedExternals = new RegExp(shared);

    build.onResolve({ filter }, async (args: OnResolveArgs) => ({
      path: args.path,
      namespace: 'container',
      pluginData: { kind: args.kind, resolveDir: args.resolveDir },
    }));

    build.onResolve(
      { filter: /^federationShare/ },
      async (args: OnResolveArgs) => ({
        path: args.path.replace('federationShare/', ''),
        namespace: 'esm-shares',
        pluginData: { kind: args.kind, resolveDir: args.resolveDir },
      }),
    );
    if (hasShared) {
      build.onResolve({ filter: sharedExternals }, (args: OnResolveArgs) => {
        if (args.namespace === 'esm-shares') return null;
        return {
          path: args.path,
          namespace: 'virtual-share-module',
          pluginData: { kind: args.kind, resolveDir: args.resolveDir },
        };
      });

      build.onResolve(
        { filter: /.*/, namespace: 'esm-shares' },
        async (args: OnResolveArgs) => {
          if (sharedExternals.test(args.path)) {
            return {
              path: args.path,
              namespace: 'virtual-share-module',
              pluginData: { kind: args.kind, resolveDir: args.resolveDir },
            };
          }

          return undefined;
        },
      );
    }

    build.onLoad(
      { filter, namespace: 'container' },
      async (args: OnLoadArgs) => ({
        contents: buildContainerHost(config),
        loader: 'js',
        resolveDir: args.pluginData.resolveDir,
      }),
    );
  },
});
