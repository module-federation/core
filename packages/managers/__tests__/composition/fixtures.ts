import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  RUNTIME_FAMILY,
  type FamilyPackage,
} from '../../src/composition/family';

type Exports = Record<string, unknown>;

export function tempDir(): string {
  return fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'mf-composition-')),
  );
}

const fileOf = (subpath: string) =>
  subpath === '.' ? 'index' : subpath.slice(2);

export function dualExports(subpaths: readonly string[]): Exports {
  return Object.fromEntries(
    ['.', ...subpaths].map((subpath) => [
      subpath,
      {
        require: `./dist/${fileOf(subpath)}.cjs`,
        import: `./dist/${fileOf(subpath)}.js`,
      },
    ]),
  );
}

export function writePackage(
  dir: string,
  name: string,
  exportsField: Exports,
): string {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name, exports: exportsField }),
  );
  for (const target of JSON.stringify(exportsField).match(
    /\.\/dist\/[^"*]+/g,
  ) ?? []) {
    const file = path.join(dir, target);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '');
  }
  return dir;
}

export const packageDir = (base: string, name: string) =>
  path.join(base, 'node_modules', name);

// A flat node_modules with every family member exporting every required subpath.
export function composableFamily(
  root: string,
  override: Partial<
    Record<FamilyPackage, { name?: string; exports?: Exports }>
  > = {},
): string {
  for (const [pkg, subpaths] of Object.entries(RUNTIME_FAMILY) as [
    FamilyPackage,
    readonly string[],
  ][]) {
    writePackage(
      packageDir(root, pkg),
      override[pkg]?.name ?? pkg,
      override[pkg]?.exports ?? dualExports(subpaths),
    );
  }
  return root;
}
