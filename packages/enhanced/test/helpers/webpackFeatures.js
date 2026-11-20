// Webpack features that config cases depend on, with the first release that
// has each, measured against the published packages. Cases ask by name, so
// the version knowledge lives here once.
const {
  normalizeWebpackPath,
} = require('@module-federation/sdk/normalize-webpack-path');

const FIRST_RELEASE = {
  chunkRootOutputDir: '5.110.0',
  // Records the properties that a destructuring of an import reads.
  destructuredImportTracking: '5.80.0',
  outputIgnoreBrowserWarnings: '5.81.0',
  // A RegExp in optimization.splitChunks.cacheGroups[].chunks.
  splitChunksRegExpChunks: '5.86.0',
  // Top-level await needs no experiments.topLevelAwait setting.
  topLevelAwaitWithoutExperiment: '5.102.0',
  // Tree-shakes a dynamic import that is only read by property.
  dynamicImportPropertyTreeShaking: '5.102.0',
};

const parts = (version) => version.split('.').map(Number);

const isAtLeast = (version, minimum) => {
  const [a, b] = [parts(version), parts(minimum)];
  const index = a.findIndex((part, i) => part !== b[i]);
  return index === -1 || a[index] > b[index];
};

// The webpack under test: FEDERATION_WEBPACK_PATH or the installed one.
const { version } = require(normalizeWebpackPath('webpack'));

const supportsWebpackFeature = (feature) => {
  const minimum = FIRST_RELEASE[feature];
  if (!minimum) throw new Error(`Unknown webpack feature: ${feature}`);
  return isAtLeast(version, minimum);
};

module.exports = { supportsWebpackFeature };
