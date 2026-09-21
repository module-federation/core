import { describe, expect, it } from '@rstest/core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

describe('extension packaging', () => {
  it('produces independent Chrome and browser manifests without changing the source or library output', () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-extension-test-'),
    );
    try {
      const source = path.join(directory, 'dist/.extension-build');
      fs.mkdirSync(source, { recursive: true });
      fs.writeFileSync(path.join(source, 'bundle.js'), 'extension bundle');
      fs.writeFileSync(
        path.join(directory, 'dist/library.js'),
        'library bundle',
      );
      for (const filename of ['postpack.js', 'package.json', 'manifest.json']) {
        fs.copyFileSync(
          path.join(process.cwd(), filename),
          path.join(directory, filename),
        );
      }
      const original = fs.readFileSync(
        path.join(directory, 'manifest.json'),
        'utf8',
      );
      execFileSync(process.execPath, ['postpack.js'], { cwd: directory });
      const read = (variant: string) =>
        JSON.parse(
          fs.readFileSync(
            path.join(directory, 'dist', variant, 'manifest.json'),
            'utf8',
          ),
        );
      const chrome = read('chrome');
      const browser = read('browser');
      expect(chrome.side_panel.default_path).toBe('html/main/index.html');
      expect(chrome.devtools_page).toBeTruthy();
      expect(chrome.permissions).toContain('sidePanel');
      expect(browser.side_panel).toBeUndefined();
      expect(browser.devtools_page).toBeUndefined();
      expect(browser.permissions).not.toContain('sidePanel');
      expect(browser.action.default_popup).toBe(
        'html/main/index.html?view=popup',
      );
      expect(browser.content_scripts).toEqual(chrome.content_scripts);
      expect(
        browser.content_scripts.some(
          (script: any) =>
            script.js.includes('static/js/webmcp.js') &&
            script.world === 'MAIN',
        ),
      ).toBe(true);
      for (const variant of ['chrome', 'browser'])
        expect(
          fs.readFileSync(
            path.join(directory, 'dist', variant, 'bundle.js'),
            'utf8',
          ),
        ).toBe('extension bundle');
      expect(
        fs.readFileSync(path.join(directory, 'dist/library.js'), 'utf8'),
      ).toBe('library bundle');
      expect(
        fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'),
      ).toBe(original);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
