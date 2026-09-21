const fs = require('fs');
const path = require('path');

const pkg = require(path.resolve(process.cwd(), 'package.json'));

const manifest = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'manifest.json'), 'utf8'),
);
pkg.version.includes('-')
  ? (manifest.version = '0.0.0')
  : (manifest.version = pkg.version);

// Some embedded browsers reject side_panel at install time, so runtime API
// detection alone cannot provide a fallback. Package a popup-only variant.
if (process.argv.includes('--popup')) {
  manifest.permissions = manifest.permissions.filter(
    (permission) => permission !== 'sidePanel',
  );
  delete manifest.side_panel;
  delete manifest.devtools_page;
  manifest.action.default_popup = 'html/main/index.html?view=popup';
}

fs.writeFileSync(
  path.resolve(process.cwd(), 'dist/manifest.json'),
  JSON.stringify(manifest, null, 2),
);
