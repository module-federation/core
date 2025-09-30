/**
 * The rendering mode for a route.
 */ export var RenderingMode = /*#__PURE__*/ function(RenderingMode) {
    /**
   * `STATIC` rendering mode will output a fully static HTML page or error if
   * anything dynamic is used.
   */ RenderingMode["STATIC"] = "STATIC";
    /**
   * `PARTIALLY_STATIC` rendering mode will output a fully static HTML page if
   * the route is fully static, but will output a partially static HTML page if
   * the route uses uses any dynamic API's.
   */ RenderingMode["PARTIALLY_STATIC"] = "PARTIALLY_STATIC";
    return RenderingMode;
}({});

//# sourceMappingURL=rendering-mode.js.map