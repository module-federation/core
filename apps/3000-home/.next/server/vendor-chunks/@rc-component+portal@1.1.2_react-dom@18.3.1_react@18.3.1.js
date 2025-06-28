"use strict";
exports.id = "vendor-chunks/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1";
exports.ids = ["vendor-chunks/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1"];
exports.modules = {

/***/ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/Context.js":
/*!******************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/Context.js ***!
  \******************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var OrderContext = /*#__PURE__*/React.createContext(null);
var _default = OrderContext;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/Portal.js":
/*!*****************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/Portal.js ***!
  \*****************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _reactDom = __webpack_require__(/*! react-dom */ "react-dom");
var _canUseDom = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/Dom/canUseDom */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/canUseDom.js"));
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var _ref2 = __webpack_require__(/*! rc-util/lib/ref */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/ref.js");
var _Context = _interopRequireDefault(__webpack_require__(/*! ./Context */ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/Context.js"));
var _useDom3 = _interopRequireDefault(__webpack_require__(/*! ./useDom */ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/useDom.js"));
var _useScrollLocker = _interopRequireDefault(__webpack_require__(/*! ./useScrollLocker */ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/useScrollLocker.js"));
var _mock = __webpack_require__(/*! ./mock */ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/mock.js");
var getPortalContainer = function getPortalContainer(getContainer) {
  if (getContainer === false) {
    return false;
  }
  if (!(0, _canUseDom.default)() || !getContainer) {
    return null;
  }
  if (typeof getContainer === 'string') {
    return document.querySelector(getContainer);
  }
  if (typeof getContainer === 'function') {
    return getContainer();
  }
  return getContainer;
};
var Portal = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var open = props.open,
    autoLock = props.autoLock,
    getContainer = props.getContainer,
    debug = props.debug,
    _props$autoDestroy = props.autoDestroy,
    autoDestroy = _props$autoDestroy === void 0 ? true : _props$autoDestroy,
    children = props.children;
  var _React$useState = React.useState(open),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
    shouldRender = _React$useState2[0],
    setShouldRender = _React$useState2[1];
  var mergedRender = shouldRender || open;

  // ========================= Warning =========================
  if (true) {
    (0, _warning.default)((0, _canUseDom.default)() || !open, "Portal only work in client side. Please call 'useEffect' to show Portal instead default render in SSR.");
  }

  // ====================== Should Render ======================
  React.useEffect(function () {
    if (autoDestroy || open) {
      setShouldRender(open);
    }
  }, [open, autoDestroy]);

  // ======================== Container ========================
  var _React$useState3 = React.useState(function () {
      return getPortalContainer(getContainer);
    }),
    _React$useState4 = (0, _slicedToArray2.default)(_React$useState3, 2),
    innerContainer = _React$useState4[0],
    setInnerContainer = _React$useState4[1];
  React.useEffect(function () {
    var customizeContainer = getPortalContainer(getContainer);

    // Tell component that we check this in effect which is safe to be `null`
    setInnerContainer(customizeContainer !== null && customizeContainer !== void 0 ? customizeContainer : null);
  });
  var _useDom = (0, _useDom3.default)(mergedRender && !innerContainer, debug),
    _useDom2 = (0, _slicedToArray2.default)(_useDom, 2),
    defaultContainer = _useDom2[0],
    queueCreate = _useDom2[1];
  var mergedContainer = innerContainer !== null && innerContainer !== void 0 ? innerContainer : defaultContainer;

  // ========================= Locker ==========================
  (0, _useScrollLocker.default)(autoLock && open && (0, _canUseDom.default)() && (mergedContainer === defaultContainer || mergedContainer === document.body));

  // =========================== Ref ===========================
  var childRef = null;
  if (children && (0, _ref2.supportRef)(children) && ref) {
    var _ref = children;
    childRef = _ref.ref;
  }
  var mergedRef = (0, _ref2.useComposeRef)(childRef, ref);

  // ========================= Render ==========================
  // Do not render when nothing need render
  // When innerContainer is `undefined`, it may not ready since user use ref in the same render
  if (!mergedRender || !(0, _canUseDom.default)() || innerContainer === undefined) {
    return null;
  }

  // Render inline
  var renderInline = mergedContainer === false || (0, _mock.inlineMock)();
  var reffedChildren = children;
  if (ref) {
    reffedChildren = /*#__PURE__*/React.cloneElement(children, {
      ref: mergedRef
    });
  }
  return /*#__PURE__*/React.createElement(_Context.default.Provider, {
    value: queueCreate
  }, renderInline ? reffedChildren : /*#__PURE__*/(0, _reactDom.createPortal)(reffedChildren, mergedContainer));
});
if (true) {
  Portal.displayName = 'Portal';
}
var _default = Portal;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/index.js":
/*!****************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/index.js ***!
  \****************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
Object.defineProperty(exports, "inlineMock", ({
  enumerable: true,
  get: function get() {
    return _mock.inlineMock;
  }
}));
var _Portal = _interopRequireDefault(__webpack_require__(/*! ./Portal */ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/Portal.js"));
var _mock = __webpack_require__(/*! ./mock */ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/mock.js");
var _default = _Portal.default;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/mock.js":
/*!***************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/mock.js ***!
  \***************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.inline = void 0;
exports.inlineMock = inlineMock;
var inline = false;
exports.inline = inline;
function inlineMock(nextInline) {
  if (typeof nextInline === 'boolean') {
    exports.inline = inline = nextInline;
  }
  return inline;
}

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/useDom.js":
/*!*****************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/useDom.js ***!
  \*****************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useDom;
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _useLayoutEffect = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useLayoutEffect */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useLayoutEffect.js"));
var _canUseDom = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/Dom/canUseDom */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/canUseDom.js"));
var _Context = _interopRequireDefault(__webpack_require__(/*! ./Context */ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/Context.js"));
var EMPTY_LIST = [];

/**
 * Will add `div` to document. Nest call will keep order
 * @param render Render DOM in document
 */
function useDom(render, debug) {
  var _React$useState = React.useState(function () {
      if (!(0, _canUseDom.default)()) {
        return null;
      }
      var defaultEle = document.createElement('div');
      if ( true && debug) {
        defaultEle.setAttribute('data-debug', debug);
      }
      return defaultEle;
    }),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 1),
    ele = _React$useState2[0];

  // ========================== Order ==========================
  var appendedRef = React.useRef(false);
  var queueCreate = React.useContext(_Context.default);
  var _React$useState3 = React.useState(EMPTY_LIST),
    _React$useState4 = (0, _slicedToArray2.default)(_React$useState3, 2),
    queue = _React$useState4[0],
    setQueue = _React$useState4[1];
  var mergedQueueCreate = queueCreate || (appendedRef.current ? undefined : function (appendFn) {
    setQueue(function (origin) {
      var newQueue = [appendFn].concat((0, _toConsumableArray2.default)(origin));
      return newQueue;
    });
  });

  // =========================== DOM ===========================
  function append() {
    if (!ele.parentElement) {
      document.body.appendChild(ele);
    }
    appendedRef.current = true;
  }
  function cleanup() {
    var _ele$parentElement;
    (_ele$parentElement = ele.parentElement) === null || _ele$parentElement === void 0 ? void 0 : _ele$parentElement.removeChild(ele);
    appendedRef.current = false;
  }
  (0, _useLayoutEffect.default)(function () {
    if (render) {
      if (queueCreate) {
        queueCreate(append);
      } else {
        append();
      }
    } else {
      cleanup();
    }
    return cleanup;
  }, [render]);
  (0, _useLayoutEffect.default)(function () {
    if (queue.length) {
      queue.forEach(function (appendFn) {
        return appendFn();
      });
      setQueue(EMPTY_LIST);
    }
  }, [queue]);
  return [ele, mergedQueueCreate];
}

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/useScrollLocker.js":
/*!**************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/useScrollLocker.js ***!
  \**************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useScrollLocker;
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _dynamicCSS = __webpack_require__(/*! rc-util/lib/Dom/dynamicCSS */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/dynamicCSS.js");
var _useLayoutEffect = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useLayoutEffect */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useLayoutEffect.js"));
var _getScrollBarSize = __webpack_require__(/*! rc-util/lib/getScrollBarSize */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/getScrollBarSize.js");
var _util = __webpack_require__(/*! ./util */ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/util.js");
var UNIQUE_ID = "rc-util-locker-".concat(Date.now());
var uuid = 0;
function useScrollLocker(lock) {
  var mergedLock = !!lock;
  var _React$useState = React.useState(function () {
      uuid += 1;
      return "".concat(UNIQUE_ID, "_").concat(uuid);
    }),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 1),
    id = _React$useState2[0];
  (0, _useLayoutEffect.default)(function () {
    if (mergedLock) {
      var scrollbarSize = (0, _getScrollBarSize.getTargetScrollBarSize)(document.body).width;
      var isOverflow = (0, _util.isBodyOverflowing)();
      (0, _dynamicCSS.updateCSS)("\nhtml body {\n  overflow-y: hidden;\n  ".concat(isOverflow ? "width: calc(100% - ".concat(scrollbarSize, "px);") : '', "\n}"), id);
    } else {
      (0, _dynamicCSS.removeCSS)(id);
    }
    return function () {
      (0, _dynamicCSS.removeCSS)(id);
    };
  }, [mergedLock, id]);
}

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/util.js":
/*!***************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/util.js ***!
  \***************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.isBodyOverflowing = isBodyOverflowing;
/**
 * Test usage export. Do not use in your production
 */
function isBodyOverflowing() {
  return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight) && window.innerWidth > document.body.offsetWidth;
}

/***/ })

};
;