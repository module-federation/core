globalThis[`__FEDERATION_${'@federation-test/app2:custom'}__`] = {
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
