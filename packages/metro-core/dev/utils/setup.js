const path = require('node:path');

require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
  },
  project: path.resolve(__dirname, '../../tsconfig.json'),
  transpileOnly: true,
});
