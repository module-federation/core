import fs from 'fs';
import { resolve, getExports } from './collect-exports.js';
import path from 'path';
import { federationBuilder } from '../../lib/core/federation-builder';
import { createContainerCode } from '../../lib/core/createContainerTemplate';

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

  const shareConfig =
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

  const injectedContent = `
    import { init as initFederationHost } from "@module-federation/runtime";
    initFederationHost({
      name: ${JSON.stringify(name)},
      remotes: ${remoteConfigs},
      shared: ${shareConfig}
     });
  `;

  return injectedContent;
};

const initializeHostPlugin = {
  name: 'host-initialization',
  setup(build) {
    build.onResolve({ filter: new RegExp('federation-host') }, (args) => {
      return {
        path: args.path,
        namespace: 'federation-host',
        pluginData: { kind: args.kind, resolveDir: args.resolveDir },
      };
    });

    build.onLoad(
      { filter: /.*/, namespace: 'federation-host' },
      async (args) => {
        const injectedContent = buildFederationHost();

        return {
          contents: injectedContent,
          resolveDir: args.pluginData.resolveDir,
        };
      },
    );

    build.onLoad(
      { filter: /.*\.(ts|js|mjs)$/, namespace: 'file' },
      async (args) => {
        const options = build.initialOptions;
        const isEntryPoint = options.entryPoints.some((e) =>
          args.path.includes(e),
        );

        if (!isEntryPoint) return undefined;
        const contents = await fs.promises.readFile(args.path, 'utf8');

        const injectedContent = buildFederationHost() + contents;

        return { contents: injectedContent };
      },
    );
  },
};

const createContainerPlugin = (config) => ({
  name: 'createContainer',
  setup(build) {
    const externals = config.externals;
    const { filename } = config.config;
    const filter = new RegExp([filename].map((name) => `${name}$`).join('|'));

    const sharedExternals = new RegExp(
      externals.map((name) => `${name}$`).join('|'),
    );

    build.onResolve({ filter: filter }, async (args) => {
      return {
        path: args.path,
        namespace: 'container',
        pluginData: { kind: args.kind, resolveDir: args.resolveDir },
      };
    });

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

    build.onResolve({ filter: sharedExternals }, (args) => {
      if (args.namespace === 'esm-shares') return null;

      return {
        path: args.path,
        namespace: 'virtual-share-module',
        pluginData: { kind: args.kind, resolveDir: args.resolveDir },
      };
    });

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

    build.onLoad({ filter, namespace: 'container' }, async (args) => {
      const code = [buildContainerHost(federationBuilder.config)].join('\n');

      return {
        contents: code,
        loader: 'js',
        resolveDir: args.pluginData.resolveDir,
      };
    });
  },
});

const cjsToEsmPlugin = {
  name: 'cjs-to-esm',
  setup(build) {
    build.onLoad({ filter: /.*/, namespace: 'esm-shares' }, async (args) => {
      const { transform } = await eval("import('@chialab/cjs-to-esm')");
      const resolver = await resolve(args.pluginData.resolveDir, args.path);

      const fileContent = fs.readFileSync(resolver, 'utf-8');
      const { code } = await transform(fileContent);

      const o = {
        contents: code,
        loader: 'js',
        resolveDir: path.dirname(resolver),
        pluginData: { ...args.pluginData, path: resolver.path },
      };
      return o;
    });
  },
};

const linkSharedPlugin = {
  name: 'linkShared',
  setup(build) {
    const externals = federationBuilder.externals;

    const filter = new RegExp(externals.map((name) => `${name}$`).join('|'));

    build.onLoad(
      { filter, namespace: 'virtual-share-module' },
      async (args) => {
        const exp = await getExports(args.path);
        const virtualShare = createVirtualModuleShare(
          federationBuilder.config.name,
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
};

export const moduleFederationPlugin = (config) => {
  const plugins = [
    initializeHostPlugin,
    createContainerPlugin(config),
    cjsToEsmPlugin,
    linkSharedPlugin,
  ];

  return {
    name: 'module-federation',
    setup(build) {
      plugins.forEach((plugin) => plugin.setup(build));
    },
  };
};
