import fs from 'node:fs';
import path from 'node:path';
import semver from 'semver';

export const checkVersion = (version: string) => {
  // Extract the version number starting from the first digit
  const versionMatch = version.match(/\d.*/);
  if (!versionMatch) return 0;

  const cleanVersion = versionMatch[0];

  if (semver.gte(cleanVersion, '5.0.0') && semver.lt(cleanVersion, '6.0.0')) {
    return 5;
  } else if (
    semver.gte(cleanVersion, '6.0.0') &&
    semver.lt(cleanVersion, '7.0.0')
  ) {
    return 6;
  } else if (semver.gte(cleanVersion, '7.0.0')) {
    return 7;
  }

  return 0;
};

export const findPackageJson = (startPath: string): string | null => {
  let currentPath = startPath;
  while (currentPath !== path.parse(currentPath).root) {
    const packageJsonPath = path.join(currentPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return null;
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
