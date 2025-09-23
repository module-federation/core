import { RetryPlugin } from '@module-federation/retry-plugin';

const retryPlugin = () =>
  RetryPlugin({
    retryTimes: 4,
    retryDelay: 1000,
    onRetry: (params) => {
      console.log('onRetry', params);
    },
    onSuccess: (params) => {
      console.log('onSuccess', params);
    },
    onError: (params) => {
      console.log('onError', params);
    },
    // manifestDomains: [
    //   'https://m1.example.com',
    //   'https://m2.example.com',
    //   'https://m3.example.com',
    // ],
    // domains: [
    //   'http://localhost:2011',
    //   'http://localhost:2021',
    //   'http://localhost:2031',
    // ],
    // addQuery: ({ times, originalQuery }) => {
    //   return `${originalQuery}&retry=${times}&retryTimeStamp=${new Date().valueOf()}`;
    // },
    fetchOptions: {
      method: 'GET',
    },
  });
export default retryPlugin;
