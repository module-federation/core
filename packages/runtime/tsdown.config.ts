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
  process.env.RUNTIME_TSDOWN_MODE === 'debug' ? 'debug' : 'build';

const standardDefine = {
  __VERSION__: JSON.stringify(version),
  FEDERATION_DEBUG: JSON.stringify(process.env.FEDERATION_DEBUG || ''),
};

const debugDefine = {
  __VERSION__: JSON.stringify(version),
  FEDERATION_DEBUG: JSON.stringify('true'),
};

const buildConfig = {
  ...createDualFormatConfig({
    name: 'runtime-build',
    packageDir,
    entry: {
      index: 'src/index.ts',
      helpers: 'src/helpers.ts',
      types: 'src/types.ts',
      core: 'src/core.ts',
    },
    external: ['@module-federation/*'],
    dts: false,
    define: standardDefine,
    copyLicense: true,
    unbundle: false,
  }),
  outputOptions: {
    exports: 'named',
  },
};

const debugConfig = createIifeDebugConfig({
  name: 'runtime-debug',
  packageDir,
  entry: 'src/index.ts',
  outDir: 'dist/debug',
  define: debugDefine,
});

export default defineConfig(
  buildMode === 'debug' ? [debugConfig] : [buildConfig],
);
