globalThis[`@loader-hooks/app3`] = {
  get(scope) {
    const moduleMap = {
      './say'() {
        return () => 'hello app3';
      },
    };
    return moduleMap[scope];
  },
  init() {},
};
