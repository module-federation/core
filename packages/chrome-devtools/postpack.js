const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pkg = require(path.join(root, 'package.json'));
const source = path.join(root, 'dist/.extension-build');
const original = JSON.parse(
  fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'),
);

for (const variant of ['chrome', 'browser']) {
  const manifest = structuredClone(original);
  manifest.version = pkg.version.includes('-') ? '0.0.0' : pkg.version;
  if (variant === 'browser') {
    manifest.permissions = manifest.permissions.filter(
      (permission) => permission !== 'sidePanel',
    );
    delete manifest.side_panel;
    delete manifest.devtools_page;
    manifest.action.default_popup = 'html/main/index.html?view=popup';
  }
  const destination = path.join(root, 'dist', variant);
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync(source, destination, { recursive: true });
  fs.writeFileSync(
    path.join(destination, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
}
