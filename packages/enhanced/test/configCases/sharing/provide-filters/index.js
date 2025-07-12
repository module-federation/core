let warnings = [];
let oldWarn;

beforeEach((done) => {
  oldWarn = console.warn;
  console.warn = (m) => warnings.push(m);
  done();
});

afterEach((done) => {
  expectWarning();
  console.warn = oldWarn;
  done();
});

const expectWarning = (regexp) => {
  if (!regexp) {
    expect(warnings).toEqual([]);
  } else if (Array.isArray(regexp)) {
    expect(warnings.length).toBe(regexp.length);
    regexp.forEach((r, i) => {
      expect(r.test(warnings[i])).toEqual(true);
    });
  } else {
    warnings.forEach((warning) => {
      expect(regexp.test(warning)).toEqual(true);
    });
  }
  warnings.length = 0;
};

it('should provide modules that pass version include filters', async () => {
  // Check that the module was provided to the share scope
  expect(__webpack_share_scopes__['default']['version-include']).toBeDefined();
  expect(
    __webpack_share_scopes__['default']['version-include']['1.2.0'],
  ).toBeDefined();
  expectWarning();
});

it('should provide modules that pass version exclude filters', async () => {
  // Check that the module was provided to the share scope
  expect(__webpack_share_scopes__['default']['version-exclude']).toBeDefined();
  expect(
    __webpack_share_scopes__['default']['version-exclude']['1.2.0'],
  ).toBeDefined();
  expectWarning();
});

it('should not provide modules that fail version include filters', async () => {
  // Check that the module was NOT provided to the share scope
  expect(
    __webpack_share_scopes__['default']['version-include-fail'],
  ).toBeUndefined();
  expectWarning(/does not satisfy include filter/);
});

it('should not provide modules that fail version exclude filters', async () => {
  // Check that the module was NOT provided to the share scope
  expect(
    __webpack_share_scopes__['default']['version-exclude-fail'],
  ).toBeUndefined();
  expectWarning(/matches exclude filter/);
});

it('should handle request filters for prefixed modules', async () => {
  // Modules with 'components' in path should be provided (unless they contain 'Button')
  expect(
    __webpack_share_scopes__['default']['request-filter/components/Modal'],
  ).toBeDefined();

  // Modules with 'Button' should be excluded
  expect(
    __webpack_share_scopes__['default']['request-filter/components/Button'],
  ).toBeUndefined();

  // Modules without 'components' should be excluded
  expect(
    __webpack_share_scopes__['default']['request-filter/utils/helper'],
  ).toBeUndefined();
  expectWarning();
});

it('should warn about singleton filters', async () => {
  // Check that the singleton module was provided
  expect(__webpack_share_scopes__['default']['singleton-filter']).toBeDefined();
  expect(
    __webpack_share_scopes__['default']['singleton-filter']['1.0.0'],
  ).toBeDefined();
  expectWarning(/singleton.*include.*version/);
});
