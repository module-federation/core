import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { build } from 'esbuild';

const runtimeDir = path.resolve(import.meta.dirname, '../..');
const packageDir = path.resolve(runtimeDir, '..');
const require = createRequire(path.join(runtimeDir, 'package.json'));

async function bundleRuntime(disableRemote) {
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
      FEDERATION_OPTIMIZE_NO_SHARED: 'false',
      FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN: 'false',
      FEDERATION_BUILD_IDENTIFIER: JSON.stringify(
        disableRemote ? 'disabled-build' : 'full-build',
      ),
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

const server = createServer((_request, response) => {
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
  const full = await bundleRuntime(false);
  const disabled = await bundleRuntime(true);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const entry = `http://127.0.0.1:${address.port}/remoteEntry.js`;
  const options = (name) => ({
    name,
    remotes: [{ name: 'tiny', entry }],
  });

  const disabledInstance = disabled.createInstance(options('disabled-app'));
  const created = full.createInstance(options('full-created'));
  const initialized = full.init(options('full-initialized'));
  if (
    globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__ !==
    disabled.ModuleFederation
  ) {
    throw new Error(
      'Expected the remote-disabled constructor to register last',
    );
  }

  let disabledError;
  try {
    await disabledInstance.loadRemote('tiny/value');
  } catch (error) {
    disabledError = error.message;
  }
  const createdRemote = await created.loadRemote('tiny/value');
  const initializedRemote = await initialized.loadRemote('tiny/value');
  console.log(
    JSON.stringify({
      disabledError,
      createdValue: createdRemote?.value,
      initializedValue: initializedRemote?.value,
      instanceNames: globalThis.__FEDERATION__.__INSTANCES__.map(
        (instance) => instance.name,
      ),
    }),
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
}
