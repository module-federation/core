import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const worktree = resolve(process.env.RFC5128_CACHE_WORKTREE || fileURLToPath(new URL('./rfc5128-cache/', import.meta.url)));
const built = (file) => import(pathToFileURL(resolve(worktree, 'packages/runtime-core/dist', file)));
const { FederationKernel, getRemoteEntry } = await built('kernel.js');
const { remote } = await built('remote/capability.js');
const { resetFederationGlobalInfo } = await built('global.js');
const { getRemoteInfo } = await built('utils/load.js');
const entry = pathToFileURL(resolve(worktree, 'packages/runtime-core/__tests__/resources/load/evaluator-entry.js')).href;
function evaluator(name, failures = 0) {
  let evaluations = 0;
  return {
    evaluations: () => evaluations,
    platform: {
      isBrowser: () => false,
      loadScript: async () => undefined,
      async loadEntry({ remoteInfo, getEntryUrl }) {
        const url = getEntryUrl ? getEntryUrl(remoteInfo.entry) : remoteInfo.entry;
        const source = await readFile(new URL(url), 'utf8');
        evaluations += 1;
        return runInNewContext(source, {
          evaluatorName: new URL(url).searchParams.get('evaluator') || name,
          failEvaluation: evaluations <= failures,
        });
      },
    },
  };
}
const host = (platform, plugins = [], id) => new FederationKernel(
  { name: 'same-host', id, remotes: [{ name: 'app', entry }], plugins },
  { remote, platform },
);
let passed = 0;
let failed = 0;
async function check(name, fn) {
  resetFederationGlobalInfo();
  try { await fn(); passed += 1; process.stdout.write(`PASS ${name}\n`); }
  catch (error) { failed += 1; process.stderr.write(`FAIL ${name}: ${error.stack}\n`); }
}
for (const [a, b] of [['A', 'B'], ['B', 'A']]) {
  for (const concurrent of [false, true]) {
    await check(`distinct ${a}->${b} concurrent=${concurrent}`, async () => {
      const first = evaluator(a), second = evaluator(b);
      const firstHost = host(first.platform), secondHost = host(second.platform);
      const actual = concurrent
        ? await Promise.all([firstHost.loadRemote('app/Button'), secondHost.loadRemote('app/Button')])
        : [await firstHost.loadRemote('app/Button'), await secondHost.loadRemote('app/Button')];
      assert.deepEqual(actual, [`${a}:./Button`, `${b}:./Button`]);
      assert.equal(first.evaluations(), 1); assert.equal(second.evaluations(), 1);
    });
  }
}
for (const concurrent of [false, true]) {
  await check(`same platform dedupe concurrent=${concurrent}`, async () => {
    const evaluated = evaluator('shared');
    const first = host(evaluated.platform), second = host(evaluated.platform);
    const actual = concurrent
      ? await Promise.all([first.loadRemote('app/Button'), second.loadRemote('app/Button')])
      : [await first.loadRemote('app/Button'), await second.loadRemote('app/Button')];
    assert.deepEqual(actual, ['shared:./Button', 'shared:./Button']);
    assert.equal(evaluated.evaluations(), 1);
  });
}
await check('rejection then another evaluator then retry', async () => {
  const retry = evaluator('retry', 1), other = evaluator('other');
  const origin = host(retry.platform);
  await assert.rejects(origin.loadRemote('app/Button'), /transient evaluator failure/);
  assert.equal(await host(other.platform).loadRemote('app/Button'), 'other:./Button');
  assert.equal(await origin.loadRemote('app/Button'), 'retry:./Button');
  assert.equal(retry.evaluations(), 2); assert.equal(other.evaluations(), 1);
});
await check('reset clears evaluated promise', async () => {
  const evaluated = evaluator('reset');
  assert.equal(await host(evaluated.platform).loadRemote('app/Button'), 'reset:./Button');
  resetFederationGlobalInfo();
  assert.equal(await host(evaluated.platform).loadRemote('app/Button'), 'reset:./Button');
  assert.equal(evaluated.evaluations(), 2);
});
await check('equivalent factories remain usable', async () => {
  const first = evaluator('equivalent'), second = evaluator('equivalent');
  assert.equal(await host(first.platform).loadRemote('app/Button'), 'equivalent:./Button');
  assert.equal(await host(second.platform).loadRemote('app/Button'), 'equivalent:./Button');
  assert.equal(first.evaluations(), 1); assert.equal(second.evaluations(), 1);
});
await check('identical callback uses host state independently', async () => {
  const a = evaluator('host-A'), b = evaluator('host-B'), fallback = evaluator('fallback');
  const plugin = {
    name: 'host-state',
    loadEntry({ origin, remoteInfo, loaderHook }) {
      return (origin.options.id === 'A' ? a : b).platform.loadEntry({ remoteInfo, loaderHook });
    },
  };
  const results = await Promise.all([
    host(fallback.platform, [plugin], 'A').loadRemote('app/Button'),
    host(fallback.platform, [plugin], 'B').loadRemote('app/Button'),
  ]);
  assert.deepEqual(results, ['host-A:./Button', 'host-B:./Button']);
  assert.equal(a.evaluations(), 1); assert.equal(b.evaluations(), 1); assert.equal(fallback.evaluations(), 0);
});
await check('same source URL distinct transformations', async () => {
  const evaluated = evaluator('fallback'), origin = host(evaluated.platform);
  const remoteInfo = getRemoteInfo({ name: 'app', entry });
  const transformA = (url) => `${url}?evaluator=url-A`;
  const transformB = (url) => `${url}?evaluator=url-B`;
  const [a, b] = await Promise.all([
    getRemoteEntry({ origin, remoteInfo, getEntryUrl: transformA }),
    getRemoteEntry({ origin, remoteInfo, getEntryUrl: transformB }),
  ]);
  assert.equal(await (await a.get('./Button'))(), 'url-A:./Button');
  assert.equal(await (await b.get('./Button'))(), 'url-B:./Button');
  assert.equal(await getRemoteEntry({ origin, remoteInfo, getEntryUrl: transformA }), a);
  assert.equal(evaluated.evaluations(), 2);
});
process.stdout.write(`SUMMARY passed=${passed} failed=${failed} skipped=0\n`);
if (failed > 0) process.exitCode = 1;
