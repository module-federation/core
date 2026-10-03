globalThis.remote = {
  get: function () {
    return function () {
      return 'literal-b';
    };
  },
  init: function () {},
};
