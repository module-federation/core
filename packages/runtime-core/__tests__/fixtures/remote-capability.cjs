const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  normalizeWebpackPath,
} = require('@module-federation/sdk/normalize-webpack-path');
const webpack = require(normalizeWebpackPath('webpack'));

async function main() {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'remote-capability-'));
  const compiler = webpack({
    mode: 'none',
    target: 'web',
    context: path.resolve(__dirname, '../..'),
    entry: path.join(__dirname, 'remote-capability.mjs'),
    output: {
      path: output,
      filename: 'main.cjs',
      library: { type: 'commonjs2' },
    },
    optimization: {
      minimize: false,
      usedExports: false,
      sideEffects: false,
      concatenateModules: false,
    },
  });
  try {
    const stats = await new Promise((resolve, reject) =>
      compiler.run((error, result) =>
        error ? reject(error) : resolve(result),
      ),
    );
    if (stats.hasErrors())
      throw new Error(stats.toString({ all: false, errors: true }));
    const modules = Array.from(
      stats.compilation.modules,
      (module) => module.resource,
    ).filter(Boolean);
    const { runtime } = require(path.join(output, 'main.cjs'));
    console.log(JSON.stringify({ modules, runtimeName: runtime.name }));
  } finally {
    await new Promise((resolve, reject) =>
      compiler.close((error) => (error ? reject(error) : resolve())),
    );
    fs.rmSync(output, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
