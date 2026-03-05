import pkg from '../package.json';

describe('no-effect-dependency', () => {
  it('should not depend on effect or effect-smol', () => {
    const deps = { ...pkg.dependencies, ...(pkg as any).devDependencies };
    expect(deps['effect']).toBeUndefined();
    expect(deps['effect-smol']).toBeUndefined();
    expect(deps['@effect/platform']).toBeUndefined();
  });
});
