// Provider App Federation Remote Entry
// This app provides shared React, Lodash, and custom utilities

(function () {
  // Mock React module for testing
  const mockReactProvider = {
    useState: (initial) => [initial, () => {}],
    useEffect: () => {},
    createElement: (type, props, ...children) => ({ type, props, children }),
    version: '18.0.0',
  };

  // Mock Lodash module for testing
  const mockLodash = {
    debounce: (fn, delay) => fn,
    throttle: (fn, delay) => fn,
    cloneDeep: (obj) => JSON.parse(JSON.stringify(obj)),
    version: '4.17.21',
  };

  globalThis[`__FEDERATION_${'provider-app:2.0.0'}__`] = {
    get(scope) {
      const moduleMap = {
        './DataService'() {
          return () => ({
            default: {
              fetchData: async () => ({
                provider: 'data',
                timestamp: Date.now(),
              }),
              version: '2.0.0',
            },
          });
        },
        './Modal'() {
          return () => ({
            default: function Modal(props) {
              return mockReactProvider.createElement(
                'div',
                { className: 'modal' },
                'Provider Modal',
              );
            },
          });
        },
      };
      return moduleMap[scope];
    },
    init(shareScope) {
      // Initialize provider app with multiple shared dependencies
      const ins = new globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__({
        name: 'provider-app',
        shared: {
          react: {
            version: '18.0.0',
            scope: 'default',
            strategy: 'version-first',
            get: () => () => mockReactProvider,
          },
          lodash: {
            version: '4.17.21',
            scope: 'default',
            strategy: 'version-first',
            get: () => () => mockLodash,
          },
          'provider-utils': {
            version: '2.0.0',
            scope: 'default',
            strategy: 'loaded-first',
            get: () => () => ({
              validate: (data) => Boolean(data),
              transform: (data) => ({ ...data, providerId: 'provider-app' }),
              version: '2.0.0',
            }),
          },
        },
      });

      globalThis.__FEDERATION__.__INSTANCES__.push(ins);
      ins.initShareScopeMap('default', shareScope);
      return ins.initializeSharing();
    },
  };
})();
