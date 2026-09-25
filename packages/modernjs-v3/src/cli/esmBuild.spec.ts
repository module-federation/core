import { describe, expect, it } from '@rstest/core';
import rslibConfig from '../../rslib.config';

describe('modern-js-v3 ESM build output', () => {
  // configPlugin calls `require.resolve` to locate runtime plugins. Without the
  // shim the ESM output keeps a bare `require`, which throws
  // `ReferenceError: require is not defined` when the plugin is loaded as
  // native ESM (for example from a `"type": "module"` project).
  it('injects a require shim into every ESM library', () => {
    const esmLibs = rslibConfig.lib.filter((lib) => lib.format === 'esm');

    expect(esmLibs.length).toBeGreaterThan(0);
    for (const lib of esmLibs) {
      expect(lib.shims?.esm?.require).toBe(true);
    }
  });
});
