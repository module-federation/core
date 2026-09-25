// Builds a tiny app with real Rspack in the order `rspack serve` uses: create
// the compiler, then turn on lazy compilation and create the middleware.
// Prints whether the lazy compilation client got the endpoint rebase.
// Usage: node compile-lazy-remote.mjs <remote|host|none>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const require = createRequire(path.join(pkgDir, 'package.json'));
const { rspack } = await import(require.resolve('@rspack/core'));
const { ModuleFederationPlugin } = require(path.join(pkgDir, 'dist/index.js'));

const mode = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-lazy-compilation-'));
fs.writeFileSync(path.join(dir, 'index.js'), "import('./lazy.js');\n");
fs.writeFileSync(path.join(dir, 'lazy.js'), 'export default 1;\n');
fs.writeFileSync(path.join(dir, 'Button.js'), 'export default 1;\n');

const plugins =
  mode === 'none'
    ? []
    : [
        new ModuleFederationPlugin({
          name: mode,
          exposes:
            mode === 'remote' ? { './Button': './Button.js' } : undefined,
          dts: false,
          manifest: false,
        }),
      ];
const compiler = rspack({
  mode: 'development',
  devtool: false,
  context: dir,
  target: 'web',
  entry: './index.js',
  output: { path: path.join(dir, 'dist'), publicPath: 'auto' },
  plugins,
});
compiler.options.lazyCompilation = { imports: true, entries: false };
rspack.lazyCompilationMiddleware(compiler);

compiler.run((err, stats) => {
  const outDir = path.join(dir, 'dist');
  const output = err
    ? ''
    : fs
        .readdirSync(outDir)
        .filter((file) => file.endsWith('.js'))
        .map((file) => fs.readFileSync(path.join(outDir, file), 'utf-8'))
        .join('\n');
  process.stdout.write(
    JSON.stringify({
      error: err ? String(err) : null,
      errors: stats
        ? stats.toJson({ all: false, errors: true }).errors.length
        : 0,
      lazyClient: output.includes('lazy-compilation-web.js'),
      rebased: output.includes('var __federation_lazy_compilation_query__ = '),
    }),
  );
  compiler.close(() => fs.rmSync(dir, { recursive: true, force: true }));
});
