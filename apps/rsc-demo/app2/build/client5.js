(self['webpackChunkapp2'] = self['webpackChunkapp2'] || []).push([
  ['client5'],
  {
    /***/ '(client)/../shared/dist/SharedClientWidget.js': /***/ (
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
        default: () => SharedClientWidget,
      });
      const jsx_runtime_namespaceObject = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
      );
      __webpack_require__(
        '(client)/webpack/sharing/consume/client/react/react',
      );
      function SharedClientWidget({ label = 'shared' }) {
        return /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsxs)('span', {
          'data-testid': 'shared-client-widget',
          children: ['Shared: ', label],
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

    /***/ '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/cjs/react-jsx-runtime.production.js':
      /***/ (__unused_webpack_module, exports) => {
        'use strict';
        /**
         * @license React
         * react-jsx-runtime.production.js
         *
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element'),
          REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
        function jsxProd(type, config, maybeKey) {
          var key = null;
          void 0 !== maybeKey && (key = '' + maybeKey);
          void 0 !== config.key && (key = '' + config.key);
          if ('key' in config) {
            maybeKey = {};
            for (var propName in config)
              'key' !== propName && (maybeKey[propName] = config[propName]);
          } else maybeKey = config;
          config = maybeKey.ref;
          return {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            ref: void 0 !== config ? config : null,
            props: maybeKey,
          };
        }
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.jsx = jsxProd;
        exports.jsxs = jsxProd;

        /***/
      },

    /***/ '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js':
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';

        if (true) {
          module.exports = __webpack_require__(
            '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/cjs/react-jsx-runtime.production.js',
          );
        } else {
        }

        /***/
      },
  },
]);
//# sourceMappingURL=client5.js.map
