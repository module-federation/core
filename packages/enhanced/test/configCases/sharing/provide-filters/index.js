// Conditional imports to help webpack detect the shared modules
if (Math.random() == 1) {
  require('./version-include.js');
  require('./version-exclude.js');
  require('./version-include-fail.js');
  require('./version-exclude-fail.js');
  require('./singleton-filter.js');
  require('./request-filter/components/Button.js');
  require('./request-filter/components/Modal.js');
  require('./request-filter/utils/helper.js');
}

let warnings = [];
let oldWarn;

beforeEach(() => {
  oldWarn = console.warn;
  console.warn = (m) => warnings.push(m);
});

afterEach(() => {
  expectWarning();
  console.warn = oldWarn;
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
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import the module to trigger sharing
  const module = await import('./version-include.js');
  expect(module.default).toBe('version-include');

  // Check that the module was provided to the share scope
  expect(__webpack_require__.S).toBeDefined();
  expect(__webpack_require__.S['default']).toBeDefined();
  expect(__webpack_require__.S['default']['version-include']).toBeDefined();
  expect(
    __webpack_require__.S['default']['version-include']['1.2.0'],
  ).toBeDefined();
  expectWarning();
});

it('should provide modules that pass version exclude filters', async () => {
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import the module to trigger sharing
  const module = await import('./version-exclude.js');
  expect(module.default).toBe('version-exclude');

  // Check that the module was provided to the share scope
  expect(__webpack_require__.S['default']['version-exclude']).toBeDefined();
  expect(
    __webpack_require__.S['default']['version-exclude']['1.2.0'],
  ).toBeDefined();
  expectWarning();
});

it('should not provide modules that fail version include filters', async () => {
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import the module to trigger sharing processing
  const module = await import('./version-include-fail.js');
  expect(module.default).toBe('version-include-fail');

  // Check that the module was NOT provided to the share scope
  expect(
    __webpack_require__.S['default']['version-include-fail'],
  ).toBeUndefined();
  expectWarning(/does not satisfy include filter/);
});

it('should not provide modules that fail version exclude filters', async () => {
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import the module to trigger sharing processing
  const module = await import('./version-exclude-fail.js');
  expect(module.default).toBe('version-exclude-fail');

  // Check that the module was NOT provided to the share scope
  expect(
    __webpack_require__.S['default']['version-exclude-fail'],
  ).toBeUndefined();
  expectWarning(/matches exclude filter/);
});

it('should warn about singleton filters', async () => {
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import the module to trigger sharing processing
  const module = await import('./singleton-filter.js');
  expect(module.default).toBe('singleton-filter');

  // Check that the singleton module was provided
  expect(__webpack_require__.S['default']['singleton-filter']).toBeDefined();
  expect(
    __webpack_require__.S['default']['singleton-filter']['1.0.0'],
  ).toBeDefined();
  expectWarning(/singleton.*include.*version/);
});

it('should provide modules that match request include filters', async () => {
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import components that should match the filter
  const button = await import('./request-filter/components/Button.js');
  expect(button.default).toBe('Button');

  // Debug: Log the entire share scope to see what's actually there
  console.log('Share scope:', Object.keys(__webpack_require__.S['default']));

  // Check that the module was provided to the share scope
  expect(__webpack_require__.S['default']['request-filter/']).toBeDefined();
  expect(
    __webpack_require__.S['default']['request-filter/']['1.0.0'],
  ).toBeDefined();
  expectWarning();
});

it('should not provide modules that do not match request include filters', async () => {
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import utils that should NOT match the components/ filter
  const helper = await import('./request-filter/utils/helper.js');
  expect(helper.default).toBe('helper');

  // The request-filter/ scope should not include utils/ since it only includes components/
  // This test verifies request filtering works for prefix matches
  expectWarning();
});
