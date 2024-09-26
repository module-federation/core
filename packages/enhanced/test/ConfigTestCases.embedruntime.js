const { describeCases } = require('./ConfigTestCases.template');
jest.resetModules();
describeCases({
  name: 'ConfigTestCases',
  federation: {
    federationRuntime: 'hoisted',
  },
});
