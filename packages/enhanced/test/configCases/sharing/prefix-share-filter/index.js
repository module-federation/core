const { expect } = require('expect');

describe('prefix-share-filter', () => {
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

  it('should share modules matching the filter pattern', async () => {
    const moduleA = await import('prefix/deep/module-a');
    expect(moduleA.default).toBe('module-a');

    // This should be shared due to filter pattern
    const container = __webpack_require__.S['default'];
    expect(container).toBeDefined();
    expect(container['prefix/deep/module-a']).toBeDefined();
  });

  it('should not share modules not matching the filter pattern', async () => {
    const moduleB = await import('prefix/shallow-module');
    expect(moduleB.default).toBe('shallow-module');

    // This should not be shared due to filter pattern
    const container = __webpack_require__.S['default'];
    expect(container['prefix/shallow-module']).toBeUndefined();
  });

  it('should properly handle nested deep modules', async () => {
    const moduleC = await import('prefix/deep/nested/module-c');
    expect(moduleC.default).toBe('module-c');

    const container = __webpack_require__.S['default'];
    expect(container['prefix/deep/nested/module-c']).toBeDefined();
  });

  it('should maintain module integrity when sharing', async () => {
    const moduleA1 = await import('prefix/deep/module-a');
    const moduleA2 = await import('prefix/deep/module-a');

    // Should be the same instance due to sharing
    expect(moduleA1).toBe(moduleA2);
  });
});
