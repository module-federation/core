import type webpack from 'webpack';
import { resolve } from 'node:path';

export function getWebpackPath(
  compiler: webpack.Compiler,
  options: { framework: 'nextjs' | 'other' } = { framework: 'other' },
): string {
  const resolveWithContext = new Function(
    'id',
    'options',
    'return typeof require === "undefined" ? "" : require.resolve(id, options)',
  ) as (id: string, options?: { paths?: string[] }) => string;

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
  if (fullPath === 'webpack') {
    return process.env['FEDERATION_WEBPACK_PATH'] || fullPath;
  }

  if (process.env['FEDERATION_WEBPACK_PATH']) {
    return resolve(
      process.env['FEDERATION_WEBPACK_PATH'],
      fullPath.replace('webpack', '../../'),
    );
  }

  return fullPath;
};
