import assert from 'node:assert/strict';
import { FederationKernel, getRemoteEntry } from './rfc5128-cache/packages/runtime-core/dist/kernel.js';
import { remote } from './rfc5128-cache/packages/runtime-core/dist/remote/capability.js';
import { node } from './rfc5128-cache/packages/runtime-core/dist/platform/node.js';
import { resetFederationGlobalInfo } from './rfc5128-cache/packages/runtime-core/dist/global.js';
import { getRemoteInfo } from './rfc5128-cache/packages/runtime-core/dist/utils/load.js';
process.env.IS_ESM_BUILD = 'true';
const url = 'https://cache-proof.invalid/entry.js';
const globalName = 'cacheProofNodeEntry';
const data = (source) => `data:text/javascript,${encodeURIComponent(source)}`;
const entry = (name) => data(`module.exports = { init() {}, get(expose) { return () => '${name}:' + expose; } };`);
const host = (name, count) => new FederationKernel({
  name: 'same-host', remotes: [{ name: 'app', entry: url, entryGlobalName: globalName }],
  plugins: [{ name: `entry-${name}`, createScript() { count(); return { url: entry(name) }; } }],
}, { remote, platform: node });
let passed = 0, failed = 0;
async function check(name, fn) {
  resetFederationGlobalInfo(); delete globalThis[globalName];
  try { await fn(); passed += 1; console.log(`PASS ${name}`); }
  catch (error) { failed += 1; console.error(`FAIL ${name}: ${error.stack}`); }
}
for (const [a, b] of [['A', 'B'], ['B', 'A']]) {
  for (const concurrent of [false, true]) {
    await check(`createScript ${a}->${b} concurrent=${concurrent}`, async () => {
      let firstCalls = 0, secondCalls = 0;
      const first = host(a, () => { firstCalls += 1; });
      const second = host(b, () => { secondCalls += 1; });
      const actual = concurrent
        ? await Promise.all([first.loadRemote('app/Button'), second.loadRemote('app/Button')])
        : [await first.loadRemote('app/Button'), await second.loadRemote('app/Button')];
      assert.deepEqual(actual, [`${a}:./Button`, `${b}:./Button`]);
      assert.equal(firstCalls, 1); assert.equal(secondCalls, 1);
    });
    await check(`getEntryUrl ${a}->${b} concurrent=${concurrent}`, async () => {
      const origin = new FederationKernel({ name: 'same-host' }, { platform: node });
      const remoteInfo = getRemoteInfo({ name: 'app', entry: entry('original'), entryGlobalName: globalName });
      const firstArgs = { origin, remoteInfo, getEntryUrl: () => entry(a) };
      const secondArgs = { origin, remoteInfo, getEntryUrl: () => entry(b) };
      const actual = concurrent
        ? await Promise.all([getRemoteEntry(firstArgs), getRemoteEntry(secondArgs)])
        : [await getRemoteEntry(firstArgs), await getRemoteEntry(secondArgs)];
      assert.equal(await (await actual[0].get('./Button'))(), `${a}:./Button`);
      assert.equal(await (await actual[1].get('./Button'))(), `${b}:./Button`);
      assert.equal(await getRemoteEntry(firstArgs), actual[0]);
    });
  }
}
await check('default loader cross-host dedupe', async () => {
  globalThis.nodeProofEvaluations = 0;
  const original = data(`globalThis.nodeProofEvaluations += 1; module.exports={init(){},get(expose){return()=> 'default:'+expose}};`);
  const make = () => new FederationKernel({ name: 'same-host', remotes: [{ name: 'app', entry: original, entryGlobalName: globalName }] }, { remote, platform: node });
  assert.deepEqual(await Promise.all([make().loadRemote('app/Button'), make().loadRemote('app/Button')]), ['default:./Button', 'default:./Button']);
  assert.equal(globalThis.nodeProofEvaluations, 1); delete globalThis.nodeProofEvaluations;
});
await check('custom same-origin concurrent dedupe', async () => {
  let calls = 0;
  const origin = host('same', () => { calls += 1; });
  assert.deepEqual(await Promise.all([origin.loadRemote('app/Button'), origin.loadRemote('app/Button')]), ['same:./Button', 'same:./Button']);
  assert.equal(calls, 1);
});
await check('rejection, other evaluator, then successful retry', async () => {
  let calls = 0;
  const retry = new FederationKernel({ name: 'same-host', remotes: [{ name: 'app', entry: url, entryGlobalName: globalName }], plugins: [{ name:'retry', createScript() { calls += 1; return { url: calls === 1 ? data("throw new Error('transient Node entry failure')") : entry('retry') }; } }] }, { remote, platform: node });
  await assert.rejects(retry.loadRemote('app/Button'), /transient Node entry failure/);
  assert.equal(await host('other', () => {}).loadRemote('app/Button'), 'other:./Button');
  assert.equal(await retry.loadRemote('app/Button'), 'retry:./Button');
  assert.equal(calls, 2);
});
await check('invalid SDK payload is rejected at external boundary', async () => {
  const origin = new FederationKernel({ name: 'same-host', remotes: [{ name: 'app', entry: url, entryGlobalName: globalName }], plugins: [{ name:'invalid', createScript: () => ({ url: data('module.exports={get:42,init(){}};') }) }] }, { remote, platform: node });
  await assert.rejects(origin.loadRemote('app/Button'), /did not return callable get\/init exports/);
});
console.log(`SUMMARY passed=${passed} failed=${failed} skipped=0`);
if (failed > 0) process.exitCode = 1;
