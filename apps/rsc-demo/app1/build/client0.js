(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client0'],
  {
    /***/ '(client)/../framework/dist/router.js': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      'use client';
      'use strict';

      var __nested_webpack_require_33__ = {};
      (() => {
        __nested_webpack_require_33__.d = (exports1, definition) => {
          for (var key in definition)
            if (
              __nested_webpack_require_33__.o(definition, key) &&
              !__nested_webpack_require_33__.o(exports1, key)
            )
              Object.defineProperty(exports1, key, {
                enumerable: true,
                get: definition[key],
              });
        };
      })();
      (() => {
        __nested_webpack_require_33__.o = (obj, prop) =>
          Object.prototype.hasOwnProperty.call(obj, prop);
      })();
      (() => {
        __nested_webpack_require_33__.r = (exports1) => {
          if ('undefined' != typeof Symbol && Symbol.toStringTag)
            Object.defineProperty(exports1, Symbol.toStringTag, {
              value: 'Module',
            });
          Object.defineProperty(exports1, '__esModule', {
            value: true,
          });
        };
      })();
      var __webpack_exports__ = {};
      __nested_webpack_require_33__.r(__webpack_exports__);
      __nested_webpack_require_33__.d(__webpack_exports__, {
        Router: () => Router,
        useMutation: () => useMutation,
        callServer: () => callServer,
        useRouter: () => useRouter,
        initFromSSR: () => initFromSSR,
      });
      const jsx_runtime_namespaceObject = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
      );
      const external_react_namespaceObject = __webpack_require__(
        '(client)/webpack/sharing/consume/client/react/react',
      );
      const client_namespaceObject = __webpack_require__(
        '(client)/../../../packages/react-server-dom-webpack/client.browser.js',
      );
      ('use client');
      const RSC_ACTION_HEADER = 'rsc-action';
      async function callServer(actionId, args) {
        const body = await (0, client_namespaceObject.encodeReply)(args);
        const response = await fetch('/react', {
          method: 'POST',
          headers: {
            Accept: 'text/x-component',
            [RSC_ACTION_HEADER]: actionId,
          },
          body,
        });
        if (!response.ok)
          throw new Error(`Server action failed: ${await response.text()}`);
        const resultHeader = response.headers.get('X-Action-Result');
        const actionResult = resultHeader ? JSON.parse(resultHeader) : void 0;
        return actionResult;
      }
      const RouterContext = /*#__PURE__*/ (0,
      external_react_namespaceObject.createContext)();
      const initialCache = new Map();
      function initFromSSR(rscData) {
        const initialLocation = {
          selectedId: null,
          isEditing: false,
          searchText: '',
        };
        const locationKey = JSON.stringify(initialLocation);
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(rscData));
            controller.close();
          },
        });
        const content = (0, client_namespaceObject.createFromReadableStream)(
          stream,
        );
        initialCache.set(locationKey, content);
      }
      function Router() {
        const [cache, setCache] = (0, external_react_namespaceObject.useState)(
          initialCache,
        );
        const [location, setLocation] = (0,
        external_react_namespaceObject.useState)({
          selectedId: null,
          isEditing: false,
          searchText: '',
        });
        const locationKey = JSON.stringify(location);
        let content = cache.get(locationKey);
        if (!content) {
          content = (0, client_namespaceObject.createFromFetch)(
            fetch('/react?location=' + encodeURIComponent(locationKey)),
          );
          cache.set(locationKey, content);
        }
        function refresh(response) {
          (0, external_react_namespaceObject.startTransition)(() => {
            const nextCache = new Map();
            if (null != response) {
              const locationKey = response.headers.get('X-Location');
              const nextLocation = JSON.parse(locationKey);
              const nextContent = (0,
              client_namespaceObject.createFromReadableStream)(response.body);
              nextCache.set(locationKey, nextContent);
              navigate(nextLocation);
            }
            setCache(nextCache);
          });
        }
        function navigate(nextLocation) {
          (0, external_react_namespaceObject.startTransition)(() => {
            setLocation((loc) => ({
              ...loc,
              ...nextLocation,
            }));
          });
        }
        return /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)(
          RouterContext.Provider,
          {
            value: {
              location,
              navigate,
              refresh,
            },
            children: (0, external_react_namespaceObject.use)(content),
          },
        );
      }
      function useRouter() {
        const context = (0, external_react_namespaceObject.useContext)(
          RouterContext,
        );
        if (!context)
          return {
            location: {
              selectedId: null,
              isEditing: false,
              searchText: '',
            },
            navigate: () => {},
            refresh: () => {},
          };
        return context;
      }
      function useMutation({ endpoint, method }) {
        const { refresh } = useRouter();
        const [isSaving, setIsSaving] = (0,
        external_react_namespaceObject.useState)(false);
        const [didError, setDidError] = (0,
        external_react_namespaceObject.useState)(false);
        const [error, setError] = (0, external_react_namespaceObject.useState)(
          null,
        );
        if (didError) throw error;
        async function performMutation(payload, requestedLocation) {
          setIsSaving(true);
          try {
            const response = await fetch(
              `${endpoint}?location=${encodeURIComponent(JSON.stringify(requestedLocation))}`,
              {
                method,
                body: JSON.stringify(payload),
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            );
            if (!response.ok) throw new Error(await response.text());
            refresh(response);
          } catch (e) {
            setDidError(true);
            setError(e);
          } finally {
            setIsSaving(false);
          }
        }
        return [isSaving, performMutation];
      }
      exports.Router = __webpack_exports__.Router;
      exports.callServer = __webpack_exports__.callServer;
      exports.initFromSSR = __webpack_exports__.initFromSSR;
      exports.useMutation = __webpack_exports__.useMutation;
      exports.useRouter = __webpack_exports__.useRouter;
      for (var __webpack_i__ in __webpack_exports__)
        if (
          -1 ===
          [
            'Router',
            'callServer',
            'initFromSSR',
            'useMutation',
            'useRouter',
          ].indexOf(__webpack_i__)
        )
          exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
      Object.defineProperty(exports, '__esModule', {
        value: true,
      });

      /***/
    },
  },
]);
//# sourceMappingURL=client0.js.map
