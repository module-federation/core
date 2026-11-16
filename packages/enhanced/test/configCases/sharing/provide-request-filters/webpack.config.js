const path = require('path');
const { ProvideSharedPlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new ProvideSharedPlugin({
      provides: {
        ...Object.fromEntries(
          ['relative', 'absolute'].flatMap((kind) =>
            [
              'include-pass',
              'include-fail',
              'exclude-pass',
              'exclude-fail',
            ].map((filterCase) => {
              const shareKey = `${kind}-${filterCase}`;
              const relativeRequest = `./static/${shareKey}.js`;
              const request =
                kind === 'absolute'
                  ? path.join(__dirname, relativeRequest)
                  : relativeRequest;
              const filter = filterCase.startsWith('include')
                ? {
                    include: {
                      request: filterCase.endsWith('pass')
                        ? request
                        : 'does-not-match',
                    },
                  }
                : {
                    exclude: {
                      request: filterCase.endsWith('fail')
                        ? /exclude-fail/
                        : /does-not-match/,
                    },
                  };
              return [
                shareKey,
                { request, shareKey, version: '1.0.0', ...filter },
              ];
            }),
          ),
        ),
        'lodash/': {
          include: {
            request: 'get',
          },
        },
        react: {
          include: {
            request: 'react',
          },
        },
        'pkg/': {
          exclude: {
            request: /node_modules/,
          },
        },
        'lodash/map.js': {
          allowNodeModulesSuffixMatch: true,
          include: {
            request: 'lodash/map.js',
          },
        },
        'lodash/pick.js': {
          allowNodeModulesSuffixMatch: true,
          include: {
            request: 'lodash/map.js',
          },
        },
      },
    }),
  ],
};
