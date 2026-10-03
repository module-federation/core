import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  externalWithSelectors,
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
    'selectors/remote-module/legacy': 'src/selectors/remote-module/legacy.ts',
    'selectors/remote-module/enabled': 'src/selectors/remote-module/enabled.ts',
    'selectors/remote-module/disabled':
      'src/selectors/remote-module/disabled.ts',
    'selectors/remote-handler/legacy': 'src/selectors/remote-handler/legacy.ts',
    'selectors/remote-handler/enabled':
      'src/selectors/remote-handler/enabled.ts',
    'selectors/remote-handler/disabled':
      'src/selectors/remote-handler/disabled.ts',
    'selectors/shared-handler/legacy': 'src/selectors/shared-handler/legacy.ts',
    'selectors/shared-handler/enabled':
      'src/selectors/shared-handler/enabled.ts',
    'selectors/shared-handler/disabled':
      'src/selectors/shared-handler/disabled.ts',
    'selectors/snapshot-handler/legacy':
      'src/selectors/snapshot-handler/legacy.ts',
    'selectors/snapshot-handler/enabled':
      'src/selectors/snapshot-handler/enabled.ts',
    'selectors/snapshot-handler/disabled':
      'src/selectors/snapshot-handler/disabled.ts',
    'selectors/default-plugins/legacy':
      'src/selectors/default-plugins/legacy.ts',
    'selectors/default-plugins/enabled':
      'src/selectors/default-plugins/enabled.ts',
    'selectors/default-plugins/disabled':
      'src/selectors/default-plugins/disabled.ts',
    'selectors/share-config/legacy': 'src/selectors/share-config/legacy.ts',
    'selectors/share-config/enabled': 'src/selectors/share-config/enabled.ts',
    'selectors/share-config/disabled': 'src/selectors/share-config/disabled.ts',
    'selectors/share-utils/legacy': 'src/selectors/share-utils/legacy.ts',
    'selectors/share-utils/enabled': 'src/selectors/share-utils/enabled.ts',
    'selectors/share-utils/disabled': 'src/selectors/share-utils/disabled.ts',
    'selectors/preload/legacy': 'src/selectors/preload/legacy.ts',
    'selectors/preload/enabled': 'src/selectors/preload/enabled.ts',
    'selectors/preload/disabled': 'src/selectors/preload/disabled.ts',
  },
  external: externalWithSelectors(['@module-federation/*']),
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
