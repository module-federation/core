const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

function getCurrentGitBranch() {
  try {
    const branch = execSync('git branch --show-current').toString().trim();
    // Replace '/' with '-' in the branch name
    return branch.replace(/\//g, '-');
  } catch (error) {
    console.error('Error getting current git branch:', error);
    return 'unknown';
  }
}

function getPreviewVersion(branch) {
  return `0.0.0-${branch}-${Date.now()}`;
}

function updatePackageVersions() {
  const currentBranch = getCurrentGitBranch();
  const packageJsonPaths = glob.sync('packages/*/package.json');

  packageJsonPaths.forEach((filePath) => {
    const fullPath = path.resolve(filePath);
    const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    packageJson.version = getPreviewVersion(currentBranch);

    fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated version in ${filePath}`);
  });
}

updatePackageVersions();
