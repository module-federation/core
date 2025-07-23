// Expected warnings configuration for consume-filters test
module.exports = [
  // Version determination warnings for prefix modules (expected)
  [
    /No required version specified and unable to automatically determine one.*components/,
  ],
  [
    /No required version specified and unable to automatically determine one.*libs/,
  ],
  // Version filtering now works correctly by reading actual module versions from package.json
  // The previous bug where version ranges were compared against version ranges has been fixed
];
