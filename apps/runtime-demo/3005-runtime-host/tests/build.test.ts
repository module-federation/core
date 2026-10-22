import { readFileSync } from 'node:fs';
import { expect, it } from '@rstest/core';

it('emits build observability with federation configuration and no local paths', () => {
  const text = readFileSync(
    new URL('../.mf/observability/build-info.json', import.meta.url),
    'utf8',
  );
  const info = JSON.parse(text);
  expect(info.source).toBe('manifest');
  expect(info.moduleFederation.name).toBe('runtime_host');
  expect(info.moduleFederation.remotes).toContainEqual(
    expect.objectContaining({
      alias: 'remote1',
      entry: 'http://127.0.0.1:3006/mf-manifest.json',
    }),
  );
  expect(info.moduleFederation.exposes).toContainEqual(
    expect.objectContaining({ name: 'Button' }),
  );
  expect(info.moduleFederation.shared).toContainEqual(
    expect.objectContaining({
      name: 'react',
      requiredVersion: '^18.2.0',
      singleton: true,
    }),
  );
  expect(text).not.toContain('/Users/');
  expect(text).not.toContain('token=');
});
