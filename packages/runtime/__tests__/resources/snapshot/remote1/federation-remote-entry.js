globalThis[`@snapshot/remote1`] = {
  get(scope) {
    const moduleMap = {
      './say'() {
        return () => 'hello world "@snapshot/remote1"';
      },
    };
    return moduleMap[scope];
  },
  init() {},
};
