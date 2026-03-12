import type webpack from 'webpack';
import fs from 'fs';
import path from 'path';

function resolveWebpackFromRoot(root: string): string {
  const webpackDir = path.join(root, 'node_modules', 'webpack');

  try {
    const webpackRealPath = fs.realpathSync(webpackDir);
    const libIndexPath = path.join(webpackRealPath, 'lib', 'index.js');

    if (fs.existsSync(libIndexPath)) {
      return libIndexPath;
    }
  } catch {
    return '';
  }

  return '';
}

function resolveWebpackFromCurrentProject(): string {
  let currentRoot = path.resolve(process.cwd());

  while (true) {
    const webpackPath = resolveWebpackFromRoot(currentRoot);
    if (webpackPath) {
      return webpackPath;
    }

    const parentRoot = path.dirname(currentRoot);
    if (parentRoot === currentRoot) {
      return '';
    }
    currentRoot = parentRoot;
  }
}

export function getWebpackPath(
  compiler: webpack.Compiler,
  options: { framework: 'nextjs' | 'other' } = { framework: 'other' },
): string {
  const resolveWithContext = new Function(
    'id',
    'options',
    'return typeof require === "undefined" ? "" : require.resolve(id, options)',
  ) as (id: string, options?: { paths?: string[] }) => string;

  if (
    options?.framework === 'nextjs' &&
    process.env['NEXT_PRIVATE_LOCAL_WEBPACK']
  ) {
    return resolveWebpackFromCurrentProject() || 'webpack';
  }

  try {
    // @ts-ignore just throw err
    compiler.webpack();
    return '';
  } catch (err) {
    const trace = (err as Error).stack?.split('\n') || [];
    const webpackErrLocation =
      trace.find((item) => item.includes('at webpack')) || '';
    const webpackLocationWithDetail = webpackErrLocation
      .replace(/[^\(\)]+/, '')
      .slice(1, -1);
    const webpackPath = webpackLocationWithDetail
      .split(':')
      .slice(0, -2)
      .join(':');
    if (options?.framework === 'nextjs') {
      if (webpackPath.endsWith('webpack.js')) {
        return webpackPath.replace('webpack.js', 'index.js');
      }
      return '';
    }
    return resolveWithContext('webpack', { paths: [webpackPath] });
  }
}

export const normalizeWebpackPath = (fullPath: string): string => {
  const federationWebpackPath = process.env['FEDERATION_WEBPACK_PATH'];
  const useNextLocalWebpack = Boolean(
    process.env['NEXT_PRIVATE_LOCAL_WEBPACK'],
  );
  const localWebpackPath = useNextLocalWebpack
    ? resolveWebpackFromCurrentProject()
    : federationWebpackPath || '';

  if (useNextLocalWebpack) {
    if (fullPath === 'webpack') {
      return localWebpackPath || fullPath;
    }

    if (localWebpackPath) {
      return path.resolve(
        localWebpackPath,
        fullPath.replace('webpack', '../../'),
      );
    }

    return fullPath;
  }

  if (fullPath === 'webpack') {
    return federationWebpackPath || fullPath;
  }

  if (federationWebpackPath) {
    return path.resolve(
      federationWebpackPath,
      fullPath.replace('webpack', '../../'),
    );
  }

  return fullPath;
};
