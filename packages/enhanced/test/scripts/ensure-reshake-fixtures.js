const fs = require('fs');
const path = require('path');

const ensureFixture = (baseDir, pkgName, entryContents) => {
  const pkgDir = path.join(baseDir, pkgName);
  fs.mkdirSync(pkgDir, { recursive: true });
  const packageJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    fs.writeFileSync(
      packageJsonPath,
      `${JSON.stringify(
        {
          name: pkgName,
          main: './index.js',
          version: '1.0.0',
          sideEffects: false,
        },
        null,
        2,
      )}\n`,
    );
  }
  fs.writeFileSync(path.join(pkgDir, 'index.js'), entryContents);
};

const repoRoot =
  process.env.GITHUB_WORKSPACE ||
  path.resolve(__dirname, '..', '..', '..', '..');

const fixtureRoots = [
  path.join(
    repoRoot,
    'packages',
    'enhanced',
    'test',
    'configCases',
    'tree-shaking-share',
    'reshake-share',
    'node_modules',
  ),
  path.join(
    repoRoot,
    'packages',
    'enhanced',
    'test',
    'configCases',
    'tree-shaking-share',
    'server-strategy',
    'node_modules',
  ),
];

const uiLibDepEntry = [
  "export const Message = 'Message';",
  "export const Spin = 'Spin';",
  '',
].join('\n');
const uiLibEntryReshake = [
  "import { Message, Spin } from 'ui-lib-dep';",
  '',
  "export const Button = 'Button';",
  "export const List = 'List';",
  "export const Badge = 'Badge';",
  '',
  'export const MessagePro = `${Message}Pro`;',
  'export const SpinPro = `${Spin}Pro`;',
  '',
  'export default {',
  '  Button,',
  '  List,',
  '  Badge,',
  '};',
  '',
].join('\n');

const uiLibEntryServer = [
  "export const Button = 'Button';",
  "export const List = 'List';",
  "export const Badge = 'Badge';",
  '',
  'export default {',
  '  Button,',
  '  List,',
  '  Badge,',
  '};',
  '',
].join('\n');

for (const baseDir of fixtureRoots) {
  const isReshake = baseDir.includes(`${path.sep}reshake-share${path.sep}`);
  if (isReshake) {
    ensureFixture(baseDir, 'ui-lib-dep', uiLibDepEntry);
    ensureFixture(baseDir, 'ui-lib', uiLibEntryReshake);
  } else {
    ensureFixture(baseDir, 'ui-lib', uiLibEntryServer);
  }
}
