import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  createIifeDebugConfig,
  packageDirFromMetaUrl,
  readPackageVersion,
} from '../../tools/scripts/tsdown/config-helpers.mjs';

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
    kernel: 'src/kernel.ts',
    'shared/capability': 'src/shared/capability.ts',
    'remote/capability': 'src/remote/capability.ts',
    'plugins/snapshot/capability': 'src/plugins/snapshot/capability.ts',
    'platform/web': 'src/platform/web.ts',
    'platform/node': 'src/platform/node.ts',
    'platform/universal': 'src/platform/universal.ts',
  },
  external: ['@module-federation/*'],
  dts: {
    resolver: 'tsc',
  },
  define: standardDefine,
  copyLicense: true,
  unbundle: true,
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
