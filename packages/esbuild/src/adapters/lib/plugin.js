import fs from 'fs';
import { resolve, getExports } from './collect-exports.js';
import path from 'path';
import { federationBuilder } from '../../lib/core/federation-builder';
import { createContainerCode } from '../../lib/core/createContainerTemplate';

// Builds the container host code based on the provided configuration
const buildContainerHost = (config) => {
  const { name, remotes = {}, shared = {}, exposes = {} } = config;

  const remoteConfigs = Object.entries(remotes).map(
    ([remoteAlias, remote]) => ({
      type: 'esm',
      name: remoteAlias,
      entry: remote.entry,
      alias: remoteAlias,
    }),
  );

  const sharedConfig =
    Object.entries(shared).reduce((acc, [pkg, config]) => {
      const version = config.requiredVersion?.replace(/^[^0-9]/, '') || '';
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
      shared: ${sharedConfig},
    });

    export const get = createdContainer.get
    export const init = createdContainer.init
  `;
  return [createContainerCode, injectedContent].join('\n');
};

// Creates a virtual module for sharing dependencies
const createVirtualShareModule = (name, ref, exports) => `
  console.log(__FEDERATION__.__INSTANCES__[0],${JSON.stringify(
    name,
  )}, ${JSON.stringify(ref)})

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
    initFederationHost({
      name: ${JSON.stringify(name)},
      remotes: ${remoteConfigs},
      shared: ${sharedConfig}
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

// Plugin to create the container
const createContainerPlugin = (config) => ({
  name: 'createContainer',
  setup(build) {
    const {
      externals,
      config: { filename },
    } = config;
    const filter = new RegExp([filename].map((name) => `${name}$`).join('|'));
    const sharedExternals = new RegExp(
      externals.map((name) => `${name}$`).join('|'),
    );

    build.onResolve({ filter }, async (args) => ({
      path: args.path,
      namespace: 'container',
      pluginData: { kind: args.kind, resolveDir: args.resolveDir },
    }));

    build.onResolve({ filter: /^federationShare/ }, async (args) => ({
      path: args.path.replace('federationShare/', ''),
      namespace: 'esm-shares',
      pluginData: { kind: args.kind, resolveDir: args.resolveDir },
    }));

    build.onResolve({ filter: sharedExternals }, (args) => {
      if (args.namespace === 'esm-shares') return null;
      return {
        path: args.path,
        namespace: 'virtual-share-module',
        pluginData: { kind: args.kind, resolveDir: args.resolveDir },
      };
    });

    build.onResolve({ filter: /.*/, namespace: 'esm-shares' }, (args) => {
      if (sharedExternals.test(args.path)) {
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

    build.onLoad({ filter, namespace: 'container' }, async (args) => ({
      contents: buildContainerHost(federationBuilder.config),
      loader: 'js',
      resolveDir: args.pluginData.resolveDir,
    }));
  },
});

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

// Main module federation plugin
export const moduleFederationPlugin = (config) => ({
  name: 'module-federation',
  setup(build) {
    [
      initializeHostPlugin,
      createContainerPlugin(config),
      cjsToEsmPlugin,
      linkSharedPlugin,
    ].forEach((plugin) => plugin.setup(build));
  },
});
