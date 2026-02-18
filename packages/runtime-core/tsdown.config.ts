import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  createIifeDebugConfig,
  packageDirFromMetaUrl,
  readPackageVersion,
} from '../../tools/scripts/tsdown/phase1-template.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);
const version = readPackageVersion(packageDir);
const buildMode =
  process.env.RUNTIME_CORE_TSDOWN_MODE === 'debug' ? 'debug' : 'build';

const standardDefine = {
  __VERSION__: JSON.stringify(version),
  FEDERATION_DEBUG: JSON.stringify(process.env.FEDERATION_DEBUG || ''),
};

const debugDefine = {
  __VERSION__: JSON.stringify(version),
  FEDERATION_DEBUG: JSON.stringify('true'),
};

const buildConfig = createDualFormatConfig({
  name: 'runtime-core-build',
  packageDir,
  entry: {
    index: 'src/index.ts',
    types: 'src/types.ts',
  },
  external: ['@module-federation/*'],
  dts: {
    resolver: 'tsc',
  },
  define: standardDefine,
  copyLicense: true,
  unbundle: false,
});

const debugConfig = createIifeDebugConfig({
  name: 'runtime-core-debug',
  packageDir,
  entry: 'src/index.ts',
  outDir: 'dist/debug',
  define: debugDefine,
  clean: false,
});

export default defineConfig(
  buildMode === 'debug' ? [debugConfig] : [buildConfig],
);
