const { runtimeFiles, hasPart } = require('../_helpers/graph');

it('loads a remote registered from afterPlugins', async () => {
  const { default: Button } = await import('self/Button');
  expect(Button()).toBe('Button from composed_after_plugins');
});

it('bundles the remotes adapter for the late ContainerReferencePlugin', () => {
  const files = runtimeFiles(__STATS__);
  for (const part of ['compose', 'remotes', 'container', 'shareScope'])
    expect([part, hasPart(files, part)]).toEqual([part, true]);
  expect(hasPart(files, 'consumes')).toBe(false);
});
