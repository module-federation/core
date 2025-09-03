import { RetryPlugin } from '@module-federation/retry-plugin';

const retryPlugin = () =>
  RetryPlugin({
    fetch: {
      // fallback: () => 'http://localhost:2001/mf-manifest.json',
      // getRetryPath: (url) => {
      //   return 'http://localhost:2001/mf-manifest.json?test=1';
      // },
    },
    script: {
      retryTimes: 3,
      retryDelay: 1000,
      // moduleName: ['remote1'],
      cb: (resolve, error) => {
        if (error) {
          throw new Error(
            'The request failed three times and has now been abandoned',
          );
        }
        return setTimeout(() => {
          resolve(error);
        }, 1000);
      },
      getRetryPath: (url) => {
        return 'http://localhost:2001/remote1.js?test=2';
      },
    },
  });
export default retryPlugin;
