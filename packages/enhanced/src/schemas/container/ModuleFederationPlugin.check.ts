/* eslint-disable */
//@ts-nocheck
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn special-lint-fix` to update
 */
const absolutePathRegExp = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
('use strict');

const schema51 = {
  definitions: {
    AmdContainer: {
      type: 'string',
      minLength: 1,
    },
    AuxiliaryComment: {
      anyOf: [
        {
          type: 'string',
        },
        {
          $ref: '#/definitions/LibraryCustomUmdCommentObject',
        },
      ],
    },
    EntryRuntime: {
      anyOf: [
        {
          enum: [false],
        },
        {
          type: 'string',
          minLength: 1,
        },
      ],
    },
    Exposes: {
      anyOf: [
        {
          type: 'array',
          items: {
            anyOf: [
              {
                $ref: '#/definitions/ExposesItem',
              },
              {
                $ref: '#/definitions/ExposesObject',
              },
            ],
          },
        },
        {
          $ref: '#/definitions/ExposesObject',
        },
      ],
    },
    ExposesConfig: {
      type: 'object',
      additionalProperties: false,
      properties: {
        import: {
          anyOf: [
            {
              $ref: '#/definitions/ExposesItem',
            },
            {
              $ref: '#/definitions/ExposesItems',
            },
          ],
        },
        name: {
          type: 'string',
        },
      },
      required: ['import'],
    },
    ExposesItem: {
      type: 'string',
      minLength: 1,
    },
    ExposesItems: {
      type: 'array',
      items: {
        $ref: '#/definitions/ExposesItem',
      },
    },
    ExposesObject: {
      type: 'object',
      additionalProperties: {
        anyOf: [
          {
            $ref: '#/definitions/ExposesConfig',
          },
          {
            $ref: '#/definitions/ExposesItem',
          },
          {
            $ref: '#/definitions/ExposesItems',
          },
        ],
      },
    },
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
    LibraryCustomUmdCommentObject: {
      type: 'object',
      additionalProperties: false,
      properties: {
        amd: {
          type: 'string',
        },
        commonjs: {
          type: 'string',
        },
        commonjs2: {
          type: 'string',
        },
        root: {
          type: 'string',
        },
      },
    },
    LibraryCustomUmdObject: {
      type: 'object',
      additionalProperties: false,
      properties: {
        amd: {
          type: 'string',
          minLength: 1,
        },
        commonjs: {
          type: 'string',
          minLength: 1,
        },
        root: {
          anyOf: [
            {
              type: 'array',
              items: {
                type: 'string',
                minLength: 1,
              },
            },
            {
              type: 'string',
              minLength: 1,
            },
          ],
        },
      },
    },
    LibraryExport: {
      anyOf: [
        {
          type: 'array',
          items: {
            type: 'string',
            minLength: 1,
          },
        },
        {
          type: 'string',
          minLength: 1,
        },
      ],
    },
    LibraryName: {
      anyOf: [
        {
          type: 'array',
          items: {
            type: 'string',
            minLength: 1,
          },
          minItems: 1,
        },
        {
          type: 'string',
          minLength: 1,
        },
        {
          $ref: '#/definitions/LibraryCustomUmdObject',
        },
      ],
    },
    LibraryOptions: {
      type: 'object',
      additionalProperties: false,
      properties: {
        amdContainer: {
          $ref: '#/definitions/AmdContainer',
        },
        auxiliaryComment: {
          $ref: '#/definitions/AuxiliaryComment',
        },
        export: {
          $ref: '#/definitions/LibraryExport',
        },
        name: {
          $ref: '#/definitions/LibraryName',
        },
        type: {
          $ref: '#/definitions/LibraryType',
        },
        umdNamedDefine: {
          $ref: '#/definitions/UmdNamedDefine',
        },
      },
      required: ['type'],
    },
    LibraryType: {
      anyOf: [
        {
          enum: [
            'var',
            'module',
            'assign',
            'assign-properties',
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
          ],
        },
        {
          type: 'string',
        },
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
    Shared: {
      anyOf: [
        {
          type: 'array',
          items: {
            anyOf: [
              {
                $ref: '#/definitions/SharedItem',
              },
              {
                $ref: '#/definitions/SharedObject',
              },
            ],
          },
        },
        {
          $ref: '#/definitions/SharedObject',
        },
      ],
    },
    SharedConfig: {
      type: 'object',
      additionalProperties: false,
      properties: {
        eager: {
          type: 'boolean',
        },
        import: {
          anyOf: [
            {
              enum: [false],
            },
            {
              $ref: '#/definitions/SharedItem',
            },
          ],
        },
        packageName: {
          type: 'string',
          minLength: 1,
        },
        requiredVersion: {
          anyOf: [
            {
              enum: [false],
            },
            {
              type: 'string',
            },
          ],
        },
        shareKey: {
          type: 'string',
          minLength: 1,
        },
        shareScope: {
          type: 'string',
          minLength: 1,
        },
        singleton: {
          type: 'boolean',
        },
        strictVersion: {
          type: 'boolean',
        },
        version: {
          anyOf: [
            {
              enum: [false],
            },
            {
              type: 'string',
            },
          ],
        },
      },
    },
    SharedItem: {
      type: 'string',
      minLength: 1,
    },
    SharedObject: {
      type: 'object',
      additionalProperties: {
        anyOf: [
          {
            $ref: '#/definitions/SharedConfig',
          },
          {
            $ref: '#/definitions/SharedItem',
          },
        ],
      },
    },
    UmdNamedDefine: {
      type: 'boolean',
    },
  },
  type: 'object',
  additionalProperties: false,
  properties: {
    exposes: {
      $ref: '#/definitions/Exposes',
    },
    filename: {
      type: 'string',
      absolutePath: false,
    },
    implementation: {
      type: 'string',
      minLength: 1,
    },
    library: {
      $ref: '#/definitions/LibraryOptions',
    },
    name: {
      type: 'string',
    },
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
    runtime: {
      $ref: '#/definitions/EntryRuntime',
    },
    runtimePlugins: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
    },
    shareScope: {
      type: 'string',
      minLength: 1,
    },
    shared: {
      $ref: '#/definitions/Shared',
    },
  },
};
const schema69 = {
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
const schema78 = {
  anyOf: [
    {
      enum: [false],
    },
    {
      type: 'string',
      minLength: 1,
    },
  ],
};
const func2 = Object.prototype.hasOwnProperty;
const schema52 = {
  anyOf: [
    {
      type: 'array',
      items: {
        anyOf: [
          {
            $ref: '#/definitions/ExposesItem',
          },
          {
            $ref: '#/definitions/ExposesObject',
          },
        ],
      },
    },
    {
      $ref: '#/definitions/ExposesObject',
    },
  ],
};
const schema53 = {
  type: 'string',
  minLength: 1,
};
const schema54 = {
  type: 'object',
  additionalProperties: {
    anyOf: [
      {
        $ref: '#/definitions/ExposesConfig',
      },
      {
        $ref: '#/definitions/ExposesItem',
      },
      {
        $ref: '#/definitions/ExposesItems',
      },
    ],
  },
};
const schema55 = {
  type: 'object',
  additionalProperties: false,
  properties: {
    import: {
      anyOf: [
        {
          $ref: '#/definitions/ExposesItem',
        },
        {
          $ref: '#/definitions/ExposesItems',
        },
      ],
    },
    name: {
      type: 'string',
    },
  },
  required: ['import'],
};
const schema57 = {
  type: 'array',
  items: {
    $ref: '#/definitions/ExposesItem',
  },
};

function validate52(
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
              validate52.errors = [
                {
                  params: {},
                },
              ];
              return false;
            }
          } else {
            validate52.errors = [
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
      validate52.errors = [
        {
          params: {
            type: 'array',
          },
        },
      ];
      return false;
    }
  }
  validate52.errors = vErrors;
  return errors === 0;
}

function validate51(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == 'object' && !Array.isArray(data)) {
      let missing0;
      if (data.import === undefined && (missing0 = 'import')) {
        validate51.errors = [
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
          if (!(key0 === 'import' || key0 === 'name')) {
            validate51.errors = [
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
          if (data.import !== undefined) {
            let data0 = data.import;
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
                !validate52(data0, {
                  instancePath: instancePath + '/import',
                  parentData: data,
                  parentDataProperty: 'import',
                  rootData,
                })
              ) {
                vErrors =
                  vErrors === null
                    ? validate52.errors
                    : vErrors.concat(validate52.errors);
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
              validate51.errors = vErrors;
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
              if (typeof data.name !== 'string') {
                validate51.errors = [
                  {
                    params: {
                      type: 'string',
                    },
                  },
                ];
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
      validate51.errors = [
        {
          params: {
            type: 'object',
          },
        },
      ];
      return false;
    }
  }
  validate51.errors = vErrors;
  return errors === 0;
}

function validate50(
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
          !validate51(data0, {
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
              ? validate51.errors
              : vErrors.concat(validate51.errors);
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
              !validate52(data0, {
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
                  ? validate52.errors
                  : vErrors.concat(validate52.errors);
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
          validate50.errors = vErrors;
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
      validate50.errors = [
        {
          params: {
            type: 'object',
          },
        },
      ];
      return false;
    }
  }
  validate50.errors = vErrors;
  return errors === 0;
}

function validate49(
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
            !validate50(data0, {
              instancePath: instancePath + '/' + i0,
              parentData: data,
              parentDataProperty: i0,
              rootData,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate50.errors
                : vErrors.concat(validate50.errors);
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
      !validate50(data, {
        instancePath,
        parentData,
        parentDataProperty,
        rootData,
      })
    ) {
      vErrors =
        vErrors === null
          ? validate50.errors
          : vErrors.concat(validate50.errors);
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
    validate49.errors = vErrors;
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
  validate49.errors = vErrors;
  return errors === 0;
}
const schema60 = {
  type: 'object',
  additionalProperties: false,
  properties: {
    amdContainer: {
      $ref: '#/definitions/AmdContainer',
    },
    auxiliaryComment: {
      $ref: '#/definitions/AuxiliaryComment',
    },
    export: {
      $ref: '#/definitions/LibraryExport',
    },
    name: {
      $ref: '#/definitions/LibraryName',
    },
    type: {
      $ref: '#/definitions/LibraryType',
    },
    umdNamedDefine: {
      $ref: '#/definitions/UmdNamedDefine',
    },
  },
  required: ['type'],
};
const schema61 = {
  type: 'string',
  minLength: 1,
};
const schema64 = {
  anyOf: [
    {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
    },
    {
      type: 'string',
      minLength: 1,
    },
  ],
};
const schema67 = {
  anyOf: [
    {
      enum: [
        'var',
        'module',
        'assign',
        'assign-properties',
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
      ],
    },
    {
      type: 'string',
    },
  ],
};
const schema68 = {
  type: 'boolean',
};
const schema62 = {
  anyOf: [
    {
      type: 'string',
    },
    {
      $ref: '#/definitions/LibraryCustomUmdCommentObject',
    },
  ],
};
const schema63 = {
  type: 'object',
  additionalProperties: false,
  properties: {
    amd: {
      type: 'string',
    },
    commonjs: {
      type: 'string',
    },
    commonjs2: {
      type: 'string',
    },
    root: {
      type: 'string',
    },
  },
};

function validate60(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (typeof data !== 'string') {
    const err0 = {
      params: {
        type: 'string',
      },
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
      if (data && typeof data == 'object' && !Array.isArray(data)) {
        const _errs6 = errors;
        for (const key0 in data) {
          if (
            !(
              key0 === 'amd' ||
              key0 === 'commonjs' ||
              key0 === 'commonjs2' ||
              key0 === 'root'
            )
          ) {
            const err1 = {
              params: {
                additionalProperty: key0,
              },
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
            if (typeof data.amd !== 'string') {
              const err2 = {
                params: {
                  type: 'string',
                },
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
              if (typeof data.commonjs !== 'string') {
                const err3 = {
                  params: {
                    type: 'string',
                  },
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
                if (typeof data.commonjs2 !== 'string') {
                  const err4 = {
                    params: {
                      type: 'string',
                    },
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
                  if (typeof data.root !== 'string') {
                    const err5 = {
                      params: {
                        type: 'string',
                      },
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
            type: 'object',
          },
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
      params: {},
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
    validate60.errors = vErrors;
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
  validate60.errors = vErrors;
  return errors === 0;
}
const schema65 = {
  anyOf: [
    {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
      minItems: 1,
    },
    {
      type: 'string',
      minLength: 1,
    },
    {
      $ref: '#/definitions/LibraryCustomUmdObject',
    },
  ],
};
const schema66 = {
  type: 'object',
  additionalProperties: false,
  properties: {
    amd: {
      type: 'string',
      minLength: 1,
    },
    commonjs: {
      type: 'string',
      minLength: 1,
    },
    root: {
      anyOf: [
        {
          type: 'array',
          items: {
            type: 'string',
            minLength: 1,
          },
        },
        {
          type: 'string',
          minLength: 1,
        },
      ],
    },
  },
};

function validate62(
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
      if (data.length < 1) {
        const err0 = {
          params: {
            limit: 1,
          },
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
            if (typeof data0 === 'string') {
              if (data0.length < 1) {
                const err1 = {
                  params: {},
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
                  type: 'string',
                },
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
    const _errs5 = errors;
    if (errors === _errs5) {
      if (typeof data === 'string') {
        if (data.length < 1) {
          const err4 = {
            params: {},
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
            type: 'string',
          },
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
        if (data && typeof data == 'object' && !Array.isArray(data)) {
          const _errs10 = errors;
          for (const key0 in data) {
            if (!(key0 === 'amd' || key0 === 'commonjs' || key0 === 'root')) {
              const err6 = {
                params: {
                  additionalProperty: key0,
                },
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
                if (typeof data1 === 'string') {
                  if (data1.length < 1) {
                    const err7 = {
                      params: {},
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
                      type: 'string',
                    },
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
                  if (typeof data2 === 'string') {
                    if (data2.length < 1) {
                      const err9 = {
                        params: {},
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
                        type: 'string',
                      },
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
                          if (typeof data4 === 'string') {
                            if (data4.length < 1) {
                              const err11 = {
                                params: {},
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
                                type: 'string',
                              },
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
                          type: 'array',
                        },
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
                      if (typeof data3 === 'string') {
                        if (data3.length < 1) {
                          const err14 = {
                            params: {},
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
                            type: 'string',
                          },
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
                      params: {},
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
              type: 'object',
            },
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
      params: {},
    };
    if (vErrors === null) {
      vErrors = [err18];
    } else {
      vErrors.push(err18);
    }
    errors++;
    validate62.errors = vErrors;
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
  validate62.errors = vErrors;
  return errors === 0;
}

function validate59(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == 'object' && !Array.isArray(data)) {
      let missing0;
      if (data.type === undefined && (missing0 = 'type')) {
        validate59.errors = [
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
              key0 === 'amdContainer' ||
              key0 === 'auxiliaryComment' ||
              key0 === 'export' ||
              key0 === 'name' ||
              key0 === 'type' ||
              key0 === 'umdNamedDefine'
            )
          ) {
            validate59.errors = [
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
          if (data.amdContainer !== undefined) {
            let data0 = data.amdContainer;
            const _errs2 = errors;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (typeof data0 === 'string') {
                if (data0.length < 1) {
                  validate59.errors = [
                    {
                      params: {},
                    },
                  ];
                  return false;
                }
              } else {
                validate59.errors = [
                  {
                    params: {
                      type: 'string',
                    },
                  },
                ];
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
              if (
                !validate60(data.auxiliaryComment, {
                  instancePath: instancePath + '/auxiliaryComment',
                  parentData: data,
                  parentDataProperty: 'auxiliaryComment',
                  rootData,
                })
              ) {
                vErrors =
                  vErrors === null
                    ? validate60.errors
                    : vErrors.concat(validate60.errors);
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
                        if (typeof data3 === 'string') {
                          if (data3.length < 1) {
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
                      var valid4 = _errs11 === errors;
                      if (!valid4) {
                        break;
                      }
                    }
                  } else {
                    const err2 = {
                      params: {
                        type: 'array',
                      },
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
                    if (typeof data2 === 'string') {
                      if (data2.length < 1) {
                        const err3 = {
                          params: {},
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
                          type: 'string',
                        },
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
                    params: {},
                  };
                  if (vErrors === null) {
                    vErrors = [err5];
                  } else {
                    vErrors.push(err5);
                  }
                  errors++;
                  validate59.errors = vErrors;
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
                  if (
                    !validate62(data.name, {
                      instancePath: instancePath + '/name',
                      parentData: data,
                      parentDataProperty: 'name',
                      rootData,
                    })
                  ) {
                    vErrors =
                      vErrors === null
                        ? validate62.errors
                        : vErrors.concat(validate62.errors);
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
                    if (
                      data5 !== 'var' &&
                      data5 !== 'module' &&
                      data5 !== 'assign' &&
                      data5 !== 'assign-properties' &&
                      data5 !== 'this' &&
                      data5 !== 'window' &&
                      data5 !== 'self' &&
                      data5 !== 'global' &&
                      data5 !== 'commonjs' &&
                      data5 !== 'commonjs2' &&
                      data5 !== 'commonjs-module' &&
                      data5 !== 'commonjs-static' &&
                      data5 !== 'amd' &&
                      data5 !== 'amd-require' &&
                      data5 !== 'umd' &&
                      data5 !== 'umd2' &&
                      data5 !== 'jsonp' &&
                      data5 !== 'system'
                    ) {
                      const err6 = {
                        params: {},
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
                      if (typeof data5 !== 'string') {
                        const err7 = {
                          params: {
                            type: 'string',
                          },
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
                        params: {},
                      };
                      if (vErrors === null) {
                        vErrors = [err8];
                      } else {
                        vErrors.push(err8);
                      }
                      errors++;
                      validate59.errors = vErrors;
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
                      if (typeof data.umdNamedDefine !== 'boolean') {
                        validate59.errors = [
                          {
                            params: {
                              type: 'boolean',
                            },
                          },
                        ];
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
      validate59.errors = [
        {
          params: {
            type: 'object',
          },
        },
      ];
      return false;
    }
  }
  validate59.errors = vErrors;
  return errors === 0;
}
const schema70 = {
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
const schema71 = {
  type: 'string',
  minLength: 1,
};
const schema72 = {
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
const schema73 = {
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
};
const schema75 = {
  type: 'array',
  items: {
    $ref: '#/definitions/RemotesItem',
  },
};

function validate68(
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
              validate68.errors = [
                {
                  params: {},
                },
              ];
              return false;
            }
          } else {
            validate68.errors = [
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
      validate68.errors = [
        {
          params: {
            type: 'array',
          },
        },
      ];
      return false;
    }
  }
  validate68.errors = vErrors;
  return errors === 0;
}

function validate67(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == 'object' && !Array.isArray(data)) {
      let missing0;
      if (data.external === undefined && (missing0 = 'external')) {
        validate67.errors = [
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
            validate67.errors = [
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
                !validate68(data0, {
                  instancePath: instancePath + '/external',
                  parentData: data,
                  parentDataProperty: 'external',
                  rootData,
                })
              ) {
                vErrors =
                  vErrors === null
                    ? validate68.errors
                    : vErrors.concat(validate68.errors);
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
              validate67.errors = vErrors;
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
            if (data.shareScope !== undefined) {
              let data1 = data.shareScope;
              const _errs8 = errors;
              if (errors === _errs8) {
                if (typeof data1 === 'string') {
                  if (data1.length < 1) {
                    validate67.errors = [
                      {
                        params: {},
                      },
                    ];
                    return false;
                  }
                } else {
                  validate67.errors = [
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
          }
        }
      }
    } else {
      validate67.errors = [
        {
          params: {
            type: 'object',
          },
        },
      ];
      return false;
    }
  }
  validate67.errors = vErrors;
  return errors === 0;
}

function validate66(
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
          !validate67(data0, {
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
              ? validate67.errors
              : vErrors.concat(validate67.errors);
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
              !validate68(data0, {
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
                  ? validate68.errors
                  : vErrors.concat(validate68.errors);
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
          validate66.errors = vErrors;
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
      validate66.errors = [
        {
          params: {
            type: 'object',
          },
        },
      ];
      return false;
    }
  }
  validate66.errors = vErrors;
  return errors === 0;
}

function validate65(
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
            !validate66(data0, {
              instancePath: instancePath + '/' + i0,
              parentData: data,
              parentDataProperty: i0,
              rootData,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate66.errors
                : vErrors.concat(validate66.errors);
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
      !validate66(data, {
        instancePath,
        parentData,
        parentDataProperty,
        rootData,
      })
    ) {
      vErrors =
        vErrors === null
          ? validate66.errors
          : vErrors.concat(validate66.errors);
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
    validate65.errors = vErrors;
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
  validate65.errors = vErrors;
  return errors === 0;
}
const schema79 = {
  anyOf: [
    {
      type: 'array',
      items: {
        anyOf: [
          {
            $ref: '#/definitions/SharedItem',
          },
          {
            $ref: '#/definitions/SharedObject',
          },
        ],
      },
    },
    {
      $ref: '#/definitions/SharedObject',
    },
  ],
};
const schema80 = {
  type: 'string',
  minLength: 1,
};
const schema81 = {
  type: 'object',
  additionalProperties: {
    anyOf: [
      {
        $ref: '#/definitions/SharedConfig',
      },
      {
        $ref: '#/definitions/SharedItem',
      },
    ],
  },
};
const schema82 = {
  type: 'object',
  additionalProperties: false,
  properties: {
    eager: {
      type: 'boolean',
    },
    import: {
      anyOf: [
        {
          enum: [false],
        },
        {
          $ref: '#/definitions/SharedItem',
        },
      ],
    },
    packageName: {
      type: 'string',
      minLength: 1,
    },
    requiredVersion: {
      anyOf: [
        {
          enum: [false],
        },
        {
          type: 'string',
        },
      ],
    },
    shareKey: {
      type: 'string',
      minLength: 1,
    },
    shareScope: {
      type: 'string',
      minLength: 1,
    },
    singleton: {
      type: 'boolean',
    },
    strictVersion: {
      type: 'boolean',
    },
    version: {
      anyOf: [
        {
          enum: [false],
        },
        {
          type: 'string',
        },
      ],
    },
  },
};

function validate77(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == 'object' && !Array.isArray(data)) {
      const _errs1 = errors;
      for (const key0 in data) {
        if (!func2.call(schema82.properties, key0)) {
          validate77.errors = [
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
        if (data.eager !== undefined) {
          const _errs2 = errors;
          if (typeof data.eager !== 'boolean') {
            validate77.errors = [
              {
                params: {
                  type: 'boolean',
                },
              },
            ];
            return false;
          }
          var valid0 = _errs2 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.import !== undefined) {
            let data1 = data.import;
            const _errs4 = errors;
            const _errs5 = errors;
            let valid1 = false;
            const _errs6 = errors;
            if (data1 !== false) {
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
            var _valid0 = _errs6 === errors;
            valid1 = valid1 || _valid0;
            if (!valid1) {
              const _errs7 = errors;
              const _errs8 = errors;
              if (errors === _errs8) {
                if (typeof data1 === 'string') {
                  if (data1.length < 1) {
                    const err1 = {
                      params: {},
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
                      type: 'string',
                    },
                  };
                  if (vErrors === null) {
                    vErrors = [err2];
                  } else {
                    vErrors.push(err2);
                  }
                  errors++;
                }
              }
              var _valid0 = _errs7 === errors;
              valid1 = valid1 || _valid0;
            }
            if (!valid1) {
              const err3 = {
                params: {},
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
              validate77.errors = vErrors;
              return false;
            } else {
              errors = _errs5;
              if (vErrors !== null) {
                if (_errs5) {
                  vErrors.length = _errs5;
                } else {
                  vErrors = null;
                }
              }
            }
            var valid0 = _errs4 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.packageName !== undefined) {
              let data2 = data.packageName;
              const _errs10 = errors;
              if (errors === _errs10) {
                if (typeof data2 === 'string') {
                  if (data2.length < 1) {
                    validate77.errors = [
                      {
                        params: {},
                      },
                    ];
                    return false;
                  }
                } else {
                  validate77.errors = [
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
            if (valid0) {
              if (data.requiredVersion !== undefined) {
                let data3 = data.requiredVersion;
                const _errs12 = errors;
                const _errs13 = errors;
                let valid3 = false;
                const _errs14 = errors;
                if (data3 !== false) {
                  const err4 = {
                    params: {},
                  };
                  if (vErrors === null) {
                    vErrors = [err4];
                  } else {
                    vErrors.push(err4);
                  }
                  errors++;
                }
                var _valid1 = _errs14 === errors;
                valid3 = valid3 || _valid1;
                if (!valid3) {
                  const _errs15 = errors;
                  if (typeof data3 !== 'string') {
                    const err5 = {
                      params: {
                        type: 'string',
                      },
                    };
                    if (vErrors === null) {
                      vErrors = [err5];
                    } else {
                      vErrors.push(err5);
                    }
                    errors++;
                  }
                  var _valid1 = _errs15 === errors;
                  valid3 = valid3 || _valid1;
                }
                if (!valid3) {
                  const err6 = {
                    params: {},
                  };
                  if (vErrors === null) {
                    vErrors = [err6];
                  } else {
                    vErrors.push(err6);
                  }
                  errors++;
                  validate77.errors = vErrors;
                  return false;
                } else {
                  errors = _errs13;
                  if (vErrors !== null) {
                    if (_errs13) {
                      vErrors.length = _errs13;
                    } else {
                      vErrors = null;
                    }
                  }
                }
                var valid0 = _errs12 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.shareKey !== undefined) {
                  let data4 = data.shareKey;
                  const _errs17 = errors;
                  if (errors === _errs17) {
                    if (typeof data4 === 'string') {
                      if (data4.length < 1) {
                        validate77.errors = [
                          {
                            params: {},
                          },
                        ];
                        return false;
                      }
                    } else {
                      validate77.errors = [
                        {
                          params: {
                            type: 'string',
                          },
                        },
                      ];
                      return false;
                    }
                  }
                  var valid0 = _errs17 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.shareScope !== undefined) {
                    let data5 = data.shareScope;
                    const _errs19 = errors;
                    if (errors === _errs19) {
                      if (typeof data5 === 'string') {
                        if (data5.length < 1) {
                          validate77.errors = [
                            {
                              params: {},
                            },
                          ];
                          return false;
                        }
                      } else {
                        validate77.errors = [
                          {
                            params: {
                              type: 'string',
                            },
                          },
                        ];
                        return false;
                      }
                    }
                    var valid0 = _errs19 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.singleton !== undefined) {
                      const _errs21 = errors;
                      if (typeof data.singleton !== 'boolean') {
                        validate77.errors = [
                          {
                            params: {
                              type: 'boolean',
                            },
                          },
                        ];
                        return false;
                      }
                      var valid0 = _errs21 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.strictVersion !== undefined) {
                        const _errs23 = errors;
                        if (typeof data.strictVersion !== 'boolean') {
                          validate77.errors = [
                            {
                              params: {
                                type: 'boolean',
                              },
                            },
                          ];
                          return false;
                        }
                        var valid0 = _errs23 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.version !== undefined) {
                          let data8 = data.version;
                          const _errs25 = errors;
                          const _errs26 = errors;
                          let valid4 = false;
                          const _errs27 = errors;
                          if (data8 !== false) {
                            const err7 = {
                              params: {},
                            };
                            if (vErrors === null) {
                              vErrors = [err7];
                            } else {
                              vErrors.push(err7);
                            }
                            errors++;
                          }
                          var _valid2 = _errs27 === errors;
                          valid4 = valid4 || _valid2;
                          if (!valid4) {
                            const _errs28 = errors;
                            if (typeof data8 !== 'string') {
                              const err8 = {
                                params: {
                                  type: 'string',
                                },
                              };
                              if (vErrors === null) {
                                vErrors = [err8];
                              } else {
                                vErrors.push(err8);
                              }
                              errors++;
                            }
                            var _valid2 = _errs28 === errors;
                            valid4 = valid4 || _valid2;
                          }
                          if (!valid4) {
                            const err9 = {
                              params: {},
                            };
                            if (vErrors === null) {
                              vErrors = [err9];
                            } else {
                              vErrors.push(err9);
                            }
                            errors++;
                            validate77.errors = vErrors;
                            return false;
                          } else {
                            errors = _errs26;
                            if (vErrors !== null) {
                              if (_errs26) {
                                vErrors.length = _errs26;
                              } else {
                                vErrors = null;
                              }
                            }
                          }
                          var valid0 = _errs25 === errors;
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
      }
    } else {
      validate77.errors = [
        {
          params: {
            type: 'object',
          },
        },
      ];
      return false;
    }
  }
  validate77.errors = vErrors;
  return errors === 0;
}

function validate76(
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
          !validate77(data0, {
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
              ? validate77.errors
              : vErrors.concat(validate77.errors);
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
          validate76.errors = vErrors;
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
      validate76.errors = [
        {
          params: {
            type: 'object',
          },
        },
      ];
      return false;
    }
  }
  validate76.errors = vErrors;
  return errors === 0;
}

function validate75(
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
            !validate76(data0, {
              instancePath: instancePath + '/' + i0,
              parentData: data,
              parentDataProperty: i0,
              rootData,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate76.errors
                : vErrors.concat(validate76.errors);
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
      !validate76(data, {
        instancePath,
        parentData,
        parentDataProperty,
        rootData,
      })
    ) {
      vErrors =
        vErrors === null
          ? validate76.errors
          : vErrors.concat(validate76.errors);
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
    validate75.errors = vErrors;
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
  validate75.errors = vErrors;
  return errors === 0;
}

function validate48(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  /*# sourceURL="" */ let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == 'object' && !Array.isArray(data)) {
      const _errs1 = errors;
      for (const key0 in data) {
        if (!func2.call(schema51.properties, key0)) {
          validate48.errors = [
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
        if (data.exposes !== undefined) {
          const _errs2 = errors;
          if (
            !validate49(data.exposes, {
              instancePath: instancePath + '/exposes',
              parentData: data,
              parentDataProperty: 'exposes',
              rootData,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate49.errors
                : vErrors.concat(validate49.errors);
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
              if (typeof data1 === 'string') {
                if (
                  data1.includes('!') ||
                  absolutePathRegExp.test(data1) !== false
                ) {
                  validate48.errors = [
                    {
                      params: {},
                    },
                  ];
                  return false;
                }
              } else {
                validate48.errors = [
                  {
                    params: {
                      type: 'string',
                    },
                  },
                ];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.implementation !== undefined) {
              let data2 = data.implementation;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (typeof data2 === 'string') {
                  if (data2.length < 1) {
                    validate48.errors = [
                      {
                        params: {},
                      },
                    ];
                    return false;
                  }
                } else {
                  validate48.errors = [
                    {
                      params: {
                        type: 'string',
                      },
                    },
                  ];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.library !== undefined) {
                const _errs7 = errors;
                if (
                  !validate59(data.library, {
                    instancePath: instancePath + '/library',
                    parentData: data,
                    parentDataProperty: 'library',
                    rootData,
                  })
                ) {
                  vErrors =
                    vErrors === null
                      ? validate59.errors
                      : vErrors.concat(validate59.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.name !== undefined) {
                  const _errs8 = errors;
                  if (typeof data.name !== 'string') {
                    validate48.errors = [
                      {
                        params: {
                          type: 'string',
                        },
                      },
                    ];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.remoteType !== undefined) {
                    let data5 = data.remoteType;
                    const _errs10 = errors;
                    const _errs11 = errors;
                    let valid1 = false;
                    let passing0 = null;
                    const _errs12 = errors;
                    if (
                      data5 !== 'var' &&
                      data5 !== 'module' &&
                      data5 !== 'assign' &&
                      data5 !== 'this' &&
                      data5 !== 'window' &&
                      data5 !== 'self' &&
                      data5 !== 'global' &&
                      data5 !== 'commonjs' &&
                      data5 !== 'commonjs2' &&
                      data5 !== 'commonjs-module' &&
                      data5 !== 'commonjs-static' &&
                      data5 !== 'amd' &&
                      data5 !== 'amd-require' &&
                      data5 !== 'umd' &&
                      data5 !== 'umd2' &&
                      data5 !== 'jsonp' &&
                      data5 !== 'system' &&
                      data5 !== 'promise' &&
                      data5 !== 'import' &&
                      data5 !== 'script' &&
                      data5 !== 'node-commonjs'
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
                    var _valid0 = _errs12 === errors;
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
                      validate48.errors = vErrors;
                      return false;
                    } else {
                      errors = _errs11;
                      if (vErrors !== null) {
                        if (_errs11) {
                          vErrors.length = _errs11;
                        } else {
                          vErrors = null;
                        }
                      }
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.remotes !== undefined) {
                      const _errs14 = errors;
                      if (
                        !validate65(data.remotes, {
                          instancePath: instancePath + '/remotes',
                          parentData: data,
                          parentDataProperty: 'remotes',
                          rootData,
                        })
                      ) {
                        vErrors =
                          vErrors === null
                            ? validate65.errors
                            : vErrors.concat(validate65.errors);
                        errors = vErrors.length;
                      }
                      var valid0 = _errs14 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.runtime !== undefined) {
                        let data7 = data.runtime;
                        const _errs15 = errors;
                        const _errs17 = errors;
                        let valid4 = false;
                        const _errs18 = errors;
                        if (data7 !== false) {
                          const err2 = {
                            params: {},
                          };
                          if (vErrors === null) {
                            vErrors = [err2];
                          } else {
                            vErrors.push(err2);
                          }
                          errors++;
                        }
                        var _valid1 = _errs18 === errors;
                        valid4 = valid4 || _valid1;
                        if (!valid4) {
                          const _errs19 = errors;
                          if (errors === _errs19) {
                            if (typeof data7 === 'string') {
                              if (data7.length < 1) {
                                const err3 = {
                                  params: {},
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
                                  type: 'string',
                                },
                              };
                              if (vErrors === null) {
                                vErrors = [err4];
                              } else {
                                vErrors.push(err4);
                              }
                              errors++;
                            }
                          }
                          var _valid1 = _errs19 === errors;
                          valid4 = valid4 || _valid1;
                        }
                        if (!valid4) {
                          const err5 = {
                            params: {},
                          };
                          if (vErrors === null) {
                            vErrors = [err5];
                          } else {
                            vErrors.push(err5);
                          }
                          errors++;
                          validate48.errors = vErrors;
                          return false;
                        } else {
                          errors = _errs17;
                          if (vErrors !== null) {
                            if (_errs17) {
                              vErrors.length = _errs17;
                            } else {
                              vErrors = null;
                            }
                          }
                        }
                        var valid0 = _errs15 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.runtimePlugins !== undefined) {
                          let data8 = data.runtimePlugins;
                          const _errs21 = errors;
                          if (errors === _errs21) {
                            if (Array.isArray(data8)) {
                              var valid5 = true;
                              const len0 = data8.length;
                              for (let i0 = 0; i0 < len0; i0++) {
                                let data9 = data8[i0];
                                const _errs23 = errors;
                                if (errors === _errs23) {
                                  if (typeof data9 === 'string') {
                                    if (data9.length < 1) {
                                      validate48.errors = [
                                        {
                                          params: {},
                                        },
                                      ];
                                      return false;
                                    }
                                  } else {
                                    validate48.errors = [
                                      {
                                        params: {
                                          type: 'string',
                                        },
                                      },
                                    ];
                                    return false;
                                  }
                                }
                                var valid5 = _errs23 === errors;
                                if (!valid5) {
                                  break;
                                }
                              }
                            } else {
                              validate48.errors = [
                                {
                                  params: {
                                    type: 'array',
                                  },
                                },
                              ];
                              return false;
                            }
                          }
                          var valid0 = _errs21 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.shareScope !== undefined) {
                            let data10 = data.shareScope;
                            const _errs25 = errors;
                            if (errors === _errs25) {
                              if (typeof data10 === 'string') {
                                if (data10.length < 1) {
                                  validate48.errors = [
                                    {
                                      params: {},
                                    },
                                  ];
                                  return false;
                                }
                              } else {
                                validate48.errors = [
                                  {
                                    params: {
                                      type: 'string',
                                    },
                                  },
                                ];
                                return false;
                              }
                            }
                            var valid0 = _errs25 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.shared !== undefined) {
                              const _errs27 = errors;
                              if (
                                !validate75(data.shared, {
                                  instancePath: instancePath + '/shared',
                                  parentData: data,
                                  parentDataProperty: 'shared',
                                  rootData,
                                })
                              ) {
                                vErrors =
                                  vErrors === null
                                    ? validate75.errors
                                    : vErrors.concat(validate75.errors);
                                errors = vErrors.length;
                              }
                              var valid0 = _errs27 === errors;
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
          }
        }
      }
    } else {
      validate48.errors = [
        {
          params: {
            type: 'object',
          },
        },
      ];
      return false;
    }
  }
  validate48.errors = vErrors;
  return errors === 0;
}

export default validate48;
