globalThis[`@register-remotes/app1`] = {
  get(scope) {
    const moduleMap = {
      './say'() {
        return () => 'hello app1 entry1';
      },
    };
    return moduleMap[scope];
  },
  init() {},
};
