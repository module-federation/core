'use strict';
(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client17'],
  {
    /***/ '(client)/./src/InlineActionButton.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ InlineActionButton,
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

      function InlineActionButton({
        addMessage,
        clearMessages,
        getMessageCount,
      }) {
        const [message, setMessage] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
        const [count, setCount] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
        const [loading, setLoading] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
        const [lastResult, setLastResult] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(
          'Last action result: 0 message',
        );
        async function handleAdd(e) {
          e.preventDefault();
          if (!message.trim()) return;
          setLoading(true);
          try {
            // Give the UI a moment to show the loading label
            await new Promise((r) => setTimeout(r, 50));
            const newCount = await addMessage(message);
            const value =
              typeof newCount === 'number' ? newCount : (count ?? 0) + 1;
            setCount(value);
            setLastResult(`Last action result: ${value} message`);
            setMessage('');
          } catch (error) {
            console.error('Failed to add message:', error);
          } finally {
            setLoading(false);
          }
        }
        async function handleClear() {
          setLoading(true);
          try {
            const newCount = await clearMessages();
            const value = typeof newCount === 'number' ? newCount : 0;
            setCount(value);
            setLastResult(`Last action result: ${value} message`);
          } catch (error) {
            console.error('Failed to clear messages:', error);
          } finally {
            setLoading(false);
          }
        }
        async function handleGetCount() {
          setLoading(true);
          try {
            const currentCount = await getMessageCount();
            const value =
              typeof currentCount === 'number' ? currentCount : (count ?? 0);
            setCount(value);
            setLastResult(`Last action result: ${value} message`);
          } catch (error) {
            console.error('Failed to get count:', error);
          } finally {
            setLoading(false);
          }
        }
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)('div', {
          style: {
            marginTop: 12,
          },
          children: [
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)('form', {
              onSubmit: handleAdd,
              style: {
                display: 'flex',
                gap: 8,
                marginBottom: 8,
              },
              children: [
                /*#__PURE__*/ (0,
                react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)('input', {
                  type: 'text',
                  value: message,
                  onChange: (e) => setMessage(e.target.value),
                  placeholder: 'Enter a message',
                  disabled: loading,
                  style: {
                    flex: 1,
                    padding: 8,
                  },
                }),
                /*#__PURE__*/ (0,
                react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)('button', {
                  type: 'submit',
                  disabled: loading || !message.trim(),
                  children: loading ? 'Adding...' : 'Add Message',
                }),
              ],
            }),
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)('div', {
              style: {
                display: 'flex',
                gap: 8,
              },
              children: [
                /*#__PURE__*/ (0,
                react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)('button', {
                  onClick: handleClear,
                  disabled: loading,
                  children: loading ? 'Clearing...' : 'Clear All',
                }),
                /*#__PURE__*/ (0,
                react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)('button', {
                  onClick: handleGetCount,
                  disabled: loading,
                  children: loading ? 'Loading...' : 'Get Count',
                }),
              ],
            }),
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)('p', {
              style: {
                marginTop: 8,
                color: '#666',
              },
              children: lastResult,
            }),
          ],
        });
      }

      /***/
    },
  },
]);
//# sourceMappingURL=client17.js.map
