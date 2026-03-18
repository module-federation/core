// Script that registers the expected global — simulates a well-formed remote entry.
globalThis['remote'] = {
  get: function (scope) {
    return function () {};
  },
  init: function () {},
};
