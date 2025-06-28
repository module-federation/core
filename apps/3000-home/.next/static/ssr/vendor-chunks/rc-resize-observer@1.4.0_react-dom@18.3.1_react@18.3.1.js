"use strict";
exports.id = "vendor-chunks/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1";
exports.ids = ["vendor-chunks/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1"];
exports.modules = {

/***/ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/Collection.js":
/*!*****************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/Collection.js ***!
  \*****************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Collection = Collection;
exports.CollectionContext = void 0;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var CollectionContext = exports.CollectionContext = /*#__PURE__*/React.createContext(null);
/**
 * Collect all the resize event from children ResizeObserver
 */
function Collection(_ref) {
  var children = _ref.children,
    onBatchResize = _ref.onBatchResize;
  var resizeIdRef = React.useRef(0);
  var resizeInfosRef = React.useRef([]);
  var onCollectionResize = React.useContext(CollectionContext);
  var onResize = React.useCallback(function (size, element, data) {
    resizeIdRef.current += 1;
    var currentId = resizeIdRef.current;
    resizeInfosRef.current.push({
      size: size,
      element: element,
      data: data
    });
    Promise.resolve().then(function () {
      if (currentId === resizeIdRef.current) {
        onBatchResize === null || onBatchResize === void 0 || onBatchResize(resizeInfosRef.current);
        resizeInfosRef.current = [];
      }
    });

    // Continue bubbling if parent exist
    onCollectionResize === null || onCollectionResize === void 0 || onCollectionResize(size, element, data);
  }, [onBatchResize, onCollectionResize]);
  return /*#__PURE__*/React.createElement(CollectionContext.Provider, {
    value: onResize
  }, children);
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/SingleObserver/DomWrapper.js":
/*!********************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/SingleObserver/DomWrapper.js ***!
  \********************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createClass.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/inherits.js"));
var _createSuper2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createSuper */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createSuper.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
/**
 * Fallback to findDOMNode if origin ref do not provide any dom element
 */
var DomWrapper = exports["default"] = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2.default)(DomWrapper, _React$Component);
  var _super = (0, _createSuper2.default)(DomWrapper);
  function DomWrapper() {
    (0, _classCallCheck2.default)(this, DomWrapper);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(DomWrapper, [{
    key: "render",
    value: function render() {
      return this.props.children;
    }
  }]);
  return DomWrapper;
}(React.Component);

/***/ }),

