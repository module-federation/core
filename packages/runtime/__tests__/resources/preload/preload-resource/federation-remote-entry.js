// eslint-disable-next-line no-var
var pkgName = '@federation/sub1';
// eslint-disable-next-line no-var
var version = 'custom';

globalThis[`__FEDERATION_${`${pkgName}:${version}`}__`] = {
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
