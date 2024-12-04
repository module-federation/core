globalThis[`@snapshot/remote2`] = {
  get(scope) {
    const moduleMap = {
      './say'() {
        return () => 'hello world "@snapshot/remote2"';
      },
    };
    return moduleMap[scope];
  },
  init() {},
};
