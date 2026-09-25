const { runtimeFiles, hasPart } = require('../_helpers/graph');

it('loads the remote module with shared disabled', async () => {
  const { default: Button } = await import('remote/Button');
  expect(Button()).toBe('Button from remotes_only_remote');
});

it('bundles only the remote capability, the web platform, and the remotes adapter', () => {
  const files = runtimeFiles(__STATS__.children[1]);
  for (const part of ['compose', 'remote', 'platform', 'remotes', 'shareScope'])
    expect([part, hasPart(files, part)]).toEqual([part, true]);
  for (const part of [
    'shared',
    'snapshot',
    'consumes',
    'container',
    'platformNode',
    'sdkNode',
    'bundlerRuntimeIndex',
    'runtimeCoreIndex',
  ])
    expect([part, hasPart(files, part)]).toEqual([part, false]);
});
