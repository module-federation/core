import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
  readPackageVersion,
} from '../../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);
const version = readPackageVersion(packageDir);

export default defineConfig([
  createDualFormatConfig({
    name: 'inject-external-runtime-core-plugin-build',
    packageDir,
    entry: {
      index: 'src/index.ts',
    },
    external: ['@module-federation/*'],
    dts: {
      resolver: 'tsc',
    },
    define: {
      __VERSION__: JSON.stringify(version),
    },
    copyLicense: true,
    unbundle: true,
  }),
]);
