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

it('bundles the shared capability and the consumes adapter only', () => {
  const files = bundledRuntimeFiles(__STATS__);
  for (const part of ['compose', 'shared', 'consumes', 'shareScope'])
    expect([part, hasPart(files, part)]).toEqual([part, true]);
  for (const part of [
    'remote',
    'snapshot',
    'platform',
    'remotes',
    'container',
    'sdkNode',
    'bundlerRuntimeIndex',
    'runtimeCoreIndex',
  ])
    expect([part, hasPart(files, part)]).toEqual([part, false]);
});
