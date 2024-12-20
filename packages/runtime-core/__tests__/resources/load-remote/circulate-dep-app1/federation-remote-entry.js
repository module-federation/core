globalThis[`__FEDERATION_@circulate-deps/app1:local__`] = {
  get(scope) {
    const moduleMap = {
      './say'() {
        return () => {
          return '@circulate-deps/app1';
        };
      },
    };
    return moduleMap[scope];
  },
  init() {},
};
