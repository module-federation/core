export default {
  name: 'another_remote',
  shareStrategy: 'loaded-first',
  exposes: {
    './SharedConsumer': './src/sharedConsumer.ts',
  },
  shared: {
    antd: {
      singleton: true,
      requiredVersion: false,
    },
  },
};
