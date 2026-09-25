// Bundles independent copies of @module-federation/runtime, each composed with its own
// capabilities and build id, and runs one scenario. Each scenario runs in its own
// process, so every scenario starts with an empty __FEDERATION__ global.
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
export { init as composeInit, createInstance as composeCreateInstance } from ${JSON.stringify(path.join(runtimeDir, 'src/compose.ts'))};
export { remote } from ${JSON.stringify(path.join(coreSrc, 'remote/capability.ts'))};
export { shared } from ${JSON.stringify(path.join(coreSrc, 'shared/capability.ts'))};
export { snapshot } from ${JSON.stringify(path.join(coreSrc, 'plugins/snapshot/capability.ts'))};
export { node } from ${JSON.stringify(path.join(coreSrc, 'platform/node.ts'))};
export { web } from ${JSON.stringify(path.join(coreSrc, 'platform/web.ts'))};
`;

// Like the bundler's composed bootstrap, init and createInstance pass the bundle's
// capabilities to runtime/compose, and init passes the build id as options.id.
async function bundle({ id, without = [], target = 'node' } = {}) {
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
      ENV_TARGET: JSON.stringify(target),
    },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(
    require,
    module,
    module.exports,
  );
  const runtime = module.exports;
  const capabilities = Object.fromEntries(
    Object.entries({
      remote: runtime.remote,
      shared: runtime.shared,
      snapshot: runtime.snapshot,
      platform: runtime[target],
    }).filter(([part]) => !without.includes(part)),
  );
  return {
    ...runtime,
    rootInit: runtime.init,
    init: (options) =>
      runtime.composeInit({ ...options, id: options.id || id }, capabilities),
    createInstance: (options) =>
      runtime.composeCreateInstance(options, capabilities),
  };
}

const noRemote = ['remote', 'snapshot'];

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
    const full = await bundle({ id: 'full-app@1.0.0' });
    const disabled = await bundle({
      id: 'disabled-app@1.0.0',
      without: noRemote,
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
      id: 'disabled-app@1.0.0',
      without: noRemote,
    });
    const full = await bundle({ id: 'full-app@1.0.0' });
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
    const full = await bundle({ id: 'app@2.0.0' });
    const disabled = await bundle({
      id: 'app@1.0.0',
      without: noRemote,
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
    const full = await bundle({ id: 'app@1.0.0' });
    const compatible = await bundle({ id: 'app@2.0.0' });
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

  'collision-different-build': () => disabledThenFull({ fullId: 'app@2.0.0' }),

  'collision-same-build': () => disabledThenFull({ fullId: 'app@1.0.0' }),

  // Without snapshot plugins, only the remote capability tells the two builds apart.
  'collision-remote-without-snapshot': () =>
    disabledThenFull({ fullId: 'app@1.0.0', without: ['snapshot'] }),

  async 'collision-full-first'() {
    const full = await bundle({ id: 'app@2.0.0' });
    const disabled = await bundle({
      id: 'app@1.0.0',
      without: noRemote,
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
    const full = await bundle({ id: 'app@2.0.0' });
    const disabled = await bundle({
      id: 'app@1.0.0',
      without: ['shared'],
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
    const full = await bundle({ id: 'app@2.0.0' });
    const disabled = await bundle({ id: 'app@1.0.0', without: ['snapshot'] });
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
    const web = await bundle({ id: 'app@1.0.0', target: 'web' });
    const node = await bundle({ id: 'app@1.0.0' });
    const webInstance = web.init(options('app', '1.0.0'));
    const nodeInstance = node.init(options('app', '1.0.0'));
    return {
      separate: webInstance !== nodeInstance,
      nodeValue: await value(nodeInstance),
      nodeModuleValue: await value(node),
    };
  },

  async 'compose-distinct-capabilities'() {
    const full = await bundle();
    const sharedOnly = await bundle({ without: noRemote });
    const composedOptions = { ...options('app', '1.0.0'), shared: sharedToken };
    const remoteInstance = full.init(composedOptions);
    const sharedInstance = sharedOnly.init(composedOptions);
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
    const root = await bundle();
    const composed = await bundle();
    const rootInstance = root.rootInit(options('app', '1.0.0'));
    const kernel = composed.init(options('app', '1.0.0'));
    return {
      reused: kernel === rootInstance,
      moduleValue: await value(composed),
      instanceCount: globalThis.__FEDERATION__.__INSTANCES__.length,
    };
  },

  async 'compose-capabilities-string'() {
    const runtime = await bundle();
    const kernel = runtime.init(options('app', '1.0.0'));
    return {
      root: runtime.ModuleFederation.runtimeCapabilities,
      rootInstance: new runtime.ModuleFederation({ name: 'root' })
        .runtimeCapabilities,
      kernel: kernel.runtimeCapabilities,
    };
  },
};

async function disabledThenFull({ fullId, without = [] }) {
  const full = await bundle({ id: fullId, without });
  const disabled = await bundle({ id: 'app@1.0.0', without: noRemote });
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
