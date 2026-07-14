import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findPackageJson } from '../src/findPackageJson';

describe('findPackageJson', () => {
  it('finds the closest package.json from a nested directory', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-managers-'));
    const nested = path.join(root, 'a', 'b');
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(root, 'package.json'), '{}');

    expect(findPackageJson(nested)).toBe(path.join(root, 'package.json'));
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('returns undefined when no package.json exists', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-managers-'));

    expect(findPackageJson(root)).toBeUndefined();
    fs.rmSync(root, { recursive: true, force: true });
  });
});
