// Expected warnings configuration for consume-filters test
module.exports = [
  // Warning for components/Button shared module without required version
  {
    file: /shared module components\/Button/,
    message:
      /No required version specified and unable to automatically determine one.*Unable to find required version for "components"/,
  },
  // Warning for libs/utils shared module without required version
  {
    file: /shared module libs\/utils/,
    message:
      /No required version specified and unable to automatically determine one.*Unable to find required version for "libs"/,
  },
];
