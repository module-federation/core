'use strict';
exports.id = '__federation_expose_HostBadge';
exports.ids = ['__federation_expose_HostBadge'];
exports.modules = {
  /***/ './src/HostBadge.js': /***/ (
    __unused_webpack_module,
    __webpack_exports__,
    __webpack_require__,
  ) => {
    __webpack_require__.r(__webpack_exports__);
    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
      /* harmony export */ default: () => /* binding */ HostBadge,
      /* harmony export */
    });
    /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
      __webpack_require__(
        '../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/react.react-server.js',
      );
    /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ =
      __webpack_require__(
        '../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.react-server.js',
      );
    ('use client');

    function HostBadge() {
      return /*#__PURE__*/ (0,
      react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)('div', {
        'data-testid': 'app1-host-badge',
        style: {
          marginTop: 8,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 999,
          border: '1px solid #93c5fd',
          background: '#eff6ff',
          color: '#1e40af',
          fontSize: 12,
          fontWeight: 600,
        },
        children: 'App1 HostBadge (federated)',
      });
    }

    /***/
  },

  /***/ '../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/cjs/react-jsx-runtime.react-server.production.js':
    /***/ (__unused_webpack_module, exports, __webpack_require__) => {
      var __webpack_unused_export__;
      /**
       * @license React
       * react-jsx-runtime.react-server.production.js
       *
       * Copyright (c) Meta Platforms, Inc. and affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       */

      var React = __webpack_require__(
          '../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/react.react-server.js',
        ),
        REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element'),
        REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
      if (
        !React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE
      )
        throw Error(
          'The "react" package in this environment is not configured correctly. The "react-server" condition must be enabled in any environment that runs React Server Components.',
        );
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
      __webpack_unused_export__ = REACT_FRAGMENT_TYPE;
      exports.jsx = jsxProd;
      __webpack_unused_export__ = void 0;
      __webpack_unused_export__ = jsxProd;

      /***/
    },

  /***/ '../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.react-server.js':
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      if (true) {
        module.exports = __webpack_require__(
          '../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/cjs/react-jsx-runtime.react-server.production.js',
        );
      } else {
      }

      /***/
    },
};
//# sourceMappingURL=__federation_expose_HostBadge.js.map
