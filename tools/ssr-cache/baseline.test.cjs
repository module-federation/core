const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Each case owns a process: MF globals must not leak between compilations.
function run(script, directory, flags = {}) {
  const child = spawnSync(
    process.execPath,
    ['--expose-gc', path.join(__dirname, script)],
    {
      env: {
        ...process.env,
        PARENTS: '0',
        SHARED: '0',
        CONCAT: '0',
        ...flags,
        SSR_CACHE_CASE_DIR: directory,
      },
      timeout: 120_000,
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  assert.ifError(child.error);
  assert.equal(child.status, 0, child.stderr + child.stdout);
}

// A known defect is not a passing feature test. Strict mode makes all TODOs
// release-blocking. Unexpected passes also fail so the TODO must be removed.
async function knownFailure(t, name, verify) {
  if (process.env.SSR_CACHE_STRICT === '1') return t.test(name, verify);
  let failure;
  try {
    verify();
  } catch (error) {
    failure = error;
  }
  assert.ok(failure, `${name}: now passes; remove its TODO designation`);
  await t.test(
    name,
    { todo: 'R1: known defect, blocks production acceptance' },
    () => {
      throw failure;
    },
  );
}

for (const [variant, flags] of Object.entries({
  plain: {},
  concat: { CONCAT: '1' },
  parents: { PARENTS: '1' },
  shared: { SHARED: '1' },
  ...(process.env.SSR_CACHE_EXPECT_NATIVE === '1'
    ? {
        'shared-concat': { SHARED: '1', CONCAT: '1' },
        'shared-numeric': {
          SHARED: '1',
          MODULE_IDS: 'deterministic',
          MINIMIZE: '1',
        },
      }
    : {}),
})) {
  test(`real Rspack artifacts: ${variant}`, async (t) => {
    const directory = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), 'mf-ssr-cache-')),
    );
    try {
      run('fixture.cjs', directory, flags);
      const result = JSON.parse(
        fs.readFileSync(path.join(directory, 'result.json'), 'utf8'),
      );
      t.diagnostic(
        JSON.stringify({
          variant,
          rspack: result.rspackVersion,
          entry: result.rspackEntry,
          node: result.nodeVersion,
        }),
      );
      assert.equal(
        result.static.savedHandler,
        'v1',
        'cache invalidation cannot mutate a retained function',
      );
      assert.equal(
        result.static.otherSame,
        true,
        'unrelated exports retain identity',
      );
      assert.equal(result.static.executions.other, 1);
      if (
        (variant === 'plain' || variant === 'shared') &&
        !result.completeParents &&
        process.env.SSR_CACHE_EXPECT_NATIVE !== '1'
      ) {
        await knownFailure(t, 'reacquiring a static page returns v2', () =>
          assert.equal(result.static.reimport, 'v2'),
        );
      } else {
        assert.equal(result.static.reimport, 'v2');
        if (variant === 'parents') {
          for (const module of ['page', 'middle', 'leaf'])
            assert.equal(result.static.executions[module], 2);
          assert.equal(result.rebuild.afterRebindingHook.result, 'v1');
          assert.equal(result.rebuild.afterRebindingHook.newClearCalls, 1);
        }
      }
      if (flags.SHARED === '1') {
        if (process.env.SSR_CACHE_EXPECT_NATIVE === '1')
          assert.equal(result.shared.selective, true);
        await t.test('shared retention does not skip host invalidation', () =>
          assert.equal(result.static.withPageInvalidated, 'v2'),
        );
        await t.test('consumed shared export retains strict identity', () =>
          assert.equal(result.shared.sameObject, true),
        );
        await t.test(
          'unshared provider payload can be collected',
          {
            skip:
              !result.shared.selective &&
              'Provider lacks selective cleanup capability',
          },
          () => assert.equal(result.shared.payloadCollected, true),
        );
        await t.test(
          'retained shared lazy dependency keeps identity after removal',
          () => {
            assert.equal(result.shared.lazySameObject, true);
            assert.equal(result.shared.lazyValue, 'lazy-singleton');
          },
        );
      } else {
        assert.equal(result.dynamic.savedHandler, 'v1');
        assert.equal(result.dynamic.reimport, 'v1');
        assert.equal(result.dynamic.mappingContainsDynamic, false);
        assert.equal(result.rebuild.dynamicResult, 'v2');
        assert.equal(result.rebuild.newBundler, true);
        assert.equal(result.rebuild.hostChanged, false);
        await knownFailure(
          t,
          'second update clears the current bundler',
          () => {
            assert.equal(result.rebuild.secondUpdate.oldClearCalls, 0);
            assert.equal(result.rebuild.secondUpdate.newClearCalls, 1);
            assert.equal(result.rebuild.secondUpdate.result, 'v1');
          },
        );
      }
      if (variant === 'plain') {
        await t.test(
          'Modern resource publication keeps server/PID/port',
          {
            skip:
              !process.env.SSR_CACHE_MODERN_ENTRY &&
              'Set SSR_CACHE_MODERN_ENTRY to a built Modern Node adapter',
          },
          () => {
            run('modern-fixture.cjs', directory);
            const modern = JSON.parse(
              fs.readFileSync(
                path.join(directory, 'modern-result.json'),
                'utf8',
              ),
            );
            assert.equal(modern.recreateResources.text, 'v2');
            for (const key of [
              'pidUnchanged',
              'portUnchanged',
              'manifestReplaced',
              'mfInstanceReused',
            ])
              assert.equal(modern[key], true, key);
          },
        );
      }
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
}
