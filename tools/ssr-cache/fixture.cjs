const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const repo = path.resolve(__dirname, '../..');
const root = process.env.SSR_CACHE_CASE_DIR;
if (!root) throw new Error('Run through baseline.test.cjs');
fs.mkdirSync(root, { recursive: true });
const out = path.join(root, 'dist');
const implementation = path.join(repo, 'packages/runtime-tools');
function write(name, value) {
  fs.writeFileSync(path.join(root, name), value);
}
async function main() {
  const { rspack, container, rspackVersion, RuntimeModule, RuntimeGlobals } =
    await import(
      pathToFileURL(
        process.env.SSR_CACHE_RSPACK_ENTRY || require.resolve('@rspack/core'),
      ).href
    );
  write('v1.js', 'export default "v1";');
  write('v2.js', 'export default "v2";');
  if (process.env.SHARED === '1') {
    write(
      'shared.js',
      'export default {identity:"shared-singleton",lazy:()=>import("./shared-lazy").then(m=>m.default)};',
    );
    write('shared-lazy.js', 'export default {identity:"lazy-singleton"};');
    write('payload.js', 'export default {items:new Array(200000).fill(42)};');
    for (const v of ['v1', 'v2'])
      write(
        v + '.js',
        `import shared from 'shared-lib'; export {shared}; export default '${v}';`,
      );
  }
  write(
    'leaf.js',
    'import value from "remote/Value"; globalThis.executions.leaf++; export default () => value;',
  );
  write(
    'middle.js',
    'import leaf from "./leaf"; globalThis.executions.middle++; export default () => leaf();',
  );
  write(
    'page.js',
    'import middle from "./middle"; globalThis.executions.page++; export default () => middle();',
  );
  write(
    'other.js',
    'globalThis.executions.other++; export default () => "unrelated";',
  );
  write(
    'dynamic.js',
    'globalThis.executions.dynamic++; let saved; export async function render() { saved ||= await __webpack_require__.federation.instance.loadRemote("dynamic/Value"); return saved.default; }',
  );
  write(
    'host.js',
    `globalThis.executions.boot++; export const req = __webpack_require__; export const page = () => import('./page').then(m => m.default); export const other = () => import('./other').then(m => m.default); export const dynamic = () => import('./dynamic').then(m => m.render); export const requestHandler = import('./dynamic').then(m => async () => new Response(await m.render()));`,
  );
  if (process.env.PARENTS === '1')
    fs.appendFileSync(
      path.join(root, 'host.js'),
      'Object.assign(__webpack_require__.remotesLoadingData.consumerModuleIdToParentModuleIds,__webpack_require__.__probeParents);',
    );
  if (process.env.SHARED === '1')
    fs.appendFileSync(
      path.join(root, 'host.js'),
      "export const share=()=>import('shared-lib');",
    );
  write(
    'plugin.js',
    `module.exports=()=>({name:'local-entry',loadEntry({remoteInfo}) { return __non_webpack_require__(remoteInfo.entry); }});`,
  );
  const common = {
    context: root,
    target: 'node',
    mode: 'production',
    devtool: false,
    optimization: {
      minimize: process.env.MINIMIZE === '1',
      concatenateModules: process.env.CONCAT === '1',
      moduleIds: process.env.MODULE_IDS || 'named',
      chunkIds: 'named',
    },
    output: {
      path: out,
      library: { type: 'commonjs2' },
      filename: '[name].cjs',
      chunkFilename: '[name].cjs',
    },
  };
  const configs = ['v1', 'v2'].map((v) => ({
    ...common,
    entry: {},
    output: { ...common.output, uniqueName: v },
    plugins: [
      new container.ModuleFederationPlugin({
        name: v,
        implementation,
        filename: v + '.cjs',
        library: { type: 'commonjs-module' },
        exposes: {
          './Value': './' + v + '.js',
          ...(process.env.SHARED === '1'
            ? { './Payload': './payload.js' }
            : {}),
        },
        shared:
          process.env.SHARED === '1'
            ? {
                'shared-lib': {
                  import: './shared.js',
                  version: '1.0.0',
                  singleton: true,
                },
              }
            : undefined,
      }),
    ],
  }));
  configs.push({
    ...common,
    entry: { host: './host.js' },
    output: { ...common.output, uniqueName: 'probe-host' },
    plugins: [
      new container.ModuleFederationPlugin({
        name: 'probe-host',
        implementation,
        remotes: { remote: { external: 'v1@' + path.join(out, 'v1.cjs') } },
        runtimePlugins: [path.join(root, 'plugin.js')],
        shared:
          process.env.SHARED === '1'
            ? {
                'shared-lib': {
                  import: false,
                  requiredVersion: false,
                  singleton: true,
                },
              }
            : undefined,
      }),
    ],
  });
  if (process.env.PARENTS === '1')
    configs.at(-1).plugins.push({
      apply(compiler) {
        compiler.hooks.thisCompilation.tap(
          'ParentClosureProbe',
          (compilation) => {
            compilation.hooks.runtimeRequirementInTree
              .for(RuntimeGlobals.ensureChunkHandlers)
              .tap('ParentClosureProbe', (chunk) => {
                class Parents extends RuntimeModule {
                  constructor() {
                    super('parent-closure-probe', 30);
                  }
                  generate() {
                    const parents = {};
                    for (const module of compilation.modules) {
                      const id = compilation.chunkGraph.getModuleId(module);
                      if (
                        id == null ||
                        !String(id).startsWith('./') ||
                        id === './plugin.js'
                      )
                        continue;
                      const ids = [];
                      for (const edge of compilation.moduleGraph.getIncomingConnections(
                        module,
                      )) {
                        if (!edge.originModule) continue;
                        const parent = compilation.chunkGraph.getModuleId(
                          edge.originModule,
                        );
                        if (
                          parent != null &&
                          String(parent).startsWith('./') &&
                          !ids.includes(parent)
                        )
                          ids.push(parent);
                      }
                      if (ids.length) parents[id] = ids;
                    }
                    return (
                      '__webpack_require__.__probeParents=' +
                      JSON.stringify(parents) +
                      ';'
                    );
                  }
                }
                compilation.addRuntimeModule(chunk, new Parents());
              });
          },
        );
      },
    });
  await new Promise((resolve, reject) => {
    const c = rspack(configs);
    c.run((e, s) =>
      c.close((closeError) => {
        if (e || closeError || !s || s.hasErrors())
          reject(
            e ||
              closeError ||
              new Error(
                s?.toString({ all: false, errors: true }) ||
                  'Missing compilation stats',
              ),
          );
        else resolve();
      }),
    );
  });
  globalThis.executions = {
    boot: 0,
    leaf: 0,
    middle: 0,
    page: 0,
    other: 0,
    dynamic: 0,
  };
  let host = require(path.join(out, 'host.cjs'));
  const beforePage = await host.page();
  const other = await host.other();
  assert.equal(beforePage(), 'v1');
  assert.equal(other(), 'unrelated');
  let sharedBefore;
  let lazyBefore;
  if (host.share) {
    sharedBefore = (await host.share()).default;
    assert.equal((await host.share()).default, sharedBefore);
    lazyBefore = await sharedBefore.lazy();
  }
  const mapping = JSON.parse(JSON.stringify(host.req.remotesLoadingData));
  const instance = host.req.federation.instance;
  let payloadRef;
  if (host.share)
    payloadRef = new WeakRef(
      (await instance.loadRemote('remote/Payload')).default,
    );
  const template = {
    ...instance.options.remotes.find(
      (r) => r.name === 'remote' || r.alias === 'remote',
    ),
  };
  await instance.removeRemote('remote');
  instance.registerRemotes([
    { ...template, entry: path.join(out, 'v2.cjs'), entryGlobalName: 'v2' },
  ]);
  const afterPage = await host.page();
  const result = {
    rspackVersion,
    rspackEntry:
      process.env.SSR_CACHE_RSPACK_ENTRY || require.resolve('@rspack/core'),
    nodeVersion: process.version,
    completeParents: Boolean(
      mapping.consumerModuleIdToParentModuleIds?.['./middle.js']?.includes(
        './page.js',
      ),
    ),
    mapping,
    static: {
      savedHandler: beforePage(),
      reimport: afterPage(),
      executions: { ...globalThis.executions },
    },
  };
  assert.equal(result.static.savedHandler, 'v1');
  // Desired behavior is asserted by the parent test, including known failures.
  // Supply missing transitive parent cache invalidation only, preserving factories.
  for (const id of Object.keys(host.req.c))
    if (id.startsWith('./page.js')) delete host.req.c[id];
  const patchedPage = await host.page();
  result.static.withPageInvalidated = patchedPage();
  result.static.otherSame = (await host.other()) === other;
  if (host.share) {
    const sharedAfter = (await host.share()).default;
    let payloadCollected = false;
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      global.gc();
      if (!payloadRef.deref()) {
        payloadCollected = true;
        break;
      }
    }
    const selective =
      typeof require(path.join(out, 'v1.cjs'))
        .__webpack_clear_exposed_cache__ === 'function';
    result.shared = {
      selective,
      payloadCollected,
      sameObject: sharedAfter === sharedBefore,
      lazySameObject: (await sharedBefore.lazy()) === lazyBefore,
      lazyValue: (await sharedAfter.lazy()).identity,
      before: sharedBefore,
      after: sharedAfter,
      records: Object.values(globalThis.__FEDERATION__.__SHARE__)
        .map((s) => s.default?.['shared-lib'])
        .filter(Boolean)
        .map((s) =>
          Object.values(s).map((r) => ({
            from: r.from,
            useIn: r.useIn,
            loaded: r.loaded,
            providerState: r.providerState,
          })),
        ),
      cachedModules: Object.keys(host.req.c).filter((k) =>
        /leaf|middle|page|remote\/remote/.test(k),
      ),
    };

    fs.writeFileSync(
      path.join(root, 'result.json'),
      JSON.stringify(result, null, 2),
    );
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  instance.registerRemotes([
    {
      name: 'dynamic',
      entry: path.join(out, 'v1.cjs'),
      type: 'commonjs-module',
      entryGlobalName: 'v1',
    },
  ]);
  const dynamic = await host.dynamic();
  assert.equal(await dynamic(), 'v1');
  await instance.removeRemote('dynamic');
  instance.registerRemotes([
    {
      name: 'dynamic',
      entry: path.join(out, 'v2.cjs'),
      type: 'commonjs-module',
      entryGlobalName: 'v2',
    },
  ]);
  result.dynamic = {
    savedHandler: await dynamic(),
    reimport: await (await host.dynamic())(),
    mappingContainsDynamic: Object.hasOwn(
      mapping.remoteKeyToRemoteModuleIds,
      'dynamic',
    ),
  };
  // Same process: drop all emitted CJS modules then reacquire the application.
  const oldInstance = host.req.federation.instance;
  const oldRequire = host.req;
  const disposeOld = oldRequire.federation.disposeClearCache;
  assert.equal(typeof disposeOld, 'function');
  disposeOld();
  disposeOld();
  for (const key of Object.keys(require.cache))
    if (key.startsWith(out + path.sep)) delete require.cache[key];
  host = require(path.join(out, 'host.cjs'));
  result.rebuild = {
    samePid: process.pid,
    hostChanged: host.req.federation.instance !== oldInstance,
    instances: globalThis.__FEDERATION__.__INSTANCES__.map((i) => i.name),
    registered: host.req.federation.instance.options.remotes.map((r) => ({
      name: r.name,
      entry: r.entry,
    })),
    executions: { ...globalThis.executions },
  };
  result.rebuild.staticResult = (await host.page())();
  result.rebuild.dynamicResult = await (await host.dynamic())();
  result.rebuild.newBundler = host.req !== oldRequire;
  let oldClearCalls = 0,
    newClearCalls = 0;
  const oldClear = oldRequire.federation.clearCache,
    newClear = host.req.federation.clearCache;
  oldRequire.federation.clearCache = (...a) => {
    oldClearCalls++;
    return oldClear(...a);
  };
  host.req.federation.clearCache = (...a) => {
    newClearCalls++;
    return newClear(...a);
  };
  const nextTemplate = {
    ...host.req.federation.instance.options.remotes.find(
      (r) => r.alias === 'remote' || r.name === 'remote',
    ),
  };
  await host.req.federation.instance.removeRemote('remote');
  host.req.federation.instance.registerRemotes([
    { ...nextTemplate, entry: path.join(out, 'v1.cjs'), entryGlobalName: 'v1' },
  ]);
  result.rebuild.secondUpdate = {
    oldClearCalls,
    newClearCalls,
    result: (await host.page())(),
  };
  assert.equal(result.dynamic.reimport, 'v1');
  assert.equal(result.rebuild.dynamicResult, 'v2');

  fs.writeFileSync(
    path.join(root, 'result.json'),
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
