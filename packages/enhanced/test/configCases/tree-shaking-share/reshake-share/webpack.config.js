const { TreeShakingSharedPlugin } = require('../../../../dist/src');
const fs = require('fs');
const path = require('path');

const ensureFixture = (pkgName, entryContents) => {
  const baseDir = path.join(__dirname, 'node_modules', pkgName);
  fs.mkdirSync(baseDir, { recursive: true });
  fs.writeFileSync(
    path.join(baseDir, 'package.json'),
    JSON.stringify(
      {
        name: pkgName,
        main: './index.js',
        version: '1.0.0',
        sideEffects: false,
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(path.join(baseDir, 'index.js'), entryContents);
};

ensureFixture(
  'ui-lib-dep',
  ["export const Message = 'Message';", "export const Spin = 'Spin';", ''].join(
    '\n',
  ),
);
ensureFixture(
  'ui-lib',
  [
    "import { Message, Spin } from 'ui-lib-dep';",
    '',
    "export const Button = 'Button';",
    "export const List = 'List';",
    "export const Badge = 'Badge';",
    '',
    'export const MessagePro = `${Message}Pro`;',
    'export const SpinPro = `${Spin}Pro`;',
    '',
  ].join('\n'),
);

module.exports = {
  cache: false,
  optimization: {
    // minimize: true,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  output: {
    publicPath: '/',
    chunkFilename: '[id].js',
  },
  target: 'async-node',
  plugins: [
    new TreeShakingSharedPlugin({
      secondary: true,
      mfConfig: {
        name: 'secondary_share',
        library: {
          type: 'commonjs2',
        },
        shared: {
          'ui-lib': {
            version: '1.0.0',
            treeShaking: {
              mode: 'runtime-infer',
              usedExports: ['Badge', 'MessagePro'],
            },
            requiredVersion: '^1.0.0',
          },
          'ui-lib-dep': {
            version: '1.0.0',
            treeShaking: {
              mode: 'runtime-infer',
              usedExports: ['Message'],
            },
            requiredVersion: '^1.0.0',
          },
        },
        treeShakingSharedPlugins: [
          path.resolve(__dirname, './CustomPlugin.js'),
        ],
      },
    }),
  ],
};
