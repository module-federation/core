import type webpack from 'webpack';
export function getWebpackPath(compiler: webpack.Compiler): string {
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
    const webpackPath = webpackLocationWithDetail.split(':').slice(0, -2)[0];
    return require.resolve('webpack', { paths: [webpackPath] });
  }
}
