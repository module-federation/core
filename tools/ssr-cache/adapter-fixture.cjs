const assert = require('node:assert/strict');
const path = require('node:path');
const { installClearCache } = require(
  path.join(
    __dirname,
    '../../packages/webpack-bundler-runtime/dist/clearCache.cjs',
  ),
);
const instance = {
  moduleCache: new Map(),
  loadRemote: async () => null,
  registerRemotes() {},
  options: { remotes: [] },
  loaderHook: { lifecycle: { createScript: { on() {}, remove() {} } } },
};
function attach() {
  const runtime = {
    federation: { instance, bundlerRuntimeOptions: {} },
    m: {},
    c: {},
  };
  const weak = new WeakRef(runtime);
  const dispose = installClearCache({ webpackRequire: runtime });
  const savedClear = runtime.federation.clearCache;
  dispose();
  return { weak, dispose, savedClear };
}
(async () => {
  const retained = attach();
  for (let n = 0; n < 30; n++) {
    await new Promise((r) => setTimeout(r, 10));
    global.gc();
    if (!retained.weak.deref()) break;
  }
  assert.equal(
    retained.weak.deref(),
    undefined,
    'retained disposer retains old runtime',
  );
  retained.dispose();
  await assert.rejects(retained.savedClear({ name: 'remote' }), /detached/);
  console.log(
    'disposed runtime collected with handle and clear function retained',
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
