'use strict';
(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client18'],
  {
    /***/ '(client)/./src/RemoteButton.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ RemoteButton,
        /* harmony export */
      });
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/webpack/sharing/consume/client/react/react',
        );
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(
          '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
        );
      ('use client');

      /**
       * Wrapper component that renders the remote Button from app2.
       * This demonstrates Module Federation cross-app component sharing.
       *
       * This demo expects the remote to be available. If the federated module fails to
       * load, we throw to surface the error rather than silently rendering a fallback.
       */

      function RemoteButton() {
        const [RemoteButtonImpl, setRemoteButtonImpl] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
        const [clickCount, setClickCount] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
        (0, react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
          let cancelled = false;
          __webpack_require__
            .e(/* import() */ 'webpack_container_remote_app2_Button')
            .then(
              __webpack_require__.t.bind(
                __webpack_require__,
                'webpack/container/remote/app2/Button',
                23,
              ),
            )
            .then((mod) => {
              if (cancelled) return;
              const Component = mod?.default || mod;
              setRemoteButtonImpl(() => Component);
            });
          return () => {
            cancelled = true;
          };
        }, []);
        const handleClick = () => {
          setClickCount((c) => c + 1);
        };
        if (!RemoteButtonImpl) {
          return /*#__PURE__*/ (0,
          react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)('div', {
            style: {
              marginTop: '16px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
            },
            children: [
              /*#__PURE__*/ (0,
              react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)('h3', {
                style: {
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                },
                children: 'Federated Button from App2',
              }),
              /*#__PURE__*/ (0,
              react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)('button', {
                style: {
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  fontWeight: 'bold',
                  backgroundColor: '#e5e7eb',
                  color: '#6b7280',
                },
                disabled: true,
                children: 'Loading remote button\u2026',
              }),
            ],
          });
        }
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)('div', {
          style: {
            marginTop: '16px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
          },
          children: [
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)('h3', {
              style: {
                margin: '0 0 12px 0',
                fontSize: '14px',
              },
              children: 'Federated Button from App2',
            }),
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(
              RemoteButtonImpl,
              {
                variant: 'primary',
                onClick: handleClick,
                'data-testid': 'federated-button',
                children: ['Remote Click: ', clickCount],
              },
            ),
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)('p', {
              style: {
                marginTop: '8px',
                fontSize: '12px',
                color: '#666',
              },
              children: 'This button is loaded from app2 via Module Federation',
            }),
          ],
        });
      }

      /***/
    },
  },
]);
//# sourceMappingURL=client18.js.map
