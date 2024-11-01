globalThis[`@register-remotes/app1`] = {
  get(scope) {
    const moduleMap = {
      './say'() {
        return () => 'hello app1 entry2';
      },
    };
    return moduleMap[scope];
  },
  init() {},
};
