const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');
const fs = require('fs');

const ensureStub = (relativeTarget, source) => {
  const target = path.resolve(__dirname, relativeTarget);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, source);
};

const exportStub = (id, marker = id, extra = '') =>
  [
    (() => {
      const base = `const stub = { id: '${id}', marker: '${marker}'${extra ? `, ${extra}` : ''} };`;
      return base;
    })(),
    'stub.__esModule = true;',
    'stub.default = stub;',
    'module.exports = stub;',
    '',
  ].join('\n');

ensureStub(
  'node_modules/next/dist/compiled/react.js',
  exportStub('compiled-react', 'compiled-react', "jsx: 'compiled-jsx'"),
);

ensureStub(
  'node_modules/next/dist/compiled/react-dom/client.js',
  exportStub('compiled-react-dom-client'),
);

ensureStub(
  'node_modules/provided/react/index.js',
  exportStub('provided-react'),
);

ensureStub(
  'node_modules/provided/react-dom/client.js',
  exportStub('provided-react-dom-client'),
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
      name: 'consume-with-aliases-generic-provider',
      experiments: { asyncStartup: false, aliasConsumption: true },
      shared: {
        'next/dist/compiled/react': {
          singleton: true,
          eager: true,
          requiredVersion: false,
          allowNodeModulesSuffixMatch: true,
          // Provide an alternate implementation to prove share precedence
          import: path.resolve(
            __dirname,
            'node_modules/provided/react/index.js',
          ),
        },
        'next/dist/compiled/react-dom/client': {
          singleton: true,
          eager: true,
          requiredVersion: false,
          allowNodeModulesSuffixMatch: true,
          import: path.resolve(
            __dirname,
            'node_modules/provided/react-dom/client.js',
          ),
        },
      },
    }),
  ],
};
