import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it } from '@rstest/core';
import rslibConfig from '../../rslib.config';

describe('modern-js-v3 ESM build output', () => {
  it.each(['esm', 'cjs'])(
    'loads file configuration and resolves runtime plugins in native %s',
    (format) => {
      const tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'mf-native-config-'),
      );
      const configPath = path.join(tempDir, 'module-federation.config.ts');
      try {
        fs.writeFileSync(configPath, 'export default { name: "native-host" };');
        execFileSync(
          process.execPath,
          [
            '--input-type=module',
            '--eval',
            `import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const plugin = process.argv[2] === 'esm'
  ? await import('@module-federation/modern-js-v3/config-plugin')
  : createRequire(import.meta.url)('@module-federation/modern-js-v3/config-plugin');
const config = await plugin.getMFConfig({ configPath: process.argv[1] });
assert.deepEqual(config, { name: 'native-host' });
plugin.patchMFConfig(config, true);
assert.equal(config.runtimePlugins.length, 3);
for (const runtimePlugin of config.runtimePlugins) {
  assert.ok(fs.existsSync(runtimePlugin));
  assert.ok(runtimePlugin.endsWith(process.argv[2] === 'esm' ? '.mjs' : '.js'));
}`,
            configPath,
            format,
          ],
          {
            cwd: path.resolve(__dirname, '../..'),
            env: {
              ...process.env,
              NODE_ENV: 'production',
              IS_ESM_BUILD: format === 'esm' ? 'false' : 'true',
            },
            timeout: 30_000,
            stdio: 'pipe',
          },
        );
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    },
  );

  // An rslib `shims.esm.require` banner imports `node:module` into every
  // ESM module, including the browser runtime entries, which then fail to
  // bundle for the web.
  it('injects no node:module shim into the ESM libraries', () => {
    for (const lib of rslibConfig.lib.filter((lib) => lib.format === 'esm')) {
      expect(lib.shims?.esm?.require).toBeFalsy();
    }
  });
});
