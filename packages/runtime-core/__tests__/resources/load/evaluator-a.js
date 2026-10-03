globalThis.remote = {
  get: function () {
    return function () {
      return 'literal-a';
    };
  },
  init: function () {},
};
