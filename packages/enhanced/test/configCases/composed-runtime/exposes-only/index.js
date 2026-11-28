const { bundledRuntimeFiles, hasPart } = require('../_helpers/graph');

it('loads a module from a remote built without remote and shared handlers', async () => {
  const { default: Button } = await import('remote/Button');
  expect(Button()).toBe('Button from exposes_only_remote');
});

it('bundles the remote container with the container adapter and no capability', () => {
  const files = bundledRuntimeFiles(__STATS__.children[0]);
  for (const part of ['compose', 'container', 'shareScope'])
    expect([part, hasPart(files, part)]).toEqual([part, true]);
  for (const part of [
    'shared',
    'remote',
    'snapshot',
    'platform',
    'remotes',
    'consumes',
    'sdkNode',
    'bundlerRuntimeIndex',
    'runtimeCoreIndex',
  ])
    expect([part, hasPart(files, part)]).toEqual([part, false]);
});
