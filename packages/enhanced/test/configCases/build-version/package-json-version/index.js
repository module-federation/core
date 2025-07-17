it('should read buildVersion from package.json', () => {
  const fs = require('fs');
  const path = require('path');

  // Read the generated mf-manifest.json file (Module Federation manifest)
  const manifestPath = path.join(__dirname, 'dist', 'mf-manifest.json');
  expect(fs.existsSync(manifestPath)).toBe(true);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Check that buildVersion matches package.json version
  expect(manifest.buildInfo).toBeDefined();
  expect(manifest.buildInfo.buildVersion).toBe('1.2.3');
});
