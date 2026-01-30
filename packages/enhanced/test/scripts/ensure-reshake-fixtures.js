const fs = require('fs');
const path = require('path');

const ensureFixture = (baseDir, pkgName, entryContents) => {
  const pkgDir = path.join(baseDir, pkgName);
  fs.mkdirSync(pkgDir, { recursive: true });
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
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
  fs.writeFileSync(path.join(pkgDir, 'index.js'), entryContents);
};

const repoRoot = process.env.GITHUB_WORKSPACE || process.cwd();
const reshakeDir = path.join(
  repoRoot,
  'packages',
  'enhanced',
  'test',
  'configCases',
  'tree-shaking-share',
  'reshake-share',
  'node_modules',
);

ensureFixture(
  reshakeDir,
  'ui-lib-dep',
  ["export const Message = 'Message';", "export const Spin = 'Spin';", ''].join(
    '\n',
  ),
);
ensureFixture(
  reshakeDir,
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
