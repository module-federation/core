const { runtimeFiles, hasPart } = require('../_helpers/graph');

it('loads the remote module with one shared-lib instance', async () => {
  const { default: app } = await import('./App');
  const { button, remoteLib, hostLib } = await app();
  expect(button).toBe('Button from composed_default');
  expect(remoteLib).toBe(hostLib);
  expect(globalThis.__composedSharedLibEvaluations).toBe(1);
});

it('bundles the composed bootstrap with every capability and adapter', () => {
  const files = runtimeFiles(__STATS__);
  for (const part of [
    'compose',
    'remotes',
    'consumes',
    'container',
    'shareScope',
    'shared',
    'remote',
    'snapshot',
    'platform',
  ]) {
    expect([part, hasPart(files, part)]).toEqual([part, true]);
  }
  expect(hasPart(files, 'bundlerRuntimeIndex')).toBe(false);
  expect(hasPart(files, 'runtimeCoreIndex')).toBe(false);
});
