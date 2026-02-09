import { assert, describe, expect, it } from 'vitest';
import { ModuleFederation } from '../src/index';

describe('shared import map support', () => {
  it('loads shared module from import specifier', async () => {
    const moduleSource =
      "export default { message: 'Hello from import map shared module' };";
    const specifier = `data:text/javascript,${encodeURIComponent(
      moduleSource,
    )}`;

    const federation = new ModuleFederation({
      name: '@import-map/shared-host',
      remotes: [],
      shared: {
        'import-map-shared': {
          version: '1.0.0',
          import: specifier,
          shareConfig: {
            singleton: true,
            requiredVersion: '^1.0.0',
            eager: false,
          },
        },
      },
    });

    const factory = await federation.loadShare<{
      default: { message: string };
    }>('import-map-shared');

    assert(factory);
    const mod = factory();
    expect(mod.default.message).toBe('Hello from import map shared module');
  });
});
