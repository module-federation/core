// Filter for worker test case
// We now rely on the ESM build exclusively, which works with Worker support.
module.exports = function () {
  return true;
};
