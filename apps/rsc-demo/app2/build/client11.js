'use strict';
(self['webpackChunkapp2'] = self['webpackChunkapp2'] || []).push([
  ['client11', 'client1'],
  {
    /***/ '(client)/../framework/framework/router.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Router: () => /* binding */ Router,
        /* harmony export */ callServer: () => /* binding */ callServer,
        /* harmony export */ initFromSSR: () => /* binding */ initFromSSR,
        /* harmony export */ useMutation: () => /* binding */ useMutation,
        /* harmony export */ useRouter: () => /* binding */ useRouter,
        /* harmony export */
      });
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/webpack/sharing/consume/client/react/react',
        );
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(
          '(client)/../../../packages/react-server-dom-webpack/client.browser.js',
        );
      /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(
          '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
        );
      /**
       * Shared router implementation for the RSC notes apps.
       *
       * This is imported directly by both app1 and app2 so that navigation,
       * callServer, and SSR integration stay in sync.
       */

      ('use client');

      // RSC Action header (must match server)

      const RSC_ACTION_HEADER = 'rsc-action';
      async function callServer(actionId, args) {
        const body = await (0,
        _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_1__.encodeReply)(
          args,
        );
        const response = await fetch('/react', {
          method: 'POST',
          headers: {
            Accept: 'text/x-component',
            [RSC_ACTION_HEADER]: actionId,
          },
          body,
        });
        if (!response.ok) {
          throw new Error(`Server action failed: ${await response.text()}`);
        }
        const resultHeader = response.headers.get('X-Action-Result');
        const actionResult = resultHeader
          ? JSON.parse(resultHeader)
          : undefined;
        return actionResult;
      }
      const RouterContext = /*#__PURE__*/ (0,
      react__WEBPACK_IMPORTED_MODULE_0__.createContext)();
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
        const content = (0,
        _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_1__.createFromReadableStream)(
          stream,
        );
        initialCache.set(locationKey, content);
      }
      function Router() {
        const [cache, setCache] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(initialCache);
        const [location, setLocation] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)({
          selectedId: null,
          isEditing: false,
          searchText: '',
        });
        const locationKey = JSON.stringify(location);
        let content = cache.get(locationKey);
        if (!content) {
          content = (0,
          _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_1__.createFromFetch)(
            fetch('/react?location=' + encodeURIComponent(locationKey)),
          );
          cache.set(locationKey, content);
        }
        function refresh(response) {
          (0, react__WEBPACK_IMPORTED_MODULE_0__.startTransition)(() => {
            const nextCache = new Map();
            if (response != null) {
              const locationKey = response.headers.get('X-Location');
              const nextLocation = JSON.parse(locationKey);
              const nextContent = (0,
              _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_1__.createFromReadableStream)(
                response.body,
              );
              nextCache.set(locationKey, nextContent);
              navigate(nextLocation);
            }
            setCache(nextCache);
          });
        }
        function navigate(nextLocation) {
          (0, react__WEBPACK_IMPORTED_MODULE_0__.startTransition)(() => {
            setLocation((loc) => ({
              ...loc,
              ...nextLocation,
            }));
          });
        }
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(
          RouterContext.Provider,
          {
            value: {
              location,
              navigate,
              refresh,
            },
            children: (0, react__WEBPACK_IMPORTED_MODULE_0__.use)(content),
          },
        );
      }
      function useRouter() {
        const context = (0, react__WEBPACK_IMPORTED_MODULE_0__.useContext)(
          RouterContext,
        );
        if (!context) {
          return {
            location: {
              selectedId: null,
              isEditing: false,
              searchText: '',
            },
            navigate: () => {},
            refresh: () => {},
          };
        }
        return context;
      }
      function useMutation({ endpoint, method }) {
        const { refresh } = useRouter();
        const [isSaving, setIsSaving] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
        const [didError, setDidError] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
        const [error, setError] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
        if (didError) {
          throw error;
        }
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
            if (!response.ok) {
              throw new Error(await response.text());
            }
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

      /***/
    },

    /***/ '(client)/../shared/src/SearchField.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      // ESM COMPAT FLAG
      __webpack_require__.r(__webpack_exports__);

      // EXPORTS
      __webpack_require__.d(__webpack_exports__, {
        default: () => /* binding */ SearchField,
      });

      // EXTERNAL MODULE: consume shared module (client) react@* (singleton) (fallback: ../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/index.js) (client)
      var index_js_client_ = __webpack_require__(
        '(client)/webpack/sharing/consume/client/react/react',
      );
      // EXTERNAL MODULE: ../framework/framework/router.js
      var router = __webpack_require__(
        '(client)/../framework/framework/router.js',
      );
      // EXTERNAL MODULE: ../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js
      var jsx_runtime = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
      ); // CONCATENATED MODULE: ../shared/src/Spinner.js
      /**
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       */

      function Spinner({ active = true }) {
        return /*#__PURE__*/ (0, jsx_runtime.jsx)('div', {
          className: ['spinner', active && 'spinner--active'].join(' '),
          role: 'progressbar',
          'aria-busy': active ? 'true' : 'false',
        });
      } // CONCATENATED MODULE: ../shared/src/SearchField.js
      /**
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       */

      ('use client');

      function SearchField() {
        const [text, setText] = (0, index_js_client_.useState)('');
        const [isSearching, startSearching] = (0,
        index_js_client_.useTransition)();
        const { navigate } = (0, router.useRouter)();
        return /*#__PURE__*/ (0, jsx_runtime.jsxs)('form', {
          className: 'search',
          role: 'search',
          onSubmit: (e) => e.preventDefault(),
          children: [
            /*#__PURE__*/ (0, jsx_runtime.jsx)('label', {
              className: 'offscreen',
              htmlFor: 'sidebar-search-input',
              children: 'Search for a note by title',
            }),
            /*#__PURE__*/ (0, jsx_runtime.jsx)('input', {
              id: 'sidebar-search-input',
              placeholder: 'Search',
              value: text,
              onChange: (e) => {
                const newText = e.target.value;
                setText(newText);
                startSearching(() => {
                  navigate({
                    searchText: newText,
                  });
                });
              },
            }),
            /*#__PURE__*/ (0, jsx_runtime.jsx)(Spinner, {
              active: isSearching,
            }),
          ],
        });
      }

      /***/
    },

    /***/ '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/cjs/react-jsx-runtime.production.js':
      /***/ (__unused_webpack_module, exports) => {
        /**
         * @license React
         * react-jsx-runtime.production.js
         *
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element'),
          REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
        function jsxProd(type, config, maybeKey) {
          var key = null;
          void 0 !== maybeKey && (key = '' + maybeKey);
          void 0 !== config.key && (key = '' + config.key);
          if ('key' in config) {
            maybeKey = {};
            for (var propName in config)
              'key' !== propName && (maybeKey[propName] = config[propName]);
          } else maybeKey = config;
          config = maybeKey.ref;
          return {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            ref: void 0 !== config ? config : null,
            props: maybeKey,
          };
        }
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.jsx = jsxProd;
        exports.jsxs = jsxProd;

        /***/
      },

    /***/ '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js':
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        if (true) {
          module.exports = __webpack_require__(
            '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/cjs/react-jsx-runtime.production.js',
          );
        } else {
        }

        /***/
      },
  },
]);
//# sourceMappingURL=client11.js.map
