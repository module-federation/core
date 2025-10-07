// Filter for worker test case
// The ESM module build has issues with URL global in the test environment
// Only run the CommonJS build for now
module.exports = function () {
  // Only run if we can handle the test environment
  // Skip if specific conditions aren't met
  return true; // For now, allow the test to run
};
