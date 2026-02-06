'use strict';
(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client15'],
  {
    /***/ '(client)/./src/FederatedActionDemo.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ FederatedActionDemo,
        /* harmony export */
      });
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/webpack/sharing/consume/client/react/react',
        );
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var app2_server_actions__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__('webpack/container/remote/app2/server-actions');
      /* harmony import */ var app2_server_actions__WEBPACK_IMPORTED_MODULE_1___default =
        /*#__PURE__*/ __webpack_require__.n(
          app2_server_actions__WEBPACK_IMPORTED_MODULE_1__,
        );
      /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(
          '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
        );
      ('use client');

      /**
       * FederatedActionDemo - Client component demonstrating cross-app server actions
       *
       * Default behavior (Option 2 - MF-native, in-process):
       * 1. Imports action reference from app2 via Module Federation
       * 2. Calls the action through app1's server (host)
       * 3. app1 resolves the action from the shared serverActionRegistry (registered
       *    when app2's server-actions module is loaded via MF)
       * 4. The action executes in app1's process (no HTTP hop to app2)
       *
       * Fallback (Option 1 - HTTP forwarding):
       * If app1 can't resolve the action locally, it forwards to app2's /react and
       * proxies the response back.
       */

      function FederatedActionDemo() {
        const [count, setCount] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
        const [isPending, startTransition] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useTransition)();
        const [error, setError] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
        const handleClick = async () => {
          startTransition(async () => {
            try {
              // Call the federated action
              // The action reference from app2 will have an action ID that includes 'app2'
              // app1's server will resolve this via MF-native registry (fallback: HTTP forward)
              const result = await (0,
              app2_server_actions__WEBPACK_IMPORTED_MODULE_1__.incrementCount)();
              setCount(result);
              setError(null);
            } catch (err) {
              console.error('Federated action failed:', err);
              setError(err.message || 'Action failed');
            }
          });
        };
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)('div', {
          style: {
            marginTop: '16px',
            padding: '12px',
            border: '2px solid #10b981',
            borderRadius: '8px',
            backgroundColor: '#ecfdf5',
          },
          'data-testid': 'federated-action-demo',
          children: [
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('h3', {
              style: {
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#059669',
              },
              children: 'Federated Action Demo (MF-native by default)',
            }),
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('p', {
              style: {
                margin: '0 0 8px 0',
                fontSize: '12px',
                color: '#6b7280',
              },
              children:
                "Calls app2's incrementCount action through app1 (in-process; HTTP fallback)",
            }),
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              },
              children: [
                /*#__PURE__*/ (0,
                react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('button', {
                  onClick: handleClick,
                  disabled: isPending,
                  style: {
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: isPending ? '#9ca3af' : '#10b981',
                    color: 'white',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                  },
                  'data-testid': 'federated-action-button',
                  children: isPending ? 'Calling...' : 'Call Remote Action',
                }),
                /*#__PURE__*/ (0,
                react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)('span', {
                  style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#059669',
                  },
                  children: [
                    'Count: ',
                    /*#__PURE__*/ (0,
                    react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(
                      'span',
                      {
                        'data-testid': 'federated-action-count',
                        children: count,
                      },
                    ),
                  ],
                }),
              ],
            }),
            error &&
              /*#__PURE__*/ (0,
              react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)('p', {
                style: {
                  margin: '8px 0 0 0',
                  fontSize: '12px',
                  color: '#dc2626',
                },
                children: ['Error: ', error],
              }),
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('p', {
              style: {
                marginTop: '8px',
                fontSize: '11px',
                color: '#9ca3af',
              },
              children:
                'Action flows: Client \u2192 app1 server \u2192 MF-native execute (fallback: HTTP forward)',
            }),
          ],
        });
      }

      /***/
    },
  },
]);
//# sourceMappingURL=client15.js.map
