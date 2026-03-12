import webpackBundlerRuntime from '@module-federation/webpack-bundler-runtime';

const normalizedWebpackBundlerRuntime =
  // Support both CJS module.exports payload and transpiled default payload.
  (webpackBundlerRuntime as { default?: unknown }).default ??
  webpackBundlerRuntime;

export default normalizedWebpackBundlerRuntime;
