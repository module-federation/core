const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');
const fs = require('fs');

const ensureStub = (relativeTarget, source) => {
  const target = path.resolve(__dirname, relativeTarget);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, source);
};

ensureStub(
  'node_modules/next/dist/compiled/react.js',
  [
    "const stub = { id: 'compiled-react', marker: 'compiled-react', jsx: 'compiled-jsx' };",
    'stub.__esModule = true;',
    'stub.default = stub;',
    'module.exports = stub;',
    '',
  ].join('\n'),
);

ensureStub(
  'node_modules/next/dist/compiled/react-dom/client.js',
  [
    "const stub = { id: 'compiled-react-dom-client', marker: 'compiled-react-dom-client' };",
    'stub.__esModule = true;',
    'stub.default = stub;',
    'module.exports = stub;',
    '',
  ].join('\n'),
);

module.exports = {
  mode: 'development',
  devtool: false,
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/next/dist/compiled/react'),
      'react-dom/client': path.resolve(
        __dirname,
        'node_modules/next/dist/compiled/react-dom/client.js',
      ),
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'consume-with-aliases-generic',
      experiments: { asyncStartup: true, aliasConsumption: true },
      shared: {
        // Provide the aliased targets; consumer will import bare specifiers
        'next/dist/compiled/react': {
          singleton: true,
          eager: true,
          allowNodeModulesSuffixMatch: true,
        },
        'next/dist/compiled/react-dom/client': {
          singleton: true,
          eager: true,
          allowNodeModulesSuffixMatch: true,
        },
      },
    }),
  ],
};
