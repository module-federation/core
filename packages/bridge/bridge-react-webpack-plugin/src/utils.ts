import fs from 'node:fs';
import path from 'node:path';

export const checkVersion = (version: string) => {
  const major = Number(version.match(/\d+/)?.[0]);
  return major === 5 || major === 6
    ? major
    : major >= 8
      ? 8
      : major === 7
        ? 7
        : 0;
};

export const findPackageJson = (startPath: string): string | null => {
  if (!path.isAbsolute(startPath) && !startPath.startsWith('.')) {
    return null;
  }

  let currentPath = path.resolve(startPath);
  while (true) {
    const packageJsonPath = path.join(currentPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath;
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      return null;
    }
    currentPath = parentPath;
  }
};

export const getDependencies = () => {
  const userPackageJsonPath = path.resolve(process.cwd(), 'package.json');
  let userDependencies: Record<string, string> = {};

  if (fs.existsSync(userPackageJsonPath)) {
    const userPackageJson = JSON.parse(
      fs.readFileSync(userPackageJsonPath, 'utf-8'),
    );
    userDependencies = {
      ...userPackageJson.dependencies,
      ...userPackageJson.devDependencies,
    };
  }
  return userDependencies;
};
