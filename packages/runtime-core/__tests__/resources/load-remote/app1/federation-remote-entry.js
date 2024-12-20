globalThis[`__FEDERATION_${'@load-remote/app1:custom'}__`] = {
  get(scope) {
    const moduleMap = {
      './say'() {
        return () => 'hello app1';
      },
    };
    return moduleMap[scope];
  },
  init() {},
};
