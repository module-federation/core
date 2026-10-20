import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

for (const variant of ['chrome', 'browser']) {
  test(`${variant} bundles exclude legacy script-generating polyfills`, () => {
    const directory = path.resolve(__dirname, '../dist', variant);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'),
    );
    expect(manifest.minimum_chrome_version).toBe('114');
    const scripts = fs
      .readdirSync(directory, { recursive: true })
      .filter(
        (file): file is string =>
          typeof file === 'string' && file.endsWith('.js'),
      );
    expect(scripts).toContain(path.join('static', 'js', 'main.js'));
    expect(scripts).toContain(path.join('static', 'js', 'worker.js'));
    for (const script of scripts) {
      const content = fs.readFileSync(path.join(directory, script), 'utf8');
      // core-js's Object.create fallback injects scripts through an IE iframe
      // or ActiveX document. Inspect every shipped entry, not just the UI.
      const legacyCode = content.match(
        /NullProtoObjectViaIFrame|NullProtoObjectViaActiveX|ActiveXObject|scriptTag\s*\(/,
      );
      expect(legacyCode?.[0], script).toBeUndefined();
    }
  });
}
