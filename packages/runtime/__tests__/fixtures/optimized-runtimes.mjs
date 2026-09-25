// Bundles independent copies of @module-federation/runtime, each with its own build-time
// flags, and runs one scenario. Each scenario runs in its own process, so every scenario
// starts with an empty __FEDERATION__ global.
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { build } from 'esbuild';

const runtimeDir = path.resolve(import.meta.dirname, '../..');
const packageDir = path.resolve(runtimeDir, '..');
const require = createRequire(path.join(runtimeDir, 'package.json'));
const coreSrc = path.join(packageDir, 'runtime-core/src');

const bundleEntry = `
export * from ${JSON.stringify(path.join(runtimeDir, 'src/index.ts'))};
export { init as composeInit } from ${JSON.stringify(path.join(runtimeDir, 'src/compose.ts'))};
export { remote } from ${JSON.stringify(path.join(coreSrc, 'remote/capability.ts'))};
export { shared } from ${JSON.stringify(path.join(coreSrc, 'shared/capability.ts'))};
export { snapshot } from ${JSON.stringify(path.join(coreSrc, 'plugins/snapshot/capability.ts'))};
export { node } from ${JSON.stringify(path.join(coreSrc, 'platform/node.ts'))};
`;

async function bundle({
  buildId,
  disableRemote = false,
  disableShared = false,
  disableSnapshot = false,
  target = 'node',
}) {
  const result = await build({
    stdin: { contents: bundleEntry, resolveDir: runtimeDir, loader: 'ts' },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    alias: {
      '@module-federation/runtime-core': coreSrc,
      '@module-federation/error-codes/browser': path.join(
        packageDir,
        'error-codes/src/browser.ts',
      ),
      '@module-federation/error-codes': path.join(
        packageDir,
        'error-codes/src/index.ts',
      ),
    },
    define: {
      __VERSION__: '"test"',
      FEDERATION_DEBUG: '"true"',
      FEDERATION_OPTIMIZE_NO_REMOTE: String(disableRemote),
      FEDERATION_OPTIMIZE_NO_SHARED: String(disableShared),
      FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN: String(disableSnapshot),
      FEDERATION_BUILD_IDENTIFIER: JSON.stringify(buildId),
      ENV_TARGET: JSON.stringify(target),
    },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(
    require,
    module,
    module.exports,
  );
  return module.exports;
}

const server = createServer((request, response) => {
  if (request.url === '/mf-manifest.json') {
    response.setHeader('Content-Type', 'application/json');
    response.end(
      JSON.stringify({
        id: 'manifest-tiny',
        name: 'manifest-tiny',
        metaData: {
          globalName: 'manifestTiny',
          publicPath: `http://${request.headers.host}/`,
          buildInfo: { buildVersion: '1.0.0' },
          remoteEntry: {
            name: 'remoteEntry.js',
            path: '',
            type: 'commonjs-module',
          },
        },
        remotes: [],
        shared: [],
        exposes: [],
      }),
    );
    return;
  }
  response.setHeader('Content-Type', 'text/javascript');
  response.end(`module.exports = {
    init() {},
    get(expose) {
      if (expose !== './value') throw new Error('Unexpected expose: ' + expose);
      return () => ({ value: 'remote-value' });
    }
  };`);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const entry = `http://127.0.0.1:${server.address().port}/remoteEntry.js`;

const options = (name, version, remoteName = 'tiny') => ({
  name,
  version,
  remotes: [{ name: remoteName, entry }],
});
const sharedToken = {
  token: {
    version: '1.0.0',
    get: async () => () => ({ value: 'shared-value' }),
  },
};
const value = async (runtime, id = 'tiny/value') =>
  (await runtime.loadRemote(id))?.value;
const errorOf = (promise, what) =>
  promise.then(
    () => `${what} unexpectedly succeeded`,
    (error) => error.message,
  );
const loadError = (runtime) =>
  errorOf(
    Promise.resolve().then(() => runtime.loadRemote('tiny/value')),
    'Remote loading',
  );
const instances = (pick) => globalThis.__FEDERATION__.__INSTANCES__.map(pick);

const scenarios = {
  async 'distinct-last-disabled'() {
    const full = await bundle({ buildId: 'full-app@1.0.0' });
    const disabled = await bundle({
      buildId: 'disabled-app@1.0.0',
      disableRemote: true,
    });
    const disabledInstance = disabled.createInstance(options('disabled-app'));
    const created = full.createInstance(options('full-created'));
    const initialized = full.init(options('full-initialized'));
    return {
      disabledError: await loadError(disabledInstance),
      createdValue: await value(created),
      initializedValue: await value(initialized),
      moduleValue: await value(full),
      instanceNames: instances((instance) => instance.name),
    };
  },

  async 'distinct-last-full'() {
    const disabled = await bundle({
      buildId: 'disabled-app@1.0.0',
      disableRemote: true,
    });
    const full = await bundle({ buildId: 'full-app@1.0.0' });
    const initialized = full.init(options('full-app'));
    const disabledInstance = disabled.init(options('disabled-app'));
    return {
      fullValue: await value(initialized),
      fullModuleValue: await value(full),
      disabledError: await loadError(disabledInstance),
      disabledModuleError: await loadError(disabled),
      instanceNames: instances((instance) => instance.name),
    };
  },

  async 'version-isolated'() {
    const full = await bundle({ buildId: 'app@2.0.0' });
    const disabled = await bundle({
      buildId: 'app@1.0.0',
      disableRemote: true,
    });
    const disabledInstance = disabled.init(options('app', '1.0.0'));
    const initialized = full.init(options('app', '2.0.0'));
    return {
      disabledError: await loadError(disabledInstance),
      fullValue: await value(initialized),
      fullModuleValue: await value(full),
      versions: instances((instance) => instance.options.version),
    };
  },

  async 'compatible-reuse'() {
    const full = await bundle({ buildId: 'app@1.0.0' });
    const compatible = await bundle({ buildId: 'app@2.0.0' });
    const first = full.init({
      ...options('app', '1.0.0'),
      shared: sharedToken,
    });
    const fresh = full.createInstance(options('app', '1.0.0', 'fresh'));
    const repeated = compatible.init(options('app', '1.0.0'));
    const shared = await repeated.loadShare('token');
    return {
      firstValue: await value(first),
      repeatedValue: await value(repeated),
      moduleValue: await value(full),
      compatibleModuleValue: await value(compatible),
      freshValue: await value(fresh, 'fresh/value'),
      sharedValue: shared?.()?.value,
      instanceCount: globalThis.__FEDERATION__.__INSTANCES__.length,
    };
  },

  'collision-different-build': () =>
    disabledThenFull({ fullBuildId: 'app@2.0.0' }),

  'collision-same-build': () => disabledThenFull({ fullBuildId: 'app@1.0.0' }),

  // Without snapshot plugins, only the remote capability tells the two builds apart.
  'collision-remote-without-snapshot': () =>
    disabledThenFull({ fullBuildId: 'app@1.0.0', disableSnapshot: true }),

  async 'collision-full-first'() {
    const full = await bundle({ buildId: 'app@2.0.0' });
    const disabled = await bundle({
      buildId: 'app@1.0.0',
      disableRemote: true,
    });
    const initialized = full.init(options('app', '1.0.0'));
    const disabledInstance = disabled.init(options('app', '1.0.0'));
    return {
      fullValue: await value(initialized),
      disabledError: await loadError(disabledInstance),
      disabledModuleError: await loadError(disabled),
      registeredIds: instances((instance) => instance.options.id),
    };
  },

  async 'collision-shared'() {
    const full = await bundle({ buildId: 'app@2.0.0' });
    const disabled = await bundle({
      buildId: 'app@1.0.0',
      disableShared: true,
    });
    const sharedOptions = { ...options('app', '1.0.0'), shared: sharedToken };
    const disabledInstance = disabled.init(sharedOptions);
    const initialized = full.init(sharedOptions);
    const shared = await initialized.loadShare('token');
    return {
      disabledError: await errorOf(
        disabledInstance.loadShare('token'),
        'Shared loading',
      ),
      sharedValue: shared?.()?.value,
      fullValue: await value(initialized),
    };
  },

  async 'collision-snapshot'() {
    const full = await bundle({ buildId: 'app@2.0.0' });
    const disabled = await bundle({
      buildId: 'app@1.0.0',
      disableSnapshot: true,
    });
    const direct = disabled.init(options('app', '1.0.0'));
    const initialized = full.init({
      name: 'app',
      version: '1.0.0',
      remotes: [
        {
          name: 'manifest-tiny',
          entry: entry.replace('remoteEntry.js', 'mf-manifest.json'),
        },
      ],
    });
    return {
      directValue: await value(direct),
      manifestValue: await value(initialized, 'manifest-tiny/value'),
      moduleValue: await value(full, 'manifest-tiny/value'),
    };
  },

  // A web-target runtime loads entries with the DOM loader, which cannot run in Node.
  async 'collision-target'() {
    const web = await bundle({ buildId: 'app@1.0.0', target: 'web' });
    const node = await bundle({ buildId: 'app@1.0.0' });
    const webInstance = web.init(options('app', '1.0.0'));
    const nodeInstance = node.init(options('app', '1.0.0'));
    return {
      separate: webInstance !== nodeInstance,
      nodeValue: await value(nodeInstance),
      nodeModuleValue: await value(node),
    };
  },

  async 'compose-distinct-capabilities'() {
    const full = await bundle({ buildId: 'app@1.0.0' });
    const sharedOnly = await bundle({ buildId: 'app@1.0.0' });
    const composedOptions = { ...options('app', '1.0.0'), shared: sharedToken };
    const remoteInstance = full.composeInit(
      composedOptions,
      fullCapabilities(full),
    );
    const sharedInstance = sharedOnly.composeInit(composedOptions, {
      shared: sharedOnly.shared,
      platform: sharedOnly.node,
    });
    const shared = await sharedInstance.loadShare('token');
    return {
      separate: sharedInstance !== remoteInstance,
      disabledError: await loadError(sharedInstance),
      sharedValue: shared?.()?.value,
      remoteValue: await value(remoteInstance),
      moduleValue: await value(full),
    };
  },

  async 'compose-root-reuse'() {
    const root = await bundle({ buildId: 'app@1.0.0' });
    const composed = await bundle({ buildId: 'app@1.0.0' });
    const rootInstance = root.init(options('app', '1.0.0'));
    const kernel = composed.composeInit(
      options('app', '1.0.0'),
      fullCapabilities(composed),
    );
    return {
      reused: kernel === rootInstance,
      moduleValue: await value(composed),
      instanceCount: globalThis.__FEDERATION__.__INSTANCES__.length,
    };
  },

  async 'compose-capabilities-string'() {
    const runtime = await bundle({ buildId: 'app@1.0.0' });
    const kernel = runtime.composeInit(
      options('app', '1.0.0'),
      fullCapabilities(runtime),
    );
    return {
      root: runtime.ModuleFederation.runtimeCapabilities,
      rootInstance: new runtime.ModuleFederation({ name: 'root' })
        .runtimeCapabilities,
      kernel: kernel.runtimeCapabilities,
    };
  },
};

const fullCapabilities = ({ shared, remote, snapshot, node }) => ({
  shared,
  remote,
  snapshot,
  platform: node,
});

async function disabledThenFull({ fullBuildId, disableSnapshot = false }) {
  const full = await bundle({ buildId: fullBuildId, disableSnapshot });
  const disabled = await bundle({ buildId: 'app@1.0.0', disableRemote: true });
  const disabledInstance = disabled.init(options('app', '1.0.0'));
  const initialized = full.init(options('app', '1.0.0'));
  const repeated = full.init(options('app', '1.0.0'));
  return {
    disabledError: await loadError(disabledInstance),
    fullValue: await value(initialized),
    fullModuleValue: await value(full),
    repeatedValue: await value(repeated),
    registeredIds: instances((instance) => instance.options.id),
  };
}

const scenario = process.argv[2];
try {
  if (!scenarios[scenario]) throw new Error(`Unknown scenario: ${scenario}`);
  console.log(JSON.stringify(await scenarios[scenario]()));
} finally {
  await new Promise((resolve) => server.close(resolve));
}
