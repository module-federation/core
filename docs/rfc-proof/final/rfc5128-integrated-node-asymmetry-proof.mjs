import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const worktree = process.env.RFC5128_CACHE_WORKTREE;
if (!worktree) throw new Error('RFC5128_CACHE_WORKTREE is required');
const artifact = (file) =>
  pathToFileURL(`${worktree}/packages/runtime-core/dist/${file}`).href;
const { FederationKernel } = await import(artifact('kernel.js'));
const { remote } = await import(artifact('remote/capability.js'));
const { node } = await import(artifact('platform/node.js'));
const { resetFederationGlobalInfo } = await import(artifact('global.js'));
const { getRemoteInfo } = await import(artifact('utils/load.js'));
process.env.IS_ESM_BUILD = 'true';
const globalName = 'cacheProofNodeEntry';
const data = (source) => `data:text/javascript,${encodeURIComponent(source)}`;
const entry = (name) =>
  data(
    `globalThis.nodeAsymmetry${name} += 1; module.exports={init(){},get(expose){return()=> '${name}:'+expose}};`,
  );
function host(custom, observer) {
  const plugins = [];
  if (custom)
    plugins.push({
      name: 'custom-A',
      createScript: () => ({ url: entry('A') }),
    });
  if (observer) plugins.push({ name: 'observer', afterLoadEntry: observer });
  return new FederationKernel(
    {
      name: 'same-host',
      remotes: [
        { name: 'app', entry: entry('B'), entryGlobalName: globalName },
      ],
      plugins,
    },
    { remote, platform: node },
  );
}
let passed = 0,
  failed = 0;
async function check(name, fn) {
  resetFederationGlobalInfo();
  delete globalThis[globalName];
  globalThis.nodeAsymmetryA = 0;
  globalThis.nodeAsymmetryB = 0;
  try {
    await fn();
    passed++;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}: ${error.stack}`);
  }
}
for (const customFirst of [true, false]) {
  for (const concurrent of [false, true]) {
    await check(
      `custom/default customFirst=${customFirst} concurrent=${concurrent}`,
      async () => {
        let announce, release;
        const evaluated = new Promise((resolve) => {
          announce = resolve;
        });
        const gate = new Promise((resolve) => {
          release = resolve;
        });
        const first = host(
          customFirst,
          concurrent
            ? async () => {
                announce();
                await gate;
              }
            : undefined,
        );
        const second = host(!customFirst);
        const expected = customFirst
          ? ['A:./Button', 'B:./Button']
          : ['B:./Button', 'A:./Button'];
        let actual;
        if (concurrent) {
          const pending = first.loadRemote('app/Button');
          await evaluated;
          let later;
          try {
            later = await second.loadRemote('app/Button');
          } finally {
            release();
          }
          actual = [await pending, later];
        } else
          actual = [
            await first.loadRemote('app/Button'),
            await second.loadRemote('app/Button'),
          ];
        assert.deepEqual(actual, expected);
        assert.equal(globalThis.nodeAsymmetryA, 1);
        assert.equal(globalThis.nodeAsymmetryB, 1);
      },
    );
  }
}
await check(
  'default cross-host concurrency and retained cache dedupe',
  async () => {
    const first = host(false),
      second = host(false);
    assert.deepEqual(
      await Promise.all([
        first.loadRemote('app/Button'),
        second.loadRemote('app/Button'),
      ]),
      ['B:./Button', 'B:./Button'],
    );
    assert.equal(await host(false).loadRemote('app/Button'), 'B:./Button');
    assert.equal(globalThis.nodeAsymmetryB, 1);
  },
);
await check(
  'legacy direct platform global reuse without loading context',
  async () => {
    const cached = {
      init() {},
      get() {
        return () => 'legacy';
      },
    };
    globalThis[globalName] = cached;
    const origin = host(false);
    const actual = await node.loadEntry({
      remoteInfo: getRemoteInfo({
        name: 'app',
        entry: entry('B'),
        entryGlobalName: globalName,
      }),
      loaderHook: origin.loaderHook,
    });
    assert.equal(actual, cached);
    assert.equal(await (await actual.get('./Button'))(), 'legacy');
    assert.equal(globalThis.nodeAsymmetryB, 0);
  },
);
console.log(`SUMMARY passed=${passed} failed=${failed} skipped=0`);
if (failed) process.exitCode = 1;
