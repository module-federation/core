/* eslint-disable */
import sharedConfig from './jest.shared';

export default {
  ...sharedConfig,
  displayName: 'enhanced',
  testMatch: ['<rootDir>/test/*.embedruntime.js'],
};
