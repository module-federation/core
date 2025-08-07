// Expected errors configuration for consume-filters test
module.exports = [
  // Error when resolving fallback for shared module components/Button
  {
    loc: /resolving fallback for shared module components\/Button/,
    message: /Module not found: Error: Can't resolve 'components\/Button'/,
  },
  // Error when resolving fallback for shared module libs/utils
  {
    loc: /resolving fallback for shared module libs\/utils/,
    message: /Module not found: Error: Can't resolve 'libs\/utils'/,
  },
];
