import type webpack from 'webpack';
import path from 'path';

export function getWebpackPath(
  compiler: webpack.Compiler,
  options: { framework: 'nextjs' | 'other' } = { framework: 'other' },
): string {
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
    return require.resolve('webpack', { paths: [webpackPath] });
  }
}

export const normalizeWebpackPath = (fullPath: string): string => {
  const federationWebpackPath = process.env['FEDERATION_WEBPACK_PATH'];

  // Next.js webpack bridge points to its compiled bundle entry. For deep webpack
  // internals we should keep native requests so Node/Next hook resolution can
  // pick the best available target (Next-compiled alias or local webpack).
  if (
    federationWebpackPath &&
    federationWebpackPath.includes('/next/dist/compiled/webpack/')
  ) {
    if (fullPath === 'webpack') {
      return federationWebpackPath;
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
