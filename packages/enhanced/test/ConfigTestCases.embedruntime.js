const { describeCases } = require('./ConfigTestCases.template');

describeCases({
  name: 'ConfigTestCases',
  federation: {
    federationRuntime: 'hoisted',
  },
});
