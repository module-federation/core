'use strict';
(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client14'],
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

    /***/ '(client)/./src/server-actions.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ getCount: () => /* binding */ getCount,
        /* harmony export */ incrementCount: () => /* binding */ incrementCount,
        /* harmony export */
      });
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
      const incrementCount = (0,
      _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_0__.createServerReference)(
        'file:///Users/bytedance/dev/core/apps/rsc-demo/app1/src/server-actions.js#incrementCount',
        callServer,
      );
      const getCount = (0,
      _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_0__.createServerReference)(
        'file:///Users/bytedance/dev/core/apps/rsc-demo/app1/src/server-actions.js#getCount',
        callServer,
      );

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
        'file:///Users/bytedance/dev/core/apps/rsc-demo/app1/src/test-default-action.js#default',
        callServer,
      );
      /* harmony default export */ __webpack_exports__['default'] = _default;

      /***/
    },
  },
]);
//# sourceMappingURL=client14.js.map
