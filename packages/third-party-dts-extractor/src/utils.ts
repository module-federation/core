import path from 'node:path';
import fs from 'node:fs';

function getTypedName(name: string) {
  return `@types/${name.replace(/^@/, '').replace('/', '__')}`;
}

/**
 * Locates the directory of the package.json for the given packageName.
 * 1. Resolves the entry file via require.resolve().
 * 2. Looks for package.json in that same directory (fallback).
 * 3. Climb upward until the folder name matches localName
 *    (the part after a scope slash, e.g. "@scope/sdk" => "sdk").
 * 4. If that folder's package.json has "name" === packageName, return that directory.
 * 5. Otherwise, return the fallback directory (if it contains a package.json).
 * 6. If all else fails, throw an error.
 */
function getPackageRootDir(packageName: string | undefined): string {
  if (!packageName) {
    throw new Error('No package name provided.');
  }

  // 1) Resolve the entry file
  const entryFile = require.resolve(packageName);
  const entryDir = path.dirname(entryFile);

  // 2) Fallback: check if there's a package.json in entryDir
  let fallbackPackageJsonPath: string | null = path.join(
    entryDir,
    'package.json',
  );
  if (!fs.existsSync(fallbackPackageJsonPath)) {
    fallbackPackageJsonPath = null;
  }

  // Figure out localName (e.g., "@scope/sdk" -> "sdk", "lodash" -> "lodash")
  const match = packageName.match(/^@[^/]+\/(.+)$/);
  const localName = match ? match[1] : packageName;

  // Start climbing from the entryDir
  let currentDir = entryDir;

  // 3) Use a while loop that continues until we either:
  //    a) find a folder whose name is localName, or
  //    b) reach the filesystem root (when path.dirname(currentDir) === currentDir)
  while (
    path.basename(currentDir) !== localName && // Keep going if names differ
    path.dirname(currentDir) !== currentDir // Stop if we're at root
  ) {
    try {
      currentDir = path.dirname(currentDir);
    } catch (err) {
      // Permission error
      if (err.code === 'EACCES') {
        continue;
      } else {
        throw err;
      }
    }
  }

  // 4) If we ended because the folder name now matches localName, check package.json
  if (path.basename(currentDir) === localName) {
    const candidate = path.join(currentDir, 'package.json');
    if (fs.existsSync(candidate)) {
      const pkgContent = JSON.parse(fs.readFileSync(candidate, 'utf8'));
      if (pkgContent.name === packageName) {
        return currentDir; // Found the correct root folder
      }
    }
  }

  // 5) If we didn't find a matching package.json, fall back (if available)
  if (fallbackPackageJsonPath) {
    return entryDir;
  }

  // 6) Otherwise, throw an error
  throw new Error(
    `Could not find a matching package.json for "${packageName}" and no fallback was found.`,
  );
}

export { getTypedName, getPackageRootDir };
