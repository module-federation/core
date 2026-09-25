import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { build } from 'esbuild';

const runtimeDir = path.resolve(import.meta.dirname, '../..');
const packageDir = path.resolve(runtimeDir, '..');
const require = createRequire(path.join(runtimeDir, 'package.json'));
const scenario = process.argv[2] || 'distinct-last-disabled';

async function bundleRuntime(
  disableRemote,
  buildId,
  { disableShared = false, disableSnapshot = false } = {},
) {
  const result = await build({
    entryPoints: [path.join(runtimeDir, 'src/index.ts')],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    alias: {
      '@module-federation/runtime-core': path.join(
        packageDir,
        'runtime-core/src/index.ts',
      ),
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
      ENV_TARGET: '"node"',
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

try {
  const fullBuildId =
    scenario === 'compatible-reuse' || scenario === 'collision-same-build'
      ? 'app@1.0.0'
      : scenario === 'version-isolated' || scenario.startsWith('collision-')
        ? 'app@2.0.0'
        : 'full-app@1.0.0';
  const disabledBuildId =
    scenario === 'version-isolated' || scenario.startsWith('collision-')
      ? 'app@1.0.0'
      : 'disabled-app@1.0.0';
  let full;
  let disabled;
  if (
    scenario === 'distinct-last-full' ||
    scenario === 'collision-full-first'
  ) {
    disabled = await bundleRuntime(true, disabledBuildId);
    full = await bundleRuntime(false, fullBuildId);
  } else {
    full = await bundleRuntime(false, fullBuildId);
    const disableShared = scenario === 'collision-shared';
    const disableSnapshot = scenario === 'collision-snapshot';
    disabled = await bundleRuntime(
      !disableShared && !disableSnapshot,
      disabledBuildId,
      { disableShared, disableSnapshot },
    );
  }
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const entry = `http://127.0.0.1:${address.port}/remoteEntry.js`;
  const options = (name, version, remoteName = 'tiny') => ({
    name,
    version,
    remotes: [{ name: remoteName, entry }],
  });
  const value = async (instance, id = 'tiny/value') =>
    (await instance.loadRemote(id))?.value;
  const loadError = async (instance) => {
    try {
      await instance.loadRemote('tiny/value');
    } catch (error) {
      return error.message;
    }
    return 'Remote loading unexpectedly succeeded';
  };
  let result;
  if (scenario === 'distinct-last-full') {
    const initialized = full.init(options('full-app'));
    const disabledInstance = disabled.init(options('disabled-app'));
    result = {
      fullValue: await value(initialized),
      fullModuleValue: await value(full),
      disabledError: await loadError(disabledInstance),
      disabledModuleError: await loadError(disabled),
      instanceNames: globalThis.__FEDERATION__.__INSTANCES__.map(
        (instance) => instance.name,
      ),
    };
  } else if (scenario === 'version-isolated') {
    const disabledInstance = disabled.init(options('app', '1.0.0'));
    const initialized = full.init(options('app', '2.0.0'));
    result = {
      disabledError: await loadError(disabledInstance),
      fullValue: await value(initialized),
      fullModuleValue: await value(full),
      versions: globalThis.__FEDERATION__.__INSTANCES__.map(
        (instance) => instance.options.version,
      ),
    };
  } else if (scenario === 'collision-full-first') {
    const initialized = full.init(options('app', '1.0.0'));
    const disabledInstance = disabled.init(options('app', '1.0.0'));
    result = {
      fullValue: await value(initialized),
      disabledError: await loadError(disabledInstance),
      disabledModuleError: await loadError(disabled),
      registeredIds: globalThis.__FEDERATION__.__INSTANCES__.map(
        (instance) => instance.options.id,
      ),
    };
  } else if (
    scenario === 'collision-different-build' ||
    scenario === 'collision-same-build'
  ) {
    const disabledInstance = disabled.init(options('app', '1.0.0'));
    const initialized = full.init(options('app', '1.0.0'));
    const repeated = full.init(options('app', '1.0.0'));
    result = {
      disabledError: await loadError(disabledInstance),
      fullValue: await value(initialized),
      fullModuleValue: await value(full),
      repeatedValue: await value(repeated),
      registeredIds: globalThis.__FEDERATION__.__INSTANCES__.map(
        (instance) => instance.options.id,
      ),
    };
  } else if (scenario === 'collision-shared') {
    const sharedOptions = {
      ...options('app', '1.0.0'),
      shared: {
        token: {
          version: '1.0.0',
          get: async () => () => ({ value: 'shared-value' }),
        },
      },
    };
    const disabledInstance = disabled.init(sharedOptions);
    const initialized = full.init(sharedOptions);
    const disabledError = await disabledInstance.loadShare('token').then(
      () => 'Shared loading unexpectedly succeeded',
      (error) => error.message,
    );
    const shared = await initialized.loadShare('token');
    result = {
      disabledError,
      sharedValue: shared?.()?.value,
      fullValue: await value(initialized),
    };
  } else if (scenario === 'collision-snapshot') {
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
    result = {
      directValue: await value(direct),
      manifestValue: await value(initialized, 'manifest-tiny/value'),
      moduleValue: await value(full, 'manifest-tiny/value'),
    };
  } else if (scenario === 'compatible-reuse') {
    const compatible = await bundleRuntime(false, 'app@2.0.0');
    const first = full.init({
      ...options('app', '1.0.0'),
      shared: {
        token: {
          version: '1.0.0',
          get: async () => () => ({ value: 'shared-value' }),
        },
      },
    });
    const fresh = full.createInstance(options('app', '1.0.0', 'fresh'));
    const repeated = compatible.init(options('app', '1.0.0'));
    const shared = await repeated.loadShare('token');
    result = {
      firstValue: await value(first),
      repeatedValue: await value(repeated),
      moduleValue: await value(full),
      compatibleModuleValue: await value(compatible),
      freshValue: await value(fresh, 'fresh/value'),
      sharedValue: shared?.()?.value,
      instanceCount: globalThis.__FEDERATION__.__INSTANCES__.length,
    };
  } else if (scenario === 'distinct-last-disabled') {
    const disabledInstance = disabled.createInstance(options('disabled-app'));
    const created = full.createInstance(options('full-created'));
    const initialized = full.init(options('full-initialized'));
    result = {
      disabledError: await loadError(disabledInstance),
      createdValue: await value(created),
      initializedValue: await value(initialized),
      moduleValue: await value(full),
      instanceNames: globalThis.__FEDERATION__.__INSTANCES__.map(
        (instance) => instance.name,
      ),
    };
  } else {
    throw new Error(`Unknown optimized-runtime scenario: ${scenario}`);
  }
  console.log(JSON.stringify(result));
} finally {
  await new Promise((resolve) => server.close(resolve));
}
