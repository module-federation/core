import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  prepareBrowserRelease,
  assetName,
} from './prepare-browser-release.mjs';

test('packages a loadable Browser archive at its root with matching metadata', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'mf-release-'));
  try {
    const write = (name, contents) => {
      const file = path.join(root, name);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(
        file,
        typeof contents === 'string' ? contents : JSON.stringify(contents),
      );
    };
    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Release Test',
        '-c',
        'user.email=test@example.com',
        '-c',
        'core.hooksPath=/dev/null',
        'commit',
        '-q',
        '--allow-empty',
        '-m',
        'test',
      ],
      { cwd: root },
    );
    write('packages/runtime/package.json', { version: '2.10.0' });
    write('packages/chrome-devtools/package.json', { version: '2.10.0' });
    const manifest = {
      version: '2.10.0',
      action: { default_popup: 'html/main/index.html?view=popup' },
      content_scripts: [
        {
          world: 'MAIN',
          run_at: 'document_start',
          js: ['static/js/webmcp.js'],
        },
      ],
    };
    const manifestPath = 'packages/chrome-devtools/dist/browser/manifest.json';
    write(manifestPath, manifest);
    write(
      'packages/chrome-devtools/dist/browser/static/js/webmcp.js',
      '/* fixture */',
    );
    write(
      'packages/chrome-devtools/dist/browser/html/main/index.html',
      '<!doctype html>',
    );
    const destination = path.join(root, 'assets');
    const result = prepareBrowserRelease({
      root,
      destination,
      channel: 'latest',
    });
    assert.equal(result.tag, 'v2.10.0');
    assert.match(result.sha, /^[a-f0-9]{40}$/);
    const names = execFileSync(
      'unzip',
      ['-Z1', path.join(destination, assetName)],
      { encoding: 'utf8' },
    ).split('\n');
    assert.ok(names.includes('manifest.json'));
    assert.ok(names.includes('static/js/webmcp.js'));
    assert.ok(!names.includes('browser/manifest.json'));
    assert.deepEqual(
      JSON.parse(readFileSync(path.join(destination, 'release.json'), 'utf8')),
      result,
    );
    assert.throws(
      () => prepareBrowserRelease({ root, destination, channel: 'latest' }),
      /already exists/,
    );
    assert.throws(
      () => prepareBrowserRelease({ root, destination, channel: 'next' }),
      /snapshot/,
    );
    write(manifestPath, { ...manifest, side_panel: {} });
    assert.throws(
      () => prepareBrowserRelease({ root, destination, channel: 'latest' }),
      /Browser extension/,
    );
    write('packages/runtime/package.json', { version: '0.0.0-next-123' });
    write('packages/chrome-devtools/package.json', {
      version: '0.0.0-next-123',
    });
    write(manifestPath, { ...manifest, version: '0.0.0' });
    const next = prepareBrowserRelease({
      root,
      destination: path.join(root, 'next'),
      channel: 'next',
    });
    assert.equal(next.tag, 'v0.0.0-next-123');
    assert.equal(next.extensionVersion, '0.0.0-next-123');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
