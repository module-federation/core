import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function readPackageJson(packageDir) {
  return JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
}

export function packageDirFromMetaUrl(metaUrl) {
  return dirname(fileURLToPath(metaUrl));
}

export function readPackageVersion(packageDir) {
  return readPackageJson(packageDir).version;
}

function createModernOutExtensions(pkgType, preferNonModuleCjs) {
  return ({ format }) => {
    if (format === 'cjs') {
      return {
        js: pkgType === 'module' || preferNonModuleCjs ? '.cjs' : '.js',
        dts: '.d.ts',
      };
    }

    if (format === 'esm') {
      return {
        js: pkgType === 'module' ? '.js' : '.mjs',
        dts: '.d.mts',
      };
    }

    return undefined;
  };
}

export function createDualFormatConfig({
  name,
  packageDir,
  entry,
  external,
  define,
  copyLicense = false,
  unbundle = false,
  dts = true,
  outDir = 'dist',
  hash = false,
  format = ['cjs', 'esm'],
  preferNonModuleCjs = true,
  outExtensions,
}) {
  const pkg = readPackageJson(packageDir);

  return {
    name,
    cwd: packageDir,
    entry,
    tsconfig: 'tsconfig.lib.json',
    outDir,
    format,
    clean: true,
    sourcemap: true,
    dts,
    unbundle,
    hash,
    fixedExtension: false,
    outExtensions:
      outExtensions || createModernOutExtensions(pkg.type, preferNonModuleCjs),
    external,
    define,
    copy: copyLicense ? ['LICENSE'] : undefined,
  };
}

export function createIifeDebugConfig({
  name,
  packageDir,
  entry = 'src/index.ts',
  outDir = 'dist/debug',
  globalName = 'ModuleFederationRuntime',
  define,
}) {
  return {
    name,
    cwd: packageDir,
    entry: typeof entry === 'string' ? { index: entry } : entry,
    tsconfig: 'tsconfig.lib.json',
    outDir,
    format: ['iife'],
    platform: 'browser',
    globalName,
    clean: true,
    sourcemap: true,
    dts: false,
    hash: false,
    noExternal: [/.*/],
    define,
    outputOptions: {
      codeSplitting: false,
    },
  };
}
