'use strict';
exports.id = '__federation_expose_server_actions';
exports.ids = ['__federation_expose_server_actions'];
exports.modules = {
  /***/ './src/server-actions.js': /***/ (
    __unused_webpack_module,
    __webpack_exports__,
    __webpack_require__,
  ) => {
    __webpack_require__.r(__webpack_exports__);
    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
      /* harmony export */ getCount: () => /* binding */ getCount,
      /* harmony export */ incrementCount: () => /* binding */ incrementCount,
      /* harmony export */
    });
    ('use server');

    let actionCount = 0;
    async function incrementCount() {
      // Small delay ensures client-side loading state is observable in tests
      await new Promise((resolve) => setTimeout(resolve, 150));
      actionCount += 1;
      return actionCount;
    }
    async function getCount() {
      return actionCount;
    }

    /***/
  },
};
//# sourceMappingURL=__federation_expose_server_actions.js.map
