import fs from 'node:fs';
import path from 'node:path';

export function findPackageJson(startPath: string): string | undefined {
  let currentPath = path.resolve(startPath);

  while (true) {
    const packageJsonPath = path.join(currentPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath;
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      return undefined;
    }
    currentPath = parentPath;
  }
}
