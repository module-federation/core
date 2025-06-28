"use strict";
self["webpackHotUpdatehome_app"]("home_app",{},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ !function() {
/******/ 	__webpack_require__.h = function() { return "d5526887b111c628"; }
/******/ }();
/******/ 
/******/ /* webpack/runtime/sharing */
/******/ !function() {
/******/ 	__webpack_require__.S = {};
/******/ 	var initPromises = {};
/******/ 	var initTokens = {};
/******/ 	__webpack_require__.I = function(name, initScope) {
/******/ 		if(!initScope) initScope = [];
/******/ 		// handling circular init calls
/******/ 		var initToken = initTokens[name];
/******/ 		if(!initToken) initToken = initTokens[name] = {};
/******/ 		if(initScope.indexOf(initToken) >= 0) return;
/******/ 		initScope.push(initToken);
/******/ 		// only runs once
/******/ 		if(initPromises[name]) return initPromises[name];
/******/ 		// creates a new share scope if needed
/******/ 		if(!__webpack_require__.o(__webpack_require__.S, name)) __webpack_require__.S[name] = {};
/******/ 		// runs all init snippets from all modules reachable
/******/ 		var scope = __webpack_require__.S[name];
/******/ 		var warn = function(msg) {
/******/ 			if (typeof console !== "undefined" && console.warn) console.warn(msg);
/******/ 		};
/******/ 		var uniqueName = "home_app";
/******/ 		var register = function(name, version, factory, eager) {
/******/ 			var versions = scope[name] = scope[name] || {};
/******/ 			var activeVersion = versions[version];
/******/ 			if(!activeVersion || (!activeVersion.loaded && (!eager != !activeVersion.eager ? eager : uniqueName > activeVersion.from))) versions[version] = { get: factory, from: uniqueName, eager: !!eager };
/******/ 		};
/******/ 		var initExternal = function(id) {
/******/ 			var handleError = function(err) { warn("Initialization of sharing external failed: " + err); };
/******/ 			try {
/******/ 				var module = __webpack_require__(id);
/******/ 				if(!module) return;
/******/ 				var initFn = function(module) { return module && module.init && module.init(__webpack_require__.S[name], initScope); }
/******/ 				if(module.then) return promises.push(module.then(initFn, handleError));
/******/ 				var initResult = initFn(module);
/******/ 				if(initResult && initResult.then) return promises.push(initResult['catch'](handleError));
/******/ 			} catch(err) { handleError(err); }
/******/ 		}
/******/ 		var promises = [];
/******/ 		switch(name) {
/******/ 			case "default": {
/******/ 				register("@ant-design/colors", "7.1.0", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_colors_7_1_0_node_modules_ant-design_colors_es_index_js-_f8481").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js"); }; }); });
/******/ 				register("@ant-design/cssinjs", "1.21.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_cssinjs_1_21_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-de-f3c0a90").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/es/index.js */ "../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/es/index.js"); }; }); });
/******/ 				register("@ant-design/icons-svg/es/asn/BarsOutlined", "4.4.2", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_BarsOut-3927b4").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js"); }; }); });
/******/ 				register("@ant-design/icons-svg/es/asn/EllipsisOutlined", "4.4.2", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_Ellipsi-cf0c04").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js"); }; }); });
/******/ 				register("@ant-design/icons-svg/es/asn/LeftOutlined", "4.4.2", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_LeftOut-1fba7a").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js"); }; }); });
/******/ 				register("@ant-design/icons-svg/es/asn/RightOutlined", "4.4.2", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_RightOu-993bc2").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js"); }; }); });
/******/ 				register("@ant-design/icons/es/components/Context", "5.5.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-0a9ca11").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js"); }; }); });
/******/ 				register("@ant-design/icons/es/icons/BarsOutlined", "5.5.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-587f870").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js"); }; }); });
/******/ 				register("@ant-design/icons/es/icons/EllipsisOutlined", "5.5.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-871a9e0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js"); }; }); });
/******/ 				register("@ant-design/icons/es/icons/LeftOutlined", "5.5.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-d114ce0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js"); }; }); });
/******/ 				register("@ant-design/icons/es/icons/RightOutlined", "5.5.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-9c06210").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js"); }; }); });
/******/ 				register("next/dynamic", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-6478ab0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js"); }; }); });
/******/ 				register("next/head", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-2e0fad1").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js"); }; }); });
/******/ 				register("next/image", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-e15dbc0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js"); }; }); });
/******/ 				register("next/link", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-dfbe5d0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js"); }; }); });
/******/ 				register("next/router", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-59b1251").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js"); }; }); });
/******/ 				register("next/script", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-78b1ab0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js"); }; }); });
/******/ 				register("react-dom/client", "18.3.1", function() { return __webpack_require__.e("node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_client_js-_382a0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js */ "../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js"); }; }); });
/******/ 				register("react-dom", "18.3.1", function() { return __webpack_require__.e("node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_index_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js */ "../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js"); }; }); });
/******/ 				register("react/jsx-dev-runtime", "18.3.1", function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-dev-runtime_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js"); }; }); });
/******/ 				register("react/jsx-runtime", "18.3.1", function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-runtime_js-_c1861").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js"); }; }); });
/******/ 				register("react", "18.3.1", function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_index_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js"); }; }); });
/******/ 				register("styled-jsx/style", "5.1.6", function() { return __webpack_require__.e("node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_st-9a91511").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/style.js */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/style.js"); }; }); });
/******/ 				register("styled-jsx", "5.1.6", function() { return __webpack_require__.e("node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_in-b28c190").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js"); }; }); });
/******/ 				initExternal("webpack/container/reference/checkout");
/******/ 				initExternal("webpack/container/reference/shop");
/******/ 			}
/******/ 			break;
/******/ 		}
/******/ 		if(!promises.length) return initPromises[name] = 1;
/******/ 		return initPromises[name] = Promise.all(promises).then(function() { return initPromises[name] = 1; });
/******/ 	};
/******/ }();
/******/ 
/******/ /* webpack/runtime/sharing */
/******/ !function() {
/******/ 	__webpack_require__.federation.initOptions.shared = {	"@ant-design/colors": [{	version: "7.1.0",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_colors_7_1_0_node_modules_ant-design_colors_es_index_js-_f8481").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/cssinjs": [{	version: "1.21.1",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_cssinjs_1_21_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-de-f3c0a90").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/es/index.js */ "../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/es/index.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/BarsOutlined": [{	version: "4.4.2",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_BarsOut-3927b4").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/EllipsisOutlined": [{	version: "4.4.2",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_Ellipsi-cf0c04").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/LeftOutlined": [{	version: "4.4.2",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_LeftOut-1fba7a").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/RightOutlined": [{	version: "4.4.2",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_RightOu-993bc2").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/components/Context": [{	version: "5.5.1",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-0a9ca11").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/BarsOutlined": [{	version: "5.5.1",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-587f870").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/EllipsisOutlined": [{	version: "5.5.1",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-871a9e0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/LeftOutlined": [{	version: "5.5.1",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-d114ce0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/RightOutlined": [{	version: "5.5.1",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-9c06210").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/dynamic": [{	version: "14.2.16",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-6478ab0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/head": [{	version: "14.2.16",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-2e0fad1").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/image": [{	version: "14.2.16",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-e15dbc0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/link": [{	version: "14.2.16",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-dfbe5d0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/router": [{	version: "14.2.16",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-59b1251").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"next/script": [{	version: "14.2.16",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-78b1ab0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"react-dom/client": [{	version: "18.3.1",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_client_js-_382a0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js */ "../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"react-dom": [{	version: "18.3.1",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_index_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js */ "../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"react/jsx-dev-runtime": [{	version: "18.3.1",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-dev-runtime_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"react/jsx-runtime": [{	version: "18.3.1",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-runtime_js-_c1861").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"react": [{	version: "18.3.1",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_index_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"styled-jsx/style": [{	version: "5.1.6",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_st-9a91511").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/style.js */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/style.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"requiredVersion":"^5.1.6","singleton":true,"layer":null}},],	"styled-jsx": [{	version: "5.1.6",
/******/ 			get: function() { return __webpack_require__.e("node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_in-b28c190").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js"); }; }); },
/******/ 			scope: ["default"],
/******/ 			shareConfig: {"eager":false,"requiredVersion":"^5.1.6","singleton":true,"layer":null}},],}
/******/ 	__webpack_require__.S = {};
/******/ 	var initPromises = {};
/******/ 	var initTokens = {};
/******/ 	__webpack_require__.I = function(name, initScope) {
/******/ 		return __webpack_require__.federation.bundlerRuntime.I({	shareScopeName: name,
/******/ 			webpackRequire: __webpack_require__,
/******/ 			initPromises: initPromises,
/******/ 			initTokens: initTokens,
/******/ 			initScope: initScope,
/******/ 		})
/******/ 	};
/******/ }();
/******/ 
/******/ /* webpack/runtime/consumes */
/******/ !function() {
/******/ 	var installedModules = {};
/******/ 	var moduleToHandlerMapping = {
/******/ 		"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-dev-runtime_js").then(function() { return function() { return __webpack_require__(/*! react/jsx-dev-runtime */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": false,
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "react/jsx-dev-runtime",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/styled-jsx/style/styled-jsx/style": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_st-9a91510").then(function() { return function() { return __webpack_require__(/*! styled-jsx/style */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/style.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^5.1.6",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "styled-jsx/style",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/react/react": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_index_js").then(function() { return function() { return __webpack_require__(/*! react */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": false,
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "react",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_cssinjs_1_21_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-de-f3c0a91").then(function() { return function() { return __webpack_require__(/*! @ant-design/cssinjs */ "../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/es/index.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^1.21.0",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/cssinjs",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-0a9ca10").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons/es/components/Context */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^5.3.7",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/icons/es/components/Context",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?369e": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_colors_7_1_0_node_modules_ant-design_colors_es_index_js-_f8480").then(function() { return function() { return __webpack_require__(/*! @ant-design/colors */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^7.1.0",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/colors",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/react-dom/react-dom": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_index_js").then(function() { return function() { return __webpack_require__(/*! react-dom */ "../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": false,
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "react-dom",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-587f871").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons/es/icons/BarsOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^5.3.7",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/icons/es/icons/BarsOutlined",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-d114ce1").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons/es/icons/LeftOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^5.3.7",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/icons/es/icons/LeftOutlined",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-9c06211").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons/es/icons/RightOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^5.3.7",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/icons/es/icons/RightOutlined",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-871a9e1").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons/es/icons/EllipsisOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^5.3.7",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/icons/es/icons/EllipsisOutlined",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/next/router/next/router": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-59b1250").then(function() { return function() { return __webpack_require__(/*! next/router */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": false,
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "next/router",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/next/head/next/head?1388": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-2e0fad0").then(function() { return function() { return __webpack_require__(/*! next/head */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "14.2.16",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "next/head",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/next/link/next/link?4ec1": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-dfbe5d0").then(function() { return function() { return __webpack_require__(/*! next/link */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "14.2.16",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "next/link",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_colors_7_1_0_node_modules_ant-design_colors_es_index_js-_f8481").then(function() { return function() { return __webpack_require__(/*! @ant-design/colors */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^7.0.0",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/colors",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/BarsOutlined/@ant-design/icons-svg/es/asn/BarsOutlined": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_BarsOut-3927b4").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons-svg/es/asn/BarsOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^4.4.0",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/icons-svg/es/asn/BarsOutlined",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/EllipsisOutlined/@ant-design/icons-svg/es/asn/EllipsisOutlined": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_Ellipsi-cf0c04").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons-svg/es/asn/EllipsisOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^4.4.0",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/icons-svg/es/asn/EllipsisOutlined",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/LeftOutlined/@ant-design/icons-svg/es/asn/LeftOutlined": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_LeftOut-1fba7a").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons-svg/es/asn/LeftOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^4.4.0",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/icons-svg/es/asn/LeftOutlined",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/RightOutlined/@ant-design/icons-svg/es/asn/RightOutlined": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_RightOu-993bc2").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons-svg/es/asn/RightOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^4.4.0",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "@ant-design/icons-svg/es/asn/RightOutlined",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-runtime_js-_c1860").then(function() { return function() { return __webpack_require__(/*! react/jsx-runtime */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": false,
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "react/jsx-runtime",
/******/ 		}
/******/ 	};
/******/ 	// no consumes in initial chunks
/******/ 	var chunkMapping = {
/******/ 		"__federation_expose_SharedNav": [
/******/ 			"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 			"webpack/sharing/consume/default/styled-jsx/style/styled-jsx/style",
/******/ 			"webpack/sharing/consume/default/react/react",
/******/ 			"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?369e",
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined",
/******/ 			"webpack/sharing/consume/default/next/router/next/router"
/******/ 		],
/******/ 		"__federation_expose_menu": [
/******/ 			"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 			"webpack/sharing/consume/default/next/router/next/router",
/******/ 			"webpack/sharing/consume/default/react/react",
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 			"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?369e",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined"
/******/ 		],
/******/ 		"__federation_expose_pages__index": [
/******/ 			"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 			"webpack/sharing/consume/default/react/react",
/******/ 			"webpack/sharing/consume/default/next/head/next/head?1388"
/******/ 		],
/******/ 		"__federation_expose_pages__home__exposed_pages": [
/******/ 			"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"__federation_expose_pages__home__test_broken_remotes": [
/******/ 			"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 			"webpack/sharing/consume/default/next/link/next/link?4ec1"
/******/ 		],
/******/ 		"__federation_expose_pages__home__test_remote_hook": [
/******/ 			"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime"
/******/ 		],
/******/ 		"__federation_expose_pages__home__test_shared_nav": [
/******/ 			"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 			"webpack/sharing/consume/default/styled-jsx/style/styled-jsx/style",
/******/ 			"webpack/sharing/consume/default/react/react",
/******/ 			"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?369e",
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined",
/******/ 			"webpack/sharing/consume/default/next/router/next/router"
/******/ 		],
/******/ 		"node_modules_pnpm_ant-design_cssinjs_1_21_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-de-f3c0a90": [
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-0a9ca11": [
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-587f870": [
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/BarsOutlined/@ant-design/icons-svg/es/asn/BarsOutlined",
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-871a9e0": [
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/EllipsisOutlined/@ant-design/icons-svg/es/asn/EllipsisOutlined",
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-d114ce0": [
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/LeftOutlined/@ant-design/icons-svg/es/asn/LeftOutlined",
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-9c06210": [
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/RightOutlined/@ant-design/icons-svg/es/asn/RightOutlined",
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-6478ab0": [
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-2e0fad1": [
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-e15dbc0": [
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 			"webpack/sharing/consume/default/react/react",
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom"
/******/ 		],
/******/ 		"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-dfbe5d0": [
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-59b1251": [
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-78b1ab0": [
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_client_js-_382a0": [
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom"
/******/ 		],
/******/ 		"node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_index_js": [
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_react_18_3_1_node_modules_react_jsx-dev-runtime_js": [
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_react_18_3_1_node_modules_react_jsx-runtime_js-_c1861": [
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_st-9a91511": [
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_in-b28c190": [
/******/ 			"webpack/sharing/consume/default/react/react"
/******/ 		],
/******/ 		"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-59b1250": [
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 		],
/******/ 		"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-587f871": [
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/BarsOutlined/@ant-design/icons-svg/es/asn/BarsOutlined"
/******/ 		],
/******/ 		"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-d114ce1": [
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/LeftOutlined/@ant-design/icons-svg/es/asn/LeftOutlined"
/******/ 		],
/******/ 		"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-9c06211": [
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/RightOutlined/@ant-design/icons-svg/es/asn/RightOutlined"
/******/ 		],
/******/ 		"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-871a9e1": [
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/EllipsisOutlined/@ant-design/icons-svg/es/asn/EllipsisOutlined"
/******/ 		],
/******/ 		"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-2e0fad0": [
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 		]
/******/ 	};
/******/ 	__webpack_require__.f.consumes = function(chunkId, promises) {
/******/ 		__webpack_require__.federation.bundlerRuntime.consumes({
/******/ 		chunkMapping: chunkMapping,
/******/ 		installedModules: installedModules,
/******/ 		chunkId: chunkId,
/******/ 		moduleToHandlerMapping: moduleToHandlerMapping,
/******/ 		promises: promises,
/******/ 		webpackRequire:__webpack_require__
/******/ 		});
/******/ 	}
/******/ }();
/******/ 
/******/ }
);