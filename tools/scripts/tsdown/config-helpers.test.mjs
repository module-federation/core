import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createDualFormatConfig } from './config-helpers.mjs';

function outExtensionsFor(type) {
  const packageDir = mkdtempSync(join(tmpdir(), 'mf-tsdown-'));
  writeFileSync(
    join(packageDir, 'package.json'),
    JSON.stringify({ name: 'fixture', version: '0.0.0', type }),
  );
  return createDualFormatConfig({ name: 'fixture', packageDir, entry: {} })
    .outExtensions;
}

test('module package: es and cjs declarations get distinct paths', () => {
  const outExtensions = outExtensionsFor('module');
  assert.deepEqual(outExtensions({ format: 'es' }), {
    js: '.js',
    dts: '.d.ts',
  });
  assert.deepEqual(outExtensions({ format: 'cjs' }), {
    js: '.cjs',
    dts: '.d.cts',
  });
});

test('commonjs package: es and cjs declarations get distinct paths', () => {
  const outExtensions = outExtensionsFor('commonjs');
  assert.deepEqual(outExtensions({ format: 'es' }), {
    js: '.mjs',
    dts: '.d.mts',
  });
  assert.deepEqual(outExtensions({ format: 'cjs' }), {
    js: '.cjs',
    dts: '.d.cts',
  });
  assert.equal(outExtensions({ format: 'iife' }), undefined);
});
