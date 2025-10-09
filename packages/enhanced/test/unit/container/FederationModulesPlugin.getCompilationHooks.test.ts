/*
 * @jest-environment node
 */

// Make normalizeWebpackPath identity so our virtual mocks resolve
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((p: string) => p),
}));

// Provide a virtual Compilation module so the import in the SUT doesn't throw
jest.mock('webpack/lib/Compilation', () => ({}), { virtual: true });

const FederationModulesPlugin =
  require('../../../src/lib/container/runtime/FederationModulesPlugin').default;

describe('FederationModulesPlugin.getCompilationHooks', () => {
  it('returns stable hooks for a Compilation-like object', () => {
    const compilation = {
      hooks: {
        processAssets: { tap: jest.fn() },
      },
    } as any;

    const hooks1 = FederationModulesPlugin.getCompilationHooks(compilation);
    const hooks2 = FederationModulesPlugin.getCompilationHooks(compilation);

    expect(hooks1).toBe(hooks2);
    expect(typeof hooks1.addContainerEntryDependency.tap).toBe('function');
    expect(typeof hooks1.addFederationRuntimeDependency.tap).toBe('function');
    expect(typeof hooks1.addRemoteDependency.tap).toBe('function');
  });

  it('throws TypeError for invalid compilation shape', () => {
    const badCompilation = { hooks: {} } as any;
    expect(() =>
      FederationModulesPlugin.getCompilationHooks(badCompilation),
    ).toThrow(TypeError);
  });
});
