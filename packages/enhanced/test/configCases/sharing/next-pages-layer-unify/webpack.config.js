const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');
const fs = require('fs');

const ensureStub = (relativeTarget, source) => {
  const target = path.resolve(__dirname, relativeTarget);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, source);
};

const exportStub = (bodyLines) =>
  [
    ...bodyLines,
    'stub.__esModule = true;',
    'stub.default = stub;',
    'module.exports = stub;',
    '',
  ].join('\n');

ensureStub(
  'node_modules/next/dist/compiled/react.js',
  exportStub([
    "const stub = { id: 'compiled-react', marker: 'compiled-react', jsx: 'compiled-jsx' };",
  ]),
);

ensureStub(
  'node_modules/next/dist/compiled/react-dom/index.js',
  exportStub([
    "const stub = { id: 'compiled-react-dom', marker: 'compiled-react-dom' };",
  ]),
);

ensureStub(
  'node_modules/next/dist/compiled/react/jsx-runtime.js',
  [
    "const stub = { id: 'compiled-react', marker: 'compiled-react', jsx: 'compiled-jsx' };",
    'stub.__esModule = true;',
    'stub.default = stub;',
    'module.exports = stub;',
    '',
  ].join('\n'),
);

module.exports = {
  mode: 'development',
  devtool: false,
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: __dirname,
        layer: 'pages-dir-browser',
      },
    ],
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/next/dist/compiled/react'),
      'react-dom': path.resolve(
        __dirname,
        'node_modules/next/dist/compiled/react-dom',
      ),
      'react/jsx-runtime': path.resolve(
        __dirname,
        'node_modules/next/dist/compiled/react/jsx-runtime.js',
      ),
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'next-pages-layer-unify',
      experiments: { asyncStartup: false, aliasConsumption: true },
      shared: {
        'next/dist/compiled/react': {
          singleton: true,
          eager: true,
          requiredVersion: false,
          allowNodeModulesSuffixMatch: true,
        },
        'next/dist/compiled/react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: false,
          allowNodeModulesSuffixMatch: true,
        },
      },
    }),
  ],
};
