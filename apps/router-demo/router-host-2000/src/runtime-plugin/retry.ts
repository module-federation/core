import { RetryPlugin } from '@module-federation/retry-plugin';

const retryPlugin = () =>
  RetryPlugin({
    fetch: {
      url: 'http://localhost:2001/mf-manifest.json',
      fallback: () => 'http://localhost:2001/mf-manifest.json',
    },
    script: {
      retryTimes: 3,
      retryDelay: 1000,
      moduleName: ['remote1'],
      cb: (resolve, error) => {
        return setTimeout(() => {
          resolve(error);
        }, 1000);
      },
    },
  });
export default retryPlugin;
