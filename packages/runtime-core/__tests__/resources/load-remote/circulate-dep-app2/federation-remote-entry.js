globalThis[`__FEDERATION_@circulate-deps/app2:local__`] = {
  get(scope) {
    const moduleMap = {
      './say'() {
        return () => {
          return new Promise((resolve) => {
            const remoteId = '@circulate-deps/app1/say';
            const federationInstance =
              globalThis.__FEDERATION__.__INSTANCES__[1];
            federationInstance.loadRemote(remoteId).then((m) => {
              m();
              resolve('@circulate-deps/app2');
            });
          });
        };
      },
    };
    return moduleMap[scope];
  },
  init() {
    const ins = new globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__({
      name: '@circulate-deps/app2',
      version: '0.0.1',
      remotes: [
        {
          name: '@circulate-deps/app1',
          entry:
            'http://localhost:1111/resources/load-remote/circulate-dep-app1/federation-manifest.json',
        },
      ],
    });
    globalThis.__FEDERATION__.__INSTANCES__.push(ins);
  },
};
