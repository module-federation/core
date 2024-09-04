const { describeCases } = require('./ConfigTestCases.template');

describeCases({
  name: 'ConfigTestCases',
  federation: {
    embedRuntime: true,
  },
});
