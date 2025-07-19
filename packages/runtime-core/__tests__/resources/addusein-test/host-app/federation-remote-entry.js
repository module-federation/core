// Host App Federation Remote Entry
// This app provides shared React and consumes shared modules from others

(function () {
  // Mock React module for testing
  const mockReactHost = {
    useState: (initial) => [initial, () => {}],
    useEffect: () => {},
    createElement: (type, props, ...children) => ({ type, props, children }),
    version: '18.0.0',
  };

  globalThis[`__FEDERATION_${'host-app:1.0.0'}__`] = {
    get(scope) {
      const moduleMap = {
        './Button'() {
          return () => ({
            default: function Button(props) {
              return mockReactHost.createElement(
                'button',
                props,
                'Host Button',
              );
            },
          });
        },
        './Utils'() {
          return () => ({
            default: {
              formatText: (text) => `Host: ${text}`,
              version: '1.0.0',
            },
          });
        },
      };
      return moduleMap[scope];
    },
    init(shareScope) {
      // Initialize host app with shared dependencies
      const ins = new globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__({
        name: 'host-app',
        shared: {
          react: {
            version: '18.0.0',
            scope: 'default',
            strategy: 'version-first',
            get: () => () => mockReactHost,
          },
          'host-utils': {
            version: '1.0.0',
            scope: 'default',
            strategy: 'version-first',
            get: () => () => ({
              formatText: (text) => `Host Utils: ${text}`,
              timestamp: Date.now(),
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
