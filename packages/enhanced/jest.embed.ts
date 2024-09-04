/* eslint-disable */
import sharedConfig from './jest.shared';

export default {
  ...sharedConfig,
  displayName: 'enhanced-experiments',
  testMatch: ['<rootDir>/test/*.embedruntime.js'],
};
