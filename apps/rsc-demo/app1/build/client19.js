'use strict';
(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client19'],
  {
    /***/ '(client)/./src/SharedCounterButton.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ SharedCounterButton,
        /* harmony export */
      });
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/webpack/sharing/consume/client/react/react',
        );
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var _rsc_demo_shared__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(
          '(client)/webpack/sharing/consume/client/@rsc-demo/shared/@rsc-demo/shared',
        );
      /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(
          '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
        );
      ('use client');

      function SharedCounterButton({ initialCount }) {
        const [count, setCount] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(initialCount);
        const [loading, setLoading] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
        async function handleIncrement() {
          setLoading(true);
          try {
            const result =
              await _rsc_demo_shared__WEBPACK_IMPORTED_MODULE_1__.sharedServerActions.incrementSharedCounter();
            if (typeof result === 'number') {
              setCount(result);
            } else {
              setCount((c) => c + 1);
            }
          } catch (error) {
            console.error('Shared server action failed:', error);
          } finally {
            setLoading(false);
          }
        }
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)('div', {
          children: [
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)('p', {
              children: ['Client view of shared count: ', count],
            }),
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('button', {
              onClick: handleIncrement,
              disabled: loading,
              children: loading ? 'Updating…' : 'Increment shared counter',
            }),
          ],
        });
      }

      /***/
    },
  },
]);
//# sourceMappingURL=client19.js.map
