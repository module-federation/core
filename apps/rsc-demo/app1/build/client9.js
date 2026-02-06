'use strict';
(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client9'],
  {
    /***/ '(client)/../shared/src/EditButton.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ EditButton,
        /* harmony export */
      });
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/webpack/sharing/consume/client/react/react',
        );
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var _rsc_demo_framework_router__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__('(client)/../framework/framework/router.js');
      /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(
          '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
        );
      /**
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       */

      ('use client');

      function EditButton({ noteId, children }) {
        const [isPending, startTransition] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useTransition)();
        const { navigate } = (0,
        _rsc_demo_framework_router__WEBPACK_IMPORTED_MODULE_1__.useRouter)();
        const isDraft = noteId == null;
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('button', {
          className: [
            'edit-button',
            isDraft ? 'edit-button--solid' : 'edit-button--outline',
          ].join(' '),
          disabled: isPending,
          onClick: () => {
            startTransition(() => {
              navigate({
                selectedId: noteId,
                isEditing: true,
              });
            });
          },
          role: 'menuitem',
          children: children,
        });
      }

      /***/
    },
  },
]);
//# sourceMappingURL=client9.js.map
