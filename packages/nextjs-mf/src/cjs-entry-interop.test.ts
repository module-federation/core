import path from 'path';

describe('nextjs-mf cjs entry interop', () => {
  const packageRoot = path.resolve(__dirname, '..');
  const distEntryPath = path.join(packageRoot, 'dist/src/index.js');

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns the plugin constructor for require() and preserves named access', () => {
    class MockNextFederationPlugin {}

    jest.doMock(
      distEntryPath,
      () => ({
        __esModule: true,
        default: MockNextFederationPlugin,
        NextFederationPlugin: MockNextFederationPlugin,
      }),
      { virtual: true },
    );

    let nextjsMf: any;
    jest.isolateModules(() => {
      nextjsMf = require(packageRoot);
    });

    expect(nextjsMf).toBe(MockNextFederationPlugin);
    expect(nextjsMf.NextFederationPlugin).toBe(MockNextFederationPlugin);
    expect(nextjsMf.default).toBe(MockNextFederationPlugin);
  });
});
