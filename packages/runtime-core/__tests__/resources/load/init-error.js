// Script that registers a remote whose container init fails.
globalThis['remote'] = {
  get: function () {
    return function () {
      return 'unused';
    };
  },
  init: function () {
    throw new Error('remote init failed');
  },
};
