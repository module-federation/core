(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client6'],
  {
    /***/ '(client)/../shared/dist/SidebarNoteContent.js': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      'use client';
      'use strict';

      var __nested_webpack_require_33__ = {};
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
        default: () => SidebarNoteContent,
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
      ('use client');
      function SidebarNoteContent({ id, title, children, expandedChildren }) {
        const { location, navigate } = (0, router_namespaceObject.useRouter)();
        const [isPending, startTransition] = (0,
        external_react_namespaceObject.useTransition)();
        const [isExpanded, setIsExpanded] = (0,
        external_react_namespaceObject.useState)(false);
        const isActive = id === location.selectedId;
        const itemRef = (0, external_react_namespaceObject.useRef)(null);
        const prevTitleRef = (0, external_react_namespaceObject.useRef)(title);
        (0, external_react_namespaceObject.useEffect)(() => {
          if (title !== prevTitleRef.current) {
            prevTitleRef.current = title;
            itemRef.current.classList.add('flash');
          }
        }, [title]);
        return /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsxs)('div', {
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
            /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('button', {
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
            /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('button', {
              className: 'sidebar-note-toggle-expand',
              onClick: (e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              },
              children: isExpanded
                ? /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('img', {
                    src: 'chevron-down.svg',
                    width: '10px',
                    height: '10px',
                    alt: 'Collapse',
                  })
                : /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('img', {
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
//# sourceMappingURL=client6.js.map
