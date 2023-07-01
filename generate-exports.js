const fs = require('fs');
const path = require('path');

// Set the root directory
const rootDir = './packages';

// Function to update "exports" in package.json
const updateExports = (packageDir) => {
  const srcDir = path.join(packageDir, 'src');

  // Check if "src" directory exists
  if (!fs.existsSync(srcDir)) {
    console.log(`No "src" directory found in ${packageDir}. Skipping...`);
    return;
  }

  // Read the package.json
  const packageJsonPath = path.join(packageDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));

  // Generate "exports" field
  const exportsField = {
    '.': './src/index.js',
    './package.json': './package.json',
  };

  // Go through the src directory recursively and create mappings
  const createMappings = (dir, prefix = '.') => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      const key = path.join(prefix, entry.name);
      if (entry.isDirectory()) {
        createMappings(fullPath, key);
      } else if (entry.isFile() && path.basename(fullPath)) {
        const keyWithoutExtension = key.substring(0, key.lastIndexOf('.'));
        exportsField[
          `./${keyWithoutExtension}`
        ] = `./src/${keyWithoutExtension}/index.js`;
      }
    });
  };

  createMappings(srcDir);

  // Update the package.json
  packageJson.exports = exportsField;
  console.log(packageJson.name, packageJson.exports);
  // fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

// Get the list of packages
const packages = fs
  .readdirSync(rootDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => path.join(rootDir, dirent.name));

// Update each package
packages.forEach(updateExports);

console.log('Exports field successfully updated for all packages.');
