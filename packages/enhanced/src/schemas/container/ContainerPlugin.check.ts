/* eslint-disable */
//@ts-nocheck
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn special-lint-fix` to update
 */
const absolutePathRegExp = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;

const schema21 = {
	"definitions": {
		"AmdContainer": {
			"type": "string",
			"minLength": 1
		},
		"AuxiliaryComment": {
			"anyOf": [{
				"type": "string"
			}, {
				"$ref": "#/definitions/LibraryCustomUmdCommentObject"
			}]
		},
		"EntryRuntime": {
			"anyOf": [{
				"enum": [false]
			}, {
				"type": "string",
				"minLength": 1
			}]
		},
		"Exposes": {
			"anyOf": [{
				"type": "array",
				"items": {
					"anyOf": [{
						"$ref": "#/definitions/ExposesItem"
					}, {
						"$ref": "#/definitions/ExposesObject"
					}]
				}
			}, {
				"$ref": "#/definitions/ExposesObject"
			}]
		},
		"ExposesConfig": {
			"type": "object",
			"additionalProperties": false,
			"properties": {
				"import": {
					"anyOf": [{
						"$ref": "#/definitions/ExposesItem"
					}, {
						"$ref": "#/definitions/ExposesItems"
					}]
				},
				"name": {
					"type": "string"
				}
			},
			"required": ["import"]
		},
		"ExposesItem": {
			"type": "string",
			"minLength": 1
		},
		"ExposesItems": {
			"type": "array",
			"items": {
				"$ref": "#/definitions/ExposesItem"
			}
		},
		"ExposesObject": {
			"type": "object",
			"additionalProperties": {
				"anyOf": [{
					"$ref": "#/definitions/ExposesConfig"
				}, {
					"$ref": "#/definitions/ExposesItem"
				}, {
					"$ref": "#/definitions/ExposesItems"
				}]
			}
		},
		"LibraryCustomUmdCommentObject": {
			"type": "object",
			"additionalProperties": false,
			"properties": {
				"amd": {
					"type": "string"
				},
				"commonjs": {
					"type": "string"
				},
				"commonjs2": {
					"type": "string"
				},
				"root": {
					"type": "string"
				}
			}
		},
		"LibraryCustomUmdObject": {
			"type": "object",
			"additionalProperties": false,
			"properties": {
				"amd": {
					"type": "string",
					"minLength": 1
				},
				"commonjs": {
					"type": "string",
					"minLength": 1
				},
				"root": {
					"anyOf": [{
						"type": "array",
						"items": {
							"type": "string",
							"minLength": 1
						}
					}, {
						"type": "string",
						"minLength": 1
					}]
				}
			}
		},
		"LibraryExport": {
			"anyOf": [{
				"type": "array",
				"items": {
					"type": "string",
					"minLength": 1
				}
			}, {
				"type": "string",
				"minLength": 1
			}]
		},
		"LibraryName": {
			"anyOf": [{
				"type": "array",
				"items": {
					"type": "string",
					"minLength": 1
				},
				"minItems": 1
			}, {
				"type": "string",
				"minLength": 1
			}, {
				"$ref": "#/definitions/LibraryCustomUmdObject"
			}]
		},
		"LibraryOptions": {
			"type": "object",
			"additionalProperties": false,
			"properties": {
				"amdContainer": {
					"$ref": "#/definitions/AmdContainer"
				},
				"auxiliaryComment": {
					"$ref": "#/definitions/AuxiliaryComment"
				},
				"export": {
					"$ref": "#/definitions/LibraryExport"
				},
				"name": {
					"$ref": "#/definitions/LibraryName"
				},
				"type": {
					"$ref": "#/definitions/LibraryType"
				},
				"umdNamedDefine": {
					"$ref": "#/definitions/UmdNamedDefine"
				}
			},
			"required": ["type"]
		},
		"LibraryType": {
			"anyOf": [{
				"enum": ["var", "module", "assign", "assign-properties", "this",
					"window", "self", "global", "commonjs", "commonjs2",
					"commonjs-module", "commonjs-static", "amd", "amd-require",
					"umd", "umd2", "jsonp", "system"
				]
			}, {
				"type": "string"
			}]
		},
		"UmdNamedDefine": {
			"type": "boolean"
		}
	},
	"type": "object",
	"additionalProperties": false,
	"properties": {
		"exposes": {
			"$ref": "#/definitions/Exposes"
		},
		"filename": {
			"type": "string",
			"absolutePath": false,
			"minLength": 1
		},
		"library": {
			"$ref": "#/definitions/LibraryOptions"
		},
		"name": {
			"type": "string",
			"minLength": 1
		},
		"runtime": {
			"$ref": "#/definitions/EntryRuntime"
		},
		"runtimePlugins": {
			"type": "array",
			"items": {
				"type": "string",
				"minLength": 1
			}
		},
		"shareScope": {
			"type": "string",
			"minLength": 1
		}
	},
	"required": ["name", "exposes"],
};
const schema39 = {
	"anyOf": [{
		"enum": [false]
	}, {
		"type": "string",
		"minLength": 1
	}]
};
const schema22 = {
	"anyOf": [{
		"type": "array",
		"items": {
			"anyOf": [{
				"$ref": "#/definitions/ExposesItem"
			}, {
				"$ref": "#/definitions/ExposesObject"
			}]
		}
	}, {
		"$ref": "#/definitions/ExposesObject"
	}]
};
const schema23 = {
	"type": "string",
	"minLength": 1
};
const schema24 = {
	"type": "object",
	"additionalProperties": {
		"anyOf": [{
			"$ref": "#/definitions/ExposesConfig"
		}, {
			"$ref": "#/definitions/ExposesItem"
		}, {
			"$ref": "#/definitions/ExposesItems"
		}]
	}
};
const schema25 = {
	"type": "object",
	"additionalProperties": false,
	"properties": {
		"import": {
			"anyOf": [{
				"$ref": "#/definitions/ExposesItem"
			}, {
				"$ref": "#/definitions/ExposesItems"
			}]
		},
		"name": {
			"type": "string"
		}
	},
	"required": ["import"]
};
const schema27 = {
	"type": "array",
	"items": {
		"$ref": "#/definitions/ExposesItem"
	}
};

function validate23(data, {
	instancePath = "",
	parentData,
	parentDataProperty,
	rootData = data
} = {}) {
	let vErrors = null;
	let errors = 0;
	if (errors === 0) {
		if (Array.isArray(data)) {
			var valid0 = true;
			const len0 = data.length;
			for (let i0 = 0; i0 < len0; i0++) {
				let data0 = data[i0];
				const _errs1 = errors;
				const _errs2 = errors;
				if (errors === _errs2) {
					if (typeof data0 === "string") {
						if (data0.length < 1) {
							validate23.errors = [{
								params: {}
							}];
							return false;
						}
					} else {
						validate23.errors = [{
							params: {
								type: "string"
							}
						}];
						return false;
					}
				}
				var valid0 = _errs1 === errors;
				if (!valid0) {
					break;
				}
			}
		} else {
			validate23.errors = [{
				params: {
					type: "array"
				}
			}];
			return false;
		}
	}
	validate23.errors = vErrors;
	return errors === 0;
}

function validate22(data, {
	instancePath = "",
	parentData,
	parentDataProperty,
	rootData = data
} = {}) {
	let vErrors = null;
	let errors = 0;
	if (errors === 0) {
		if (data && typeof data == "object" && !Array.isArray(data)) {
			let missing0;
			if ((data.import === undefined) && (missing0 = "import")) {
				validate22.errors = [{
					params: {
						missingProperty: missing0
					}
				}];
				return false;
			} else {
				const _errs1 = errors;
				for (const key0 in data) {
					if (!((key0 === "import") || (key0 === "name"))) {
						validate22.errors = [{
							params: {
								additionalProperty: key0
							}
						}];
						return false;
						break;
					}
				}
				if (_errs1 === errors) {
					if (data.import !== undefined) {
						let data0 = data.import;
						const _errs2 = errors;
						const _errs3 = errors;
						let valid1 = false;
						const _errs4 = errors;
						const _errs5 = errors;
						if (errors === _errs5) {
							if (typeof data0 === "string") {
								if (data0.length < 1) {
									const err0 = {
										params: {}
									};
									if (vErrors === null) {
										vErrors = [err0];
									} else {
										vErrors.push(err0);
									}
									errors++;
								}
							} else {
								const err1 = {
									params: {
										type: "string"
									}
								};
								if (vErrors === null) {
									vErrors = [err1];
								} else {
									vErrors.push(err1);
								}
								errors++;
							}
						}
						var _valid0 = _errs4 === errors;
						valid1 = valid1 || _valid0;
						if (!valid1) {
							const _errs7 = errors;
							if (!(validate23(data0, {
									instancePath: instancePath + "/import",
									parentData: data,
									parentDataProperty: "import",
									rootData
								}))) {
								vErrors = vErrors === null ? validate23.errors : vErrors.concat(
									validate23.errors);
								errors = vErrors.length;
							}
							var _valid0 = _errs7 === errors;
							valid1 = valid1 || _valid0;
						}
						if (!valid1) {
							const err2 = {
								params: {}
							};
							if (vErrors === null) {
								vErrors = [err2];
							} else {
								vErrors.push(err2);
							}
							errors++;
							validate22.errors = vErrors;
							return false;
						} else {
							errors = _errs3;
							if (vErrors !== null) {
								if (_errs3) {
									vErrors.length = _errs3;
								} else {
									vErrors = null;
								}
							}
						}
						var valid0 = _errs2 === errors;
					} else {
						var valid0 = true;
					}
					if (valid0) {
						if (data.name !== undefined) {
							const _errs8 = errors;
							if (typeof data.name !== "string") {
								validate22.errors = [{
									params: {
										type: "string"
									}
								}];
								return false;
							}
							var valid0 = _errs8 === errors;
						} else {
							var valid0 = true;
						}
					}
				}
			}
		} else {
			validate22.errors = [{
				params: {
					type: "object"
				}
			}];
			return false;
		}
	}
	validate22.errors = vErrors;
	return errors === 0;
}

function validate21(data, {
	instancePath = "",
	parentData,
	parentDataProperty,
	rootData = data
} = {}) {
	let vErrors = null;
	let errors = 0;
	if (errors === 0) {
		if (data && typeof data == "object" && !Array.isArray(data)) {
			for (const key0 in data) {
				let data0 = data[key0];
				const _errs2 = errors;
				const _errs3 = errors;
				let valid1 = false;
				const _errs4 = errors;
				if (!(validate22(data0, {
						instancePath: instancePath + "/" + key0.replace(/~/g, "~0")
							.replace(/\//g, "~1"),
						parentData: data,
						parentDataProperty: key0,
						rootData
					}))) {
					vErrors = vErrors === null ? validate22.errors : vErrors.concat(
						validate22.errors);
					errors = vErrors.length;
				}
				var _valid0 = _errs4 === errors;
				valid1 = valid1 || _valid0;
				if (!valid1) {
					const _errs5 = errors;
					const _errs6 = errors;
					if (errors === _errs6) {
						if (typeof data0 === "string") {
							if (data0.length < 1) {
								const err0 = {
									params: {}
								};
								if (vErrors === null) {
									vErrors = [err0];
								} else {
									vErrors.push(err0);
								}
								errors++;
							}
						} else {
							const err1 = {
								params: {
									type: "string"
								}
							};
							if (vErrors === null) {
								vErrors = [err1];
							} else {
								vErrors.push(err1);
							}
							errors++;
						}
					}
					var _valid0 = _errs5 === errors;
					valid1 = valid1 || _valid0;
					if (!valid1) {
						const _errs8 = errors;
						if (!(validate23(data0, {
								instancePath: instancePath + "/" + key0.replace(/~/g, "~0")
									.replace(/\//g, "~1"),
								parentData: data,
								parentDataProperty: key0,
								rootData
							}))) {
							vErrors = vErrors === null ? validate23.errors : vErrors.concat(
								validate23.errors);
							errors = vErrors.length;
						}
						var _valid0 = _errs8 === errors;
						valid1 = valid1 || _valid0;
					}
				}
				if (!valid1) {
					const err2 = {
						params: {}
					};
					if (vErrors === null) {
						vErrors = [err2];
					} else {
						vErrors.push(err2);
					}
					errors++;
					validate21.errors = vErrors;
					return false;
				} else {
					errors = _errs3;
					if (vErrors !== null) {
						if (_errs3) {
							vErrors.length = _errs3;
						} else {
							vErrors = null;
						}
					}
				}
				var valid0 = _errs2 === errors;
				if (!valid0) {
					break;
				}
			}
		} else {
			validate21.errors = [{
				params: {
					type: "object"
				}
			}];
			return false;
		}
	}
	validate21.errors = vErrors;
	return errors === 0;
}

function validate20(data, {
	instancePath = "",
	parentData,
	parentDataProperty,
	rootData = data
} = {}) {
	let vErrors = null;
	let errors = 0;
	const _errs0 = errors;
	let valid0 = false;
	const _errs1 = errors;
	if (errors === _errs1) {
		if (Array.isArray(data)) {
			var valid1 = true;
			const len0 = data.length;
			for (let i0 = 0; i0 < len0; i0++) {
				let data0 = data[i0];
				const _errs3 = errors;
				const _errs4 = errors;
				let valid2 = false;
				const _errs5 = errors;
				const _errs6 = errors;
				if (errors === _errs6) {
					if (typeof data0 === "string") {
						if (data0.length < 1) {
							const err0 = {
								params: {}
							};
							if (vErrors === null) {
								vErrors = [err0];
							} else {
								vErrors.push(err0);
							}
							errors++;
						}
					} else {
						const err1 = {
							params: {
								type: "string"
							}
						};
						if (vErrors === null) {
							vErrors = [err1];
						} else {
							vErrors.push(err1);
						}
						errors++;
					}
				}
				var _valid1 = _errs5 === errors;
				valid2 = valid2 || _valid1;
				if (!valid2) {
					const _errs8 = errors;
					if (!(validate21(data0, {
							instancePath: instancePath + "/" + i0,
							parentData: data,
							parentDataProperty: i0,
							rootData
						}))) {
						vErrors = vErrors === null ? validate21.errors : vErrors.concat(
							validate21.errors);
						errors = vErrors.length;
					}
					var _valid1 = _errs8 === errors;
					valid2 = valid2 || _valid1;
				}
				if (!valid2) {
					const err2 = {
						params: {}
					};
					if (vErrors === null) {
						vErrors = [err2];
					} else {
						vErrors.push(err2);
					}
					errors++;
				} else {
					errors = _errs4;
					if (vErrors !== null) {
						if (_errs4) {
							vErrors.length = _errs4;
						} else {
							vErrors = null;
						}
					}
				}
				var valid1 = _errs3 === errors;
				if (!valid1) {
					break;
				}
			}
		} else {
			const err3 = {
				params: {
					type: "array"
				}
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
	}
	var _valid0 = _errs1 === errors;
	valid0 = valid0 || _valid0;
	if (!valid0) {
		const _errs9 = errors;
		if (!(validate21(data, {
				instancePath,
				parentData,
				parentDataProperty,
				rootData
			}))) {
			vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21
				.errors);
			errors = vErrors.length;
		}
		var _valid0 = _errs9 === errors;
		valid0 = valid0 || _valid0;
	}
	if (!valid0) {
		const err4 = {
			params: {}
		};
		if (vErrors === null) {
			vErrors = [err4];
		} else {
			vErrors.push(err4);
		}
		errors++;
		validate20.errors = vErrors;
		return false;
	} else {
		errors = _errs0;
		if (vErrors !== null) {
			if (_errs0) {
				vErrors.length = _errs0;
			} else {
				vErrors = null;
			}
		}
	}
	validate20.errors = vErrors;
	return errors === 0;
}
const schema30 = {
	"type": "object",
	"additionalProperties": false,
	"properties": {
		"amdContainer": {
			"$ref": "#/definitions/AmdContainer"
		},
		"auxiliaryComment": {
			"$ref": "#/definitions/AuxiliaryComment"
		},
		"export": {
			"$ref": "#/definitions/LibraryExport"
		},
		"name": {
			"$ref": "#/definitions/LibraryName"
		},
		"type": {
			"$ref": "#/definitions/LibraryType"
		},
		"umdNamedDefine": {
			"$ref": "#/definitions/UmdNamedDefine"
		}
	},
	"required": ["type"]
};
const schema31 = {
	"type": "string",
	"minLength": 1
};
const schema34 = {
	"anyOf": [{
		"type": "array",
		"items": {
			"type": "string",
			"minLength": 1
		}
	}, {
		"type": "string",
		"minLength": 1
	}]
};
const schema37 = {
	"anyOf": [{
		"enum": ["var", "module", "assign", "assign-properties", "this",
			"window", "self", "global", "commonjs", "commonjs2",
			"commonjs-module", "commonjs-static", "amd", "amd-require", "umd",
			"umd2", "jsonp", "system"
		]
	}, {
		"type": "string"
	}]
};
const schema38 = {
	"type": "boolean"
};
const schema32 = {
	"anyOf": [{
		"type": "string"
	}, {
		"$ref": "#/definitions/LibraryCustomUmdCommentObject"
	}]
};
const schema33 = {
	"type": "object",
	"additionalProperties": false,
	"properties": {
		"amd": {
			"type": "string"
		},
		"commonjs": {
			"type": "string"
		},
		"commonjs2": {
			"type": "string"
		},
		"root": {
			"type": "string"
		}
	}
};

function validate31(data, {
	instancePath = "",
	parentData,
	parentDataProperty,
	rootData = data
} = {}) {
	let vErrors = null;
	let errors = 0;
	const _errs0 = errors;
	let valid0 = false;
	const _errs1 = errors;
	if (typeof data !== "string") {
		const err0 = {
			params: {
				type: "string"
			}
		};
		if (vErrors === null) {
			vErrors = [err0];
		} else {
			vErrors.push(err0);
		}
		errors++;
	}
	var _valid0 = _errs1 === errors;
	valid0 = valid0 || _valid0;
	if (!valid0) {
		const _errs3 = errors;
		const _errs4 = errors;
		if (errors === _errs4) {
			if (data && typeof data == "object" && !Array.isArray(data)) {
				const _errs6 = errors;
				for (const key0 in data) {
					if (!((((key0 === "amd") || (key0 === "commonjs")) || (key0 ===
							"commonjs2")) || (key0 === "root"))) {
						const err1 = {
							params: {
								additionalProperty: key0
							}
						};
						if (vErrors === null) {
							vErrors = [err1];
						} else {
							vErrors.push(err1);
						}
						errors++;
						break;
					}
				}
				if (_errs6 === errors) {
					if (data.amd !== undefined) {
						const _errs7 = errors;
						if (typeof data.amd !== "string") {
							const err2 = {
								params: {
									type: "string"
								}
							};
							if (vErrors === null) {
								vErrors = [err2];
							} else {
								vErrors.push(err2);
							}
							errors++;
						}
						var valid2 = _errs7 === errors;
					} else {
						var valid2 = true;
					}
					if (valid2) {
						if (data.commonjs !== undefined) {
							const _errs9 = errors;
							if (typeof data.commonjs !== "string") {
								const err3 = {
									params: {
										type: "string"
									}
								};
								if (vErrors === null) {
									vErrors = [err3];
								} else {
									vErrors.push(err3);
								}
								errors++;
							}
							var valid2 = _errs9 === errors;
						} else {
							var valid2 = true;
						}
						if (valid2) {
							if (data.commonjs2 !== undefined) {
								const _errs11 = errors;
								if (typeof data.commonjs2 !== "string") {
									const err4 = {
										params: {
											type: "string"
										}
									};
									if (vErrors === null) {
										vErrors = [err4];
									} else {
										vErrors.push(err4);
									}
									errors++;
								}
								var valid2 = _errs11 === errors;
							} else {
								var valid2 = true;
							}
							if (valid2) {
								if (data.root !== undefined) {
									const _errs13 = errors;
									if (typeof data.root !== "string") {
										const err5 = {
											params: {
												type: "string"
											}
										};
										if (vErrors === null) {
											vErrors = [err5];
										} else {
											vErrors.push(err5);
										}
										errors++;
									}
									var valid2 = _errs13 === errors;
								} else {
									var valid2 = true;
								}
							}
						}
					}
				}
			} else {
				const err6 = {
					params: {
						type: "object"
					}
				};
				if (vErrors === null) {
					vErrors = [err6];
				} else {
					vErrors.push(err6);
				}
				errors++;
			}
		}
		var _valid0 = _errs3 === errors;
		valid0 = valid0 || _valid0;
	}
	if (!valid0) {
		const err7 = {
			params: {}
		};
		if (vErrors === null) {
			vErrors = [err7];
		} else {
			vErrors.push(err7);
		}
		errors++;
		validate31.errors = vErrors;
		return false;
	} else {
		errors = _errs0;
		if (vErrors !== null) {
			if (_errs0) {
				vErrors.length = _errs0;
			} else {
				vErrors = null;
			}
		}
	}
	validate31.errors = vErrors;
	return errors === 0;
}
const schema35 = {
	"anyOf": [{
		"type": "array",
		"items": {
			"type": "string",
			"minLength": 1
		},
		"minItems": 1
	}, {
		"type": "string",
		"minLength": 1
	}, {
		"$ref": "#/definitions/LibraryCustomUmdObject"
	}]
};
const schema36 = {
	"type": "object",
	"additionalProperties": false,
	"properties": {
		"amd": {
			"type": "string",
			"minLength": 1
		},
		"commonjs": {
			"type": "string",
			"minLength": 1
		},
		"root": {
			"anyOf": [{
				"type": "array",
				"items": {
					"type": "string",
					"minLength": 1
				}
			}, {
				"type": "string",
				"minLength": 1
			}]
		}
	}
};

function validate33(data, {
	instancePath = "",
	parentData,
	parentDataProperty,
	rootData = data
} = {}) {
	let vErrors = null;
	let errors = 0;
	const _errs0 = errors;
	let valid0 = false;
	const _errs1 = errors;
	if (errors === _errs1) {
		if (Array.isArray(data)) {
			if (data.length < 1) {
				const err0 = {
					params: {
						limit: 1
					}
				};
				if (vErrors === null) {
					vErrors = [err0];
				} else {
					vErrors.push(err0);
				}
				errors++;
			} else {
				var valid1 = true;
				const len0 = data.length;
				for (let i0 = 0; i0 < len0; i0++) {
					let data0 = data[i0];
					const _errs3 = errors;
					if (errors === _errs3) {
						if (typeof data0 === "string") {
							if (data0.length < 1) {
								const err1 = {
									params: {}
								};
								if (vErrors === null) {
									vErrors = [err1];
								} else {
									vErrors.push(err1);
								}
								errors++;
							}
						} else {
							const err2 = {
								params: {
									type: "string"
								}
							};
							if (vErrors === null) {
								vErrors = [err2];
							} else {
								vErrors.push(err2);
							}
							errors++;
						}
					}
					var valid1 = _errs3 === errors;
					if (!valid1) {
						break;
					}
				}
			}
		} else {
			const err3 = {
				params: {
					type: "array"
				}
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
	}
	var _valid0 = _errs1 === errors;
	valid0 = valid0 || _valid0;
	if (!valid0) {
		const _errs5 = errors;
		if (errors === _errs5) {
			if (typeof data === "string") {
				if (data.length < 1) {
					const err4 = {
						params: {}
					};
					if (vErrors === null) {
						vErrors = [err4];
					} else {
						vErrors.push(err4);
					}
					errors++;
				}
			} else {
				const err5 = {
					params: {
						type: "string"
					}
				};
				if (vErrors === null) {
					vErrors = [err5];
				} else {
					vErrors.push(err5);
				}
				errors++;
			}
		}
		var _valid0 = _errs5 === errors;
		valid0 = valid0 || _valid0;
		if (!valid0) {
			const _errs7 = errors;
			const _errs8 = errors;
			if (errors === _errs8) {
				if (data && typeof data == "object" && !Array.isArray(data)) {
					const _errs10 = errors;
					for (const key0 in data) {
						if (!(((key0 === "amd") || (key0 === "commonjs")) || (key0 ===
								"root"))) {
							const err6 = {
								params: {
									additionalProperty: key0
								}
							};
							if (vErrors === null) {
								vErrors = [err6];
							} else {
								vErrors.push(err6);
							}
							errors++;
							break;
						}
					}
					if (_errs10 === errors) {
						if (data.amd !== undefined) {
							let data1 = data.amd;
							const _errs11 = errors;
							if (errors === _errs11) {
								if (typeof data1 === "string") {
									if (data1.length < 1) {
										const err7 = {
											params: {}
										};
										if (vErrors === null) {
											vErrors = [err7];
										} else {
											vErrors.push(err7);
										}
										errors++;
									}
								} else {
									const err8 = {
										params: {
											type: "string"
										}
									};
									if (vErrors === null) {
										vErrors = [err8];
									} else {
										vErrors.push(err8);
									}
									errors++;
								}
							}
							var valid3 = _errs11 === errors;
						} else {
							var valid3 = true;
						}
						if (valid3) {
							if (data.commonjs !== undefined) {
								let data2 = data.commonjs;
								const _errs13 = errors;
								if (errors === _errs13) {
									if (typeof data2 === "string") {
										if (data2.length < 1) {
											const err9 = {
												params: {}
											};
											if (vErrors === null) {
												vErrors = [err9];
											} else {
												vErrors.push(err9);
											}
											errors++;
										}
									} else {
										const err10 = {
											params: {
												type: "string"
											}
										};
										if (vErrors === null) {
											vErrors = [err10];
										} else {
											vErrors.push(err10);
										}
										errors++;
									}
								}
								var valid3 = _errs13 === errors;
							} else {
								var valid3 = true;
							}
							if (valid3) {
								if (data.root !== undefined) {
									let data3 = data.root;
									const _errs15 = errors;
									const _errs16 = errors;
									let valid4 = false;
									const _errs17 = errors;
									if (errors === _errs17) {
										if (Array.isArray(data3)) {
											var valid5 = true;
											const len1 = data3.length;
											for (let i1 = 0; i1 < len1; i1++) {
												let data4 = data3[i1];
												const _errs19 = errors;
												if (errors === _errs19) {
													if (typeof data4 === "string") {
														if (data4.length < 1) {
															const err11 = {
																params: {}
															};
															if (vErrors === null) {
																vErrors = [err11];
															} else {
																vErrors.push(err11);
															}
															errors++;
														}
													} else {
														const err12 = {
															params: {
																type: "string"
															}
														};
														if (vErrors === null) {
															vErrors = [err12];
														} else {
															vErrors.push(err12);
														}
														errors++;
													}
												}
												var valid5 = _errs19 === errors;
												if (!valid5) {
													break;
												}
											}
										} else {
											const err13 = {
												params: {
													type: "array"
												}
											};
											if (vErrors === null) {
												vErrors = [err13];
											} else {
												vErrors.push(err13);
											}
											errors++;
										}
									}
									var _valid1 = _errs17 === errors;
									valid4 = valid4 || _valid1;
									if (!valid4) {
										const _errs21 = errors;
										if (errors === _errs21) {
											if (typeof data3 === "string") {
												if (data3.length < 1) {
													const err14 = {
														params: {}
													};
													if (vErrors === null) {
														vErrors = [err14];
													} else {
														vErrors.push(err14);
													}
													errors++;
												}
											} else {
												const err15 = {
													params: {
														type: "string"
													}
												};
												if (vErrors === null) {
													vErrors = [err15];
												} else {
													vErrors.push(err15);
												}
												errors++;
											}
										}
										var _valid1 = _errs21 === errors;
										valid4 = valid4 || _valid1;
									}
									if (!valid4) {
										const err16 = {
											params: {}
										};
										if (vErrors === null) {
											vErrors = [err16];
										} else {
											vErrors.push(err16);
										}
										errors++;
									} else {
										errors = _errs16;
										if (vErrors !== null) {
											if (_errs16) {
												vErrors.length = _errs16;
											} else {
												vErrors = null;
											}
										}
									}
									var valid3 = _errs15 === errors;
								} else {
									var valid3 = true;
								}
							}
						}
					}
				} else {
					const err17 = {
						params: {
							type: "object"
						}
					};
					if (vErrors === null) {
						vErrors = [err17];
					} else {
						vErrors.push(err17);
					}
					errors++;
				}
			}
			var _valid0 = _errs7 === errors;
			valid0 = valid0 || _valid0;
		}
	}
	if (!valid0) {
		const err18 = {
			params: {}
		};
		if (vErrors === null) {
			vErrors = [err18];
		} else {
			vErrors.push(err18);
		}
		errors++;
		validate33.errors = vErrors;
		return false;
	} else {
		errors = _errs0;
		if (vErrors !== null) {
			if (_errs0) {
				vErrors.length = _errs0;
			} else {
				vErrors = null;
			}
		}
	}
	validate33.errors = vErrors;
	return errors === 0;
}

function validate30(data, {
	instancePath = "",
	parentData,
	parentDataProperty,
	rootData = data
} = {}) {
	let vErrors = null;
	let errors = 0;
	if (errors === 0) {
		if (data && typeof data == "object" && !Array.isArray(data)) {
			let missing0;
			if ((data.type === undefined) && (missing0 = "type")) {
				validate30.errors = [{
					params: {
						missingProperty: missing0
					}
				}];
				return false;
			} else {
				const _errs1 = errors;
				for (const key0 in data) {
					if (!((((((key0 === "amdContainer") || (key0 ===
							"auxiliaryComment")) || (key0 === "export")) || (key0 ===
							"name")) || (key0 === "type")) || (key0 === "umdNamedDefine"))) {
						validate30.errors = [{
							params: {
								additionalProperty: key0
							}
						}];
						return false;
						break;
					}
				}
				if (_errs1 === errors) {
					if (data.amdContainer !== undefined) {
						let data0 = data.amdContainer;
						const _errs2 = errors;
						const _errs3 = errors;
						if (errors === _errs3) {
							if (typeof data0 === "string") {
								if (data0.length < 1) {
									validate30.errors = [{
										params: {}
									}];
									return false;
								}
							} else {
								validate30.errors = [{
									params: {
										type: "string"
									}
								}];
								return false;
							}
						}
						var valid0 = _errs2 === errors;
					} else {
						var valid0 = true;
					}
					if (valid0) {
						if (data.auxiliaryComment !== undefined) {
							const _errs5 = errors;
							if (!(validate31(data.auxiliaryComment, {
									instancePath: instancePath + "/auxiliaryComment",
									parentData: data,
									parentDataProperty: "auxiliaryComment",
									rootData
								}))) {
								vErrors = vErrors === null ? validate31.errors : vErrors.concat(
									validate31.errors);
								errors = vErrors.length;
							}
							var valid0 = _errs5 === errors;
						} else {
							var valid0 = true;
						}
						if (valid0) {
							if (data.export !== undefined) {
								let data2 = data.export;
								const _errs6 = errors;
								const _errs8 = errors;
								let valid3 = false;
								const _errs9 = errors;
								if (errors === _errs9) {
									if (Array.isArray(data2)) {
										var valid4 = true;
										const len0 = data2.length;
										for (let i0 = 0; i0 < len0; i0++) {
											let data3 = data2[i0];
											const _errs11 = errors;
											if (errors === _errs11) {
												if (typeof data3 === "string") {
													if (data3.length < 1) {
														const err0 = {
															params: {}
														};
														if (vErrors === null) {
															vErrors = [err0];
														} else {
															vErrors.push(err0);
														}
														errors++;
													}
												} else {
													const err1 = {
														params: {
															type: "string"
														}
													};
													if (vErrors === null) {
														vErrors = [err1];
													} else {
														vErrors.push(err1);
													}
													errors++;
												}
											}
											var valid4 = _errs11 === errors;
											if (!valid4) {
												break;
											}
										}
									} else {
										const err2 = {
											params: {
												type: "array"
											}
										};
										if (vErrors === null) {
											vErrors = [err2];
										} else {
											vErrors.push(err2);
										}
										errors++;
									}
								}
								var _valid0 = _errs9 === errors;
								valid3 = valid3 || _valid0;
								if (!valid3) {
									const _errs13 = errors;
									if (errors === _errs13) {
										if (typeof data2 === "string") {
											if (data2.length < 1) {
												const err3 = {
													params: {}
												};
												if (vErrors === null) {
													vErrors = [err3];
												} else {
													vErrors.push(err3);
												}
												errors++;
											}
										} else {
											const err4 = {
												params: {
													type: "string"
												}
											};
											if (vErrors === null) {
												vErrors = [err4];
											} else {
												vErrors.push(err4);
											}
											errors++;
										}
									}
									var _valid0 = _errs13 === errors;
									valid3 = valid3 || _valid0;
								}
								if (!valid3) {
									const err5 = {
										params: {}
									};
									if (vErrors === null) {
										vErrors = [err5];
									} else {
										vErrors.push(err5);
									}
									errors++;
									validate30.errors = vErrors;
									return false;
								} else {
									errors = _errs8;
									if (vErrors !== null) {
										if (_errs8) {
											vErrors.length = _errs8;
										} else {
											vErrors = null;
										}
									}
								}
								var valid0 = _errs6 === errors;
							} else {
								var valid0 = true;
							}
							if (valid0) {
								if (data.name !== undefined) {
									const _errs15 = errors;
									if (!(validate33(data.name, {
											instancePath: instancePath + "/name",
											parentData: data,
											parentDataProperty: "name",
											rootData
										}))) {
										vErrors = vErrors === null ? validate33.errors : vErrors
											.concat(validate33.errors);
										errors = vErrors.length;
									}
									var valid0 = _errs15 === errors;
								} else {
									var valid0 = true;
								}
								if (valid0) {
									if (data.type !== undefined) {
										let data5 = data.type;
										const _errs16 = errors;
										const _errs18 = errors;
										let valid6 = false;
										const _errs19 = errors;
										if (data5 !== "var" && data5 !== "module" && data5 !==
											"assign" && data5 !== "assign-properties" && data5 !==
											"this" && data5 !== "window" && data5 !== "self" &&
											data5 !== "global" && data5 !== "commonjs" && data5 !==
											"commonjs2" && data5 !== "commonjs-module" && data5 !==
											"commonjs-static" && data5 !== "amd" && data5 !==
											"amd-require" && data5 !== "umd" && data5 !== "umd2" &&
											data5 !== "jsonp" && data5 !== "system") {
											const err6 = {
												params: {}
											};
											if (vErrors === null) {
												vErrors = [err6];
											} else {
												vErrors.push(err6);
											}
											errors++;
										}
										var _valid1 = _errs19 === errors;
										valid6 = valid6 || _valid1;
										if (!valid6) {
											const _errs20 = errors;
											if (typeof data5 !== "string") {
												const err7 = {
													params: {
														type: "string"
													}
												};
												if (vErrors === null) {
													vErrors = [err7];
												} else {
													vErrors.push(err7);
												}
												errors++;
											}
											var _valid1 = _errs20 === errors;
											valid6 = valid6 || _valid1;
										}
										if (!valid6) {
											const err8 = {
												params: {}
											};
											if (vErrors === null) {
												vErrors = [err8];
											} else {
												vErrors.push(err8);
											}
											errors++;
											validate30.errors = vErrors;
											return false;
										} else {
											errors = _errs18;
											if (vErrors !== null) {
												if (_errs18) {
													vErrors.length = _errs18;
												} else {
													vErrors = null;
												}
											}
										}
										var valid0 = _errs16 === errors;
									} else {
										var valid0 = true;
									}
									if (valid0) {
										if (data.umdNamedDefine !== undefined) {
											const _errs22 = errors;
											if (typeof data.umdNamedDefine !== "boolean") {
												validate30.errors = [{
													params: {
														type: "boolean"
													}
												}];
												return false;
											}
											var valid0 = _errs22 === errors;
										} else {
											var valid0 = true;
										}
									}
								}
							}
						}
					}
				}
			}
		} else {
			validate30.errors = [{
				params: {
					type: "object"
				}
			}];
			return false;
		}
	}
	validate30.errors = vErrors;
	return errors === 0;
}

function validate19(data, {
	instancePath = "",
	parentData,
	parentDataProperty,
	rootData = data
} = {}) {
	/*# sourceURL="file:///Users/bytedance/work/webpack/schemas/plugins/container/ContainerPlugin.json" */ ;
	let vErrors = null;
	let errors = 0;
	if (errors === 0) {
		if (data && typeof data == "object" && !Array.isArray(data)) {
			let missing0;
			if (((data.name === undefined) && (missing0 = "name")) || ((data
					.exposes === undefined) && (missing0 = "exposes"))) {
				validate19.errors = [{
					params: {
						missingProperty: missing0
					}
				}];
				return false;
			} else {
				const _errs1 = errors;
				for (const key0 in data) {
					if (!(((((((key0 === "exposes") || (key0 === "filename")) || (key0 ===
								"library")) || (key0 === "name")) || (key0 === "runtime")) ||
							(key0 === "runtimePlugins")) || (key0 === "shareScope"))) {
						validate19.errors = [{
							params: {
								additionalProperty: key0
							}
						}];
						return false;
						break;
					}
				}
				if (_errs1 === errors) {
					if (data.exposes !== undefined) {
						const _errs2 = errors;
						if (!(validate20(data.exposes, {
								instancePath: instancePath + "/exposes",
								parentData: data,
								parentDataProperty: "exposes",
								rootData
							}))) {
							vErrors = vErrors === null ? validate20.errors : vErrors.concat(
								validate20.errors);
							errors = vErrors.length;
						}
						var valid0 = _errs2 === errors;
					} else {
						var valid0 = true;
					}
					if (valid0) {
						if (data.filename !== undefined) {
							let data1 = data.filename;
							const _errs3 = errors;
							if (errors === _errs3) {
								if (typeof data1 === "string") {
									if (data1.includes("!") || (absolutePathRegExp.test(data1) !==
											false)) {
										validate19.errors = [{
											params: {}
										}];
										return false;
									} else {
										if (data1.length < 1) {
											validate19.errors = [{
												params: {}
											}];
											return false;
										}
									}
								} else {
									validate19.errors = [{
										params: {
											type: "string"
										}
									}];
									return false;
								}
							}
							var valid0 = _errs3 === errors;
						} else {
							var valid0 = true;
						}
						if (valid0) {
							if (data.library !== undefined) {
								const _errs5 = errors;
								if (!(validate30(data.library, {
										instancePath: instancePath + "/library",
										parentData: data,
										parentDataProperty: "library",
										rootData
									}))) {
									vErrors = vErrors === null ? validate30.errors : vErrors
										.concat(validate30.errors);
									errors = vErrors.length;
								}
								var valid0 = _errs5 === errors;
							} else {
								var valid0 = true;
							}
							if (valid0) {
								if (data.name !== undefined) {
									let data3 = data.name;
									const _errs6 = errors;
									if (errors === _errs6) {
										if (typeof data3 === "string") {
											if (data3.length < 1) {
												validate19.errors = [{
													params: {}
												}];
												return false;
											}
										} else {
											validate19.errors = [{
												params: {
													type: "string"
												}
											}];
											return false;
										}
									}
									var valid0 = _errs6 === errors;
								} else {
									var valid0 = true;
								}
								if (valid0) {
									if (data.runtime !== undefined) {
										let data4 = data.runtime;
										const _errs8 = errors;
										const _errs10 = errors;
										let valid2 = false;
										const _errs11 = errors;
										if (data4 !== false) {
											const err0 = {
												params: {}
											};
											if (vErrors === null) {
												vErrors = [err0];
											} else {
												vErrors.push(err0);
											}
											errors++;
										}
										var _valid0 = _errs11 === errors;
										valid2 = valid2 || _valid0;
										if (!valid2) {
											const _errs12 = errors;
											if (errors === _errs12) {
												if (typeof data4 === "string") {
													if (data4.length < 1) {
														const err1 = {
															params: {}
														};
														if (vErrors === null) {
															vErrors = [err1];
														} else {
															vErrors.push(err1);
														}
														errors++;
													}
												} else {
													const err2 = {
														params: {
															type: "string"
														}
													};
													if (vErrors === null) {
														vErrors = [err2];
													} else {
														vErrors.push(err2);
													}
													errors++;
												}
											}
											var _valid0 = _errs12 === errors;
											valid2 = valid2 || _valid0;
										}
										if (!valid2) {
											const err3 = {
												params: {}
											};
											if (vErrors === null) {
												vErrors = [err3];
											} else {
												vErrors.push(err3);
											}
											errors++;
											validate19.errors = vErrors;
											return false;
										} else {
											errors = _errs10;
											if (vErrors !== null) {
												if (_errs10) {
													vErrors.length = _errs10;
												} else {
													vErrors = null;
												}
											}
										}
										var valid0 = _errs8 === errors;
									} else {
										var valid0 = true;
									}
									if (valid0) {
										if (data.runtimePlugins !== undefined) {
											let data5 = data.runtimePlugins;
											const _errs14 = errors;
											if (errors === _errs14) {
												if (Array.isArray(data5)) {
													var valid3 = true;
													const len0 = data5.length;
													for (let i0 = 0; i0 < len0; i0++) {
														let data6 = data5[i0];
														const _errs16 = errors;
														if (errors === _errs16) {
															if (typeof data6 === "string") {
																if (data6.length < 1) {
																	validate19.errors = [{
																		params: {}
																	}];
																	return false;
																}
															} else {
																validate19.errors = [{
																	params: {
																		type: "string"
																	}
																}];
																return false;
															}
														}
														var valid3 = _errs16 === errors;
														if (!valid3) {
															break;
														}
													}
												} else {
													validate19.errors = [{
														params: {
															type: "array"
														}
													}];
													return false;
												}
											}
											var valid0 = _errs14 === errors;
										} else {
											var valid0 = true;
										}
										if (valid0) {
											if (data.shareScope !== undefined) {
												let data7 = data.shareScope;
												const _errs18 = errors;
												if (errors === _errs18) {
													if (typeof data7 === "string") {
														if (data7.length < 1) {
															validate19.errors = [{
																params: {}
															}];
															return false;
														}
													} else {
														validate19.errors = [{
															params: {
																type: "string"
															}
														}];
														return false;
													}
												}
												var valid0 = _errs18 === errors;
											} else {
												var valid0 = true;
											}
										}
									}
								}
							}
						}
					}
				}
			}
		} else {
			validate19.errors = [{
				params: {
					type: "object"
				}
			}];
			return false;
		}
	}
	validate19.errors = vErrors;
	return errors === 0;
}
export default validate19;
