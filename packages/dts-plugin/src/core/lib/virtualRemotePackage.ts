import fs from 'fs';
import { readdir, writeFile } from 'fs/promises';
import path from 'path';
import fse from 'fs-extra';

import { fileLog } from '../../server';

const REMOTE_ALIAS_PACKAGE_NAME_REGEXP = /^(?:@[^/]+\/[^/]+|[^@/][^/]*)$/;
const GENERATED_REMOTE_TYPES_PACKAGE_MARK = '.mf-types-generated';

const toPosixPath = (value: string) => value.split(path.sep).join('/');

const ensureImportSpecifier = (value: string) => {
  if (!value || value === '.') {
    return './';
  }

  if (value.startsWith('.')) {
    return value;
  }

  return `./${value}`;
};

const isPathInside = (childPath: string, parentPath: string) => {
  const relativePath = path.relative(parentPath, childPath);
  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
  );
};

const resolveVirtualPackagePath = (context: string, remoteAlias: string) => {
  const nodeModulesPath = path.resolve(context, 'node_modules');
  const packagePath = path.resolve(nodeModulesPath, ...remoteAlias.split('/'));

  if (!isPathInside(packagePath, nodeModulesPath)) {
    throw new Error(
      `Invalid remote alias "${remoteAlias}", cannot create virtual package outside node_modules`,
    );
  }

  return packagePath;
};

const collectDeclarationFiles = async (
  rootDir: string,
  currentDir: string = rootDir,
): Promise<string[]> => {
  const dirents = await readdir(currentDir, {
    withFileTypes: true,
  });

  const files = await Promise.all(
    dirents
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(async (dirent) => {
        const absolutePath = path.join(currentDir, dirent.name);
        const relativePath = path.relative(rootDir, absolutePath);
        const pathSegments = relativePath.split(path.sep);

        if (pathSegments.includes('node_modules')) {
          return [];
        }

        if (dirent.isDirectory()) {
          return collectDeclarationFiles(rootDir, absolutePath);
        }

        if (dirent.isFile() && absolutePath.endsWith('.d.ts')) {
          return [absolutePath];
        }

        return [];
      }),
  );

  return files.flat();
};

export const syncRemoteTypesPackage = async (options: {
  context: string;
  remoteAlias: string;
  remoteTypesFolder: string;
}) => {
  const { context, remoteAlias, remoteTypesFolder } = options;

  if (!REMOTE_ALIAS_PACKAGE_NAME_REGEXP.test(remoteAlias)) {
    fileLog(
      `Skip creating virtual package for "${remoteAlias}" because the alias is not a valid package name`,
      'syncRemoteTypesPackage',
      'warning',
    );
    return false;
  }

  if (!fs.existsSync(remoteTypesFolder)) {
    fileLog(
      `Skip creating virtual package for "${remoteAlias}" because source types folder does not exist: ${remoteTypesFolder}`,
      'syncRemoteTypesPackage',
      'warning',
    );
    return false;
  }

  try {
    const virtualPackagePath = resolveVirtualPackagePath(context, remoteAlias);
    const markerFilePath = path.join(
      virtualPackagePath,
      GENERATED_REMOTE_TYPES_PACKAGE_MARK,
    );

    if (
      fs.existsSync(virtualPackagePath) &&
      !fs.existsSync(markerFilePath)
    ) {
      fileLog(
        `Skip creating virtual package for "${remoteAlias}" because "${virtualPackagePath}" already exists and is not managed by Module Federation`,
        'syncRemoteTypesPackage',
        'warning',
      );
      return false;
    }

    await fse.remove(virtualPackagePath);
    await fse.ensureDir(virtualPackagePath);

    const declarationFiles = await collectDeclarationFiles(remoteTypesFolder);

    await writeFile(
      path.join(virtualPackagePath, 'package.json'),
      JSON.stringify(
        {
          name: remoteAlias,
          private: true,
          types: './index.d.ts',
        },
        null,
        2,
      ),
    );
    await writeFile(markerFilePath, '');

    for (const declarationPath of declarationFiles) {
      const declarationWithoutExt = declarationPath.replace(/\.d\.ts$/, '');
      const relativeDeclarationPath = path.relative(
        remoteTypesFolder,
        declarationPath,
      );
      const virtualDeclarationPath = path.join(
        virtualPackagePath,
        relativeDeclarationPath,
      );
      const relativeImportPath = ensureImportSpecifier(
        toPosixPath(
          path.relative(
            path.dirname(virtualDeclarationPath),
            declarationWithoutExt,
          ),
        ),
      );

      await fse.ensureDir(path.dirname(virtualDeclarationPath));
      await writeFile(
        virtualDeclarationPath,
        `export * from '${relativeImportPath}';\nexport { default } from '${relativeImportPath}';\n`,
      );
    }

    const rootTypesFilePath = path.join(virtualPackagePath, 'index.d.ts');
    if (!fs.existsSync(rootTypesFilePath)) {
      await writeFile(rootTypesFilePath, 'export {};\n');
    }

    return true;
  } catch (err) {
    fileLog(
      `Unable to create virtual package for "${remoteAlias}", ${err}`,
      'syncRemoteTypesPackage',
      'warning',
    );
    return false;
  }
};
