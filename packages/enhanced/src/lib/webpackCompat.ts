import type { Compiler } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const JavascriptModulesPlugin = require(
  normalizeWebpackPath('webpack/lib/javascript/JavascriptModulesPlugin'),
) as typeof import('webpack/lib/javascript/JavascriptModulesPlugin');

type CompilerWithJavascriptModulesPlugin = Compiler['webpack'] & {
  javascript?: {
    JavascriptModulesPlugin?: typeof import('webpack/lib/javascript/JavascriptModulesPlugin');
  };
};

type WebpackSources = NonNullable<Compiler['webpack']>['sources'];

export function getWebpackSources(compiler: Compiler): WebpackSources {
  if (compiler.webpack?.sources) {
    return compiler.webpack.sources as WebpackSources;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const webpack = require(
      process.env['FEDERATION_WEBPACK_PATH'] || 'webpack',
    ) as typeof import('webpack');
    if (webpack?.sources) {
      return webpack.sources as WebpackSources;
    }
  } catch {
    // ignore fallback failures
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('webpack').sources as WebpackSources;
}

export function getJavascriptModulesPlugin(
  compiler: Compiler,
): typeof import('webpack/lib/javascript/JavascriptModulesPlugin') {
  const maybePlugin = (compiler.webpack as CompilerWithJavascriptModulesPlugin)
    ?.javascript?.JavascriptModulesPlugin;

  return maybePlugin || JavascriptModulesPlugin;
}
