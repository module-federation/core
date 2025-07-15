module.exports = [
  // Warning for singleton with version filters
  {
    message:
      /"singleton: true" is used together with "include\.version: "\^1\.0\.0""\. This might lead to multiple instances of the shared module "singleton-filter" in the shared scope\./,
  },

  // Warning for version-exclude-fail.js matching the exclude filter (appears twice)
  {
    message:
      /Shared module "\.\/version-exclude-fail\.js".*version "2\.0\.0" matches exclude filter: \^2\.0\.0/,
  },
  {
    message:
      /Shared module "\.\/version-exclude-fail\.js".*version "2\.0\.0" matches exclude filter: \^2\.0\.0/,
  },

  // Warning for version-include-fail.js not matching the include filter (appears twice)
  {
    message:
      /Shared module "\.\/version-include-fail\.js".*version "1\.2\.0" does not satisfy include filter: \^2\.0\.0/,
  },
  {
    message:
      /Shared module "\.\/version-include-fail\.js".*version "1\.2\.0" does not satisfy include filter: \^2\.0\.0/,
  },
];
