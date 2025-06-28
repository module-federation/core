"use strict";
exports.id = "vendor-chunks/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1";
exports.ids = ["vendor-chunks/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1"];
exports.modules = {

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/Arrow.js":
/*!************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/Arrow.js ***!
  \************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = Arrow;
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function Arrow(props) {
  var prefixCls = props.prefixCls,
    align = props.align,
    arrow = props.arrow,
    arrowPos = props.arrowPos;
  var _ref = arrow || {},
    className = _ref.className,
    content = _ref.content;
  var _arrowPos$x = arrowPos.x,
    x = _arrowPos$x === void 0 ? 0 : _arrowPos$x,
    _arrowPos$y = arrowPos.y,
    y = _arrowPos$y === void 0 ? 0 : _arrowPos$y;
  var arrowRef = React.useRef();

  // Skip if no align
  if (!align || !align.points) {
    return null;
  }
  var alignStyle = {
    position: 'absolute'
  };

  // Skip if no need to align
  if (align.autoArrow !== false) {
    var popupPoints = align.points[0];
    var targetPoints = align.points[1];
    var popupTB = popupPoints[0];
    var popupLR = popupPoints[1];
    var targetTB = targetPoints[0];
    var targetLR = targetPoints[1];

    // Top & Bottom
    if (popupTB === targetTB || !['t', 'b'].includes(popupTB)) {
      alignStyle.top = y;
    } else if (popupTB === 't') {
      alignStyle.top = 0;
    } else {
      alignStyle.bottom = 0;
    }

    // Left & Right
    if (popupLR === targetLR || !['l', 'r'].includes(popupLR)) {
      alignStyle.left = x;
    } else if (popupLR === 'l') {
      alignStyle.left = 0;
    } else {
      alignStyle.right = 0;
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: arrowRef,
    className: (0, _classnames.default)("".concat(prefixCls, "-arrow"), className),
    style: alignStyle
  }, content);
}

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/Mask.js":
/*!***********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/Mask.js ***!
  \***********************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = Mask;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _rcMotion = _interopRequireDefault(__webpack_require__(/*! rc-motion */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/index.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function Mask(props) {
  var prefixCls = props.prefixCls,
    open = props.open,
    zIndex = props.zIndex,
    mask = props.mask,
    motion = props.motion;
  if (!mask) {
    return null;
  }
  return /*#__PURE__*/React.createElement(_rcMotion.default, (0, _extends2.default)({}, motion, {
    motionAppear: true,
    visible: open,
    removeOnLeave: true
  }), function (_ref) {
    var className = _ref.className;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        zIndex: zIndex
      },
      className: (0, _classnames.default)("".concat(prefixCls, "-mask"), className)
    });
  });
}

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/PopupContent.js":
/*!*******************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/PopupContent.js ***!
  \*******************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var PopupContent = /*#__PURE__*/React.memo(function (_ref) {
  var children = _ref.children;
  return children;
}, function (_, next) {
  return next.cache;
});
if (true) {
  PopupContent.displayName = 'PopupContent';
}
var _default = exports["default"] = PopupContent;

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/index.js":
/*!************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/index.js ***!
  \************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _rcMotion = _interopRequireDefault(__webpack_require__(/*! rc-motion */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/index.js"));
