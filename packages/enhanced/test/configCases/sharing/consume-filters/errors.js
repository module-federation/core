// Expected errors configuration for consume-filters test
// These errors occur because we're testing consumption without providing the modules
module.exports = [
  // Module not found errors are expected because we're only testing the consume side
  [/Module not found: Error: Can't resolve 'components\/Button'/],
  [/Module not found: Error: Can't resolve 'libs\/utils'/],
  [/Module not found: Error: Can't resolve 'version-include'/],
];
