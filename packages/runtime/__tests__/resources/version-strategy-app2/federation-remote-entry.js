globalThis[
  `__FEDERATION_${'@federation-test/version-strategy-app2:custom'}__`
] = {
  get(scope) {
    const moduleMap = {
      './say'() {
        return () => 'hello app2';
      },
    };
    return moduleMap[scope];
  },
  init(shareScope) {
    const ins = new globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__({
      name: '@shared-test/version-strategy-app2',
      version: '0.0.1',
      shared: {
        'runtime-react': {
          version: '16.2.0',
          scope: 'default',
          strategy: 'loaded-first',
          get: () => () => {
            return { from: '@shared-test/version-strategy-app2' };
          },
        },
      },
    });
    globalThis.__FEDERATION__.__INSTANCES__.push(ins);
    ins.initShareScopeMap('default', shareScope);

    return ins.initializeSharing();
  },
};