var _rcResizeObserver = _interopRequireDefault(__webpack_require__(/*! rc-resize-observer */ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/index.js"));
var _useLayoutEffect = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useLayoutEffect */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useLayoutEffect.js"));
var _ref2 = __webpack_require__(/*! rc-util/lib/ref */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/ref.js");
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _Arrow = _interopRequireDefault(__webpack_require__(/*! ./Arrow */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/Arrow.js"));
var _Mask = _interopRequireDefault(__webpack_require__(/*! ./Mask */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/Mask.js"));
var _PopupContent = _interopRequireDefault(__webpack_require__(/*! ./PopupContent */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/PopupContent.js"));
var Popup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var popup = props.popup,
    className = props.className,
    prefixCls = props.prefixCls,
    style = props.style,
    target = props.target,
    _onVisibleChanged = props.onVisibleChanged,
    open = props.open,
    keepDom = props.keepDom,
    fresh = props.fresh,
    onClick = props.onClick,
    mask = props.mask,
    arrow = props.arrow,
    arrowPos = props.arrowPos,
    align = props.align,
    motion = props.motion,
    maskMotion = props.maskMotion,
    forceRender = props.forceRender,
    getPopupContainer = props.getPopupContainer,
    autoDestroy = props.autoDestroy,
    Portal = props.portal,
    zIndex = props.zIndex,
    onMouseEnter = props.onMouseEnter,
    onMouseLeave = props.onMouseLeave,
    onPointerEnter = props.onPointerEnter,
    ready = props.ready,
    offsetX = props.offsetX,
    offsetY = props.offsetY,
    offsetR = props.offsetR,
    offsetB = props.offsetB,
    onAlign = props.onAlign,
    onPrepare = props.onPrepare,
    stretch = props.stretch,
    targetWidth = props.targetWidth,
    targetHeight = props.targetHeight;
  var childNode = typeof popup === 'function' ? popup() : popup;

  // We can not remove holder only when motion finished.
  var isNodeVisible = open || keepDom;

  // ======================= Container ========================
  var getPopupContainerNeedParams = (getPopupContainer === null || getPopupContainer === void 0 ? void 0 : getPopupContainer.length) > 0;
  var _React$useState = React.useState(!getPopupContainer || !getPopupContainerNeedParams),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
    show = _React$useState2[0],
    setShow = _React$useState2[1];

  // Delay to show since `getPopupContainer` need target element
  (0, _useLayoutEffect.default)(function () {
    if (!show && getPopupContainerNeedParams && target) {
      setShow(true);
    }
  }, [show, getPopupContainerNeedParams, target]);

  // ========================= Render =========================
  if (!show) {
    return null;
  }

  // >>>>> Offset
  var AUTO = 'auto';
  var offsetStyle = {
    left: '-1000vw',
    top: '-1000vh',
    right: AUTO,
    bottom: AUTO
  };

  // Set align style
  if (ready || !open) {
    var _experimental;
    var points = align.points;
    var dynamicInset = align.dynamicInset || ((_experimental = align._experimental) === null || _experimental === void 0 ? void 0 : _experimental.dynamicInset);
    var alignRight = dynamicInset && points[0][1] === 'r';
    var alignBottom = dynamicInset && points[0][0] === 'b';
    if (alignRight) {
      offsetStyle.right = offsetR;
      offsetStyle.left = AUTO;
    } else {
      offsetStyle.left = offsetX;
      offsetStyle.right = AUTO;
    }
    if (alignBottom) {
      offsetStyle.bottom = offsetB;
      offsetStyle.top = AUTO;
    } else {
      offsetStyle.top = offsetY;
      offsetStyle.bottom = AUTO;
    }
  }

  // >>>>> Misc
  var miscStyle = {};
  if (stretch) {
    if (stretch.includes('height') && targetHeight) {
      miscStyle.height = targetHeight;
    } else if (stretch.includes('minHeight') && targetHeight) {
      miscStyle.minHeight = targetHeight;
    }
    if (stretch.includes('width') && targetWidth) {
      miscStyle.width = targetWidth;
    } else if (stretch.includes('minWidth') && targetWidth) {
      miscStyle.minWidth = targetWidth;
    }
  }
  if (!open) {
    miscStyle.pointerEvents = 'none';
  }
  return /*#__PURE__*/React.createElement(Portal, {
    open: forceRender || isNodeVisible,
    getContainer: getPopupContainer && function () {
      return getPopupContainer(target);
    },
    autoDestroy: autoDestroy
  }, /*#__PURE__*/React.createElement(_Mask.default, {
    prefixCls: prefixCls,
    open: open,
    zIndex: zIndex,
    mask: mask,
    motion: maskMotion
  }), /*#__PURE__*/React.createElement(_rcResizeObserver.default, {
    onResize: onAlign,
    disabled: !open
  }, function (resizeObserverRef) {
    return /*#__PURE__*/React.createElement(_rcMotion.default, (0, _extends2.default)({
      motionAppear: true,
      motionEnter: true,
      motionLeave: true,
      removeOnLeave: false,
      forceRender: forceRender,
      leavedClassName: "".concat(prefixCls, "-hidden")
    }, motion, {
      onAppearPrepare: onPrepare,
      onEnterPrepare: onPrepare,
      visible: open,
      onVisibleChanged: function onVisibleChanged(nextVisible) {
        var _motion$onVisibleChan;
        motion === null || motion === void 0 || (_motion$onVisibleChan = motion.onVisibleChanged) === null || _motion$onVisibleChan === void 0 || _motion$onVisibleChan.call(motion, nextVisible);
        _onVisibleChanged(nextVisible);
      }
    }), function (_ref, motionRef) {
      var motionClassName = _ref.className,
        motionStyle = _ref.style;
      var cls = (0, _classnames.default)(prefixCls, motionClassName, className);
      return /*#__PURE__*/React.createElement("div", {
        ref: (0, _ref2.composeRef)(resizeObserverRef, ref, motionRef),
        className: cls,
        style: (0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)({
          '--arrow-x': "".concat(arrowPos.x || 0, "px"),
          '--arrow-y': "".concat(arrowPos.y || 0, "px")
        }, offsetStyle), miscStyle), motionStyle), {}, {
          boxSizing: 'border-box',
          zIndex: zIndex
        }, style),
        onMouseEnter: onMouseEnter,
        onMouseLeave: onMouseLeave,
        onPointerEnter: onPointerEnter,
        onClick: onClick
      }, arrow && /*#__PURE__*/React.createElement(_Arrow.default, {
        prefixCls: prefixCls,
        arrow: arrow,
        arrowPos: arrowPos,
        align: align
      }), /*#__PURE__*/React.createElement(_PopupContent.default, {
        cache: !open && !fresh
      }, childNode));
    });
  }));
});
if (true) {
  Popup.displayName = 'Popup';
}
var _default = exports["default"] = Popup;

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/TriggerWrapper.js":
/*!***************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/TriggerWrapper.js ***!
  \***************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _ref = __webpack_require__(/*! rc-util/lib/ref */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/ref.js");
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var TriggerWrapper = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var children = props.children,
    getTriggerDOMNode = props.getTriggerDOMNode;
  var canUseRef = (0, _ref.supportRef)(children);

  // When use `getTriggerDOMNode`, we should do additional work to get the real dom
  var setRef = React.useCallback(function (node) {
    (0, _ref.fillRef)(ref, getTriggerDOMNode ? getTriggerDOMNode(node) : node);
  }, [getTriggerDOMNode]);
  var mergedRef = (0, _ref.useComposeRef)(setRef, children.ref);
  return canUseRef ? /*#__PURE__*/React.cloneElement(children, {
    ref: mergedRef
  }) : children;
});
if (true) {
  TriggerWrapper.displayName = 'TriggerWrapper';
}
var _default = exports["default"] = TriggerWrapper;

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/context.js":
/*!********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/context.js ***!
  \********************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var TriggerContext = /*#__PURE__*/React.createContext(null);
var _default = exports["default"] = TriggerContext;

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useAction.js":
/*!****************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useAction.js ***!
  \****************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useAction;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function toArray(val) {
  return val ? Array.isArray(val) ? val : [val] : [];
}
function useAction(mobile, action, showAction, hideAction) {
  return React.useMemo(function () {
    var mergedShowAction = toArray(showAction !== null && showAction !== void 0 ? showAction : action);
    var mergedHideAction = toArray(hideAction !== null && hideAction !== void 0 ? hideAction : action);
    var showActionSet = new Set(mergedShowAction);
    var hideActionSet = new Set(mergedHideAction);
    if (mobile) {
      if (showActionSet.has('hover')) {
        showActionSet.delete('hover');
        showActionSet.add('click');
      }
      if (hideActionSet.has('hover')) {
        hideActionSet.delete('hover');
        hideActionSet.add('click');
      }
    }
    return [showActionSet, hideActionSet];
  }, [mobile, action, showAction, hideAction]);
}

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useAlign.js":
/*!***************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useAlign.js ***!
  \***************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useAlign;
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _findDOMNode = __webpack_require__(/*! rc-util/lib/Dom/findDOMNode */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/findDOMNode.js");
var _isVisible = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/Dom/isVisible */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/isVisible.js"));
var _useEvent = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useEvent */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useEvent.js"));
var _useLayoutEffect = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useLayoutEffect */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useLayoutEffect.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _util = __webpack_require__(/*! ../util */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/util.js");
function getUnitOffset(size) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var offsetStr = "".concat(offset);
  var cells = offsetStr.match(/^(.*)\%$/);
  if (cells) {
    return size * (parseFloat(cells[1]) / 100);
  }
  return parseFloat(offsetStr);
}
function getNumberOffset(rect, offset) {
  var _ref = offset || [],
    _ref2 = (0, _slicedToArray2.default)(_ref, 2),
    offsetX = _ref2[0],
    offsetY = _ref2[1];
  return [getUnitOffset(rect.width, offsetX), getUnitOffset(rect.height, offsetY)];
}
function splitPoints() {
  var points = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return [points[0], points[1]];
}
function getAlignPoint(rect, points) {
  var topBottom = points[0];
  var leftRight = points[1];
  var x;
  var y;

  // Top & Bottom
  if (topBottom === 't') {
    y = rect.y;
  } else if (topBottom === 'b') {
    y = rect.y + rect.height;
  } else {
    y = rect.y + rect.height / 2;
  }

  // Left & Right
  if (leftRight === 'l') {
    x = rect.x;
  } else if (leftRight === 'r') {
    x = rect.x + rect.width;
  } else {
    x = rect.x + rect.width / 2;
  }
  return {
    x: x,
    y: y
  };
}
function reversePoints(points, index) {
  var reverseMap = {
    t: 'b',
    b: 't',
    l: 'r',
    r: 'l'
  };
  return points.map(function (point, i) {
    if (i === index) {
      return reverseMap[point] || 'c';
    }
    return point;
  }).join('');
}
function useAlign(open, popupEle, target, placement, builtinPlacements, popupAlign, onPopupAlign) {
  var _React$useState = React.useState({
      ready: false,
      offsetX: 0,
      offsetY: 0,
      offsetR: 0,
      offsetB: 0,
      arrowX: 0,
      arrowY: 0,
      scaleX: 1,
      scaleY: 1,
      align: builtinPlacements[placement] || {}
    }),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
    offsetInfo = _React$useState2[0],
    setOffsetInfo = _React$useState2[1];
  var alignCountRef = React.useRef(0);
  var scrollerList = React.useMemo(function () {
    if (!popupEle) {
      return [];
    }
    return (0, _util.collectScroller)(popupEle);
  }, [popupEle]);

  // ========================= Flip ==========================
  // We will memo flip info.
  // If size change to make flip, it will memo the flip info and use it in next align.
  var prevFlipRef = React.useRef({});
  var resetFlipCache = function resetFlipCache() {
    prevFlipRef.current = {};
  };
  if (!open) {
    resetFlipCache();
  }

  // ========================= Align =========================
  var onAlign = (0, _useEvent.default)(function () {
    if (popupEle && target && open) {
      var _popupElement$parentE, _popupRect$x, _popupRect$y, _popupElement$parentE2;
      var popupElement = popupEle;
      var doc = popupElement.ownerDocument;
      var win = (0, _util.getWin)(popupElement);
      var _win$getComputedStyle = win.getComputedStyle(popupElement),
        width = _win$getComputedStyle.width,
        height = _win$getComputedStyle.height,
        popupPosition = _win$getComputedStyle.position;
      var originLeft = popupElement.style.left;
      var originTop = popupElement.style.top;
      var originRight = popupElement.style.right;
      var originBottom = popupElement.style.bottom;
      var originOverflow = popupElement.style.overflow;

      // Placement
      var placementInfo = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, builtinPlacements[placement]), popupAlign);

      // placeholder element
      var placeholderElement = doc.createElement('div');
      (_popupElement$parentE = popupElement.parentElement) === null || _popupElement$parentE === void 0 || _popupElement$parentE.appendChild(placeholderElement);
      placeholderElement.style.left = "".concat(popupElement.offsetLeft, "px");
      placeholderElement.style.top = "".concat(popupElement.offsetTop, "px");
      placeholderElement.style.position = popupPosition;
      placeholderElement.style.height = "".concat(popupElement.offsetHeight, "px");
      placeholderElement.style.width = "".concat(popupElement.offsetWidth, "px");

      // Reset first
      popupElement.style.left = '0';
      popupElement.style.top = '0';
      popupElement.style.right = 'auto';
      popupElement.style.bottom = 'auto';
      popupElement.style.overflow = 'hidden';

      // Calculate align style, we should consider `transform` case
      var targetRect;
      if (Array.isArray(target)) {
        targetRect = {
          x: target[0],
          y: target[1],
          width: 0,
          height: 0
        };
      } else {
        var _rect$x, _rect$y;
        var rect = target.getBoundingClientRect();
        rect.x = (_rect$x = rect.x) !== null && _rect$x !== void 0 ? _rect$x : rect.left;
        rect.y = (_rect$y = rect.y) !== null && _rect$y !== void 0 ? _rect$y : rect.top;
        targetRect = {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      }
      var popupRect = popupElement.getBoundingClientRect();
      popupRect.x = (_popupRect$x = popupRect.x) !== null && _popupRect$x !== void 0 ? _popupRect$x : popupRect.left;
      popupRect.y = (_popupRect$y = popupRect.y) !== null && _popupRect$y !== void 0 ? _popupRect$y : popupRect.top;
      var _doc$documentElement = doc.documentElement,
        clientWidth = _doc$documentElement.clientWidth,
        clientHeight = _doc$documentElement.clientHeight,
        scrollWidth = _doc$documentElement.scrollWidth,
        scrollHeight = _doc$documentElement.scrollHeight,
        scrollTop = _doc$documentElement.scrollTop,
        scrollLeft = _doc$documentElement.scrollLeft;
      var popupHeight = popupRect.height;
      var popupWidth = popupRect.width;
      var targetHeight = targetRect.height;
      var targetWidth = targetRect.width;

      // Get bounding of visible area
      var visibleRegion = {
        left: 0,
        top: 0,
        right: clientWidth,
        bottom: clientHeight
      };
      var scrollRegion = {
        left: -scrollLeft,
        top: -scrollTop,
        right: scrollWidth - scrollLeft,
        bottom: scrollHeight - scrollTop
      };
      var htmlRegion = placementInfo.htmlRegion;
      var VISIBLE = 'visible';
      var VISIBLE_FIRST = 'visibleFirst';
      if (htmlRegion !== 'scroll' && htmlRegion !== VISIBLE_FIRST) {
        htmlRegion = VISIBLE;
      }
      var isVisibleFirst = htmlRegion === VISIBLE_FIRST;
      var scrollRegionArea = (0, _util.getVisibleArea)(scrollRegion, scrollerList);
      var visibleRegionArea = (0, _util.getVisibleArea)(visibleRegion, scrollerList);
      var visibleArea = htmlRegion === VISIBLE ? visibleRegionArea : scrollRegionArea;

      // When set to `visibleFirst`,
      // the check `adjust` logic will use `visibleRegion` for check first.
      var adjustCheckVisibleArea = isVisibleFirst ? visibleRegionArea : visibleArea;

      // Record right & bottom align data
      popupElement.style.left = 'auto';
      popupElement.style.top = 'auto';
      popupElement.style.right = '0';
      popupElement.style.bottom = '0';
      var popupMirrorRect = popupElement.getBoundingClientRect();

      // Reset back
      popupElement.style.left = originLeft;
      popupElement.style.top = originTop;
      popupElement.style.right = originRight;
      popupElement.style.bottom = originBottom;
      popupElement.style.overflow = originOverflow;
      (_popupElement$parentE2 = popupElement.parentElement) === null || _popupElement$parentE2 === void 0 || _popupElement$parentE2.removeChild(placeholderElement);

      // Calculate scale
      var _scaleX = (0, _util.toNum)(Math.round(popupWidth / parseFloat(width) * 1000) / 1000);
      var _scaleY = (0, _util.toNum)(Math.round(popupHeight / parseFloat(height) * 1000) / 1000);

      // No need to align since it's not visible in view
      if (_scaleX === 0 || _scaleY === 0 || (0, _findDOMNode.isDOM)(target) && !(0, _isVisible.default)(target)) {
        return;
      }

      // Offset
      var offset = placementInfo.offset,
        targetOffset = placementInfo.targetOffset;
      var _getNumberOffset = getNumberOffset(popupRect, offset),
        _getNumberOffset2 = (0, _slicedToArray2.default)(_getNumberOffset, 2),
        popupOffsetX = _getNumberOffset2[0],
        popupOffsetY = _getNumberOffset2[1];
      var _getNumberOffset3 = getNumberOffset(targetRect, targetOffset),
        _getNumberOffset4 = (0, _slicedToArray2.default)(_getNumberOffset3, 2),
        targetOffsetX = _getNumberOffset4[0],
        targetOffsetY = _getNumberOffset4[1];
      targetRect.x -= targetOffsetX;
      targetRect.y -= targetOffsetY;

      // Points
      var _ref3 = placementInfo.points || [],
        _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
        popupPoint = _ref4[0],
        targetPoint = _ref4[1];
      var targetPoints = splitPoints(targetPoint);
      var popupPoints = splitPoints(popupPoint);
      var targetAlignPoint = getAlignPoint(targetRect, targetPoints);
      var popupAlignPoint = getAlignPoint(popupRect, popupPoints);

      // Real align info may not same as origin one
      var nextAlignInfo = (0, _objectSpread2.default)({}, placementInfo);

      // Next Offset
      var nextOffsetX = targetAlignPoint.x - popupAlignPoint.x + popupOffsetX;
      var nextOffsetY = targetAlignPoint.y - popupAlignPoint.y + popupOffsetY;

      // ============== Intersection ===============
      // Get area by position. Used for check if flip area is better
      function getIntersectionVisibleArea(offsetX, offsetY) {
        var area = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : visibleArea;
        var l = popupRect.x + offsetX;
        var t = popupRect.y + offsetY;
        var r = l + popupWidth;
        var b = t + popupHeight;
        var visibleL = Math.max(l, area.left);
        var visibleT = Math.max(t, area.top);
        var visibleR = Math.min(r, area.right);
        var visibleB = Math.min(b, area.bottom);
        return Math.max(0, (visibleR - visibleL) * (visibleB - visibleT));
      }
      var originIntersectionVisibleArea = getIntersectionVisibleArea(nextOffsetX, nextOffsetY);

      // As `visibleFirst`, we prepare this for check
      var originIntersectionRecommendArea = getIntersectionVisibleArea(nextOffsetX, nextOffsetY, visibleRegionArea);

      // ========================== Overflow ===========================
      var targetAlignPointTL = getAlignPoint(targetRect, ['t', 'l']);
      var popupAlignPointTL = getAlignPoint(popupRect, ['t', 'l']);
      var targetAlignPointBR = getAlignPoint(targetRect, ['b', 'r']);
      var popupAlignPointBR = getAlignPoint(popupRect, ['b', 'r']);
      var overflow = placementInfo.overflow || {};
      var adjustX = overflow.adjustX,
        adjustY = overflow.adjustY,
        shiftX = overflow.shiftX,
        shiftY = overflow.shiftY;
      var supportAdjust = function supportAdjust(val) {
        if (typeof val === 'boolean') {
          return val;
        }
        return val >= 0;
      };

      // Prepare position
      var nextPopupY;
      var nextPopupBottom;
      var nextPopupX;
      var nextPopupRight;
      function syncNextPopupPosition() {
        nextPopupY = popupRect.y + nextOffsetY;
        nextPopupBottom = nextPopupY + popupHeight;
        nextPopupX = popupRect.x + nextOffsetX;
        nextPopupRight = nextPopupX + popupWidth;
      }
      syncNextPopupPosition();

      // >>>>>>>>>> Top & Bottom
      var needAdjustY = supportAdjust(adjustY);
      var sameTB = popupPoints[0] === targetPoints[0];

      // Bottom to Top
      if (needAdjustY && popupPoints[0] === 't' && (nextPopupBottom > adjustCheckVisibleArea.bottom || prevFlipRef.current.bt)) {
        var tmpNextOffsetY = nextOffsetY;
        if (sameTB) {
          tmpNextOffsetY -= popupHeight - targetHeight;
        } else {
          tmpNextOffsetY = targetAlignPointTL.y - popupAlignPointBR.y - popupOffsetY;
        }
        var newVisibleArea = getIntersectionVisibleArea(nextOffsetX, tmpNextOffsetY);
        var newVisibleRecommendArea = getIntersectionVisibleArea(nextOffsetX, tmpNextOffsetY, visibleRegionArea);
        if (
        // Of course use larger one
        newVisibleArea > originIntersectionVisibleArea || newVisibleArea === originIntersectionVisibleArea && (!isVisibleFirst ||
        // Choose recommend one
        newVisibleRecommendArea >= originIntersectionRecommendArea)) {
          prevFlipRef.current.bt = true;
          nextOffsetY = tmpNextOffsetY;
          popupOffsetY = -popupOffsetY;
          nextAlignInfo.points = [reversePoints(popupPoints, 0), reversePoints(targetPoints, 0)];
        } else {
          prevFlipRef.current.bt = false;
        }
      }

      // Top to Bottom
      if (needAdjustY && popupPoints[0] === 'b' && (nextPopupY < adjustCheckVisibleArea.top || prevFlipRef.current.tb)) {
        var _tmpNextOffsetY = nextOffsetY;
        if (sameTB) {
          _tmpNextOffsetY += popupHeight - targetHeight;
        } else {
          _tmpNextOffsetY = targetAlignPointBR.y - popupAlignPointTL.y - popupOffsetY;
        }
        var _newVisibleArea = getIntersectionVisibleArea(nextOffsetX, _tmpNextOffsetY);
        var _newVisibleRecommendArea = getIntersectionVisibleArea(nextOffsetX, _tmpNextOffsetY, visibleRegionArea);
        if (
        // Of course use larger one
        _newVisibleArea > originIntersectionVisibleArea || _newVisibleArea === originIntersectionVisibleArea && (!isVisibleFirst ||
        // Choose recommend one
        _newVisibleRecommendArea >= originIntersectionRecommendArea)) {
          prevFlipRef.current.tb = true;
          nextOffsetY = _tmpNextOffsetY;
          popupOffsetY = -popupOffsetY;
          nextAlignInfo.points = [reversePoints(popupPoints, 0), reversePoints(targetPoints, 0)];
        } else {
          prevFlipRef.current.tb = false;
        }
      }

      // >>>>>>>>>> Left & Right
      var needAdjustX = supportAdjust(adjustX);

      // >>>>> Flip
      var sameLR = popupPoints[1] === targetPoints[1];

      // Right to Left
      if (needAdjustX && popupPoints[1] === 'l' && (nextPopupRight > adjustCheckVisibleArea.right || prevFlipRef.current.rl)) {
        var tmpNextOffsetX = nextOffsetX;
        if (sameLR) {
          tmpNextOffsetX -= popupWidth - targetWidth;
        } else {
          tmpNextOffsetX = targetAlignPointTL.x - popupAlignPointBR.x - popupOffsetX;
        }
        var _newVisibleArea2 = getIntersectionVisibleArea(tmpNextOffsetX, nextOffsetY);
        var _newVisibleRecommendArea2 = getIntersectionVisibleArea(tmpNextOffsetX, nextOffsetY, visibleRegionArea);
        if (
        // Of course use larger one
        _newVisibleArea2 > originIntersectionVisibleArea || _newVisibleArea2 === originIntersectionVisibleArea && (!isVisibleFirst ||
        // Choose recommend one
        _newVisibleRecommendArea2 >= originIntersectionRecommendArea)) {
          prevFlipRef.current.rl = true;
          nextOffsetX = tmpNextOffsetX;
          popupOffsetX = -popupOffsetX;
          nextAlignInfo.points = [reversePoints(popupPoints, 1), reversePoints(targetPoints, 1)];
        } else {
          prevFlipRef.current.rl = false;
        }
      }

      // Left to Right
      if (needAdjustX && popupPoints[1] === 'r' && (nextPopupX < adjustCheckVisibleArea.left || prevFlipRef.current.lr)) {
        var _tmpNextOffsetX = nextOffsetX;
        if (sameLR) {
          _tmpNextOffsetX += popupWidth - targetWidth;
        } else {
          _tmpNextOffsetX = targetAlignPointBR.x - popupAlignPointTL.x - popupOffsetX;
        }
        var _newVisibleArea3 = getIntersectionVisibleArea(_tmpNextOffsetX, nextOffsetY);
        var _newVisibleRecommendArea3 = getIntersectionVisibleArea(_tmpNextOffsetX, nextOffsetY, visibleRegionArea);
        if (
        // Of course use larger one
        _newVisibleArea3 > originIntersectionVisibleArea || _newVisibleArea3 === originIntersectionVisibleArea && (!isVisibleFirst ||
        // Choose recommend one
        _newVisibleRecommendArea3 >= originIntersectionRecommendArea)) {
          prevFlipRef.current.lr = true;
          nextOffsetX = _tmpNextOffsetX;
          popupOffsetX = -popupOffsetX;
          nextAlignInfo.points = [reversePoints(popupPoints, 1), reversePoints(targetPoints, 1)];
        } else {
          prevFlipRef.current.lr = false;
        }
      }

      // ============================ Shift ============================
      syncNextPopupPosition();
      var numShiftX = shiftX === true ? 0 : shiftX;
      if (typeof numShiftX === 'number') {
        // Left
        if (nextPopupX < visibleRegionArea.left) {
          nextOffsetX -= nextPopupX - visibleRegionArea.left - popupOffsetX;
          if (targetRect.x + targetWidth < visibleRegionArea.left + numShiftX) {
            nextOffsetX += targetRect.x - visibleRegionArea.left + targetWidth - numShiftX;
          }
        }

        // Right
        if (nextPopupRight > visibleRegionArea.right) {
          nextOffsetX -= nextPopupRight - visibleRegionArea.right - popupOffsetX;
          if (targetRect.x > visibleRegionArea.right - numShiftX) {
            nextOffsetX += targetRect.x - visibleRegionArea.right + numShiftX;
          }
        }
      }
      var numShiftY = shiftY === true ? 0 : shiftY;
      if (typeof numShiftY === 'number') {
        // Top
        if (nextPopupY < visibleRegionArea.top) {
          nextOffsetY -= nextPopupY - visibleRegionArea.top - popupOffsetY;

          // When target if far away from visible area
          // Stop shift
          if (targetRect.y + targetHeight < visibleRegionArea.top + numShiftY) {
            nextOffsetY += targetRect.y - visibleRegionArea.top + targetHeight - numShiftY;
          }
        }

        // Bottom
        if (nextPopupBottom > visibleRegionArea.bottom) {
          nextOffsetY -= nextPopupBottom - visibleRegionArea.bottom - popupOffsetY;
          if (targetRect.y > visibleRegionArea.bottom - numShiftY) {
            nextOffsetY += targetRect.y - visibleRegionArea.bottom + numShiftY;
          }
        }
      }

      // ============================ Arrow ============================
      // Arrow center align
      var popupLeft = popupRect.x + nextOffsetX;
      var popupRight = popupLeft + popupWidth;
      var popupTop = popupRect.y + nextOffsetY;
      var popupBottom = popupTop + popupHeight;
      var targetLeft = targetRect.x;
      var targetRight = targetLeft + targetWidth;
      var targetTop = targetRect.y;
      var targetBottom = targetTop + targetHeight;
      var maxLeft = Math.max(popupLeft, targetLeft);
      var minRight = Math.min(popupRight, targetRight);
      var xCenter = (maxLeft + minRight) / 2;
      var nextArrowX = xCenter - popupLeft;
      var maxTop = Math.max(popupTop, targetTop);
      var minBottom = Math.min(popupBottom, targetBottom);
      var yCenter = (maxTop + minBottom) / 2;
      var nextArrowY = yCenter - popupTop;
      onPopupAlign === null || onPopupAlign === void 0 || onPopupAlign(popupEle, nextAlignInfo);

      // Additional calculate right & bottom position
      var offsetX4Right = popupMirrorRect.right - popupRect.x - (nextOffsetX + popupRect.width);
      var offsetY4Bottom = popupMirrorRect.bottom - popupRect.y - (nextOffsetY + popupRect.height);
      if (_scaleX === 1) {
        nextOffsetX = Math.round(nextOffsetX);
        offsetX4Right = Math.round(offsetX4Right);
      }
      if (_scaleY === 1) {
        nextOffsetY = Math.round(nextOffsetY);
        offsetY4Bottom = Math.round(offsetY4Bottom);
      }
      var nextOffsetInfo = {
        ready: true,
        offsetX: nextOffsetX / _scaleX,
        offsetY: nextOffsetY / _scaleY,
        offsetR: offsetX4Right / _scaleX,
        offsetB: offsetY4Bottom / _scaleY,
        arrowX: nextArrowX / _scaleX,
        arrowY: nextArrowY / _scaleY,
        scaleX: _scaleX,
        scaleY: _scaleY,
        align: nextAlignInfo
      };
      setOffsetInfo(nextOffsetInfo);
    }
  });
  var triggerAlign = function triggerAlign() {
    alignCountRef.current += 1;
    var id = alignCountRef.current;

    // Merge all align requirement into one frame
    Promise.resolve().then(function () {
      if (alignCountRef.current === id) {
        onAlign();
      }
    });
  };

  // Reset ready status when placement & open changed
  var resetReady = function resetReady() {
    setOffsetInfo(function (ori) {
      return (0, _objectSpread2.default)((0, _objectSpread2.default)({}, ori), {}, {
        ready: false
      });
    });
  };
  (0, _useLayoutEffect.default)(resetReady, [placement]);
  (0, _useLayoutEffect.default)(function () {
    if (!open) {
      resetReady();
    }
  }, [open]);
  return [offsetInfo.ready, offsetInfo.offsetX, offsetInfo.offsetY, offsetInfo.offsetR, offsetInfo.offsetB, offsetInfo.arrowX, offsetInfo.arrowY, offsetInfo.scaleX, offsetInfo.scaleY, offsetInfo.align, triggerAlign];
}

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useWatch.js":
/*!***************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useWatch.js ***!
  \***************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useWatch;
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _useLayoutEffect = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useLayoutEffect */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useLayoutEffect.js"));
var _util = __webpack_require__(/*! ../util */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/util.js");
function useWatch(open, target, popup, onAlign, onScroll) {
  (0, _useLayoutEffect.default)(function () {
    if (open && target && popup) {
      var targetElement = target;
      var popupElement = popup;
      var targetScrollList = (0, _util.collectScroller)(targetElement);
      var popupScrollList = (0, _util.collectScroller)(popupElement);
      var win = (0, _util.getWin)(popupElement);
      var mergedList = new Set([win].concat((0, _toConsumableArray2.default)(targetScrollList), (0, _toConsumableArray2.default)(popupScrollList)));
      function notifyScroll() {
        onAlign();
        onScroll();
      }
      mergedList.forEach(function (scroller) {
        scroller.addEventListener('scroll', notifyScroll, {
          passive: true
        });
      });
      win.addEventListener('resize', notifyScroll, {
        passive: true
      });

      // First time always do align
      onAlign();
      return function () {
        mergedList.forEach(function (scroller) {
          scroller.removeEventListener('scroll', notifyScroll);
          win.removeEventListener('resize', notifyScroll);
        });
      };
    }
  }, [open, target, popup]);
}

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useWinClick.js":
/*!******************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useWinClick.js ***!
  \******************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useWinClick;
var _shadow = __webpack_require__(/*! rc-util/lib/Dom/shadow */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/shadow.js");
var _warning = __webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js");
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _util = __webpack_require__(/*! ../util */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/util.js");
function useWinClick(open, clickToHide, targetEle, popupEle, mask, maskClosable, inPopupOrChild, triggerOpen) {
  var openRef = React.useRef(open);
  openRef.current = open;

  // Click to hide is special action since click popup element should not hide
  React.useEffect(function () {
    if (clickToHide && popupEle && (!mask || maskClosable)) {
      var onTriggerClose = function onTriggerClose(e) {
        var _e$composedPath;
        if (openRef.current && !inPopupOrChild(((_e$composedPath = e.composedPath) === null || _e$composedPath === void 0 || (_e$composedPath = _e$composedPath.call(e)) === null || _e$composedPath === void 0 ? void 0 : _e$composedPath[0]) || e.target)) {
          triggerOpen(false);
        }
      };
      var win = (0, _util.getWin)(popupEle);
      win.addEventListener('mousedown', onTriggerClose, true);
      win.addEventListener('contextmenu', onTriggerClose, true);

      // shadow root
      var targetShadowRoot = (0, _shadow.getShadowRoot)(targetEle);
      if (targetShadowRoot) {
        targetShadowRoot.addEventListener('mousedown', onTriggerClose, true);
        targetShadowRoot.addEventListener('contextmenu', onTriggerClose, true);
      }

      // Warning if target and popup not in same root
      if (true) {
        var _targetEle$getRootNod, _popupEle$getRootNode;
        var targetRoot = targetEle === null || targetEle === void 0 || (_targetEle$getRootNod = targetEle.getRootNode) === null || _targetEle$getRootNod === void 0 ? void 0 : _targetEle$getRootNod.call(targetEle);
        var popupRoot = (_popupEle$getRootNode = popupEle.getRootNode) === null || _popupEle$getRootNode === void 0 ? void 0 : _popupEle$getRootNode.call(popupEle);
        (0, _warning.warning)(targetRoot === popupRoot, "trigger element and popup element should in same shadow root.");
      }
      return function () {
        win.removeEventListener('mousedown', onTriggerClose, true);
        win.removeEventListener('contextmenu', onTriggerClose, true);
        if (targetShadowRoot) {
          targetShadowRoot.removeEventListener('mousedown', onTriggerClose, true);
          targetShadowRoot.removeEventListener('contextmenu', onTriggerClose, true);
        }
      };
    }
  }, [clickToHide, targetEle, popupEle, mask, maskClosable]);
}

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/index.js":
/*!******************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/index.js ***!
  \******************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
exports.generateTrigger = generateTrigger;
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var _portal = _interopRequireDefault(__webpack_require__(/*! @rc-component/portal */ "../../node_modules/.pnpm/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/portal/lib/index.js"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _rcResizeObserver = _interopRequireDefault(__webpack_require__(/*! rc-resize-observer */ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/index.js"));
var _findDOMNode = __webpack_require__(/*! rc-util/lib/Dom/findDOMNode */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/findDOMNode.js");
var _shadow = __webpack_require__(/*! rc-util/lib/Dom/shadow */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/shadow.js");
var _useEvent = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useEvent */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useEvent.js"));
var _useId = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useId */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useId.js"));
var _useLayoutEffect = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useLayoutEffect */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useLayoutEffect.js"));
var _isMobile = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/isMobile */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/isMobile.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _Popup = _interopRequireDefault(__webpack_require__(/*! ./Popup */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/Popup/index.js"));
var _TriggerWrapper = _interopRequireDefault(__webpack_require__(/*! ./TriggerWrapper */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/TriggerWrapper.js"));
var _context = _interopRequireDefault(__webpack_require__(/*! ./context */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/context.js"));
var _useAction3 = _interopRequireDefault(__webpack_require__(/*! ./hooks/useAction */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useAction.js"));
var _useAlign3 = _interopRequireDefault(__webpack_require__(/*! ./hooks/useAlign */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useAlign.js"));
var _useWatch = _interopRequireDefault(__webpack_require__(/*! ./hooks/useWatch */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useWatch.js"));
var _useWinClick = _interopRequireDefault(__webpack_require__(/*! ./hooks/useWinClick */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/hooks/useWinClick.js"));
var _util = __webpack_require__(/*! ./util */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/util.js");
var _excluded = ["prefixCls", "children", "action", "showAction", "hideAction", "popupVisible", "defaultPopupVisible", "onPopupVisibleChange", "afterPopupVisibleChange", "mouseEnterDelay", "mouseLeaveDelay", "focusDelay", "blurDelay", "mask", "maskClosable", "getPopupContainer", "forceRender", "autoDestroy", "destroyPopupOnHide", "popup", "popupClassName", "popupStyle", "popupPlacement", "builtinPlacements", "popupAlign", "zIndex", "stretch", "getPopupClassNameFromAlign", "fresh", "alignPoint", "onPopupClick", "onPopupAlign", "arrow", "popupMotion", "maskMotion", "popupTransitionName", "popupAnimation", "maskTransitionName", "maskAnimation", "className", "getTriggerDOMNode"];
// Removed Props List
// Seems this can be auto
// getDocument?: (element?: HTMLElement) => Document;

// New version will not wrap popup with `rc-trigger-popup-content` when multiple children

function generateTrigger() {
  var PortalComponent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _portal.default;
  var Trigger = /*#__PURE__*/React.forwardRef(function (props, ref) {
    var _props$prefixCls = props.prefixCls,
      prefixCls = _props$prefixCls === void 0 ? 'rc-trigger-popup' : _props$prefixCls,
      children = props.children,
      _props$action = props.action,
      action = _props$action === void 0 ? 'hover' : _props$action,
      showAction = props.showAction,
      hideAction = props.hideAction,
      popupVisible = props.popupVisible,
      defaultPopupVisible = props.defaultPopupVisible,
      onPopupVisibleChange = props.onPopupVisibleChange,
      afterPopupVisibleChange = props.afterPopupVisibleChange,
      mouseEnterDelay = props.mouseEnterDelay,
      _props$mouseLeaveDela = props.mouseLeaveDelay,
      mouseLeaveDelay = _props$mouseLeaveDela === void 0 ? 0.1 : _props$mouseLeaveDela,
      focusDelay = props.focusDelay,
      blurDelay = props.blurDelay,
      mask = props.mask,
      _props$maskClosable = props.maskClosable,
      maskClosable = _props$maskClosable === void 0 ? true : _props$maskClosable,
      getPopupContainer = props.getPopupContainer,
      forceRender = props.forceRender,
      autoDestroy = props.autoDestroy,
      destroyPopupOnHide = props.destroyPopupOnHide,
      popup = props.popup,
      popupClassName = props.popupClassName,
      popupStyle = props.popupStyle,
      popupPlacement = props.popupPlacement,
      _props$builtinPlaceme = props.builtinPlacements,
      builtinPlacements = _props$builtinPlaceme === void 0 ? {} : _props$builtinPlaceme,
      popupAlign = props.popupAlign,
      zIndex = props.zIndex,
      stretch = props.stretch,
      getPopupClassNameFromAlign = props.getPopupClassNameFromAlign,
      fresh = props.fresh,
      alignPoint = props.alignPoint,
      onPopupClick = props.onPopupClick,
      onPopupAlign = props.onPopupAlign,
      arrow = props.arrow,
      popupMotion = props.popupMotion,
      maskMotion = props.maskMotion,
      popupTransitionName = props.popupTransitionName,
      popupAnimation = props.popupAnimation,
      maskTransitionName = props.maskTransitionName,
      maskAnimation = props.maskAnimation,
      className = props.className,
      getTriggerDOMNode = props.getTriggerDOMNode,
      restProps = (0, _objectWithoutProperties2.default)(props, _excluded);
    var mergedAutoDestroy = autoDestroy || destroyPopupOnHide || false;

    // =========================== Mobile ===========================
    var _React$useState = React.useState(false),
      _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
      mobile = _React$useState2[0],
      setMobile = _React$useState2[1];
    (0, _useLayoutEffect.default)(function () {
      setMobile((0, _isMobile.default)());
    }, []);

    // ========================== Context ===========================
    var subPopupElements = React.useRef({});
    var parentContext = React.useContext(_context.default);
    var context = React.useMemo(function () {
      return {
        registerSubPopup: function registerSubPopup(id, subPopupEle) {
          subPopupElements.current[id] = subPopupEle;
          parentContext === null || parentContext === void 0 || parentContext.registerSubPopup(id, subPopupEle);
        }
      };
    }, [parentContext]);

    // =========================== Popup ============================
    var id = (0, _useId.default)();
    var _React$useState3 = React.useState(null),
      _React$useState4 = (0, _slicedToArray2.default)(_React$useState3, 2),
      popupEle = _React$useState4[0],
      setPopupEle = _React$useState4[1];

    // Used for forwardRef popup. Not use internal
    var externalPopupRef = React.useRef(null);
    var setPopupRef = (0, _useEvent.default)(function (node) {
      externalPopupRef.current = node;
      if ((0, _findDOMNode.isDOM)(node) && popupEle !== node) {
        setPopupEle(node);
      }
      parentContext === null || parentContext === void 0 || parentContext.registerSubPopup(id, node);
    });

    // =========================== Target ===========================
    // Use state to control here since `useRef` update not trigger render
    var _React$useState5 = React.useState(null),
      _React$useState6 = (0, _slicedToArray2.default)(_React$useState5, 2),
      targetEle = _React$useState6[0],
      setTargetEle = _React$useState6[1];

    // Used for forwardRef target. Not use internal
    var externalForwardRef = React.useRef(null);
    var setTargetRef = (0, _useEvent.default)(function (node) {
      if ((0, _findDOMNode.isDOM)(node) && targetEle !== node) {
        setTargetEle(node);
        externalForwardRef.current = node;
      }
    });

    // ========================== Children ==========================
    var child = React.Children.only(children);
    var originChildProps = (child === null || child === void 0 ? void 0 : child.props) || {};
    var cloneProps = {};
    var inPopupOrChild = (0, _useEvent.default)(function (ele) {
      var _getShadowRoot, _getShadowRoot2;
      var childDOM = targetEle;
      return (childDOM === null || childDOM === void 0 ? void 0 : childDOM.contains(ele)) || ((_getShadowRoot = (0, _shadow.getShadowRoot)(childDOM)) === null || _getShadowRoot === void 0 ? void 0 : _getShadowRoot.host) === ele || ele === childDOM || (popupEle === null || popupEle === void 0 ? void 0 : popupEle.contains(ele)) || ((_getShadowRoot2 = (0, _shadow.getShadowRoot)(popupEle)) === null || _getShadowRoot2 === void 0 ? void 0 : _getShadowRoot2.host) === ele || ele === popupEle || Object.values(subPopupElements.current).some(function (subPopupEle) {
        return (subPopupEle === null || subPopupEle === void 0 ? void 0 : subPopupEle.contains(ele)) || ele === subPopupEle;
      });
    });

    // =========================== Motion ===========================
    var mergePopupMotion = (0, _util.getMotion)(prefixCls, popupMotion, popupAnimation, popupTransitionName);
    var mergeMaskMotion = (0, _util.getMotion)(prefixCls, maskMotion, maskAnimation, maskTransitionName);

    // ============================ Open ============================
    var _React$useState7 = React.useState(defaultPopupVisible || false),
      _React$useState8 = (0, _slicedToArray2.default)(_React$useState7, 2),
      internalOpen = _React$useState8[0],
      setInternalOpen = _React$useState8[1];

    // Render still use props as first priority
    var mergedOpen = popupVisible !== null && popupVisible !== void 0 ? popupVisible : internalOpen;

    // We use effect sync here in case `popupVisible` back to `undefined`
    var setMergedOpen = (0, _useEvent.default)(function (nextOpen) {
      if (popupVisible === undefined) {
        setInternalOpen(nextOpen);
      }
    });
    (0, _useLayoutEffect.default)(function () {
      setInternalOpen(popupVisible || false);
    }, [popupVisible]);
    var openRef = React.useRef(mergedOpen);
    openRef.current = mergedOpen;
    var lastTriggerRef = React.useRef([]);
    lastTriggerRef.current = [];
    var internalTriggerOpen = (0, _useEvent.default)(function (nextOpen) {
      var _lastTriggerRef$curre;
      setMergedOpen(nextOpen);

      // Enter or Pointer will both trigger open state change
      // We only need take one to avoid duplicated change event trigger
      // Use `lastTriggerRef` to record last open type
      if (((_lastTriggerRef$curre = lastTriggerRef.current[lastTriggerRef.current.length - 1]) !== null && _lastTriggerRef$curre !== void 0 ? _lastTriggerRef$curre : mergedOpen) !== nextOpen) {
        lastTriggerRef.current.push(nextOpen);
        onPopupVisibleChange === null || onPopupVisibleChange === void 0 || onPopupVisibleChange(nextOpen);
      }
    });

    // Trigger for delay
    var delayRef = React.useRef();
    var clearDelay = function clearDelay() {
      clearTimeout(delayRef.current);
    };
    var triggerOpen = function triggerOpen(nextOpen) {
      var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      clearDelay();
      if (delay === 0) {
        internalTriggerOpen(nextOpen);
      } else {
        delayRef.current = setTimeout(function () {
          internalTriggerOpen(nextOpen);
        }, delay * 1000);
      }
    };
    React.useEffect(function () {
      return clearDelay;
    }, []);

    // ========================== Motion ============================
    var _React$useState9 = React.useState(false),
      _React$useState10 = (0, _slicedToArray2.default)(_React$useState9, 2),
      inMotion = _React$useState10[0],
      setInMotion = _React$useState10[1];
    (0, _useLayoutEffect.default)(function (firstMount) {
      if (!firstMount || mergedOpen) {
        setInMotion(true);
      }
    }, [mergedOpen]);
    var _React$useState11 = React.useState(null),
      _React$useState12 = (0, _slicedToArray2.default)(_React$useState11, 2),
      motionPrepareResolve = _React$useState12[0],
      setMotionPrepareResolve = _React$useState12[1];

    // =========================== Align ============================
    var _React$useState13 = React.useState(null),
      _React$useState14 = (0, _slicedToArray2.default)(_React$useState13, 2),
      mousePos = _React$useState14[0],
      setMousePos = _React$useState14[1];
    var setMousePosByEvent = function setMousePosByEvent(event) {
      setMousePos([event.clientX, event.clientY]);
    };
    var _useAlign = (0, _useAlign3.default)(mergedOpen, popupEle, alignPoint && mousePos !== null ? mousePos : targetEle, popupPlacement, builtinPlacements, popupAlign, onPopupAlign),
      _useAlign2 = (0, _slicedToArray2.default)(_useAlign, 11),
      ready = _useAlign2[0],
      offsetX = _useAlign2[1],
      offsetY = _useAlign2[2],
      offsetR = _useAlign2[3],
      offsetB = _useAlign2[4],
      arrowX = _useAlign2[5],
      arrowY = _useAlign2[6],
      scaleX = _useAlign2[7],
      scaleY = _useAlign2[8],
      alignInfo = _useAlign2[9],
      onAlign = _useAlign2[10];
    var _useAction = (0, _useAction3.default)(mobile, action, showAction, hideAction),
      _useAction2 = (0, _slicedToArray2.default)(_useAction, 2),
      showActions = _useAction2[0],
      hideActions = _useAction2[1];
    var clickToShow = showActions.has('click');
    var clickToHide = hideActions.has('click') || hideActions.has('contextMenu');
    var triggerAlign = (0, _useEvent.default)(function () {
      if (!inMotion) {
        onAlign();
      }
    });
    var onScroll = function onScroll() {
      if (openRef.current && alignPoint && clickToHide) {
        triggerOpen(false);
      }
    };
    (0, _useWatch.default)(mergedOpen, targetEle, popupEle, triggerAlign, onScroll);
    (0, _useLayoutEffect.default)(function () {
      triggerAlign();
    }, [mousePos, popupPlacement]);

    // When no builtinPlacements and popupAlign changed
    (0, _useLayoutEffect.default)(function () {
      if (mergedOpen && !(builtinPlacements !== null && builtinPlacements !== void 0 && builtinPlacements[popupPlacement])) {
        triggerAlign();
      }
    }, [JSON.stringify(popupAlign)]);
    var alignedClassName = React.useMemo(function () {
      var baseClassName = (0, _util.getAlignPopupClassName)(builtinPlacements, prefixCls, alignInfo, alignPoint);
      return (0, _classnames.default)(baseClassName, getPopupClassNameFromAlign === null || getPopupClassNameFromAlign === void 0 ? void 0 : getPopupClassNameFromAlign(alignInfo));
    }, [alignInfo, getPopupClassNameFromAlign, builtinPlacements, prefixCls, alignPoint]);

    // ============================ Refs ============================
    React.useImperativeHandle(ref, function () {
      return {
        nativeElement: externalForwardRef.current,
        popupElement: externalPopupRef.current,
        forceAlign: triggerAlign
      };
    });

    // ========================== Stretch ===========================
    var _React$useState15 = React.useState(0),
      _React$useState16 = (0, _slicedToArray2.default)(_React$useState15, 2),
      targetWidth = _React$useState16[0],
      setTargetWidth = _React$useState16[1];
    var _React$useState17 = React.useState(0),
      _React$useState18 = (0, _slicedToArray2.default)(_React$useState17, 2),
      targetHeight = _React$useState18[0],
      setTargetHeight = _React$useState18[1];
    var syncTargetSize = function syncTargetSize() {
      if (stretch && targetEle) {
        var rect = targetEle.getBoundingClientRect();
        setTargetWidth(rect.width);
        setTargetHeight(rect.height);
      }
    };
    var onTargetResize = function onTargetResize() {
      syncTargetSize();
      triggerAlign();
    };

    // ========================== Motion ============================
    var onVisibleChanged = function onVisibleChanged(visible) {
      setInMotion(false);
      onAlign();
      afterPopupVisibleChange === null || afterPopupVisibleChange === void 0 || afterPopupVisibleChange(visible);
    };

    // We will trigger align when motion is in prepare
    var onPrepare = function onPrepare() {
      return new Promise(function (resolve) {
        syncTargetSize();
        setMotionPrepareResolve(function () {
          return resolve;
        });
      });
    };
    (0, _useLayoutEffect.default)(function () {
      if (motionPrepareResolve) {
        onAlign();
        motionPrepareResolve();
        setMotionPrepareResolve(null);
      }
    }, [motionPrepareResolve]);

    // =========================== Action ===========================
    /**
     * Util wrapper for trigger action
     */
    function wrapperAction(eventName, nextOpen, delay, preEvent) {
      cloneProps[eventName] = function (event) {
        var _originChildProps$eve;
        preEvent === null || preEvent === void 0 || preEvent(event);
        triggerOpen(nextOpen, delay);

        // Pass to origin
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        (_originChildProps$eve = originChildProps[eventName]) === null || _originChildProps$eve === void 0 || _originChildProps$eve.call.apply(_originChildProps$eve, [originChildProps, event].concat(args));
      };
    }

    // ======================= Action: Click ========================
    if (clickToShow || clickToHide) {
      cloneProps.onClick = function (event) {
        var _originChildProps$onC;
        if (openRef.current && clickToHide) {
          triggerOpen(false);
        } else if (!openRef.current && clickToShow) {
          setMousePosByEvent(event);
          triggerOpen(true);
        }

        // Pass to origin
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        (_originChildProps$onC = originChildProps.onClick) === null || _originChildProps$onC === void 0 || _originChildProps$onC.call.apply(_originChildProps$onC, [originChildProps, event].concat(args));
      };
    }

    // Click to hide is special action since click popup element should not hide
    (0, _useWinClick.default)(mergedOpen, clickToHide, targetEle, popupEle, mask, maskClosable, inPopupOrChild, triggerOpen);

    // ======================= Action: Hover ========================
    var hoverToShow = showActions.has('hover');
    var hoverToHide = hideActions.has('hover');
    var onPopupMouseEnter;
    var onPopupMouseLeave;
    if (hoverToShow) {
      // Compatible with old browser which not support pointer event
      wrapperAction('onMouseEnter', true, mouseEnterDelay, function (event) {
        setMousePosByEvent(event);
      });
      wrapperAction('onPointerEnter', true, mouseEnterDelay, function (event) {
        setMousePosByEvent(event);
      });
      onPopupMouseEnter = function onPopupMouseEnter(event) {
        // Only trigger re-open when popup is visible
        if ((mergedOpen || inMotion) && popupEle !== null && popupEle !== void 0 && popupEle.contains(event.target)) {
          triggerOpen(true, mouseEnterDelay);
        }
      };

      // Align Point
      if (alignPoint) {
        cloneProps.onMouseMove = function (event) {
          var _originChildProps$onM;
          // setMousePosByEvent(event);
          (_originChildProps$onM = originChildProps.onMouseMove) === null || _originChildProps$onM === void 0 || _originChildProps$onM.call(originChildProps, event);
        };
      }
    }
    if (hoverToHide) {
      wrapperAction('onMouseLeave', false, mouseLeaveDelay);
      wrapperAction('onPointerLeave', false, mouseLeaveDelay);
      onPopupMouseLeave = function onPopupMouseLeave() {
        triggerOpen(false, mouseLeaveDelay);
      };
    }

    // ======================= Action: Focus ========================
    if (showActions.has('focus')) {
      wrapperAction('onFocus', true, focusDelay);
    }
    if (hideActions.has('focus')) {
      wrapperAction('onBlur', false, blurDelay);
    }

    // ==================== Action: ContextMenu =====================
    if (showActions.has('contextMenu')) {
      cloneProps.onContextMenu = function (event) {
        var _originChildProps$onC2;
        if (openRef.current && hideActions.has('contextMenu')) {
          triggerOpen(false);
        } else {
          setMousePosByEvent(event);
          triggerOpen(true);
        }
        event.preventDefault();

        // Pass to origin
        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }
        (_originChildProps$onC2 = originChildProps.onContextMenu) === null || _originChildProps$onC2 === void 0 || _originChildProps$onC2.call.apply(_originChildProps$onC2, [originChildProps, event].concat(args));
      };
    }

    // ========================= ClassName ==========================
    if (className) {
      cloneProps.className = (0, _classnames.default)(originChildProps.className, className);
    }

    // =========================== Render ===========================
    var mergedChildrenProps = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, originChildProps), cloneProps);

    // Pass props into cloneProps for nest usage
    var passedProps = {};
    var passedEventList = ['onContextMenu', 'onClick', 'onMouseDown', 'onTouchStart', 'onMouseEnter', 'onMouseLeave', 'onFocus', 'onBlur'];
    passedEventList.forEach(function (eventName) {
      if (restProps[eventName]) {
        passedProps[eventName] = function () {
          var _mergedChildrenProps$;
          for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }
          (_mergedChildrenProps$ = mergedChildrenProps[eventName]) === null || _mergedChildrenProps$ === void 0 || _mergedChildrenProps$.call.apply(_mergedChildrenProps$, [mergedChildrenProps].concat(args));
          restProps[eventName].apply(restProps, args);
        };
      }
    });

    // Child Node
    var triggerNode = /*#__PURE__*/React.cloneElement(child, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, mergedChildrenProps), passedProps));
    var arrowPos = {
      x: arrowX,
      y: arrowY
    };
    var innerArrow = arrow ? (0, _objectSpread2.default)({}, arrow !== true ? arrow : {}) : null;

    // Render
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_rcResizeObserver.default, {
      disabled: !mergedOpen,
      ref: setTargetRef,
      onResize: onTargetResize
    }, /*#__PURE__*/React.createElement(_TriggerWrapper.default, {
      getTriggerDOMNode: getTriggerDOMNode
    }, triggerNode)), /*#__PURE__*/React.createElement(_context.default.Provider, {
      value: context
    }, /*#__PURE__*/React.createElement(_Popup.default, {
      portal: PortalComponent,
      ref: setPopupRef,
      prefixCls: prefixCls,
      popup: popup,
      className: (0, _classnames.default)(popupClassName, alignedClassName),
      style: popupStyle,
      target: targetEle,
      onMouseEnter: onPopupMouseEnter,
      onMouseLeave: onPopupMouseLeave
      // https://github.com/ant-design/ant-design/issues/43924
      ,
      onPointerEnter: onPopupMouseEnter,
      zIndex: zIndex
      // Open
      ,
      open: mergedOpen,
      keepDom: inMotion,
      fresh: fresh
      // Click
      ,
      onClick: onPopupClick
      // Mask
      ,
      mask: mask
      // Motion
      ,
      motion: mergePopupMotion,
      maskMotion: mergeMaskMotion,
      onVisibleChanged: onVisibleChanged,
      onPrepare: onPrepare
      // Portal
      ,
      forceRender: forceRender,
      autoDestroy: mergedAutoDestroy,
      getPopupContainer: getPopupContainer
      // Arrow
      ,
      align: alignInfo,
      arrow: innerArrow,
      arrowPos: arrowPos
      // Align
      ,
      ready: ready,
      offsetX: offsetX,
      offsetY: offsetY,
      offsetR: offsetR,
      offsetB: offsetB,
      onAlign: triggerAlign
      // Stretch
      ,
      stretch: stretch,
      targetWidth: targetWidth / scaleX,
      targetHeight: targetHeight / scaleY
    })));
  });
  if (true) {
    Trigger.displayName = 'Trigger';
  }
  return Trigger;
}
var _default = exports["default"] = generateTrigger(_portal.default);

/***/ }),

/***/ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/util.js":
/*!*****************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/util.js ***!
  \*****************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.collectScroller = collectScroller;
exports.getAlignPopupClassName = getAlignPopupClassName;
exports.getMotion = getMotion;
exports.getVisibleArea = getVisibleArea;
exports.getWin = getWin;
exports.toNum = toNum;
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
function isPointsEq() {
  var a1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var a2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var isAlignPoint = arguments.length > 2 ? arguments[2] : undefined;
  if (isAlignPoint) {
    return a1[0] === a2[0];
  }
  return a1[0] === a2[0] && a1[1] === a2[1];
}
function getAlignPopupClassName(builtinPlacements, prefixCls, align, isAlignPoint) {
  var points = align.points;
  var placements = Object.keys(builtinPlacements);
  for (var i = 0; i < placements.length; i += 1) {
    var _builtinPlacements$pl;
    var placement = placements[i];
    if (isPointsEq((_builtinPlacements$pl = builtinPlacements[placement]) === null || _builtinPlacements$pl === void 0 ? void 0 : _builtinPlacements$pl.points, points, isAlignPoint)) {
      return "".concat(prefixCls, "-placement-").concat(placement);
    }
  }
  return '';
}

/** @deprecated We should not use this if we can refactor all deps */
function getMotion(prefixCls, motion, animation, transitionName) {
  if (motion) {
    return motion;
  }
  if (animation) {
    return {
      motionName: "".concat(prefixCls, "-").concat(animation)
    };
  }
  if (transitionName) {
    return {
      motionName: transitionName
    };
  }
  return null;
}
function getWin(ele) {
  return ele.ownerDocument.defaultView;
}

/**
 * Get all the scrollable parent elements of the element
 * @param ele       The element to be detected
 * @param areaOnly  Only return the parent which will cut visible area
 */
function collectScroller(ele) {
  var scrollerList = [];
  var current = ele === null || ele === void 0 ? void 0 : ele.parentElement;
  var scrollStyle = ['hidden', 'scroll', 'clip', 'auto'];
  while (current) {
    var _getWin$getComputedSt = getWin(current).getComputedStyle(current),
      overflowX = _getWin$getComputedSt.overflowX,
      overflowY = _getWin$getComputedSt.overflowY,
      overflow = _getWin$getComputedSt.overflow;
    if ([overflowX, overflowY, overflow].some(function (o) {
      return scrollStyle.includes(o);
    })) {
      scrollerList.push(current);
    }
    current = current.parentElement;
  }
  return scrollerList;
}
function toNum(num) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  return Number.isNaN(num) ? defaultValue : num;
}
function getPxValue(val) {
  return toNum(parseFloat(val), 0);
}
/**
 *
 *
 *  **************************************
 *  *              Border                *
 *  *     **************************     *
 *  *     *                  *     *     *
 *  *  B  *                  *  S  *  B  *
 *  *  o  *                  *  c  *  o  *
 *  *  r  *      Content     *  r  *  r  *
 *  *  d  *                  *  o  *  d  *
 *  *  e  *                  *  l  *  e  *
 *  *  r  ********************  l  *  r  *
 *  *     *        Scroll          *     *
 *  *     **************************     *
 *  *              Border                *
 *  **************************************
 *
 */
/**
 * Get visible area of element
 */
function getVisibleArea(initArea, scrollerList) {
  var visibleArea = (0, _objectSpread2.default)({}, initArea);
  (scrollerList || []).forEach(function (ele) {
    if (ele instanceof HTMLBodyElement || ele instanceof HTMLHtmlElement) {
      return;
    }

    // Skip if static position which will not affect visible area
    var _getWin$getComputedSt2 = getWin(ele).getComputedStyle(ele),
      overflow = _getWin$getComputedSt2.overflow,
      overflowClipMargin = _getWin$getComputedSt2.overflowClipMargin,
      borderTopWidth = _getWin$getComputedSt2.borderTopWidth,
      borderBottomWidth = _getWin$getComputedSt2.borderBottomWidth,
      borderLeftWidth = _getWin$getComputedSt2.borderLeftWidth,
      borderRightWidth = _getWin$getComputedSt2.borderRightWidth;
    var eleRect = ele.getBoundingClientRect();
    var eleOutHeight = ele.offsetHeight,
      eleInnerHeight = ele.clientHeight,
      eleOutWidth = ele.offsetWidth,
      eleInnerWidth = ele.clientWidth;
    var borderTopNum = getPxValue(borderTopWidth);
    var borderBottomNum = getPxValue(borderBottomWidth);
    var borderLeftNum = getPxValue(borderLeftWidth);
    var borderRightNum = getPxValue(borderRightWidth);
    var scaleX = toNum(Math.round(eleRect.width / eleOutWidth * 1000) / 1000);
    var scaleY = toNum(Math.round(eleRect.height / eleOutHeight * 1000) / 1000);

    // Original visible area
    var eleScrollWidth = (eleOutWidth - eleInnerWidth - borderLeftNum - borderRightNum) * scaleX;
    var eleScrollHeight = (eleOutHeight - eleInnerHeight - borderTopNum - borderBottomNum) * scaleY;

    // Cut border size
    var scaledBorderTopWidth = borderTopNum * scaleY;
    var scaledBorderBottomWidth = borderBottomNum * scaleY;
    var scaledBorderLeftWidth = borderLeftNum * scaleX;
    var scaledBorderRightWidth = borderRightNum * scaleX;

    // Clip margin
    var clipMarginWidth = 0;
    var clipMarginHeight = 0;
    if (overflow === 'clip') {
      var clipNum = getPxValue(overflowClipMargin);
      clipMarginWidth = clipNum * scaleX;
      clipMarginHeight = clipNum * scaleY;
    }

    // Region
    var eleLeft = eleRect.x + scaledBorderLeftWidth - clipMarginWidth;
    var eleTop = eleRect.y + scaledBorderTopWidth - clipMarginHeight;
    var eleRight = eleLeft + eleRect.width + 2 * clipMarginWidth - scaledBorderLeftWidth - scaledBorderRightWidth - eleScrollWidth;
    var eleBottom = eleTop + eleRect.height + 2 * clipMarginHeight - scaledBorderTopWidth - scaledBorderBottomWidth - eleScrollHeight;
    visibleArea.left = Math.max(visibleArea.left, eleLeft);
    visibleArea.top = Math.max(visibleArea.top, eleTop);
    visibleArea.right = Math.min(visibleArea.right, eleRight);
    visibleArea.bottom = Math.min(visibleArea.bottom, eleBottom);
  });
  return visibleArea;
}

/***/ })

};
;