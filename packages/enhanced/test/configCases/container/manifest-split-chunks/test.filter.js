const { supportsWebpackFeature } = require('../../../helpers/webpackFeatures');

module.exports = () => supportsWebpackFeature('splitChunksRegExpChunks');
