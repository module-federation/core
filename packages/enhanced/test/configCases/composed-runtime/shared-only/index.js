const { bundledRuntimeFiles, hasPart } = require('../_helpers/graph');

const evaluationsBefore = globalThis.__composedSharedLibEvaluations || 0;

it('resolves the shared module through the share scope', async () => {
  const { default: app } = await import('./App');
  expect(typeof app().token).toBe('number');
  expect(globalThis.__composedSharedLibEvaluations - evaluationsBefore).toBe(1);
  expect(
    Object.keys(__webpack_require__.federation.instance.shareScopeMap.default),
  ).toEqual(['shared-lib']);
});

it('bundles the shared capability, platform, and consumes adapter', () => {
  const files = bundledRuntimeFiles(__STATS__);
  for (const part of [
    'compose',
    'shared',
    'platform',
    'consumes',
    'shareScope',
    'sdkNode',
  ])
    expect([part, hasPart(files, part)]).toEqual([part, true]);
  for (const part of [
    'remote',
    'snapshot',
    'remotes',
    'container',
    'bundlerRuntimeIndex',
    'runtimeCoreIndex',
  ])
    expect([part, hasPart(files, part)]).toEqual([part, false]);
});
