import path from 'node:path';

function getTypedName(name: string) {
  return `@types/${name.replace(/^@/, '').replace('/', '__')}`;
}

function getPackageRootDir(packageName: string | undefined): string {
  if (!packageName) {
    throw new Error('No package name provided.');
  }

  let packageRootDir: string;

  try {
    // First, try resolving the package's package.json
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    packageRootDir = path.dirname(packageJsonPath);
  } catch (error) {
    // If resolving package.json fails, fall back to resolving the package itself
    try {
      const packageEntryPath = require.resolve(packageName);
      packageRootDir = path.dirname(packageEntryPath);
    } catch (fallbackError) {
      throw new Error(
        `Could not resolve package "${packageName}" or its package.json.`,
      );
    }
  }

  return packageRootDir;
}

export { getTypedName, getPackageRootDir };
