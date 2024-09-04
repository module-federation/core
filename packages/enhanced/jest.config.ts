/* eslint-disable */
import sharedConfig from './jest.shared';

export default {
  ...sharedConfig,
  displayName: 'enhanced',
  testMatch: [
    '<rootDir>/test/*.test.js',
    '<rootDir>/test/*.basictest.js',
    '<rootDir>/test/*.longtest.js',
    '<rootDir>/test/*.unittest.js',
  ],
};
