const fs = require('fs');
const path = require('path');

const pkg = require(path.resolve(process.cwd(), 'package.json'));

const manifest = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'manifest.json'), 'utf8'),
);
if (!process.env.E2ETEST) {
  delete manifest.background;
}
pkg.version.includes('-')
  ? (manifest.version = '0.0.0')
  : (manifest.version = pkg.version);

fs.writeFileSync(
  path.resolve(process.cwd(), 'dist/manifest.json'),
  JSON.stringify(manifest, null, 2),
);
