import { join } from 'path';
import { defineConfig } from 'tsup';

const shared = {
  entry: [join(__dirname, 'src', 'index.ts')],
  dts: false,
  splitting: true,
  outDir: join('packages', 'third-party-dts-extractor', 'dist'),
  external: [join(__dirname, 'package.json')],
  // Needed so createRequire(import.meta.url) in src/utils.ts and
  // src/ThirdPartyExtractor.ts resolves to a real file URL in the cjs
  // build too — without this, esbuild leaves import.meta empty under
  // the cjs target and createRequire(undefined) throws at load time.
  shims: true,
};

export default defineConfig([
  { ...shared, format: 'cjs' as const, clean: true },
  { ...shared, format: 'esm' as const },
]);
