(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client2'],
  {
    /***/ '(client)/../shared/dist/EditButton.js': /***/ (
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
        default: () => EditButton,
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
      function EditButton({ noteId, children }) {
        const [isPending, startTransition] = (0,
        external_react_namespaceObject.useTransition)();
        const { navigate } = (0, router_namespaceObject.useRouter)();
        const isDraft = null == noteId;
        return /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('button', {
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
//# sourceMappingURL=client2.js.map
