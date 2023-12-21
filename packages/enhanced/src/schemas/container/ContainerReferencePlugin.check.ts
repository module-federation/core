/* eslint-disable */
//@ts-nocheck
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn special-lint-fix` to update
 */

const schema40 = {
  definitions: {
    ExternalsType: {
      enum: [
        'var',
        'module',
        'assign',
        'this',
        'window',
        'self',
        'global',
        'commonjs',
        'commonjs2',
        'commonjs-module',
        'commonjs-static',
        'amd',
        'amd-require',
        'umd',
        'umd2',
        'jsonp',
        'system',
        'promise',
        'import',
        'script',
        'node-commonjs',
      ],
    },
    Remotes: {
      anyOf: [
        {
          type: 'array',
          items: {
            anyOf: [
              {
                $ref: '#/definitions/RemotesItem',
              },
              {
                $ref: '#/definitions/RemotesObject',
              },
            ],
          },
        },
        {
          $ref: '#/definitions/RemotesObject',
        },
      ],
    },
    RemotesConfig: {
      type: 'object',
      additionalProperties: false,
      properties: {
        external: {
          anyOf: [
            {
              $ref: '#/definitions/RemotesItem',
            },
            {
              $ref: '#/definitions/RemotesItems',
            },
          ],
        },
        shareScope: {
          type: 'string',
          minLength: 1,
        },
      },
      required: ['external'],
    },
    RemotesItem: {
      type: 'string',
      minLength: 1,
    },
    RemotesItems: {
      type: 'array',
      items: {
        $ref: '#/definitions/RemotesItem',
      },
    },
    RemotesObject: {
      type: 'object',
      additionalProperties: {
        anyOf: [
          {
            $ref: '#/definitions/RemotesConfig',
          },
          {
            $ref: '#/definitions/RemotesItem',
          },
          {
            $ref: '#/definitions/RemotesItems',
          },
        ],
      },
    },
  },
  type: 'object',
  additionalProperties: false,
  properties: {
    remoteType: {
      oneOf: [
        {
          $ref: '#/definitions/ExternalsType',
        },
      ],
    },
    remotes: {
      $ref: '#/definitions/Remotes',
    },
    shareScope: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['remoteType', 'remotes'],
};
const schema41 = {
  enum: [
    'var',
    'module',
    'assign',
    'this',
    'window',
    'self',
    'global',
    'commonjs',
    'commonjs2',
    'commonjs-module',
    'commonjs-static',
    'amd',
    'amd-require',
    'umd',
    'umd2',
    'jsonp',
    'system',
    'promise',
    'import',
    'script',
    'node-commonjs',
  ],
};
const schema42 = {
  anyOf: [
    {
      type: 'array',
      items: {
        anyOf: [
          {
            $ref: '#/definitions/RemotesItem',
          },
          {
            $ref: '#/definitions/RemotesObject',
          },
        ],
      },
    },
    {
      $ref: '#/definitions/RemotesObject',
    },
  ],
};
const schema43 = {
  type: 'string',
  minLength: 1,
};
const schema44 = {
  type: 'object',
  additionalProperties: {
    anyOf: [
      {
        $ref: '#/definitions/RemotesConfig',
      },
      {
        $ref: '#/definitions/RemotesItem',
      },
      {
        $ref: '#/definitions/RemotesItems',
      },
    ],
  },
};
const schema45 = {
  type: 'object',
  additionalProperties: false,
  properties: {
    external: {
      anyOf: [
        {
          $ref: '#/definitions/RemotesItem',
        },
        {
          $ref: '#/definitions/RemotesItems',
        },
      ],
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    shareScope: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['external'],
};
const schema47 = {
  type: 'array',
  items: {
    $ref: '#/definitions/RemotesItem',
  },
};

function validate40(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
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
          if (typeof data0 === 'string') {
            if (data0.length < 1) {
              validate40.errors = [
                {
                  params: {},
                },
              ];
              return false;
            }
          } else {
            validate40.errors = [
              {
                params: {
                  type: 'string',
                },
              },
            ];
            return false;
          }
        }
        var valid0 = _errs1 === errors;
        if (!valid0) {
          break;
        }
      }
    } else {
      validate40.errors = [
        {
          params: {
            type: 'array',
          },
        },
      ];
      return false;
    }
  }
  validate40.errors = vErrors;
  return errors === 0;
}

function validate39(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == 'object' && !Array.isArray(data)) {
      let missing0;
      if (data.external === undefined && (missing0 = 'external')) {
        validate39.errors = [
          {
            params: {
              missingProperty: missing0,
            },
          },
        ];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === 'external' || key0 === 'shareScope')) {
            validate39.errors = [
              {
                params: {
                  additionalProperty: key0,
                },
              },
            ];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.external !== undefined) {
            let data0 = data.external;
            const _errs2 = errors;
            const _errs3 = errors;
            let valid1 = false;
            const _errs4 = errors;
            const _errs5 = errors;
            if (errors === _errs5) {
              if (typeof data0 === 'string') {
                if (data0.length < 1) {
                  const err0 = {
                    params: {},
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
                    type: 'string',
                  },
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
              if (
                !validate40(data0, {
                  instancePath: instancePath + '/external',
                  parentData: data,
                  parentDataProperty: 'external',
                  rootData,
                })
              ) {
                vErrors =
                  vErrors === null
                    ? validate40.errors
                    : vErrors.concat(validate40.errors);
                errors = vErrors.length;
              }
              var _valid0 = _errs7 === errors;
              valid1 = valid1 || _valid0;
            }
            if (!valid1) {
              const err2 = {
                params: {},
              };
              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
              validate39.errors = vErrors;
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
              let data1 = data.name;
              const _errs8 = errors;
              if (errors === _errs8) {
                if (typeof data1 === 'string') {
                  if (data1.length < 1) {
                    validate39.errors = [
                      {
                        params: {},
                      },
                    ];
                    return false;
                  }
                } else {
                  validate39.errors = [
                    {
                      params: {
                        type: 'string',
                      },
                    },
                  ];
                  return false;
                }
              }
              var valid0 = _errs8 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.shareScope !== undefined) {
                let data2 = data.shareScope;
                const _errs10 = errors;
                if (errors === _errs10) {
                  if (typeof data2 === 'string') {
                    if (data2.length < 1) {
                      validate39.errors = [
                        {
                          params: {},
                        },
                      ];
                      return false;
                    }
                  } else {
                    validate39.errors = [
                      {
                        params: {
                          type: 'string',
                        },
                      },
                    ];
                    return false;
                  }
                }
                var valid0 = _errs10 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate39.errors = [
        {
          params: {
            type: 'object',
          },
        },
      ];
      return false;
    }
  }
  validate39.errors = vErrors;
  return errors === 0;
}

function validate38(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == 'object' && !Array.isArray(data)) {
      for (const key0 in data) {
        let data0 = data[key0];
        const _errs2 = errors;
        const _errs3 = errors;
        let valid1 = false;
        const _errs4 = errors;
        if (
          !validate39(data0, {
            instancePath:
              instancePath +
              '/' +
              key0.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: data,
            parentDataProperty: key0,
            rootData,
          })
        ) {
          vErrors =
            vErrors === null
              ? validate39.errors
              : vErrors.concat(validate39.errors);
          errors = vErrors.length;
        }
        var _valid0 = _errs4 === errors;
        valid1 = valid1 || _valid0;
        if (!valid1) {
          const _errs5 = errors;
          const _errs6 = errors;
          if (errors === _errs6) {
            if (typeof data0 === 'string') {
              if (data0.length < 1) {
                const err0 = {
                  params: {},
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
                  type: 'string',
                },
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
            if (
              !validate40(data0, {
                instancePath:
                  instancePath +
                  '/' +
                  key0.replace(/~/g, '~0').replace(/\//g, '~1'),
                parentData: data,
                parentDataProperty: key0,
                rootData,
              })
            ) {
              vErrors =
                vErrors === null
                  ? validate40.errors
                  : vErrors.concat(validate40.errors);
              errors = vErrors.length;
            }
            var _valid0 = _errs8 === errors;
            valid1 = valid1 || _valid0;
          }
        }
        if (!valid1) {
          const err2 = {
            params: {},
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
          validate38.errors = vErrors;
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
      validate38.errors = [
        {
          params: {
            type: 'object',
          },
        },
      ];
      return false;
    }
  }
  validate38.errors = vErrors;
  return errors === 0;
}

function validate37(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
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
          if (typeof data0 === 'string') {
            if (data0.length < 1) {
              const err0 = {
                params: {},
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
                type: 'string',
              },
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
          if (
            !validate38(data0, {
              instancePath: instancePath + '/' + i0,
              parentData: data,
              parentDataProperty: i0,
              rootData,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate38.errors
                : vErrors.concat(validate38.errors);
            errors = vErrors.length;
          }
          var _valid1 = _errs8 === errors;
          valid2 = valid2 || _valid1;
        }
        if (!valid2) {
          const err2 = {
            params: {},
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
          type: 'array',
        },
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
    if (
      !validate38(data, {
        instancePath,
        parentData,
        parentDataProperty,
        rootData,
      })
    ) {
      vErrors =
        vErrors === null
          ? validate38.errors
          : vErrors.concat(validate38.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs9 === errors;
    valid0 = valid0 || _valid0;
  }
  if (!valid0) {
    const err4 = {
      params: {},
    };
    if (vErrors === null) {
      vErrors = [err4];
    } else {
      vErrors.push(err4);
    }
    errors++;
    validate37.errors = vErrors;
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
  validate37.errors = vErrors;
  return errors === 0;
}

function validate36(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  /*# sourceURL="file:///Users/bytedance/work/webpack/schemas/plugins/container/ContainerReferencePlugin.json" */ let vErrors =
    null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == 'object' && !Array.isArray(data)) {
      let missing0;
      if (
        (data.remoteType === undefined && (missing0 = 'remoteType')) ||
        (data.remotes === undefined && (missing0 = 'remotes'))
      ) {
        validate36.errors = [
          {
            params: {
              missingProperty: missing0,
            },
          },
        ];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (
            !(
              key0 === 'remoteType' ||
              key0 === 'remotes' ||
              key0 === 'shareScope'
            )
          ) {
            validate36.errors = [
              {
                params: {
                  additionalProperty: key0,
                },
              },
            ];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.remoteType !== undefined) {
            let data0 = data.remoteType;
            const _errs2 = errors;
            const _errs3 = errors;
            let valid1 = false;
            let passing0 = null;
            const _errs4 = errors;
            if (
              data0 !== 'var' &&
              data0 !== 'module' &&
              data0 !== 'assign' &&
              data0 !== 'this' &&
              data0 !== 'window' &&
              data0 !== 'self' &&
              data0 !== 'global' &&
              data0 !== 'commonjs' &&
              data0 !== 'commonjs2' &&
              data0 !== 'commonjs-module' &&
              data0 !== 'commonjs-static' &&
              data0 !== 'amd' &&
              data0 !== 'amd-require' &&
              data0 !== 'umd' &&
              data0 !== 'umd2' &&
              data0 !== 'jsonp' &&
              data0 !== 'system' &&
              data0 !== 'promise' &&
              data0 !== 'import' &&
              data0 !== 'script' &&
              data0 !== 'node-commonjs'
            ) {
              const err0 = {
                params: {},
              };
              if (vErrors === null) {
                vErrors = [err0];
              } else {
                vErrors.push(err0);
              }
              errors++;
            }
            var _valid0 = _errs4 === errors;
            if (_valid0) {
              valid1 = true;
              passing0 = 0;
            }
            if (!valid1) {
              const err1 = {
                params: {
                  passingSchemas: passing0,
                },
              };
              if (vErrors === null) {
                vErrors = [err1];
              } else {
                vErrors.push(err1);
              }
              errors++;
              validate36.errors = vErrors;
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
            if (data.remotes !== undefined) {
              const _errs6 = errors;
              if (
                !validate37(data.remotes, {
                  instancePath: instancePath + '/remotes',
                  parentData: data,
                  parentDataProperty: 'remotes',
                  rootData,
                })
              ) {
                vErrors =
                  vErrors === null
                    ? validate37.errors
                    : vErrors.concat(validate37.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs6 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.shareScope !== undefined) {
                let data2 = data.shareScope;
                const _errs7 = errors;
                if (errors === _errs7) {
                  if (typeof data2 === 'string') {
                    if (data2.length < 1) {
                      validate36.errors = [
                        {
                          params: {},
                        },
                      ];
                      return false;
                    }
                  } else {
                    validate36.errors = [
                      {
                        params: {
                          type: 'string',
                        },
                      },
                    ];
                    return false;
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate36.errors = [
        {
          params: {
            type: 'object',
          },
        },
      ];
      return false;
    }
  }
  validate36.errors = vErrors;
  return errors === 0;
}

export default validate36;
