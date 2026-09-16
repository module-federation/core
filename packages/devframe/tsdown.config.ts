import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
  readPackageVersion,
} from '../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);
export default defineConfig([
  createDualFormatConfig({
    name: 'devframe-build',
    packageDir,
    entry: {
      index: 'src/index.ts',
      client: 'src/client.ts',
      reader: 'src/reader.ts',
    },
    external: ['devframe', /^devframe\//, 'zod'],
    define: { __VERSION__: JSON.stringify(readPackageVersion(packageDir)) },
    dts: { resolver: 'tsc' },
  }),
]);
