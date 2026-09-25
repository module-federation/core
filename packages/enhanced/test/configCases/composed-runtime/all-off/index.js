const { runtimeFiles, hasPart } = require('../_helpers/graph');

it('creates a kernel instance without capabilities', () => {
  const { instance } = __webpack_require__.federation;
  expect(instance.options.name).toBe('composed_all_off');
  expect(instance.options.remotes).toEqual([]);
});

it('bundles the kernel and no capability or adapter', () => {
  const files = runtimeFiles(__STATS__);
  expect(hasPart(files, 'compose')).toBe(true);
  for (const part of [
    'shared',
    'remote',
    'snapshot',
    'platform',
    'remotes',
    'consumes',
    'container',
    'shareScope',
    'sdkNode',
    'bundlerRuntimeIndex',
    'runtimeCoreIndex',
  ])
    expect([part, hasPart(files, part)]).toEqual([part, false]);
});
