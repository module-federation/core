'use strict';
(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client13'],
  {
    /***/ '(client)/../shared/src/SidebarNoteContent.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ SidebarNoteContent,
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

      function SidebarNoteContent({ id, title, children, expandedChildren }) {
        const { location, navigate } = (0,
        _rsc_demo_framework_router__WEBPACK_IMPORTED_MODULE_1__.useRouter)();
        const [isPending, startTransition] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useTransition)();
        const [isExpanded, setIsExpanded] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
        const isActive = id === location.selectedId;

        // Animate after title is edited.
        const itemRef = (0, react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
        const prevTitleRef = (0, react__WEBPACK_IMPORTED_MODULE_0__.useRef)(
          title,
        );
        (0, react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
          if (title !== prevTitleRef.current) {
            prevTitleRef.current = title;
            itemRef.current.classList.add('flash');
          }
        }, [title]);
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)('div', {
          ref: itemRef,
          onAnimationEnd: () => {
            itemRef.current.classList.remove('flash');
          },
          className: [
            'sidebar-note-list-item',
            isExpanded ? 'note-expanded' : '',
          ].join(' '),
          children: [
            children,
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('button', {
              className: 'sidebar-note-open',
              style: {
                backgroundColor: isPending
                  ? 'var(--gray-80)'
                  : isActive
                    ? 'var(--tertiary-blue)'
                    : '',
                border: isActive
                  ? '1px solid var(--primary-border)'
                  : '1px solid transparent',
              },
              onClick: () => {
                startTransition(() => {
                  navigate({
                    selectedId: id,
                    isEditing: false,
                  });
                });
              },
              children: 'Open note for preview',
            }),
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('button', {
              className: 'sidebar-note-toggle-expand',
              onClick: (e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              },
              children: isExpanded
                ? /*#__PURE__*/ (0,
                  react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('img', {
                    src: 'chevron-down.svg',
                    width: '10px',
                    height: '10px',
                    alt: 'Collapse',
                  })
                : /*#__PURE__*/ (0,
                  react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('img', {
                    src: 'chevron-up.svg',
                    width: '10px',
                    height: '10px',
                    alt: 'Expand',
                  }),
            }),
            isExpanded && expandedChildren,
          ],
        });
      }

      /***/
    },
  },
]);
//# sourceMappingURL=client13.js.map
