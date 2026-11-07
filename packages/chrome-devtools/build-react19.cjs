const path = require('node:path');
const { buildSync } = require('esbuild');

// Build the official development modules ourselves: the third-party UMD build
// uses eval devtool, and fetching it from a CDN is unsuitable for the extension.
buildSync({
  stdin: {
    contents: `let runtime;
    export function getReact19Development() {
      return runtime || (runtime = {
        React: require('react19'),
        ReactDOM: { ...require('react-dom19'), ...require('react-dom19/client') },
      });
    }`,
    resolveDir: __dirname,
    sourcefile: 'react19-development-entry.js',
  },
  outfile: path.join(__dirname, 'src/vendor/react19-development.js'),
  bundle: true,
  platform: 'browser',
  format: 'esm',
  target: 'chrome114',
  define: { 'process.env.NODE_ENV': '"development"' },
  // ReactDOM must use this exact React instance, not the extension UI's React.
  alias: {
    react: path.dirname(require.resolve('react19/package.json')),
    'react-dom': path.dirname(require.resolve('react-dom19/package.json')),
  },
  minify: false,
  legalComments: 'inline',
});
