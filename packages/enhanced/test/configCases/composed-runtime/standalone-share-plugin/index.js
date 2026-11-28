const { bundledRuntimeFiles, hasPart } = require('../_helpers/graph');

const evaluationsBefore = globalThis.__composedSharedLibEvaluations || 0;

it('shares one instance through a standalone SharePlugin', async () => {
  const { default: app } = await import('./App');
  const { button, remoteLib, hostLib } = await app();
  expect(button).toBe('Button from composed_standalone_share');
  expect(remoteLib).toBe(hostLib);
  expect(globalThis.__composedSharedLibEvaluations - evaluationsBefore).toBe(1);
});

it('bundles the consumes adapter the standalone SharePlugin needs', () => {
  const files = bundledRuntimeFiles(__STATS__);
  for (const part of [
    'compose',
    'consumes',
    'shareScope',
    'shared',
    'remotes',
    'container',
  ])
    expect([part, hasPart(files, part)]).toEqual([part, true]);
});
