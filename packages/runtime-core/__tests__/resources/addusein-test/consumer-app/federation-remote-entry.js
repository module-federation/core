// Consumer App Federation Remote Entry
// This app primarily consumes shared modules from other apps

(function () {
  // Mock React for internal use (lower version to test version resolution)
  const mockReactConsumer = {
    useState: (initial) => [initial, () => {}],
    useEffect: () => {},
    createElement: (type, props, ...children) => ({ type, props, children }),
    version: '17.0.2', // Lower version to test version-first strategy
  };

  globalThis[`__FEDERATION_${'consumer-app:1.5.0'}__`] = {
    get(scope) {
      const moduleMap = {
        './Dashboard'() {
          return () => ({
            default: function Dashboard(props) {
              return {
                type: 'div',
                props: { className: 'dashboard' },
                children: ['Consumer Dashboard'],
              };
            },
          });
        },
        './Analytics'() {
          return () => ({
            default: {
              track: (event) => console.log('Consumer tracked:', event),
              version: '1.5.0',
            },
          });
        },
      };
      return moduleMap[scope];
    },
    init(shareScope) {
      // Initialize consumer app - primarily consumes, provides minimal shared
      const ins = new globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__({
        name: 'consumer-app',
        shared: {
          react: {
            version: '17.0.2', // Older version to test resolution
            scope: 'default',
            strategy: 'version-first',
            get: () => () => mockReactConsumer,
          },
          'consumer-analytics': {
            version: '1.5.0',
            scope: 'default',
            strategy: 'loaded-first',
            get: () => () => ({
              trackEvent: (name, data) => ({
                event: name,
                data,
                app: 'consumer-app',
              }),
              version: '1.5.0',
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
