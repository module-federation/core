globalThis['__FEDERATION_shared-version-selection-1_0__'] = {
  get() {
    return () => ({
      version: '1.0.0',
      render: () => 'rendered with the 1.0.0 shared implementation',
    });
  },
  init(shareScope) {
    const instance = new globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__({
      name: '@shared-version-selection/remote-1-0',
      version: '0.0.1',
      shared: {
        'shared-version-selection': {
          version: '1.0.0',
          scope: 'default',
          strategy: 'version-first',
          get: () => () => ({
            version: '1.0.0',
            render: () => 'rendered with the 1.0.0 shared implementation',
          }),
        },
      },
    });

    globalThis.__FEDERATION__.__INSTANCES__.push(instance);
    instance.initShareScopeMap('default', shareScope);

    return Promise.all(instance.initializeSharing());
  },
};
