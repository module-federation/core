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

it('should handle version include filters', async () => {
  __webpack_share_scopes__['default'] = {
    'version-include': {
      '1.2.0': {
        get: () => () => 'shared version-include',
      },
    },
  };

  const result = await import('version-include');
  expect(result.default).toBe('shared version-include');
  expectWarning();
});

it('should handle version exclude filters', async () => {
  __webpack_share_scopes__['default'] = {
    'version-exclude': {
      '1.2.0': {
        get: () => () => 'shared version-exclude',
      },
    },
  };

  const result = await import('version-exclude');
  expect(result.default).toBe('shared version-exclude');
  expectWarning();
});

it('should fail version include filters and show warning', async () => {
  __webpack_share_scopes__['default'] = {};

  const result = await import('version-include-fail');
  expect(result.default).toBe('version-include-fail');
  expectWarning(/does not satisfy include filter/);
});

it('should fail version exclude filters and show warning', async () => {
  __webpack_share_scopes__['default'] = {};

  const result = await import('version-exclude-fail');
  expect(result.default).toBe('version-exclude-fail');
  expectWarning(/matches exclude filter/);
});

it('should handle request filters for prefixed modules', async () => {
  __webpack_share_scopes__['default'] = {
    'request-filter/components/Modal': {
      '1.0.0': {
        get: () => () => 'shared modal',
      },
    },
  };

  // Should pass include filter (contains 'components') but not exclude filter (doesn't contain 'Button')
  const result1 = await import('request-filter/components/Modal');
  expect(result1.default).toBe('shared modal');
  expectWarning();

  // Should fail because it contains 'Button' (exclude filter)
  const result2 = await import('request-filter/components/Button');
  expect(result2.default).toBe('request-filter-components-Button');
  expectWarning();

  // Should fail because it doesn't contain 'components' (include filter)
  const result3 = await import('request-filter/utils/helper');
  expect(result3.default).toBe('request-filter-utils-helper');
  expectWarning();
});

it('should warn about singleton filters', async () => {
  __webpack_share_scopes__['default'] = {
    'singleton-filter': {
      '1.0.0': {
        get: () => () => 'shared singleton',
      },
    },
  };

  const result = await import('singleton-filter');
  expect(result.default).toBe('shared singleton');
  expectWarning(/singleton.*include.*version/);
});
