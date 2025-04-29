let warnings;
let oldWarn;

beforeEach(() => {
  warnings = [];
  oldWarn = console.warn;
  console.warn = (warning) => {
    warnings.push(warning);
  };
});

afterEach(() => {
  console.warn = oldWarn;
});

it('should share modules NOT matching the filter', async () => {
  const moduleA = await import('prefix/a');
  expect(moduleA.default).toBe('a');

  // This should not be shared due to filter pattern
  const container = __webpack_share_scopes__['test-scope'];
  console.log(container);

  expect(container).toBeDefined();
  expect(container['prefix/a']).toBeDefined();
});

it('should not share modules in deep directory', async () => {
  const moduleB = await import('prefix/deep/b');
  expect(moduleB.default).toBe('b');

  // This should not be shared due to filter pattern
  const container = __webpack_require__.S['test-scope'];
  expect(container['prefix/deep/b']).toBeUndefined();
});
