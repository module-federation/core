const path = require('node:path');
const createHostConfig = require('../node-host/webpack.config.js');

const config = createHostConfig({}, { mode: 'development' });

module.exports = {
  ...config,
  entry: {
    main: path.resolve(__dirname, 'src/webpack-consumer.js'),
  },
  output: {
    ...config.output,
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack-consumer.cjs',
    chunkFilename: '[id]-[contenthash].cjs',
  },
};
