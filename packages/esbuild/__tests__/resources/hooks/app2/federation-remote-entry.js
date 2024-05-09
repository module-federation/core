globalThis[`@loader-hooks/app2`] = {
  get(scope) {
    const moduleMap = {
      './say'() {
        return () => 'hello app2';
      },
    };
    return moduleMap[scope];
  },
  init() {},
};