/***/ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/SingleObserver/index.js":
/*!***************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/SingleObserver/index.js ***!
  \***************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js"));
var _findDOMNode = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/Dom/findDOMNode */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/findDOMNode.js"));
var _ref = __webpack_require__(/*! rc-util/lib/ref */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/ref.js");
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _Collection = __webpack_require__(/*! ../Collection */ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/Collection.js");
var _observerUtil = __webpack_require__(/*! ../utils/observerUtil */ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/utils/observerUtil.js");
var _DomWrapper = _interopRequireDefault(__webpack_require__(/*! ./DomWrapper */ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/SingleObserver/DomWrapper.js"));
function SingleObserver(props, ref) {
  var children = props.children,
    disabled = props.disabled;
  var elementRef = React.useRef(null);
  var wrapperRef = React.useRef(null);
  var onCollectionResize = React.useContext(_Collection.CollectionContext);

  // =========================== Children ===========================
  var isRenderProps = typeof children === 'function';
  var mergedChildren = isRenderProps ? children(elementRef) : children;

  // ============================= Size =============================
  var sizeRef = React.useRef({
    width: -1,
    height: -1,
    offsetWidth: -1,
    offsetHeight: -1
  });

  // ============================= Ref ==============================
  var canRef = !isRenderProps && /*#__PURE__*/React.isValidElement(mergedChildren) && (0, _ref.supportRef)(mergedChildren);
  var originRef = canRef ? mergedChildren.ref : null;
  var mergedRef = (0, _ref.useComposeRef)(originRef, elementRef);
  var getDom = function getDom() {
    var _elementRef$current;
    return (0, _findDOMNode.default)(elementRef.current) || (
    // Support `nativeElement` format
    elementRef.current && (0, _typeof2.default)(elementRef.current) === 'object' ? (0, _findDOMNode.default)((_elementRef$current = elementRef.current) === null || _elementRef$current === void 0 ? void 0 : _elementRef$current.nativeElement) : null) || (0, _findDOMNode.default)(wrapperRef.current);
  };
  React.useImperativeHandle(ref, function () {
    return getDom();
  });

  // =========================== Observe ============================
  var propsRef = React.useRef(props);
  propsRef.current = props;

  // Handler
  var onInternalResize = React.useCallback(function (target) {
    var _propsRef$current = propsRef.current,
      onResize = _propsRef$current.onResize,
      data = _propsRef$current.data;
    var _target$getBoundingCl = target.getBoundingClientRect(),
      width = _target$getBoundingCl.width,
      height = _target$getBoundingCl.height;
    var offsetWidth = target.offsetWidth,
      offsetHeight = target.offsetHeight;

    /**
     * Resize observer trigger when content size changed.
     * In most case we just care about element size,
     * let's use `boundary` instead of `contentRect` here to avoid shaking.
     */
    var fixedWidth = Math.floor(width);
    var fixedHeight = Math.floor(height);
    if (sizeRef.current.width !== fixedWidth || sizeRef.current.height !== fixedHeight || sizeRef.current.offsetWidth !== offsetWidth || sizeRef.current.offsetHeight !== offsetHeight) {
      var size = {
        width: fixedWidth,
        height: fixedHeight,
        offsetWidth: offsetWidth,
        offsetHeight: offsetHeight
      };
      sizeRef.current = size;

      // IE is strange, right?
      var mergedOffsetWidth = offsetWidth === Math.round(width) ? width : offsetWidth;
      var mergedOffsetHeight = offsetHeight === Math.round(height) ? height : offsetHeight;
      var sizeInfo = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, size), {}, {
        offsetWidth: mergedOffsetWidth,
        offsetHeight: mergedOffsetHeight
      });

      // Let collection know what happened
      onCollectionResize === null || onCollectionResize === void 0 || onCollectionResize(sizeInfo, target, data);
      if (onResize) {
        // defer the callback but not defer to next frame
        Promise.resolve().then(function () {
          onResize(sizeInfo, target);
        });
      }
    }
  }, []);

  // Dynamic observe
  React.useEffect(function () {
    var currentElement = getDom();
    if (currentElement && !disabled) {
      (0, _observerUtil.observe)(currentElement, onInternalResize);
    }
    return function () {
      return (0, _observerUtil.unobserve)(currentElement, onInternalResize);
    };
  }, [elementRef.current, disabled]);

  // ============================ Render ============================
  return /*#__PURE__*/React.createElement(_DomWrapper.default, {
    ref: wrapperRef
  }, canRef ? /*#__PURE__*/React.cloneElement(mergedChildren, {
    ref: mergedRef
  }) : mergedChildren);
}
var RefSingleObserver = /*#__PURE__*/React.forwardRef(SingleObserver);
if (true) {
  RefSingleObserver.displayName = 'SingleObserver';
}
var _default = exports["default"] = RefSingleObserver;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/index.js":
/*!************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/index.js ***!
  \************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "_rs", ({
  enumerable: true,
  get: function get() {
    return _observerUtil._rs;
  }
}));
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _toArray = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/Children/toArray */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Children/toArray.js"));
var _warning = __webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js");
var _SingleObserver = _interopRequireDefault(__webpack_require__(/*! ./SingleObserver */ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/SingleObserver/index.js"));
var _Collection = __webpack_require__(/*! ./Collection */ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/Collection.js");
var _observerUtil = __webpack_require__(/*! ./utils/observerUtil */ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/utils/observerUtil.js");
var INTERNAL_PREFIX_KEY = 'rc-observer-key';
function ResizeObserver(props, ref) {
  var children = props.children;
  var childNodes = typeof children === 'function' ? [children] : (0, _toArray.default)(children);
  if (true) {
    if (childNodes.length > 1) {
      (0, _warning.warning)(false, 'Find more than one child node with `children` in ResizeObserver. Please use ResizeObserver.Collection instead.');
    } else if (childNodes.length === 0) {
      (0, _warning.warning)(false, '`children` of ResizeObserver is empty. Nothing is in observe.');
    }
  }
  return childNodes.map(function (child, index) {
    var key = (child === null || child === void 0 ? void 0 : child.key) || "".concat(INTERNAL_PREFIX_KEY, "-").concat(index);
    return /*#__PURE__*/React.createElement(_SingleObserver.default, (0, _extends2.default)({}, props, {
      key: key,
      ref: index === 0 ? ref : undefined
    }), child);
  });
}
var RefResizeObserver = /*#__PURE__*/React.forwardRef(ResizeObserver);
if (true) {
  RefResizeObserver.displayName = 'ResizeObserver';
}
RefResizeObserver.Collection = _Collection.Collection;
var _default = exports["default"] = RefResizeObserver;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/utils/observerUtil.js":
/*!*************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/utils/observerUtil.js ***!
  \*************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports._rs = exports._el = void 0;
exports.observe = observe;
exports.unobserve = unobserve;
var _resizeObserverPolyfill = _interopRequireDefault(__webpack_require__(/*! resize-observer-polyfill */ "../../node_modules/.pnpm/resize-observer-polyfill@1.5.1/node_modules/resize-observer-polyfill/dist/ResizeObserver.js"));
// =============================== Const ===============================
var elementListeners = new Map();
function onResize(entities) {
  entities.forEach(function (entity) {
    var _elementListeners$get;
    var target = entity.target;
    (_elementListeners$get = elementListeners.get(target)) === null || _elementListeners$get === void 0 || _elementListeners$get.forEach(function (listener) {
      return listener(target);
    });
  });
}

// Note: ResizeObserver polyfill not support option to measure border-box resize
var resizeObserver = new _resizeObserverPolyfill.default(onResize);

// Dev env only
var _el = exports._el =  true ? elementListeners : 0; // eslint-disable-line
var _rs = exports._rs =  true ? onResize : 0; // eslint-disable-line

// ============================== Observe ==============================
function observe(element, callback) {
  if (!elementListeners.has(element)) {
    elementListeners.set(element, new Set());
    resizeObserver.observe(element);
  }
  elementListeners.get(element).add(callback);
}
function unobserve(element, callback) {
  if (elementListeners.has(element)) {
    elementListeners.get(element).delete(callback);
    if (!elementListeners.get(element).size) {
      resizeObserver.unobserve(element);
      elementListeners.delete(element);
    }
  }
}

/***/ })

};
;