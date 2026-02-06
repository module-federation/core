'use strict';
(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client11'],
  {
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
  },
]);
//# sourceMappingURL=client11.js.map
