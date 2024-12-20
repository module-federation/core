globalThis[`__FEDERATION_${'@demo/main:custom'}__`] = {
  get(scope) {
    const moduleMap = {
      './say'() {
        return () => 'hello world';
      },
      './add'() {
        return (...args) => args.reduce((cur, next) => cur + next, 0);
      },
    };
    return moduleMap[scope];
  },
  init() {},
};
