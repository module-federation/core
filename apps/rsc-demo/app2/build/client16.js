'use strict';
(self['webpackChunkapp2'] = self['webpackChunkapp2'] || []).push([
  ['client16', '__federation_expose_DemoCounterButton'],
  {
    /***/ '(client)/./src/DemoCounterButton.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ DemoCounterButton,
        /* harmony export */
      });
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/webpack/sharing/consume/client/react/react',
        );
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var _server_actions__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__('(client)/./src/server-actions.js');
      /* harmony import */ var _test_default_action__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__('(client)/./src/test-default-action.js');
      /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__(
          '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
        );
      ('use client');

      // This import is transformed by the server-action-client-loader
      // into a createServerReference call at build time

      // Test default export action (for P1 bug regression test)

      function DemoCounterButton({ initialCount }) {
        const [count, setCount] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(initialCount);
        const [loading, setLoading] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
        async function increment() {
          setLoading(true);
          try {
            // incrementCount is now a server reference that calls the server action
            const result = await (0,
            _server_actions__WEBPACK_IMPORTED_MODULE_1__.incrementCount)();
            if (typeof result === 'number') {
              setCount(result);
            } else {
              setCount((c) => c + 1);
            }
          } catch (error) {
            console.error('Server action failed:', error);
          } finally {
            setLoading(false);
          }
        }
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)('div', {
          children: [
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)('p', {
              children: ['Client view of count: ', count],
            }),
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)('button', {
              onClick: increment,
              disabled: loading,
              'data-loading': loading ? 'true' : 'false',
              'aria-busy': loading,
              'data-testid': 'demo-counter-button',
              children: loading ? 'Updating…' : 'Increment on server',
            }),
          ],
        });
      }

      /***/
    },

    /***/ '(client)/./src/test-default-action.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony import */ var _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/../../../packages/react-server-dom-webpack/client.browser.js',
        );
      // RSC Client Loader: 'use server' module transformed to server references

      const callServer =
        globalThis.__RSC_CALL_SERVER__ ||
        ((id, args) => {
          throw new Error(
            'callServer not initialized. Set globalThis.__RSC_CALL_SERVER__',
          );
        });
      const _default = (0,
      _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_0__.createServerReference)(
        'file:///Users/bytedance/dev/core/apps/rsc-demo/app2/src/test-default-action.js#default',
        callServer,
      );
      /* harmony default export */ __webpack_exports__['default'] = _default;

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
//# sourceMappingURL=client16.js.map
