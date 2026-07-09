import { createRequire } from 'module';
import { dirname, resolve } from 'path';

interface TypeScriptPackageJson {
  version?: string;
  bin?: string | Record<string, string>;
}

interface ResolvedTypeScriptPackage {
  packageJsonPath: string;
  packageJson: TypeScriptPackageJson;
  requireFromContext: NodeJS.Require;
}

export interface TypeScriptPackageInfo {
  packageJsonPath: string;
  packageRoot: string;
  version: string;
  majorVersion: number;
  tscBinPath: string;
}

const parseMajorVersion = (version: string): number => {
  const major = Number.parseInt(version.split('.')[0], 10);
  return Number.isNaN(major) ? 0 : major;
};

const isMissingTypeScriptPackage = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 'MODULE_NOT_FOUND' &&
  'message' in error &&
  typeof error.message === 'string' &&
  error.message.includes('typescript/package.json');

const resolveTypeScriptPackage = (
  context = process.cwd(),
): ResolvedTypeScriptPackage => {
  const candidateContexts = [...new Set([context, process.cwd()])];
  let missingTypeScriptError: unknown;

  for (const candidateContext of candidateContexts) {
    const requireFromContext = createRequire(
      resolve(candidateContext, 'package.json'),
    );
    try {
      const packageJsonPath = requireFromContext.resolve(
        'typescript/package.json',
      );
      return {
        packageJsonPath,
        packageJson: requireFromContext(
          'typescript/package.json',
        ) as TypeScriptPackageJson,
        requireFromContext,
      };
    } catch (error) {
      if (!isMissingTypeScriptPackage(error)) {
        throw error;
      }
      missingTypeScriptError = error;
    }
  }

  throw missingTypeScriptError;
};

export const getTypeScriptPackageInfo = (
  context = process.cwd(),
): TypeScriptPackageInfo => {
  const { packageJsonPath, packageJson } = resolveTypeScriptPackage(context);
  const version = packageJson.version || '0.0.0';
  const packageRoot = dirname(packageJsonPath);
  const bin =
    typeof packageJson.bin === 'string'
      ? packageJson.bin
      : (packageJson.bin?.['tsc'] ?? './bin/tsc');

  return {
    packageJsonPath,
    packageRoot,
    version,
    majorVersion: parseMajorVersion(version),
    tscBinPath: resolve(packageRoot, bin),
  };
};

export const getTypeScriptMajorVersion = (context = process.cwd()) =>
  getTypeScriptPackageInfo(context).majorVersion;

export const isTypeScript7 = (context = process.cwd()) =>
  getTypeScriptMajorVersion(context) === 7;

export const requireTypeScript = <T = unknown>(context = process.cwd()): T => {
  const { requireFromContext } = resolveTypeScriptPackage(context);
  return requireFromContext('typescript') as T;
};
