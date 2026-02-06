(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client4'],
  {
    /***/ '(client)/../shared/dist/SearchField.js': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      'use client';
      'use strict';

      var __nested_webpack_require_33__ = {};
      (() => {
        __nested_webpack_require_33__.n = (module) => {
          var getter =
            module && module.__esModule
              ? () => module['default']
              : () => module;
          __nested_webpack_require_33__.d(getter, {
            a: getter,
          });
          return getter;
        };
      })();
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
        default: () => SearchField,
      });
      const jsx_runtime_namespaceObject = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
      );
      const external_react_namespaceObject = __webpack_require__(
        '(client)/webpack/sharing/consume/client/react/react',
      );
      const router_namespaceObject = __webpack_require__(
        '(client)/../framework/framework/router.js',
      );
      const external_Spinner_js_namespaceObject = __webpack_require__(
        '(client)/../shared/dist/Spinner.js',
      );
      var external_Spinner_js_default =
        /*#__PURE__*/ __nested_webpack_require_33__.n(
          external_Spinner_js_namespaceObject,
        );
      ('use client');
      function SearchField() {
        const [text, setText] = (0, external_react_namespaceObject.useState)(
          '',
        );
        const [isSearching, startSearching] = (0,
        external_react_namespaceObject.useTransition)();
        const { navigate } = (0, router_namespaceObject.useRouter)();
        return /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsxs)('form', {
          className: 'search',
          role: 'search',
          onSubmit: (e) => e.preventDefault(),
          children: [
            /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('label', {
              className: 'offscreen',
              htmlFor: 'sidebar-search-input',
              children: 'Search for a note by title',
            }),
            /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('input', {
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
            /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)(
              external_Spinner_js_default(),
              {
                active: isSearching,
              },
            ),
          ],
        });
      }
      exports['default'] = __webpack_exports__['default'];
      for (var __webpack_i__ in __webpack_exports__)
        if (-1 === ['default'].indexOf(__webpack_i__))
          exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
      Object.defineProperty(exports, '__esModule', {
        value: true,
      });

      /***/
    },

    /***/ '(client)/../shared/dist/Spinner.js': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      'use strict';

      var __nested_webpack_require_19__ = {};
      (() => {
        __nested_webpack_require_19__.d = (exports1, definition) => {
          for (var key in definition)
            if (
              __nested_webpack_require_19__.o(definition, key) &&
              !__nested_webpack_require_19__.o(exports1, key)
            )
              Object.defineProperty(exports1, key, {
                enumerable: true,
                get: definition[key],
              });
        };
      })();
      (() => {
        __nested_webpack_require_19__.o = (obj, prop) =>
          Object.prototype.hasOwnProperty.call(obj, prop);
      })();
      (() => {
        __nested_webpack_require_19__.r = (exports1) => {
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
      __nested_webpack_require_19__.r(__webpack_exports__);
      __nested_webpack_require_19__.d(__webpack_exports__, {
        default: () => Spinner,
      });
      const jsx_runtime_namespaceObject = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
      );
      function Spinner({ active = true }) {
        return /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('div', {
          className: ['spinner', active && 'spinner--active'].join(' '),
          role: 'progressbar',
          'aria-busy': active ? 'true' : 'false',
        });
      }
      exports['default'] = __webpack_exports__['default'];
      for (var __webpack_i__ in __webpack_exports__)
        if (-1 === ['default'].indexOf(__webpack_i__))
          exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
      Object.defineProperty(exports, '__esModule', {
        value: true,
      });

      /***/
    },
  },
]);
//# sourceMappingURL=client4.js.map
