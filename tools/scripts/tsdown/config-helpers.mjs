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

const DTS_EXTENSION = { '.js': '.d.ts', '.cjs': '.d.cts', '.mjs': '.d.mts' };

// tsdown passes rolldown's format name, so ESM arrives as 'es'. The dts
// extension mirrors the js extension so the CJS and ESM passes never write
// the same declaration path.
function createModernOutExtensions(pkgType, preferNonModuleCjs) {
  return ({ format }) => {
    let js;
    if (format === 'cjs') {
      js = pkgType === 'module' || preferNonModuleCjs ? '.cjs' : '.js';
    } else if (format === 'es') {
      js = pkgType === 'module' ? '.js' : '.mjs';
    } else {
      return undefined;
    }
    return { js, dts: DTS_EXTENSION[js] };
  };
}

export function createDualFormatConfig({
  name,
  packageDir,
  entry,
  external,
  noExternal,
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
    noExternal,
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
