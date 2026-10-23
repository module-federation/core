import { validate as check } from '../../../src/schemas/container/ModuleFederationPlugin.check';

it('accepts only booleans for the legacy manifest stats option', () => {
  expect(check({ manifest: {} })).toBe(true);
  for (const useLegacyStats of [false, true]) {
    expect(check({ manifest: { useLegacyStats } })).toBe(true);
  }
  for (const useLegacyStats of ['true', 1, null, {}, []]) {
    expect(check({ manifest: { useLegacyStats } })).toBe(false);
  }
});
