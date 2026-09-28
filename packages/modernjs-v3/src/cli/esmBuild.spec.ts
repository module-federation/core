import fs from 'fs';
import path from 'path';
import { describe, expect, it } from '@rstest/core';
import rslibConfig from '../../rslib.config';

const cliDir = __dirname;

describe('modern-js-v3 ESM build output', () => {
  // configPlugin calls `require.resolve` to locate runtime plugins. A bare
  // `require` throws `ReferenceError: require is not defined` when the
  // plugin is loaded as native ESM (for example from a `"type": "module"`
  // project), so the CLI resolves through `createRequire(import.meta.url)`.
  it('resolves through createRequire instead of a bare require', () => {
    for (const file of fs.readdirSync(cliDir)) {
      if (!/\.tsx?$/.test(file) || file.includes('.spec.')) continue;
      const source = fs.readFileSync(path.join(cliDir, file), 'utf8');
      expect({
        file,
        bare: /(?<![.\w])require\.resolve\(/.test(source),
      }).toEqual({
        file,
        bare: false,
      });
    }
  });

  // An rslib `shims.esm.require` banner imports `node:module` into every
  // ESM module, including the browser runtime entries, which then fail to
  // bundle for the web.
  it('injects no node:module shim into the ESM libraries', () => {
    for (const lib of rslibConfig.lib.filter((lib) => lib.format === 'esm')) {
      expect(lib.shims?.esm?.require).toBeFalsy();
    }
  });
});
