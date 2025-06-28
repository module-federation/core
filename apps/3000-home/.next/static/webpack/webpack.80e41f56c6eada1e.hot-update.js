"use strict";
self["webpackHotUpdatehome_app"]("webpack",{},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/federation runtime */
/******/ !function() {
/******/ 	if(!__webpack_require__.federation){
/******/ 		__webpack_require__.federation = {
/******/ 			initOptions: {"name":"home_app","remotes":[{"alias":"shop","name":"shop","entry":"http://localhost:3001/_next/static/chunks/remoteEntry.js","shareScope":"default"},{"alias":"checkout","name":"checkout","entry":"http://localhost:3002/_next/static/chunks/remoteEntry.js","shareScope":"default"}],"shareStrategy":"loaded-first"},
/******/ 			chunkMatcher: function(chunkId) {return !/^webpack_container_remote_(shop_(Webpack(Pn|Sv)g|menu)|checkout_menu)$/.test(chunkId)},
/******/ 			rootOutputDir: "../../",
/******/ 			initialConsumes: undefined,
/******/ 			bundlerRuntimeOptions: {}
/******/ 		};
/******/ 	}
/******/ }();
/******/ 
/******/ /* webpack/runtime/getFullHash */
/******/ !function() {
/******/ 	__webpack_require__.h = function() { return "d5526887b111c628"; }
/******/ }();
/******/ 
/******/ /* webpack/runtime/remotes loading */
/******/ !function() {
/******/ 	var chunkMapping = {
/******/ 		"__federation_expose_pages__index": [
/******/ 			"webpack/container/remote/checkout/CheckoutTitle",
/******/ 			"webpack/container/remote/checkout/ButtonOldAnt"
/******/ 		],
/******/ 		"__federation_expose_pages__checkout__[...slug]": [
/******/ 			"webpack/container/remote/checkout/pages/checkout/[...slug]"
/******/ 		],
/******/ 		"__federation_expose_pages__checkout__[pid]": [
/******/ 			"webpack/container/remote/checkout/pages/checkout/[pid]"
/******/ 		],
/******/ 		"__federation_expose_pages__checkout__exposed_pages": [
/******/ 			"webpack/container/remote/checkout/pages/checkout/exposed-pages"
/******/ 		],
/******/ 		"__federation_expose_pages__checkout__index": [
/******/ 			"webpack/container/remote/checkout/pages/checkout/index"
/******/ 		],
/******/ 		"__federation_expose_pages__checkout__test_check_button": [
/******/ 			"webpack/container/remote/checkout/pages/checkout/test-check-button"
/******/ 		],
/******/ 		"__federation_expose_pages__checkout__test_title": [
/******/ 			"webpack/container/remote/checkout/pages/checkout/test-title"
/******/ 		],
/******/ 		"__federation_expose_pages__home__test_remote_hook": [
/******/ 			"webpack/container/remote/shop/useCustomRemoteHook"
/******/ 		],
/******/ 		"__federation_expose_pages__shop__exposed_pages": [
/******/ 			"webpack/container/remote/shop/pages/shop/exposed-pages"
/******/ 		],
/******/ 		"__federation_expose_pages__shop__index": [
/******/ 			"webpack/container/remote/shop/pages/shop/index"
/******/ 		],
/******/ 		"__federation_expose_pages__shop__test_webpack_png": [
/******/ 			"webpack/container/remote/shop/pages/shop/test-webpack-png"
/******/ 		],
/******/ 		"__federation_expose_pages__shop__test_webpack_svg": [
/******/ 			"webpack/container/remote/shop/pages/shop/test-webpack-svg"
/******/ 		],
/******/ 		"__federation_expose_pages__shop__products__[...slug]": [
/******/ 			"webpack/container/remote/shop/pages/shop/products/[...slug]"
/******/ 		],
/******/ 		"webpack_container_remote_shop_WebpackSvg": [
/******/ 			"webpack/container/remote/shop/WebpackSvg"
/******/ 		],
/******/ 		"webpack_container_remote_shop_WebpackPng": [
/******/ 			"webpack/container/remote/shop/WebpackPng"
/******/ 		],
/******/ 		"pages/index": [
/******/ 			"webpack/container/remote/checkout/CheckoutTitle",
/******/ 			"webpack/container/remote/checkout/ButtonOldAnt"
/******/ 		],
/******/ 		"webpack_container_remote_shop_menu": [
/******/ 			"webpack/container/remote/shop/menu"
/******/ 		],
/******/ 		"webpack_container_remote_checkout_menu": [
/******/ 			"webpack/container/remote/checkout/menu"
/******/ 		]
/******/ 	};
/******/ 	var idToExternalAndNameMapping = {
/******/ 		"webpack/container/remote/checkout/CheckoutTitle": [
/******/ 			"default",
/******/ 			"./CheckoutTitle",
/******/ 			"webpack/container/reference/checkout"
/******/ 		],
/******/ 		"webpack/container/remote/checkout/ButtonOldAnt": [
/******/ 			"default",
/******/ 			"./ButtonOldAnt",
/******/ 			"webpack/container/reference/checkout"
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/[...slug]": [
/******/ 			"default",
/******/ 			"./pages/checkout/[...slug]",
/******/ 			"webpack/container/reference/checkout"
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/[pid]": [
/******/ 			"default",
/******/ 			"./pages/checkout/[pid]",
/******/ 			"webpack/container/reference/checkout"
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/exposed-pages": [
/******/ 			"default",
/******/ 			"./pages/checkout/exposed-pages",
/******/ 			"webpack/container/reference/checkout"
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/index": [
/******/ 			"default",
/******/ 			"./pages/checkout/index",
/******/ 			"webpack/container/reference/checkout"
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/test-check-button": [
/******/ 			"default",
/******/ 			"./pages/checkout/test-check-button",
/******/ 			"webpack/container/reference/checkout"
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/test-title": [
/******/ 			"default",
/******/ 			"./pages/checkout/test-title",
/******/ 			"webpack/container/reference/checkout"
/******/ 		],
/******/ 		"webpack/container/remote/shop/useCustomRemoteHook": [
/******/ 			"default",
/******/ 			"./useCustomRemoteHook",
/******/ 			"webpack/container/reference/shop"
/******/ 		],
/******/ 		"webpack/container/remote/shop/pages/shop/exposed-pages": [
/******/ 			"default",
/******/ 			"./pages/shop/exposed-pages",
/******/ 			"webpack/container/reference/shop"
/******/ 		],
/******/ 		"webpack/container/remote/shop/pages/shop/index": [
/******/ 			"default",
/******/ 			"./pages/shop/index",
/******/ 			"webpack/container/reference/shop"
/******/ 		],
/******/ 		"webpack/container/remote/shop/pages/shop/test-webpack-png": [
/******/ 			"default",
/******/ 			"./pages/shop/test-webpack-png",
/******/ 			"webpack/container/reference/shop"
/******/ 		],
/******/ 		"webpack/container/remote/shop/pages/shop/test-webpack-svg": [
/******/ 			"default",
/******/ 			"./pages/shop/test-webpack-svg",
/******/ 			"webpack/container/reference/shop"
/******/ 		],
/******/ 		"webpack/container/remote/shop/pages/shop/products/[...slug]": [
/******/ 			"default",
/******/ 			"./pages/shop/products/[...slug]",
/******/ 			"webpack/container/reference/shop"
/******/ 		],
/******/ 		"webpack/container/remote/shop/WebpackSvg": [
/******/ 			"default",
/******/ 			"./WebpackSvg",
/******/ 			"webpack/container/reference/shop"
/******/ 		],
/******/ 		"webpack/container/remote/shop/WebpackPng": [
/******/ 			"default",
/******/ 			"./WebpackPng",
/******/ 			"webpack/container/reference/shop"
/******/ 		],
/******/ 		"webpack/container/remote/shop/menu": [
/******/ 			"default",
/******/ 			"./menu",
/******/ 			"webpack/container/reference/shop"
/******/ 		],
/******/ 		"webpack/container/remote/checkout/menu": [
/******/ 			"default",
/******/ 			"./menu",
/******/ 			"webpack/container/reference/checkout"
/******/ 		]
/******/ 	};
/******/ 	var idToRemoteMap = {
/******/ 		"webpack/container/remote/checkout/CheckoutTitle": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "checkout",
/******/ 				"externalModuleId": "webpack/container/reference/checkout"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/checkout/ButtonOldAnt": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "checkout",
/******/ 				"externalModuleId": "webpack/container/reference/checkout"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/[...slug]": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "checkout",
/******/ 				"externalModuleId": "webpack/container/reference/checkout"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/[pid]": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "checkout",
/******/ 				"externalModuleId": "webpack/container/reference/checkout"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/exposed-pages": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "checkout",
/******/ 				"externalModuleId": "webpack/container/reference/checkout"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/index": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "checkout",
/******/ 				"externalModuleId": "webpack/container/reference/checkout"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/test-check-button": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "checkout",
/******/ 				"externalModuleId": "webpack/container/reference/checkout"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/checkout/pages/checkout/test-title": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "checkout",
/******/ 				"externalModuleId": "webpack/container/reference/checkout"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/shop/useCustomRemoteHook": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "shop",
/******/ 				"externalModuleId": "webpack/container/reference/shop"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/shop/pages/shop/exposed-pages": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "shop",
/******/ 				"externalModuleId": "webpack/container/reference/shop"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/shop/pages/shop/index": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "shop",
/******/ 				"externalModuleId": "webpack/container/reference/shop"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/shop/pages/shop/test-webpack-png": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "shop",
/******/ 				"externalModuleId": "webpack/container/reference/shop"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/shop/pages/shop/test-webpack-svg": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "shop",
/******/ 				"externalModuleId": "webpack/container/reference/shop"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/shop/pages/shop/products/[...slug]": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "shop",
/******/ 				"externalModuleId": "webpack/container/reference/shop"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/shop/WebpackSvg": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "shop",
/******/ 				"externalModuleId": "webpack/container/reference/shop"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/shop/WebpackPng": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "shop",
/******/ 				"externalModuleId": "webpack/container/reference/shop"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/shop/menu": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "shop",
/******/ 				"externalModuleId": "webpack/container/reference/shop"
/******/ 			}
/******/ 		],
/******/ 		"webpack/container/remote/checkout/menu": [
/******/ 			{
/******/ 				"externalType": "script",
/******/ 				"name": "checkout",
/******/ 				"externalModuleId": "webpack/container/reference/checkout"
/******/ 			}
/******/ 		]
/******/ 	};
/******/ 	__webpack_require__.federation.bundlerRuntimeOptions.remotes = {idToRemoteMap,chunkMapping, idToExternalAndNameMapping, webpackRequire:__webpack_require__};
/******/ 	__webpack_require__.f.remotes = function(chunkId, promises) {
/******/ 		__webpack_require__.federation.bundlerRuntime.remotes({idToRemoteMap,chunkMapping, idToExternalAndNameMapping, chunkId, promises, webpackRequire:__webpack_require__});
/******/ 	}
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
/******/ 		"webpack/sharing/consume/default/next/head/next/head?0fc9": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-2e0fad2").then(function() { return function() { return __webpack_require__(/*! next/head */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^12 || ^13 || ^14 || ^15",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "next/head",
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
/******/ 		"webpack/sharing/consume/default/next/link/next/link?4954": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-dfbe5d1").then(function() { return function() { return __webpack_require__(/*! next/link */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^12 || ^13 || ^14 || ^15",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "next/link",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/next/script/next/script": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-78b1ab1").then(function() { return function() { return __webpack_require__(/*! next/script */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^12 || ^13 || ^14 || ^15",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "next/script",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/next/image/next/image": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-e15dbc1").then(function() { return function() { return __webpack_require__(/*! next/image */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^12 || ^13 || ^14 || ^15",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "next/image",
/******/ 		},
/******/ 		"webpack/sharing/consume/default/next/dynamic/next/dynamic": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-6478ab1").then(function() { return function() { return __webpack_require__(/*! next/dynamic */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": "^12 || ^13 || ^14 || ^15",
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "next/dynamic",
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
/******/ 		"webpack/sharing/consume/default/styled-jsx/styled-jsx": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_in-b28c191").then(function() { return function() { return __webpack_require__(/*! styled-jsx */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js"); }; }); },
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
/******/ 			shareKey: "styled-jsx",
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
/******/ 		"webpack/sharing/consume/default/react-dom/client/react-dom/client": {
/******/ 			getter: function() { return __webpack_require__.e("node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_client_js-_382a1").then(function() { return function() { return __webpack_require__(/*! react-dom/client */ "../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js"); }; }); },
/******/ 			shareInfo: {
/******/ 				shareConfig: {
/******/ 				  "fixedDependencies": false,
/******/ 				  "requiredVersion": false,
/******/ 				  "strictVersion": false,
/******/ 				  "singleton": true,
/******/ 				  "eager": false,
/******/ 				  "layer": null
/******/ 				},
/******/ 				scope: ["default"],
/******/ 			},
/******/ 			shareKey: "react-dom/client",
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
/******/ 		}
/******/ 	};
/******/ 	var initialConsumes = ["webpack/sharing/consume/default/next/head/next/head?0fc9","webpack/sharing/consume/default/next/router/next/router","webpack/sharing/consume/default/next/link/next/link?4954","webpack/sharing/consume/default/next/script/next/script","webpack/sharing/consume/default/next/image/next/image","webpack/sharing/consume/default/next/dynamic/next/dynamic","webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime","webpack/sharing/consume/default/react/react","webpack/sharing/consume/default/styled-jsx/styled-jsx","webpack/sharing/consume/default/styled-jsx/style/styled-jsx/style","webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime","webpack/sharing/consume/default/react/react","webpack/sharing/consume/default/react-dom/client/react-dom/client","webpack/sharing/consume/default/react-dom/react-dom","webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime","webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs","webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context","webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?369e","webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined","webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined","webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined","webpack/sharing/consume/default/next/router/next/router","webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined","webpack/sharing/consume/default/next/head/next/head?1388"];
/******/ 	__webpack_require__.federation.installInitialConsumes = function() { return __webpack_require__.federation.bundlerRuntime.installInitialConsumes({
/******/ 		initialConsumes: initialConsumes,
/******/ 		installedModules:installedModules,
/******/ 		moduleToHandlerMapping:moduleToHandlerMapping,
/******/ 		webpackRequire: __webpack_require__
/******/ 	}); }
/******/ 	var chunkMapping = {
/******/ 		"noop": [
/******/ 			"webpack/sharing/consume/default/next/head/next/head?0fc9",
/******/ 			"webpack/sharing/consume/default/next/router/next/router",
/******/ 			"webpack/sharing/consume/default/next/link/next/link?4954",
/******/ 			"webpack/sharing/consume/default/next/script/next/script",
/******/ 			"webpack/sharing/consume/default/next/image/next/image",
/******/ 			"webpack/sharing/consume/default/next/dynamic/next/dynamic",
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 			"webpack/sharing/consume/default/react/react",
/******/ 			"webpack/sharing/consume/default/styled-jsx/styled-jsx",
/******/ 			"webpack/sharing/consume/default/styled-jsx/style/styled-jsx/style"
/******/ 		],
/******/ 		"main": [
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 			"webpack/sharing/consume/default/react/react",
/******/ 			"webpack/sharing/consume/default/react-dom/client/react-dom/client",
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom"
/******/ 		],
/******/ 		"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-59b1250": [
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 		],
/******/ 		"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-78b1ab1": [
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom"
/******/ 		],
/******/ 		"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-e15dbc1": [
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom"
/******/ 		],
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
/******/ 		"pages/_app": [
/******/ 			"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 			"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?369e",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 			"webpack/sharing/consume/default/next/router/next/router",
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined"
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
/******/ 		],
/******/ 		"pages/index": [
/******/ 			"webpack/sharing/consume/default/next/head/next/head?1388"
/******/ 		],
/******/ 		"components_SharedNav_tsx": [
/******/ 			"webpack/sharing/consume/default/styled-jsx/style/styled-jsx/style"
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
/******/ /* webpack/runtime/jsonp chunk loading */
/******/ !function() {
/******/ 	// no baseURI
/******/ 	
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = __webpack_require__.hmrS_jsonp = __webpack_require__.hmrS_jsonp || {
/******/ 		"webpack": 0
/******/ 	};
/******/ 	
/******/ 	__webpack_require__.f.j = function(chunkId, promises) {
/******/ 			// JSONP chunk loading for javascript
/******/ 			var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 			if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 	
/******/ 				// a Promise means "currently loading".
/******/ 				if(installedChunkData) {
/******/ 					promises.push(installedChunkData[2]);
/******/ 				} else {
/******/ 					if(!/^webpack_container_remote_(shop_(Webpack(Pn|Sv)g|menu)|checkout_menu)$/.test(chunkId)) {
/******/ 						// setup Promise in chunk cache
/******/ 						var promise = new Promise(function(resolve, reject) { installedChunkData = installedChunks[chunkId] = [resolve, reject]; });
/******/ 						promises.push(installedChunkData[2] = promise);
/******/ 	
/******/ 						// start chunk loading
/******/ 						var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 						// create error before stack unwound to get useful stacktrace later
/******/ 						var error = new Error();
/******/ 						var loadingEnded = function(event) {
/******/ 							if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 								installedChunkData = installedChunks[chunkId];
/******/ 								if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 								if(installedChunkData) {
/******/ 									var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 									var realSrc = event && event.target && event.target.src;
/******/ 									error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 									error.name = 'ChunkLoadError';
/******/ 									error.type = errorType;
/******/ 									error.request = realSrc;
/******/ 									installedChunkData[1](error);
/******/ 								}
/******/ 							}
/******/ 						};
/******/ 						__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 					} else installedChunks[chunkId] = 0;
/******/ 				}
/******/ 			}
/******/ 	};
/******/ 	
/******/ 	// no prefetching
/******/ 	
/******/ 	// no preloaded
/******/ 	
/******/ 	var currentUpdatedModulesList;
/******/ 	var waitingUpdateResolves = {};
/******/ 	function loadUpdateChunk(chunkId, updatedModulesList) {
/******/ 		currentUpdatedModulesList = updatedModulesList;
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			waitingUpdateResolves[chunkId] = resolve;
/******/ 			// start update chunk loading
/******/ 			var url = __webpack_require__.p + __webpack_require__.hu(chunkId);
/******/ 			// create error before stack unwound to get useful stacktrace later
/******/ 			var error = new Error();
/******/ 			var loadingEnded = function(event) {
/******/ 				if(waitingUpdateResolves[chunkId]) {
/******/ 					waitingUpdateResolves[chunkId] = undefined
/******/ 					var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 					var realSrc = event && event.target && event.target.src;
/******/ 					error.message = 'Loading hot update chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 					error.name = 'ChunkLoadError';
/******/ 					error.type = errorType;
/******/ 					error.request = realSrc;
/******/ 					reject(error);
/******/ 				}
/******/ 			};
/******/ 			__webpack_require__.l(url, loadingEnded);
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	self["webpackHotUpdatehome_app"] = function(chunkId, moreModules, runtime) {
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 				currentUpdate[moduleId] = moreModules[moduleId];
/******/ 				if(currentUpdatedModulesList) currentUpdatedModulesList.push(moduleId);
/******/ 			}
/******/ 		}
/******/ 		if(runtime) currentUpdateRuntime.push(runtime);
/******/ 		if(waitingUpdateResolves[chunkId]) {
/******/ 			waitingUpdateResolves[chunkId]();
/******/ 			waitingUpdateResolves[chunkId] = undefined;
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	var currentUpdateChunks;
/******/ 	var currentUpdate;
/******/ 	var currentUpdateRemovedChunks;
/******/ 	var currentUpdateRuntime;
/******/ 	function applyHandler(options) {
/******/ 		if (__webpack_require__.f) delete __webpack_require__.f.jsonpHmr;
/******/ 		currentUpdateChunks = undefined;
/******/ 		function getAffectedModuleEffects(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.map(function (id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while (queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				var module = __webpack_require__.c[moduleId];
/******/ 				if (
/******/ 					!module ||
/******/ 					(module.hot._selfAccepted && !module.hot._selfInvalidated)
/******/ 				)
/******/ 					continue;
/******/ 				if (module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if (module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for (var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = __webpack_require__.c[parentId];
/******/ 					if (!parent) continue;
/******/ 					if (parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 					if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if (!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for (var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if (a.indexOf(item) === -1) a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 	
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
/******/ 			console.warn(
/******/ 				"[HMR] unexpected require(" + module.id + ") to disposed module"
/******/ 			);
/******/ 		};
/******/ 	
/******/ 		for (var moduleId in currentUpdate) {
/******/ 			if (__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 				var newModuleFactory = currentUpdate[moduleId];
/******/ 				/** @type {TODO} */
/******/ 				var result = newModuleFactory
/******/ 					? getAffectedModuleEffects(moduleId)
/******/ 					: {
/******/ 							type: "disposed",
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 				/** @type {Error|false} */
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if (result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch (result.type) {
/******/ 					case "self-declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of self decline: " +
/******/ 									result.moduleId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of declined dependency: " +
/******/ 									result.moduleId +
/******/ 									" in " +
/******/ 									result.parentId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 						if (!options.ignoreUnaccepted)
/******/ 							abortError = new Error(
/******/ 								"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if (options.onAccepted) options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if (options.onDisposed) options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if (abortError) {
/******/ 					return {
/******/ 						error: abortError
/******/ 					};
/******/ 				}
/******/ 				if (doApply) {
/******/ 					appliedUpdate[moduleId] = newModuleFactory;
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for (moduleId in result.outdatedDependencies) {
/******/ 						if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
/******/ 							if (!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(
/******/ 								outdatedDependencies[moduleId],
/******/ 								result.outdatedDependencies[moduleId]
/******/ 							);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if (doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		currentUpdate = undefined;
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for (var j = 0; j < outdatedModules.length; j++) {
/******/ 			var outdatedModuleId = outdatedModules[j];
/******/ 			var module = __webpack_require__.c[outdatedModuleId];
/******/ 			if (
/******/ 				module &&
/******/ 				(module.hot._selfAccepted || module.hot._main) &&
/******/ 				// removed self-accepted modules should not be required
/******/ 				appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
/******/ 				// when called invalidate self-accepting is not possible
/******/ 				!module.hot._selfInvalidated
/******/ 			) {
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: outdatedModuleId,
/******/ 					require: module.hot._requireSelf,
/******/ 					errorHandler: module.hot._selfAccepted
/******/ 				});
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		var moduleOutdatedDependencies;
/******/ 	
/******/ 		return {
/******/ 			dispose: function () {
/******/ 				currentUpdateRemovedChunks.forEach(function (chunkId) {
/******/ 					delete installedChunks[chunkId];
/******/ 				});
/******/ 				currentUpdateRemovedChunks = undefined;
/******/ 	
/******/ 				var idx;
/******/ 				var queue = outdatedModules.slice();
/******/ 				while (queue.length > 0) {
/******/ 					var moduleId = queue.pop();
/******/ 					var module = __webpack_require__.c[moduleId];
/******/ 					if (!module) continue;
/******/ 	
/******/ 					var data = {};
/******/ 	
/******/ 					// Call dispose handlers
/******/ 					var disposeHandlers = module.hot._disposeHandlers;
/******/ 					for (j = 0; j < disposeHandlers.length; j++) {
/******/ 						disposeHandlers[j].call(null, data);
/******/ 					}
/******/ 					__webpack_require__.hmrD[moduleId] = data;
/******/ 	
/******/ 					// disable module (this disables requires from this module)
/******/ 					module.hot.active = false;
/******/ 	
/******/ 					// remove module from cache
/******/ 					delete __webpack_require__.c[moduleId];
/******/ 	
/******/ 					// when disposing there is no need to call dispose handler
/******/ 					delete outdatedDependencies[moduleId];
/******/ 	
/******/ 					// remove "parents" references from all children
/******/ 					for (j = 0; j < module.children.length; j++) {
/******/ 						var child = __webpack_require__.c[module.children[j]];
/******/ 						if (!child) continue;
/******/ 						idx = child.parents.indexOf(moduleId);
/******/ 						if (idx >= 0) {
/******/ 							child.parents.splice(idx, 1);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 	
/******/ 				// remove outdated dependency from module children
/******/ 				var dependency;
/******/ 				for (var outdatedModuleId in outdatedDependencies) {
/******/ 					if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 						module = __webpack_require__.c[outdatedModuleId];
/******/ 						if (module) {
/******/ 							moduleOutdatedDependencies =
/******/ 								outdatedDependencies[outdatedModuleId];
/******/ 							for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 								dependency = moduleOutdatedDependencies[j];
/******/ 								idx = module.children.indexOf(dependency);
/******/ 								if (idx >= 0) module.children.splice(idx, 1);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			},
/******/ 			apply: function (reportError) {
/******/ 				// insert new code
/******/ 				for (var updateModuleId in appliedUpdate) {
/******/ 					if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
/******/ 						__webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
/******/ 					}
/******/ 				}
/******/ 	
/******/ 				// run new runtime modules
/******/ 				for (var i = 0; i < currentUpdateRuntime.length; i++) {
/******/ 					currentUpdateRuntime[i](__webpack_require__);
/******/ 				}
/******/ 	
/******/ 				// call accept handlers
/******/ 				for (var outdatedModuleId in outdatedDependencies) {
/******/ 					if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 						var module = __webpack_require__.c[outdatedModuleId];
/******/ 						if (module) {
/******/ 							moduleOutdatedDependencies =
/******/ 								outdatedDependencies[outdatedModuleId];
/******/ 							var callbacks = [];
/******/ 							var errorHandlers = [];
/******/ 							var dependenciesForCallbacks = [];
/******/ 							for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 								var dependency = moduleOutdatedDependencies[j];
/******/ 								var acceptCallback =
/******/ 									module.hot._acceptedDependencies[dependency];
/******/ 								var errorHandler =
/******/ 									module.hot._acceptedErrorHandlers[dependency];
/******/ 								if (acceptCallback) {
/******/ 									if (callbacks.indexOf(acceptCallback) !== -1) continue;
/******/ 									callbacks.push(acceptCallback);
/******/ 									errorHandlers.push(errorHandler);
/******/ 									dependenciesForCallbacks.push(dependency);
/******/ 								}
/******/ 							}
/******/ 							for (var k = 0; k < callbacks.length; k++) {
/******/ 								try {
/******/ 									callbacks[k].call(null, moduleOutdatedDependencies);
/******/ 								} catch (err) {
/******/ 									if (typeof errorHandlers[k] === "function") {
/******/ 										try {
/******/ 											errorHandlers[k](err, {
/******/ 												moduleId: outdatedModuleId,
/******/ 												dependencyId: dependenciesForCallbacks[k]
/******/ 											});
/******/ 										} catch (err2) {
/******/ 											if (options.onErrored) {
/******/ 												options.onErrored({
/******/ 													type: "accept-error-handler-errored",
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k],
/******/ 													error: err2,
/******/ 													originalError: err
/******/ 												});
/******/ 											}
/******/ 											if (!options.ignoreErrored) {
/******/ 												reportError(err2);
/******/ 												reportError(err);
/******/ 											}
/******/ 										}
/******/ 									} else {
/******/ 										if (options.onErrored) {
/******/ 											options.onErrored({
/******/ 												type: "accept-errored",
/******/ 												moduleId: outdatedModuleId,
/******/ 												dependencyId: dependenciesForCallbacks[k],
/******/ 												error: err
/******/ 											});
/******/ 										}
/******/ 										if (!options.ignoreErrored) {
/******/ 											reportError(err);
/******/ 										}
/******/ 									}
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 	
/******/ 				// Load self accepted modules
/******/ 				for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
/******/ 					var item = outdatedSelfAcceptedModules[o];
/******/ 					var moduleId = item.module;
/******/ 					try {
/******/ 						item.require(moduleId);
/******/ 					} catch (err) {
/******/ 						if (typeof item.errorHandler === "function") {
/******/ 							try {
/******/ 								item.errorHandler(err, {
/******/ 									moduleId: moduleId,
/******/ 									module: __webpack_require__.c[moduleId]
/******/ 								});
/******/ 							} catch (err1) {
/******/ 								if (options.onErrored) {
/******/ 									options.onErrored({
/******/ 										type: "self-accept-error-handler-errored",
/******/ 										moduleId: moduleId,
/******/ 										error: err1,
/******/ 										originalError: err
/******/ 									});
/******/ 								}
/******/ 								if (!options.ignoreErrored) {
/******/ 									reportError(err1);
/******/ 									reportError(err);
/******/ 								}
/******/ 							}
/******/ 						} else {
/******/ 							if (options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "self-accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if (!options.ignoreErrored) {
/******/ 								reportError(err);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 	
/******/ 				return outdatedModules;
/******/ 			}
/******/ 		};
/******/ 	}
/******/ 	__webpack_require__.hmrI.jsonp = function (moduleId, applyHandlers) {
/******/ 		if (!currentUpdate) {
/******/ 			currentUpdate = {};
/******/ 			currentUpdateRuntime = [];
/******/ 			currentUpdateRemovedChunks = [];
/******/ 			applyHandlers.push(applyHandler);
/******/ 		}
/******/ 		if (!__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 			currentUpdate[moduleId] = __webpack_require__.m[moduleId];
/******/ 		}
/******/ 	};
/******/ 	__webpack_require__.hmrC.jsonp = function (
/******/ 		chunkIds,
/******/ 		removedChunks,
/******/ 		removedModules,
/******/ 		promises,
/******/ 		applyHandlers,
/******/ 		updatedModulesList
/******/ 	) {
/******/ 		applyHandlers.push(applyHandler);
/******/ 		currentUpdateChunks = {};
/******/ 		currentUpdateRemovedChunks = removedChunks;
/******/ 		currentUpdate = removedModules.reduce(function (obj, key) {
/******/ 			obj[key] = false;
/******/ 			return obj;
/******/ 		}, {});
/******/ 		currentUpdateRuntime = [];
/******/ 		chunkIds.forEach(function (chunkId) {
/******/ 			if (
/******/ 				__webpack_require__.o(installedChunks, chunkId) &&
/******/ 				installedChunks[chunkId] !== undefined
/******/ 			) {
/******/ 				promises.push(loadUpdateChunk(chunkId, updatedModulesList));
/******/ 				currentUpdateChunks[chunkId] = true;
/******/ 			} else {
/******/ 				currentUpdateChunks[chunkId] = false;
/******/ 			}
/******/ 		});
/******/ 		if (__webpack_require__.f) {
/******/ 			__webpack_require__.f.jsonpHmr = function (chunkId, promises) {
/******/ 				if (
/******/ 					currentUpdateChunks &&
/******/ 					__webpack_require__.o(currentUpdateChunks, chunkId) &&
/******/ 					!currentUpdateChunks[chunkId]
/******/ 				) {
/******/ 					promises.push(loadUpdateChunk(chunkId));
/******/ 					currentUpdateChunks[chunkId] = true;
/******/ 				}
/******/ 			};
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	__webpack_require__.hmrM = function() {
/******/ 		if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
/******/ 		return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then(function(response) {
/******/ 			if(response.status === 404) return; // no update available
/******/ 			if(!response.ok) throw new Error("Failed to fetch update manifest " + response.statusText);
/******/ 			return response.json();
/******/ 		});
/******/ 	};
/******/ 	
/******/ 	__webpack_require__.O.j = function(chunkId) { return installedChunks[chunkId] === 0; };
/******/ 	
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var webpackJsonpCallback = function(parentChunkLoadingFunction, data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var runtime = data[2];
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0;
/******/ 		if(chunkIds.some(function(id) { return installedChunks[id] !== 0; })) {
/******/ 			for(moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) var result = runtime(__webpack_require__);
/******/ 		}
/******/ 		if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				installedChunks[chunkId][0]();
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		return __webpack_require__.O(result);
/******/ 	}
/******/ 	
/******/ 	var chunkLoadingGlobal = self["webpackChunkhome_app"] = self["webpackChunkhome_app"] || [];
/******/ 	chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 	chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ }();
/******/ 
/******/ }
);