import { RetryPlugin } from '@module-federation/retry-plugin';

const retryPlugin = () =>
  RetryPlugin({
    retryTimes: 3,
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
    domains: [
      'http://localhost:2001',
      'http://localhost:2001',
      'http://localhost:2011',
      'http://localhost:2021',
    ],
    addQuery: true,
    fetchOptions: {
      method: 'GET',
    },
  });
export default retryPlugin;
