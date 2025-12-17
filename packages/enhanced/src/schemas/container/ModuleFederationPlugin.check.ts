// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
const e = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
export const validate = A;
export default A;
const t = {
    definitions: {
      AmdContainer: { type: 'string', minLength: 1 },
      AuxiliaryComment: {
        anyOf: [
          { type: 'string' },
          { $ref: '#/definitions/LibraryCustomUmdCommentObject' },
        ],
      },
      EntryRuntime: {
        anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }],
      },
      Exposes: {
        anyOf: [
          {
            type: 'array',
            items: {
              anyOf: [
                { $ref: '#/definitions/ExposesItem' },
                { $ref: '#/definitions/ExposesObject' },
              ],
            },
          },
          { $ref: '#/definitions/ExposesObject' },
        ],
      },
      ExposesConfig: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          import: {
            anyOf: [
              { $ref: '#/definitions/ExposesItem' },
              { $ref: '#/definitions/ExposesItems' },
            ],
          },
          name: { type: 'string' },
        },
        required: ['import'],
      },
      ExposesItem: { type: 'string', minLength: 1 },
      ExposesItems: {
        type: 'array',
        items: { $ref: '#/definitions/ExposesItem' },
      },
      ExposesObject: {
        type: 'object',
        additionalProperties: {
          anyOf: [
            { $ref: '#/definitions/ExposesConfig' },
            { $ref: '#/definitions/ExposesItem' },
            { $ref: '#/definitions/ExposesItems' },
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
          'module-import',
          'script',
          'node-commonjs',
        ],
      },
      LibraryCustomUmdCommentObject: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          amd: { type: 'string' },
          commonjs: { type: 'string' },
          commonjs2: { type: 'string' },
          root: { type: 'string' },
        },
      },
      LibraryCustomUmdObject: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          amd: { type: 'string', minLength: 1 },
          commonjs: { type: 'string', minLength: 1 },
          root: {
            anyOf: [
              { type: 'array', items: { type: 'string', minLength: 1 } },
              { type: 'string', minLength: 1 },
            ],
          },
        },
      },
      LibraryExport: {
        anyOf: [
          { type: 'array', items: { type: 'string', minLength: 1 } },
          { type: 'string', minLength: 1 },
        ],
      },
      LibraryName: {
        anyOf: [
          {
            type: 'array',
            items: { type: 'string', minLength: 1 },
            minItems: 1,
          },
          { type: 'string', minLength: 1 },
          { $ref: '#/definitions/LibraryCustomUmdObject' },
        ],
      },
      LibraryOptions: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          amdContainer: { $ref: '#/definitions/AmdContainer' },
          auxiliaryComment: { $ref: '#/definitions/AuxiliaryComment' },
          export: { $ref: '#/definitions/LibraryExport' },
          name: { $ref: '#/definitions/LibraryName' },
          type: { $ref: '#/definitions/LibraryType' },
          umdNamedDefine: { $ref: '#/definitions/UmdNamedDefine' },
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
          { type: 'string' },
        ],
      },
      Remotes: {
        anyOf: [
          {
            type: 'array',
            items: {
              anyOf: [
                { $ref: '#/definitions/RemotesItem' },
                { $ref: '#/definitions/RemotesObject' },
              ],
            },
          },
          { $ref: '#/definitions/RemotesObject' },
        ],
      },
      RemotesConfig: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          external: {
            anyOf: [
              { $ref: '#/definitions/RemotesItem' },
              { $ref: '#/definitions/RemotesItems' },
            ],
          },
          shareScope: {
            anyOf: [
              { type: 'string', minLength: 1 },
              { type: 'array', items: { type: 'string', minLength: 1 } },
            ],
          },
        },
        required: ['external'],
      },
      RemotesItem: { type: 'string', minLength: 1 },
      RemotesItems: {
        type: 'array',
        items: { $ref: '#/definitions/RemotesItem' },
      },
      RemotesObject: {
        type: 'object',
        additionalProperties: {
          anyOf: [
            { $ref: '#/definitions/RemotesConfig' },
            { $ref: '#/definitions/RemotesItem' },
            { $ref: '#/definitions/RemotesItems' },
          ],
        },
      },
      Shared: {
        anyOf: [
          {
            type: 'array',
            items: {
              anyOf: [
                { $ref: '#/definitions/SharedItem' },
                { $ref: '#/definitions/SharedObject' },
              ],
            },
          },
          { $ref: '#/definitions/SharedObject' },
        ],
      },
      SharedConfig: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          eager: { type: 'boolean' },
          exclude: { $ref: '#/definitions/IncludeExcludeOptions' },
          include: { $ref: '#/definitions/IncludeExcludeOptions' },
          import: {
            anyOf: [{ enum: [!1] }, { $ref: '#/definitions/SharedItem' }],
          },
          request: { type: 'string', minLength: 1 },
          layer: { type: 'string', minLength: 1 },
          issuerLayer: { type: 'string', minLength: 1 },
          packageName: { type: 'string', minLength: 1 },
          requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
          shareKey: { type: 'string', minLength: 1 },
          shareScope: {
            anyOf: [
              { type: 'string', minLength: 1 },
              { type: 'array', items: { type: 'string', minLength: 1 } },
            ],
          },
          shareStrategy: {
            enum: ['version-first', 'loaded-first'],
            type: 'string',
          },
          singleton: { type: 'boolean' },
          strictVersion: { type: 'boolean' },
          version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
          allowNodeModulesSuffixMatch: { type: 'boolean' },
        },
      },
      SharedItem: { type: 'string', minLength: 1 },
      SharedObject: {
        type: 'object',
        additionalProperties: {
          anyOf: [
            { $ref: '#/definitions/SharedConfig' },
            { $ref: '#/definitions/SharedItem' },
          ],
        },
      },
      UmdNamedDefine: { type: 'boolean' },
      IncludeExcludeOptions: {
        type: 'object',
        properties: {
          request: { type: ['string', 'object'] },
          version: { type: 'string' },
          fallbackVersion: { type: 'string' },
        },
        additionalProperties: !1,
        anyOf: [
          { required: ['request'] },
          { required: ['version'] },
          { required: ['fallbackVersion'] },
        ],
      },
      Exclude: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          request: { instanceof: 'RegExp' },
          version: { type: 'string' },
          fallbackVersion: { type: 'string' },
        },
      },
    },
    type: 'object',
    additionalProperties: !1,
    properties: {
      async: {
        anyOf: [
          { type: 'boolean' },
          {
            type: 'object',
            properties: {
              eager: {
                anyOf: [{ instanceof: 'RegExp' }, { instanceof: 'Function' }],
              },
              excludeChunk: { instanceof: 'Function' },
            },
            additionalProperties: !1,
          },
        ],
      },
      exposes: { $ref: '#/definitions/Exposes' },
      filename: { type: 'string', absolutePath: !1, minLength: 1 },
      library: { $ref: '#/definitions/LibraryOptions' },
      name: { type: 'string', minLength: 1 },
      remoteType: { oneOf: [{ $ref: '#/definitions/ExternalsType' }] },
      remotes: { $ref: '#/definitions/Remotes' },
      runtime: { $ref: '#/definitions/EntryRuntime' },
      shareScope: {
        anyOf: [
          { type: 'string', minLength: 1 },
          { type: 'array', items: { type: 'string', minLength: 1 } },
        ],
      },
      shareStrategy: {
        enum: ['version-first', 'loaded-first'],
        type: 'string',
      },
      shared: { $ref: '#/definitions/Shared' },
      dts: {
        anyOf: [
          { type: 'boolean' },
          {
            type: 'object',
            properties: {
              generateTypes: {
                anyOf: [
                  { type: 'boolean' },
                  {
                    type: 'object',
                    properties: {
                      tsConfigPath: { type: 'string' },
                      typesFolder: { type: 'string' },
                      compiledTypesFolder: { type: 'string' },
                      deleteTypesFolder: { type: 'boolean' },
                      additionalFilesToCompile: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                      compileInChildProcess: { type: 'boolean' },
                      compilerInstance: { type: 'string' },
                      generateAPITypes: { type: 'boolean' },
                      extractThirdParty: {
                        anyOf: [
                          { type: 'boolean' },
                          {
                            type: 'object',
                            properties: {
                              exclude: {
                                type: 'array',
                                items: {
                                  anyOf: [
                                    { type: 'string' },
                                    { instanceof: 'RegExp' },
                                  ],
                                },
                              },
                            },
                            additionalProperties: !1,
                          },
                        ],
                      },
                      extractRemoteTypes: { type: 'boolean' },
                      abortOnError: { type: 'boolean' },
                    },
                  },
                ],
              },
              consumeTypes: {
                anyOf: [
                  { type: 'boolean' },
                  {
                    type: 'object',
                    properties: {
                      typesFolder: { type: 'string' },
                      abortOnError: { type: 'boolean' },
                      remoteTypesFolder: { type: 'string' },
                      deleteTypesFolder: { type: 'boolean' },
                      maxRetries: { type: 'number' },
                      consumeAPITypes: { type: 'boolean' },
                      runtimePkgs: { type: 'array', items: { type: 'string' } },
                      remoteTypeUrls: {
                        anyOf: [
                          { instanceof: 'Function' },
                          {
                            type: 'object',
                            additionalProperties: {
                              type: 'object',
                              properties: {
                                alias: { type: 'string' },
                                api: { type: 'string' },
                                zip: { type: 'string' },
                              },
                              required: ['api', 'zip'],
                              additionalProperties: !1,
                            },
                          },
                        ],
                      },
                      timeout: { type: 'number' },
                      family: { enum: [4, 6] },
                      typesOnBuild: { type: 'boolean' },
                    },
                  },
                ],
              },
              tsConfigPath: { type: 'string' },
              extraOptions: { type: 'object' },
              implementation: { type: 'string' },
              cwd: { type: 'string' },
              displayErrorInTerminal: { type: 'boolean' },
            },
          },
        ],
      },
      experiments: {
        type: 'object',
        properties: {
          asyncStartup: { type: 'boolean' },
          externalRuntime: { type: 'boolean' },
          provideExternalRuntime: { type: 'boolean' },
          optimization: {
            type: 'object',
            properties: {
              disableSnapshot: { type: 'boolean' },
              target: { enum: ['web', 'node'] },
            },
            additionalProperties: !1,
          },
        },
      },
      bridge: {
        type: 'object',
        properties: {
          enableBridgeRouter: { type: 'boolean', default: !1 },
          disableAlias: { type: 'boolean', default: !1 },
        },
        additionalProperties: !1,
      },
      virtualRuntimeEntry: { type: 'boolean' },
      dev: {
        anyOf: [
          { type: 'boolean' },
          {
            type: 'object',
            properties: {
              disableLiveReload: { type: 'boolean' },
              disableHotTypesReload: { type: 'boolean' },
              disableDynamicRemoteTypeHints: { type: 'boolean' },
            },
            additionalProperties: !1,
          },
        ],
      },
      manifest: {
        anyOf: [
          { type: 'boolean' },
          {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              disableAssetsAnalyze: { type: 'boolean' },
              fileName: { type: 'string' },
              rsc: { type: 'object' },
              additionalData: { instanceof: 'Function' },
              rsc: { type: 'object' },
            },
            additionalProperties: !1,
          },
        ],
      },
      runtimePlugins: {
        type: 'array',
        items: {
          anyOf: [
            { type: 'string' },
            {
              type: 'array',
              items: [{ type: 'string' }, { type: 'object' }],
              minItems: 2,
              maxItems: 2,
            },
          ],
        },
      },
      getPublicPath: { type: 'string' },
      dataPrefetch: { type: 'boolean' },
      implementation: { type: 'string' },
    },
  },
  r = {
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
      'module-import',
      'script',
      'node-commonjs',
    ],
  },
  n = { anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }] },
  s = Object.prototype.hasOwnProperty;
function o(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  if (!Array.isArray(e))
    return (o.errors = [{ params: { type: 'array' } }]), !1;
  {
    const t = e.length;
    for (let r = 0; r < t; r++) {
      let t = e[r];
      const n = 0;
      if ('string' != typeof t)
        return (o.errors = [{ params: { type: 'string' } }]), !1;
      if (t.length < 1) return (o.errors = [{ params: {} }]), !1;
      if (0 !== n) break;
    }
  }
  return (o.errors = null), !0;
}
function i(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    l = 0;
  if (0 === l) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (i.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.import && (r = 'import'))
        return (i.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = l;
        for (const t in e)
          if ('import' !== t && 'name' !== t)
            return (i.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === l) {
          if (void 0 !== e.import) {
            let r = e.import;
            const n = l,
              u = l;
            let c = !1;
            const y = l;
            if (l == l)
              if ('string' == typeof r) {
                if (r.length < 1) {
                  const e = { params: {} };
                  null === a ? (a = [e]) : a.push(e), l++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === a ? (a = [e]) : a.push(e), l++;
              }
            var p = y === l;
            if (((c = c || p), !c)) {
              const n = l;
              o(r, {
                instancePath: t + '/import',
                parentData: e,
                parentDataProperty: 'import',
                rootData: s,
              }) ||
                ((a = null === a ? o.errors : a.concat(o.errors)),
                (l = a.length)),
                (p = n === l),
                (c = c || p);
            }
            if (!c) {
              const e = { params: {} };
              return (
                null === a ? (a = [e]) : a.push(e), l++, (i.errors = a), !1
              );
            }
            (l = u), null !== a && (u ? (a.length = u) : (a = null));
            var f = n === l;
          } else f = !0;
          if (f)
            if (void 0 !== e.name) {
              const t = l;
              if ('string' != typeof e.name)
                return (i.errors = [{ params: { type: 'string' } }]), !1;
              f = t === l;
            } else f = !0;
        }
      }
    }
  }
  return (i.errors = a), 0 === l;
}
function a(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let n = e[r];
      const u = p,
        c = p;
      let y = !1;
      const m = p;
      i(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((l = null === l ? i.errors : l.concat(i.errors)), (p = l.length));
      var f = m === p;
      if (((y = y || f), !y)) {
        const i = p;
        if (p == p)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const e = { params: {} };
              null === l ? (l = [e]) : l.push(e), p++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === l ? (l = [e]) : l.push(e), p++;
          }
        if (((f = i === p), (y = y || f), !y)) {
          const i = p;
          o(n, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: s,
          }) ||
            ((l = null === l ? o.errors : l.concat(o.errors)), (p = l.length)),
            (f = i === p),
            (y = y || f);
        }
      }
      if (!y) {
        const e = { params: {} };
        return null === l ? (l = [e]) : l.push(e), p++, (a.errors = l), !1;
      }
      if (((p = c), null !== l && (c ? (l.length = c) : (l = null)), u !== p))
        break;
    }
  }
  return (a.errors = l), 0 === p;
}
function l(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    i = 0;
  const p = i;
  let f = !1;
  const u = i;
  if (i === u)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const l = i,
          p = i;
        let f = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), i++;
          }
        var c = u === i;
        if (((f = f || c), !f)) {
          const l = i;
          a(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((o = null === o ? a.errors : o.concat(a.errors)), (i = o.length)),
            (c = l === i),
            (f = f || c);
        }
        if (f) (i = p), null !== o && (p ? (o.length = p) : (o = null));
        else {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), i++;
        }
        if (l !== i) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), i++;
    }
  var y = u === i;
  if (((f = f || y), !f)) {
    const l = i;
    a(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((o = null === o ? a.errors : o.concat(a.errors)), (i = o.length)),
      (y = l === i),
      (f = f || y);
  }
  if (!f) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), i++, (l.errors = o), !1;
  }
  return (
    (i = p),
    null !== o && (p ? (o.length = p) : (o = null)),
    (l.errors = o),
    0 === i
  );
}
const p = {
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
    { type: 'string' },
  ],
};
function f(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    i = 0;
  const a = i;
  let l = !1;
  const p = i;
  if ('string' != typeof e) {
    const e = { params: { type: 'string' } };
    null === o ? (o = [e]) : o.push(e), i++;
  }
  var u = p === i;
  if (((l = l || u), !l)) {
    const t = i;
    if (i == i)
      if (e && 'object' == typeof e && !Array.isArray(e)) {
        const t = i;
        for (const t in e)
          if (
            'amd' !== t &&
            'commonjs' !== t &&
            'commonjs2' !== t &&
            'root' !== t
          ) {
            const e = { params: { additionalProperty: t } };
            null === o ? (o = [e]) : o.push(e), i++;
            break;
          }
        if (t === i) {
          if (void 0 !== e.amd) {
            const t = i;
            if ('string' != typeof e.amd) {
              const e = { params: { type: 'string' } };
              null === o ? (o = [e]) : o.push(e), i++;
            }
            var c = t === i;
          } else c = !0;
          if (c) {
            if (void 0 !== e.commonjs) {
              const t = i;
              if ('string' != typeof e.commonjs) {
                const e = { params: { type: 'string' } };
                null === o ? (o = [e]) : o.push(e), i++;
              }
              c = t === i;
            } else c = !0;
            if (c) {
              if (void 0 !== e.commonjs2) {
                const t = i;
                if ('string' != typeof e.commonjs2) {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), i++;
                }
                c = t === i;
              } else c = !0;
              if (c)
                if (void 0 !== e.root) {
                  const t = i;
                  if ('string' != typeof e.root) {
                    const e = { params: { type: 'string' } };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                  c = t === i;
                } else c = !0;
            }
          }
        }
      } else {
        const e = { params: { type: 'object' } };
        null === o ? (o = [e]) : o.push(e), i++;
      }
    (u = t === i), (l = l || u);
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), i++, (f.errors = o), !1;
  }
  return (
    (i = a),
    null !== o && (a ? (o.length = a) : (o = null)),
    (f.errors = o),
    0 === i
  );
}
function u(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    i = 0;
  const a = i;
  let l = !1;
  const p = i;
  if (i === p)
    if (Array.isArray(e))
      if (e.length < 1) {
        const e = { params: { limit: 1 } };
        null === o ? (o = [e]) : o.push(e), i++;
      } else {
        const t = e.length;
        for (let r = 0; r < t; r++) {
          let t = e[r];
          const n = i;
          if (i === n)
            if ('string' == typeof t) {
              if (t.length < 1) {
                const e = { params: {} };
                null === o ? (o = [e]) : o.push(e), i++;
              }
            } else {
              const e = { params: { type: 'string' } };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          if (n !== i) break;
        }
      }
    else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), i++;
    }
  var f = p === i;
  if (((l = l || f), !l)) {
    const t = i;
    if (i === t)
      if ('string' == typeof e) {
        if (e.length < 1) {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), i++;
        }
      } else {
        const e = { params: { type: 'string' } };
        null === o ? (o = [e]) : o.push(e), i++;
      }
    if (((f = t === i), (l = l || f), !l)) {
      const t = i;
      if (i == i)
        if (e && 'object' == typeof e && !Array.isArray(e)) {
          const t = i;
          for (const t in e)
            if ('amd' !== t && 'commonjs' !== t && 'root' !== t) {
              const e = { params: { additionalProperty: t } };
              null === o ? (o = [e]) : o.push(e), i++;
              break;
            }
          if (t === i) {
            if (void 0 !== e.amd) {
              let t = e.amd;
              const r = i;
              if (i === r)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), i++;
                }
              var c = r === i;
            } else c = !0;
            if (c) {
              if (void 0 !== e.commonjs) {
                let t = e.commonjs;
                const r = i;
                if (i === r)
                  if ('string' == typeof t) {
                    if (t.length < 1) {
                      const e = { params: {} };
                      null === o ? (o = [e]) : o.push(e), i++;
                    }
                  } else {
                    const e = { params: { type: 'string' } };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                c = r === i;
              } else c = !0;
              if (c)
                if (void 0 !== e.root) {
                  let t = e.root;
                  const r = i,
                    n = i;
                  let s = !1;
                  const a = i;
                  if (i === a)
                    if (Array.isArray(t)) {
                      const e = t.length;
                      for (let r = 0; r < e; r++) {
                        let e = t[r];
                        const n = i;
                        if (i === n)
                          if ('string' == typeof e) {
                            if (e.length < 1) {
                              const e = { params: {} };
                              null === o ? (o = [e]) : o.push(e), i++;
                            }
                          } else {
                            const e = { params: { type: 'string' } };
                            null === o ? (o = [e]) : o.push(e), i++;
                          }
                        if (n !== i) break;
                      }
                    } else {
                      const e = { params: { type: 'array' } };
                      null === o ? (o = [e]) : o.push(e), i++;
                    }
                  var y = a === i;
                  if (((s = s || y), !s)) {
                    const e = i;
                    if (i === e)
                      if ('string' == typeof t) {
                        if (t.length < 1) {
                          const e = { params: {} };
                          null === o ? (o = [e]) : o.push(e), i++;
                        }
                      } else {
                        const e = { params: { type: 'string' } };
                        null === o ? (o = [e]) : o.push(e), i++;
                      }
                    (y = e === i), (s = s || y);
                  }
                  if (s)
                    (i = n), null !== o && (n ? (o.length = n) : (o = null));
                  else {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                  c = r === i;
                } else c = !0;
            }
          }
        } else {
          const e = { params: { type: 'object' } };
          null === o ? (o = [e]) : o.push(e), i++;
        }
      (f = t === i), (l = l || f);
    }
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), i++, (u.errors = o), !1;
  }
  return (
    (i = a),
    null !== o && (a ? (o.length = a) : (o = null)),
    (u.errors = o),
    0 === i
  );
}
function c(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (c.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.type && (r = 'type'))
        return (c.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = i;
        for (const t in e)
          if (
            'amdContainer' !== t &&
            'auxiliaryComment' !== t &&
            'export' !== t &&
            'name' !== t &&
            'type' !== t &&
            'umdNamedDefine' !== t
          )
            return (c.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === i) {
          if (void 0 !== e.amdContainer) {
            let t = e.amdContainer;
            const r = i;
            if (i == i) {
              if ('string' != typeof t)
                return (c.errors = [{ params: { type: 'string' } }]), !1;
              if (t.length < 1) return (c.errors = [{ params: {} }]), !1;
            }
            var a = r === i;
          } else a = !0;
          if (a) {
            if (void 0 !== e.auxiliaryComment) {
              const r = i;
              f(e.auxiliaryComment, {
                instancePath: t + '/auxiliaryComment',
                parentData: e,
                parentDataProperty: 'auxiliaryComment',
                rootData: s,
              }) ||
                ((o = null === o ? f.errors : o.concat(f.errors)),
                (i = o.length)),
                (a = r === i);
            } else a = !0;
            if (a) {
              if (void 0 !== e.export) {
                let t = e.export;
                const r = i,
                  n = i;
                let s = !1;
                const p = i;
                if (i === p)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let r = 0; r < e; r++) {
                      let e = t[r];
                      const n = i;
                      if (i === n)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === o ? (o = [e]) : o.push(e), i++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === o ? (o = [e]) : o.push(e), i++;
                        }
                      if (n !== i) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                var l = p === i;
                if (((s = s || l), !s)) {
                  const e = i;
                  if (i === e)
                    if ('string' == typeof t) {
                      if (t.length < 1) {
                        const e = { params: {} };
                        null === o ? (o = [e]) : o.push(e), i++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === o ? (o = [e]) : o.push(e), i++;
                    }
                  (l = e === i), (s = s || l);
                }
                if (!s) {
                  const e = { params: {} };
                  return (
                    null === o ? (o = [e]) : o.push(e), i++, (c.errors = o), !1
                  );
                }
                (i = n),
                  null !== o && (n ? (o.length = n) : (o = null)),
                  (a = r === i);
              } else a = !0;
              if (a) {
                if (void 0 !== e.name) {
                  const r = i;
                  u(e.name, {
                    instancePath: t + '/name',
                    parentData: e,
                    parentDataProperty: 'name',
                    rootData: s,
                  }) ||
                    ((o = null === o ? u.errors : o.concat(u.errors)),
                    (i = o.length)),
                    (a = r === i);
                } else a = !0;
                if (a) {
                  if (void 0 !== e.type) {
                    let t = e.type;
                    const r = i,
                      n = i;
                    let s = !1;
                    const l = i;
                    if (
                      'var' !== t &&
                      'module' !== t &&
                      'assign' !== t &&
                      'assign-properties' !== t &&
                      'this' !== t &&
                      'window' !== t &&
                      'self' !== t &&
                      'global' !== t &&
                      'commonjs' !== t &&
                      'commonjs2' !== t &&
                      'commonjs-module' !== t &&
                      'commonjs-static' !== t &&
                      'amd' !== t &&
                      'amd-require' !== t &&
                      'umd' !== t &&
                      'umd2' !== t &&
                      'jsonp' !== t &&
                      'system' !== t
                    ) {
                      const e = { params: { allowedValues: p.anyOf[0].enum } };
                      null === o ? (o = [e]) : o.push(e), i++;
                    }
                    var y = l === i;
                    if (((s = s || y), !s)) {
                      const e = i;
                      if ('string' != typeof t) {
                        const e = { params: { type: 'string' } };
                        null === o ? (o = [e]) : o.push(e), i++;
                      }
                      (y = e === i), (s = s || y);
                    }
                    if (!s) {
                      const e = { params: {} };
                      return (
                        null === o ? (o = [e]) : o.push(e),
                        i++,
                        (c.errors = o),
                        !1
                      );
                    }
                    (i = n),
                      null !== o && (n ? (o.length = n) : (o = null)),
                      (a = r === i);
                  } else a = !0;
                  if (a)
                    if (void 0 !== e.umdNamedDefine) {
                      const t = i;
                      if ('boolean' != typeof e.umdNamedDefine)
                        return (
                          (c.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      a = t === i;
                    } else a = !0;
                }
              }
            }
          }
        }
      }
    }
  }
  return (c.errors = o), 0 === i;
}
function y(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  if (!Array.isArray(e))
    return (y.errors = [{ params: { type: 'array' } }]), !1;
  {
    const t = e.length;
    for (let r = 0; r < t; r++) {
      let t = e[r];
      const n = 0;
      if ('string' != typeof t)
        return (y.errors = [{ params: { type: 'string' } }]), !1;
      if (t.length < 1) return (y.errors = [{ params: {} }]), !1;
      if (0 !== n) break;
    }
  }
  return (y.errors = null), !0;
}
function m(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (m.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.external && (r = 'external'))
        return (m.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = i;
        for (const t in e)
          if ('external' !== t && 'shareScope' !== t)
            return (m.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === i) {
          if (void 0 !== e.external) {
            let r = e.external;
            const n = i,
              p = i;
            let f = !1;
            const u = i;
            if (i == i)
              if ('string' == typeof r) {
                if (r.length < 1) {
                  const e = { params: {} };
                  null === o ? (o = [e]) : o.push(e), i++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === o ? (o = [e]) : o.push(e), i++;
              }
            var a = u === i;
            if (((f = f || a), !f)) {
              const n = i;
              y(r, {
                instancePath: t + '/external',
                parentData: e,
                parentDataProperty: 'external',
                rootData: s,
              }) ||
                ((o = null === o ? y.errors : o.concat(y.errors)),
                (i = o.length)),
                (a = n === i),
                (f = f || a);
            }
            if (!f) {
              const e = { params: {} };
              return (
                null === o ? (o = [e]) : o.push(e), i++, (m.errors = o), !1
              );
            }
            (i = p), null !== o && (p ? (o.length = p) : (o = null));
            var l = n === i;
          } else l = !0;
          if (l)
            if (void 0 !== e.shareScope) {
              let t = e.shareScope;
              const r = i,
                n = i;
              let s = !1;
              const a = i;
              if (i === a)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), i++;
                }
              var p = a === i;
              if (((s = s || p), !s)) {
                const e = i;
                if (i === e)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let r = 0; r < e; r++) {
                      let e = t[r];
                      const n = i;
                      if (i === n)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === o ? (o = [e]) : o.push(e), i++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === o ? (o = [e]) : o.push(e), i++;
                        }
                      if (n !== i) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                (p = e === i), (s = s || p);
              }
              if (!s) {
                const e = { params: {} };
                return (
                  null === o ? (o = [e]) : o.push(e), i++, (m.errors = o), !1
                );
              }
              (i = n),
                null !== o && (n ? (o.length = n) : (o = null)),
                (l = r === i);
            } else l = !0;
        }
      }
    }
  }
  return (m.errors = o), 0 === i;
}
function d(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (d.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let n = e[r];
      const l = i,
        p = i;
      let f = !1;
      const u = i;
      m(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((o = null === o ? m.errors : o.concat(m.errors)), (i = o.length));
      var a = u === i;
      if (((f = f || a), !f)) {
        const l = i;
        if (i == i)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), i++;
          }
        if (((a = l === i), (f = f || a), !f)) {
          const l = i;
          y(n, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: s,
          }) ||
            ((o = null === o ? y.errors : o.concat(y.errors)), (i = o.length)),
            (a = l === i),
            (f = f || a);
        }
      }
      if (!f) {
        const e = { params: {} };
        return null === o ? (o = [e]) : o.push(e), i++, (d.errors = o), !1;
      }
      if (((i = p), null !== o && (p ? (o.length = p) : (o = null)), l !== i))
        break;
    }
  }
  return (d.errors = o), 0 === i;
}
function g(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    i = 0;
  const a = i;
  let l = !1;
  const p = i;
  if (i === p)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const a = i,
          l = i;
        let p = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), i++;
          }
        var f = u === i;
        if (((p = p || f), !p)) {
          const a = i;
          d(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((o = null === o ? d.errors : o.concat(d.errors)), (i = o.length)),
            (f = a === i),
            (p = p || f);
        }
        if (p) (i = l), null !== o && (l ? (o.length = l) : (o = null));
        else {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), i++;
        }
        if (a !== i) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), i++;
    }
  var u = p === i;
  if (((l = l || u), !l)) {
    const a = i;
    d(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((o = null === o ? d.errors : o.concat(d.errors)), (i = o.length)),
      (u = a === i),
      (l = l || u);
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), i++, (g.errors = o), !1;
  }
  return (
    (i = a),
    null !== o && (a ? (o.length = a) : (o = null)),
    (g.errors = o),
    0 === i
  );
}
const h = {
    type: 'object',
    additionalProperties: !1,
    properties: {
      eager: { type: 'boolean' },
      exclude: { $ref: '#/definitions/IncludeExcludeOptions' },
      include: { $ref: '#/definitions/IncludeExcludeOptions' },
      import: { anyOf: [{ enum: [!1] }, { $ref: '#/definitions/SharedItem' }] },
      request: { type: 'string', minLength: 1 },
      layer: { type: 'string', minLength: 1 },
      issuerLayer: { type: 'string', minLength: 1 },
      packageName: { type: 'string', minLength: 1 },
      requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      shareKey: { type: 'string', minLength: 1 },
      shareScope: {
        anyOf: [
          { type: 'string', minLength: 1 },
          { type: 'array', items: { type: 'string', minLength: 1 } },
        ],
      },
      shareStrategy: {
        enum: ['version-first', 'loaded-first'],
        type: 'string',
      },
      singleton: { type: 'boolean' },
      strictVersion: { type: 'boolean' },
      version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      allowNodeModulesSuffixMatch: { type: 'boolean' },
    },
  },
  b = {
    type: 'object',
    properties: {
      request: { type: ['string', 'object'] },
      version: { type: 'string' },
      fallbackVersion: { type: 'string' },
    },
    additionalProperties: !1,
    anyOf: [
      { required: ['request'] },
      { required: ['version'] },
      { required: ['fallbackVersion'] },
    ],
  };
function v(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: o = e,
  } = {},
) {
  let i = null,
    a = 0;
  if (0 === a) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (v.errors = [{ params: { type: 'object' } }]), !1;
    {
      const t = a;
      for (const t in e)
        if (!s.call(h.properties, t))
          return (v.errors = [{ params: { additionalProperty: t } }]), !1;
      if (t === a) {
        if (void 0 !== e.eager) {
          const t = a;
          if ('boolean' != typeof e.eager)
            return (v.errors = [{ params: { type: 'boolean' } }]), !1;
          var l = t === a;
        } else l = !0;
        if (l) {
          if (void 0 !== e.exclude) {
            let t = e.exclude;
            const r = a,
              n = a,
              s = a;
            let o = !1;
            const u = a;
            if (t && 'object' == typeof t && !Array.isArray(t)) {
              let e;
              if (void 0 === t.request && (e = 'request')) {
                const t = { params: { missingProperty: e } };
                null === i ? (i = [t]) : i.push(t), a++;
              }
            }
            var p = u === a;
            if (((o = o || p), !o)) {
              const e = a;
              if (t && 'object' == typeof t && !Array.isArray(t)) {
                let e;
                if (void 0 === t.version && (e = 'version')) {
                  const t = { params: { missingProperty: e } };
                  null === i ? (i = [t]) : i.push(t), a++;
                }
              }
              if (((p = e === a), (o = o || p), !o)) {
                const e = a;
                if (t && 'object' == typeof t && !Array.isArray(t)) {
                  let e;
                  if (void 0 === t.fallbackVersion && (e = 'fallbackVersion')) {
                    const t = { params: { missingProperty: e } };
                    null === i ? (i = [t]) : i.push(t), a++;
                  }
                }
                (p = e === a), (o = o || p);
              }
            }
            if (!o) {
              const e = { params: {} };
              return (
                null === i ? (i = [e]) : i.push(e), a++, (v.errors = i), !1
              );
            }
            if (
              ((a = s),
              null !== i && (s ? (i.length = s) : (i = null)),
              a === n)
            ) {
              if (!t || 'object' != typeof t || Array.isArray(t))
                return (v.errors = [{ params: { type: 'object' } }]), !1;
              {
                const e = a;
                for (const e in t)
                  if (
                    'request' !== e &&
                    'version' !== e &&
                    'fallbackVersion' !== e
                  )
                    return (
                      (v.errors = [{ params: { additionalProperty: e } }]), !1
                    );
                if (e === a) {
                  if (void 0 !== t.request) {
                    let e = t.request;
                    const r = a;
                    if (
                      'string' != typeof e &&
                      (!e || 'object' != typeof e || Array.isArray(e))
                    )
                      return (
                        (v.errors = [
                          { params: { type: b.properties.request.type } },
                        ]),
                        !1
                      );
                    var f = r === a;
                  } else f = !0;
                  if (f) {
                    if (void 0 !== t.version) {
                      const e = a;
                      if ('string' != typeof t.version)
                        return (
                          (v.errors = [{ params: { type: 'string' } }]), !1
                        );
                      f = e === a;
                    } else f = !0;
                    if (f)
                      if (void 0 !== t.fallbackVersion) {
                        const e = a;
                        if ('string' != typeof t.fallbackVersion)
                          return (
                            (v.errors = [{ params: { type: 'string' } }]), !1
                          );
                        f = e === a;
                      } else f = !0;
                  }
                }
              }
            }
            l = r === a;
          } else l = !0;
          if (l) {
            if (void 0 !== e.include) {
              let t = e.include;
              const r = a,
                n = a,
                s = a;
              let o = !1;
              const p = a;
              if (t && 'object' == typeof t && !Array.isArray(t)) {
                let e;
                if (void 0 === t.request && (e = 'request')) {
                  const t = { params: { missingProperty: e } };
                  null === i ? (i = [t]) : i.push(t), a++;
                }
              }
              var u = p === a;
              if (((o = o || u), !o)) {
                const e = a;
                if (t && 'object' == typeof t && !Array.isArray(t)) {
                  let e;
                  if (void 0 === t.version && (e = 'version')) {
                    const t = { params: { missingProperty: e } };
                    null === i ? (i = [t]) : i.push(t), a++;
                  }
                }
                if (((u = e === a), (o = o || u), !o)) {
                  const e = a;
                  if (t && 'object' == typeof t && !Array.isArray(t)) {
                    let e;
                    if (
                      void 0 === t.fallbackVersion &&
                      (e = 'fallbackVersion')
                    ) {
                      const t = { params: { missingProperty: e } };
                      null === i ? (i = [t]) : i.push(t), a++;
                    }
                  }
                  (u = e === a), (o = o || u);
                }
              }
              if (!o) {
                const e = { params: {} };
                return (
                  null === i ? (i = [e]) : i.push(e), a++, (v.errors = i), !1
                );
              }
              if (
                ((a = s),
                null !== i && (s ? (i.length = s) : (i = null)),
                a === n)
              ) {
                if (!t || 'object' != typeof t || Array.isArray(t))
                  return (v.errors = [{ params: { type: 'object' } }]), !1;
                {
                  const e = a;
                  for (const e in t)
                    if (
                      'request' !== e &&
                      'version' !== e &&
                      'fallbackVersion' !== e
                    )
                      return (
                        (v.errors = [{ params: { additionalProperty: e } }]), !1
                      );
                  if (e === a) {
                    if (void 0 !== t.request) {
                      let e = t.request;
                      const r = a;
                      if (
                        'string' != typeof e &&
                        (!e || 'object' != typeof e || Array.isArray(e))
                      )
                        return (
                          (v.errors = [
                            { params: { type: b.properties.request.type } },
                          ]),
                          !1
                        );
                      var c = r === a;
                    } else c = !0;
                    if (c) {
                      if (void 0 !== t.version) {
                        const e = a;
                        if ('string' != typeof t.version)
                          return (
                            (v.errors = [{ params: { type: 'string' } }]), !1
                          );
                        c = e === a;
                      } else c = !0;
                      if (c)
                        if (void 0 !== t.fallbackVersion) {
                          const e = a;
                          if ('string' != typeof t.fallbackVersion)
                            return (
                              (v.errors = [{ params: { type: 'string' } }]), !1
                            );
                          c = e === a;
                        } else c = !0;
                    }
                  }
                }
              }
              l = r === a;
            } else l = !0;
            if (l) {
              if (void 0 !== e.import) {
                let t = e.import;
                const r = a,
                  n = a;
                let s = !1;
                const o = a;
                if (!1 !== t) {
                  const e = {
                    params: {
                      allowedValues: h.properties.import.anyOf[0].enum,
                    },
                  };
                  null === i ? (i = [e]) : i.push(e), a++;
                }
                var y = o === a;
                if (((s = s || y), !s)) {
                  const e = a;
                  if (a == a)
                    if ('string' == typeof t) {
                      if (t.length < 1) {
                        const e = { params: {} };
                        null === i ? (i = [e]) : i.push(e), a++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === i ? (i = [e]) : i.push(e), a++;
                    }
                  (y = e === a), (s = s || y);
                }
                if (!s) {
                  const e = { params: {} };
                  return (
                    null === i ? (i = [e]) : i.push(e), a++, (v.errors = i), !1
                  );
                }
                (a = n),
                  null !== i && (n ? (i.length = n) : (i = null)),
                  (l = r === a);
              } else l = !0;
              if (l) {
                if (void 0 !== e.request) {
                  let t = e.request;
                  const r = a;
                  if (a === r) {
                    if ('string' != typeof t)
                      return (v.errors = [{ params: { type: 'string' } }]), !1;
                    if (t.length < 1) return (v.errors = [{ params: {} }]), !1;
                  }
                  l = r === a;
                } else l = !0;
                if (l) {
                  if (void 0 !== e.layer) {
                    let t = e.layer;
                    const r = a;
                    if (a === r) {
                      if ('string' != typeof t)
                        return (
                          (v.errors = [{ params: { type: 'string' } }]), !1
                        );
                      if (t.length < 1)
                        return (v.errors = [{ params: {} }]), !1;
                    }
                    l = r === a;
                  } else l = !0;
                  if (l) {
                    if (void 0 !== e.issuerLayer) {
                      let t = e.issuerLayer;
                      const r = a;
                      if (a === r) {
                        if ('string' != typeof t)
                          return (
                            (v.errors = [{ params: { type: 'string' } }]), !1
                          );
                        if (t.length < 1)
                          return (v.errors = [{ params: {} }]), !1;
                      }
                      l = r === a;
                    } else l = !0;
                    if (l) {
                      if (void 0 !== e.packageName) {
                        let t = e.packageName;
                        const r = a;
                        if (a === r) {
                          if ('string' != typeof t)
                            return (
                              (v.errors = [{ params: { type: 'string' } }]), !1
                            );
                          if (t.length < 1)
                            return (v.errors = [{ params: {} }]), !1;
                        }
                        l = r === a;
                      } else l = !0;
                      if (l) {
                        if (void 0 !== e.requiredVersion) {
                          let t = e.requiredVersion;
                          const r = a,
                            n = a;
                          let s = !1;
                          const o = a;
                          if (!1 !== t) {
                            const e = {
                              params: {
                                allowedValues:
                                  h.properties.requiredVersion.anyOf[0].enum,
                              },
                            };
                            null === i ? (i = [e]) : i.push(e), a++;
                          }
                          var m = o === a;
                          if (((s = s || m), !s)) {
                            const e = a;
                            if ('string' != typeof t) {
                              const e = { params: { type: 'string' } };
                              null === i ? (i = [e]) : i.push(e), a++;
                            }
                            (m = e === a), (s = s || m);
                          }
                          if (!s) {
                            const e = { params: {} };
                            return (
                              null === i ? (i = [e]) : i.push(e),
                              a++,
                              (v.errors = i),
                              !1
                            );
                          }
                          (a = n),
                            null !== i && (n ? (i.length = n) : (i = null)),
                            (l = r === a);
                        } else l = !0;
                        if (l) {
                          if (void 0 !== e.shareKey) {
                            let t = e.shareKey;
                            const r = a;
                            if (a === r) {
                              if ('string' != typeof t)
                                return (
                                  (v.errors = [{ params: { type: 'string' } }]),
                                  !1
                                );
                              if (t.length < 1)
                                return (v.errors = [{ params: {} }]), !1;
                            }
                            l = r === a;
                          } else l = !0;
                          if (l) {
                            if (void 0 !== e.shareScope) {
                              let t = e.shareScope;
                              const r = a,
                                n = a;
                              let s = !1;
                              const o = a;
                              if (a === o)
                                if ('string' == typeof t) {
                                  if (t.length < 1) {
                                    const e = { params: {} };
                                    null === i ? (i = [e]) : i.push(e), a++;
                                  }
                                } else {
                                  const e = { params: { type: 'string' } };
                                  null === i ? (i = [e]) : i.push(e), a++;
                                }
                              var d = o === a;
                              if (((s = s || d), !s)) {
                                const e = a;
                                if (a === e)
                                  if (Array.isArray(t)) {
                                    const e = t.length;
                                    for (let r = 0; r < e; r++) {
                                      let e = t[r];
                                      const n = a;
                                      if (a === n)
                                        if ('string' == typeof e) {
                                          if (e.length < 1) {
                                            const e = { params: {} };
                                            null === i ? (i = [e]) : i.push(e),
                                              a++;
                                          }
                                        } else {
                                          const e = {
                                            params: { type: 'string' },
                                          };
                                          null === i ? (i = [e]) : i.push(e),
                                            a++;
                                        }
                                      if (n !== a) break;
                                    }
                                  } else {
                                    const e = { params: { type: 'array' } };
                                    null === i ? (i = [e]) : i.push(e), a++;
                                  }
                                (d = e === a), (s = s || d);
                              }
                              if (!s) {
                                const e = { params: {} };
                                return (
                                  null === i ? (i = [e]) : i.push(e),
                                  a++,
                                  (v.errors = i),
                                  !1
                                );
                              }
                              (a = n),
                                null !== i && (n ? (i.length = n) : (i = null)),
                                (l = r === a);
                            } else l = !0;
                            if (l) {
                              if (void 0 !== e.shareStrategy) {
                                let t = e.shareStrategy;
                                const r = a;
                                if ('string' != typeof t)
                                  return (
                                    (v.errors = [
                                      { params: { type: 'string' } },
                                    ]),
                                    !1
                                  );
                                if (
                                  'version-first' !== t &&
                                  'loaded-first' !== t
                                )
                                  return (
                                    (v.errors = [
                                      {
                                        params: {
                                          allowedValues:
                                            h.properties.shareStrategy.enum,
                                        },
                                      },
                                    ]),
                                    !1
                                  );
                                l = r === a;
                              } else l = !0;
                              if (l) {
                                if (void 0 !== e.singleton) {
                                  const t = a;
                                  if ('boolean' != typeof e.singleton)
                                    return (
                                      (v.errors = [
                                        { params: { type: 'boolean' } },
                                      ]),
                                      !1
                                    );
                                  l = t === a;
                                } else l = !0;
                                if (l) {
                                  if (void 0 !== e.strictVersion) {
                                    const t = a;
                                    if ('boolean' != typeof e.strictVersion)
                                      return (
                                        (v.errors = [
                                          { params: { type: 'boolean' } },
                                        ]),
                                        !1
                                      );
                                    l = t === a;
                                  } else l = !0;
                                  if (l) {
                                    if (void 0 !== e.version) {
                                      let t = e.version;
                                      const r = a,
                                        n = a;
                                      let s = !1;
                                      const o = a;
                                      if (!1 !== t) {
                                        const e = {
                                          params: {
                                            allowedValues:
                                              h.properties.version.anyOf[0]
                                                .enum,
                                          },
                                        };
                                        null === i ? (i = [e]) : i.push(e), a++;
                                      }
                                      var g = o === a;
                                      if (((s = s || g), !s)) {
                                        const e = a;
                                        if ('string' != typeof t) {
                                          const e = {
                                            params: { type: 'string' },
                                          };
                                          null === i ? (i = [e]) : i.push(e),
                                            a++;
                                        }
                                        (g = e === a), (s = s || g);
                                      }
                                      if (!s) {
                                        const e = { params: {} };
                                        return (
                                          null === i ? (i = [e]) : i.push(e),
                                          a++,
                                          (v.errors = i),
                                          !1
                                        );
                                      }
                                      (a = n),
                                        null !== i &&
                                          (n ? (i.length = n) : (i = null)),
                                        (l = r === a);
                                    } else l = !0;
                                    if (l)
                                      if (
                                        void 0 !== e.allowNodeModulesSuffixMatch
                                      ) {
                                        const t = a;
                                        if (
                                          'boolean' !=
                                          typeof e.allowNodeModulesSuffixMatch
                                        )
                                          return (
                                            (v.errors = [
                                              { params: { type: 'boolean' } },
                                            ]),
                                            !1
                                          );
                                        l = t === a;
                                      } else l = !0;
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
          }
        }
      }
    }
  }
  return (v.errors = i), 0 === a;
}
function P(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (P.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let n = e[r];
      const l = i,
        p = i;
      let f = !1;
      const u = i;
      v(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((o = null === o ? v.errors : o.concat(v.errors)), (i = o.length));
      var a = u === i;
      if (((f = f || a), !f)) {
        const e = i;
        if (i == i)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), i++;
          }
        (a = e === i), (f = f || a);
      }
      if (!f) {
        const e = { params: {} };
        return null === o ? (o = [e]) : o.push(e), i++, (P.errors = o), !1;
      }
      if (((i = p), null !== o && (p ? (o.length = p) : (o = null)), l !== i))
        break;
    }
  }
  return (P.errors = o), 0 === i;
}
function j(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    i = 0;
  const a = i;
  let l = !1;
  const p = i;
  if (i === p)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const a = i,
          l = i;
        let p = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), i++;
          }
        var f = u === i;
        if (((p = p || f), !p)) {
          const a = i;
          P(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((o = null === o ? P.errors : o.concat(P.errors)), (i = o.length)),
            (f = a === i),
            (p = p || f);
        }
        if (p) (i = l), null !== o && (l ? (o.length = l) : (o = null));
        else {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), i++;
        }
        if (a !== i) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), i++;
    }
  var u = p === i;
  if (((l = l || u), !l)) {
    const a = i;
    P(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((o = null === o ? P.errors : o.concat(P.errors)), (i = o.length)),
      (u = a === i),
      (l = l || u);
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), i++, (j.errors = o), !1;
  }
  return (
    (i = a),
    null !== o && (a ? (o.length = a) : (o = null)),
    (j.errors = o),
    0 === i
  );
}
function A(
  o,
  {
    instancePath: i = '',
    parentData: a,
    parentDataProperty: p,
    rootData: f = o,
  } = {},
) {
  let u = null,
    y = 0;
  if (0 === y) {
    if (!o || 'object' != typeof o || Array.isArray(o))
      return (A.errors = [{ params: { type: 'object' } }]), !1;
    {
      const a = y;
      for (const e in o)
        if (!s.call(t.properties, e))
          return (A.errors = [{ params: { additionalProperty: e } }]), !1;
      if (a === y) {
        if (void 0 !== o.async) {
          let e = o.async;
          const t = y,
            r = y;
          let n = !1;
          const s = y;
          if ('boolean' != typeof e) {
            const e = { params: { type: 'boolean' } };
            null === u ? (u = [e]) : u.push(e), y++;
          }
          var m = s === y;
          if (((n = n || m), !n)) {
            const t = y;
            if (y === t)
              if (e && 'object' == typeof e && !Array.isArray(e)) {
                const t = y;
                for (const t in e)
                  if ('eager' !== t && 'excludeChunk' !== t) {
                    const e = { params: { additionalProperty: t } };
                    null === u ? (u = [e]) : u.push(e), y++;
                    break;
                  }
                if (t === y) {
                  if (void 0 !== e.eager) {
                    let t = e.eager;
                    const r = y,
                      n = y;
                    let s = !1;
                    const o = y;
                    if (!(t instanceof RegExp)) {
                      const e = { params: {} };
                      null === u ? (u = [e]) : u.push(e), y++;
                    }
                    var d = o === y;
                    if (((s = s || d), !s)) {
                      const e = y;
                      if (!(t instanceof Function)) {
                        const e = { params: {} };
                        null === u ? (u = [e]) : u.push(e), y++;
                      }
                      (d = e === y), (s = s || d);
                    }
                    if (s)
                      (y = n), null !== u && (n ? (u.length = n) : (u = null));
                    else {
                      const e = { params: {} };
                      null === u ? (u = [e]) : u.push(e), y++;
                    }
                    var h = r === y;
                  } else h = !0;
                  if (h)
                    if (void 0 !== e.excludeChunk) {
                      const t = y;
                      if (!(e.excludeChunk instanceof Function)) {
                        const e = { params: {} };
                        null === u ? (u = [e]) : u.push(e), y++;
                      }
                      h = t === y;
                    } else h = !0;
                }
              } else {
                const e = { params: { type: 'object' } };
                null === u ? (u = [e]) : u.push(e), y++;
              }
            (m = t === y), (n = n || m);
          }
          if (!n) {
            const e = { params: {} };
            return null === u ? (u = [e]) : u.push(e), y++, (A.errors = u), !1;
          }
          (y = r), null !== u && (r ? (u.length = r) : (u = null));
          var b = t === y;
        } else b = !0;
        if (b) {
          if (void 0 !== o.exposes) {
            const e = y;
            l(o.exposes, {
              instancePath: i + '/exposes',
              parentData: o,
              parentDataProperty: 'exposes',
              rootData: f,
            }) ||
              ((u = null === u ? l.errors : u.concat(l.errors)),
              (y = u.length)),
              (b = e === y);
          } else b = !0;
          if (b) {
            if (void 0 !== o.filename) {
              let t = o.filename;
              const r = y;
              if (y === r) {
                if ('string' != typeof t)
                  return (A.errors = [{ params: { type: 'string' } }]), !1;
                if (t.length < 1) return (A.errors = [{ params: {} }]), !1;
                if (t.includes('!') || !1 !== e.test(t))
                  return (A.errors = [{ params: {} }]), !1;
              }
              b = r === y;
            } else b = !0;
            if (b) {
              if (void 0 !== o.library) {
                const e = y;
                c(o.library, {
                  instancePath: i + '/library',
                  parentData: o,
                  parentDataProperty: 'library',
                  rootData: f,
                }) ||
                  ((u = null === u ? c.errors : u.concat(c.errors)),
                  (y = u.length)),
                  (b = e === y);
              } else b = !0;
              if (b) {
                if (void 0 !== o.name) {
                  let e = o.name;
                  const t = y;
                  if (y === t) {
                    if ('string' != typeof e)
                      return (A.errors = [{ params: { type: 'string' } }]), !1;
                    if (e.length < 1) return (A.errors = [{ params: {} }]), !1;
                  }
                  b = t === y;
                } else b = !0;
                if (b) {
                  if (void 0 !== o.remoteType) {
                    let e = o.remoteType;
                    const t = y,
                      n = y;
                    let s = !1,
                      i = null;
                    const a = y;
                    if (
                      'var' !== e &&
                      'module' !== e &&
                      'assign' !== e &&
                      'this' !== e &&
                      'window' !== e &&
                      'self' !== e &&
                      'global' !== e &&
                      'commonjs' !== e &&
                      'commonjs2' !== e &&
                      'commonjs-module' !== e &&
                      'commonjs-static' !== e &&
                      'amd' !== e &&
                      'amd-require' !== e &&
                      'umd' !== e &&
                      'umd2' !== e &&
                      'jsonp' !== e &&
                      'system' !== e &&
                      'promise' !== e &&
                      'import' !== e &&
                      'module-import' !== e &&
                      'script' !== e &&
                      'node-commonjs' !== e
                    ) {
                      const e = { params: { allowedValues: r.enum } };
                      null === u ? (u = [e]) : u.push(e), y++;
                    }
                    if ((a === y && ((s = !0), (i = 0)), !s)) {
                      const e = { params: { passingSchemas: i } };
                      return (
                        null === u ? (u = [e]) : u.push(e),
                        y++,
                        (A.errors = u),
                        !1
                      );
                    }
                    (y = n),
                      null !== u && (n ? (u.length = n) : (u = null)),
                      (b = t === y);
                  } else b = !0;
                  if (b) {
                    if (void 0 !== o.remotes) {
                      const e = y;
                      g(o.remotes, {
                        instancePath: i + '/remotes',
                        parentData: o,
                        parentDataProperty: 'remotes',
                        rootData: f,
                      }) ||
                        ((u = null === u ? g.errors : u.concat(g.errors)),
                        (y = u.length)),
                        (b = e === y);
                    } else b = !0;
                    if (b) {
                      if (void 0 !== o.runtime) {
                        let e = o.runtime;
                        const t = y,
                          r = y;
                        let s = !1;
                        const i = y;
                        if (!1 !== e) {
                          const e = {
                            params: { allowedValues: n.anyOf[0].enum },
                          };
                          null === u ? (u = [e]) : u.push(e), y++;
                        }
                        var v = i === y;
                        if (((s = s || v), !s)) {
                          const t = y;
                          if (y === t)
                            if ('string' == typeof e) {
                              if (e.length < 1) {
                                const e = { params: {} };
                                null === u ? (u = [e]) : u.push(e), y++;
                              }
                            } else {
                              const e = { params: { type: 'string' } };
                              null === u ? (u = [e]) : u.push(e), y++;
                            }
                          (v = t === y), (s = s || v);
                        }
                        if (!s) {
                          const e = { params: {} };
                          return (
                            null === u ? (u = [e]) : u.push(e),
                            y++,
                            (A.errors = u),
                            !1
                          );
                        }
                        (y = r),
                          null !== u && (r ? (u.length = r) : (u = null)),
                          (b = t === y);
                      } else b = !0;
                      if (b) {
                        if (void 0 !== o.shareScope) {
                          let e = o.shareScope;
                          const t = y,
                            r = y;
                          let n = !1;
                          const s = y;
                          if (y === s)
                            if ('string' == typeof e) {
                              if (e.length < 1) {
                                const e = { params: {} };
                                null === u ? (u = [e]) : u.push(e), y++;
                              }
                            } else {
                              const e = { params: { type: 'string' } };
                              null === u ? (u = [e]) : u.push(e), y++;
                            }
                          var P = s === y;
                          if (((n = n || P), !n)) {
                            const t = y;
                            if (y === t)
                              if (Array.isArray(e)) {
                                const t = e.length;
                                for (let r = 0; r < t; r++) {
                                  let t = e[r];
                                  const n = y;
                                  if (y === n)
                                    if ('string' == typeof t) {
                                      if (t.length < 1) {
                                        const e = { params: {} };
                                        null === u ? (u = [e]) : u.push(e), y++;
                                      }
                                    } else {
                                      const e = { params: { type: 'string' } };
                                      null === u ? (u = [e]) : u.push(e), y++;
                                    }
                                  if (n !== y) break;
                                }
                              } else {
                                const e = { params: { type: 'array' } };
                                null === u ? (u = [e]) : u.push(e), y++;
                              }
                            (P = t === y), (n = n || P);
                          }
                          if (!n) {
                            const e = { params: {} };
                            return (
                              null === u ? (u = [e]) : u.push(e),
                              y++,
                              (A.errors = u),
                              !1
                            );
                          }
                          (y = r),
                            null !== u && (r ? (u.length = r) : (u = null)),
                            (b = t === y);
                        } else b = !0;
                        if (b) {
                          if (void 0 !== o.shareStrategy) {
                            let e = o.shareStrategy;
                            const r = y;
                            if ('string' != typeof e)
                              return (
                                (A.errors = [{ params: { type: 'string' } }]),
                                !1
                              );
                            if ('version-first' !== e && 'loaded-first' !== e)
                              return (
                                (A.errors = [
                                  {
                                    params: {
                                      allowedValues:
                                        t.properties.shareStrategy.enum,
                                    },
                                  },
                                ]),
                                !1
                              );
                            b = r === y;
                          } else b = !0;
                          if (b) {
                            if (void 0 !== o.shared) {
                              const e = y;
                              j(o.shared, {
                                instancePath: i + '/shared',
                                parentData: o,
                                parentDataProperty: 'shared',
                                rootData: f,
                              }) ||
                                ((u =
                                  null === u ? j.errors : u.concat(j.errors)),
                                (y = u.length)),
                                (b = e === y);
                            } else b = !0;
                            if (b) {
                              if (void 0 !== o.dts) {
                                let e = o.dts;
                                const r = y,
                                  n = y;
                                let s = !1;
                                const i = y;
                                if ('boolean' != typeof e) {
                                  const e = { params: { type: 'boolean' } };
                                  null === u ? (u = [e]) : u.push(e), y++;
                                }
                                var D = i === y;
                                if (((s = s || D), !s)) {
                                  const r = y;
                                  if (y === r)
                                    if (
                                      e &&
                                      'object' == typeof e &&
                                      !Array.isArray(e)
                                    ) {
                                      if (void 0 !== e.generateTypes) {
                                        let t = e.generateTypes;
                                        const r = y,
                                          n = y;
                                        let s = !1;
                                        const o = y;
                                        if ('boolean' != typeof t) {
                                          const e = {
                                            params: { type: 'boolean' },
                                          };
                                          null === u ? (u = [e]) : u.push(e),
                                            y++;
                                        }
                                        var x = o === y;
                                        if (((s = s || x), !s)) {
                                          const e = y;
                                          if (y === e)
                                            if (
                                              t &&
                                              'object' == typeof t &&
                                              !Array.isArray(t)
                                            ) {
                                              if (void 0 !== t.tsConfigPath) {
                                                const e = y;
                                                if (
                                                  'string' !=
                                                  typeof t.tsConfigPath
                                                ) {
                                                  const e = {
                                                    params: { type: 'string' },
                                                  };
                                                  null === u
                                                    ? (u = [e])
                                                    : u.push(e),
                                                    y++;
                                                }
                                                var O = e === y;
                                              } else O = !0;
                                              if (O) {
                                                if (void 0 !== t.typesFolder) {
                                                  const e = y;
                                                  if (
                                                    'string' !=
                                                    typeof t.typesFolder
                                                  ) {
                                                    const e = {
                                                      params: {
                                                        type: 'string',
                                                      },
                                                    };
                                                    null === u
                                                      ? (u = [e])
                                                      : u.push(e),
                                                      y++;
                                                  }
                                                  O = e === y;
                                                } else O = !0;
                                                if (O) {
                                                  if (
                                                    void 0 !==
                                                    t.compiledTypesFolder
                                                  ) {
                                                    const e = y;
                                                    if (
                                                      'string' !=
                                                      typeof t.compiledTypesFolder
                                                    ) {
                                                      const e = {
                                                        params: {
                                                          type: 'string',
                                                        },
                                                      };
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                        y++;
                                                    }
                                                    O = e === y;
                                                  } else O = !0;
                                                  if (O) {
                                                    if (
                                                      void 0 !==
                                                      t.deleteTypesFolder
                                                    ) {
                                                      const e = y;
                                                      if (
                                                        'boolean' !=
                                                        typeof t.deleteTypesFolder
                                                      ) {
                                                        const e = {
                                                          params: {
                                                            type: 'boolean',
                                                          },
                                                        };
                                                        null === u
                                                          ? (u = [e])
                                                          : u.push(e),
                                                          y++;
                                                      }
                                                      O = e === y;
                                                    } else O = !0;
                                                    if (O) {
                                                      if (
                                                        void 0 !==
                                                        t.additionalFilesToCompile
                                                      ) {
                                                        let e =
                                                          t.additionalFilesToCompile;
                                                        const r = y;
                                                        if (y === r)
                                                          if (
                                                            Array.isArray(e)
                                                          ) {
                                                            const t = e.length;
                                                            for (
                                                              let r = 0;
                                                              r < t;
                                                              r++
                                                            ) {
                                                              const t = y;
                                                              if (
                                                                'string' !=
                                                                typeof e[r]
                                                              ) {
                                                                const e = {
                                                                  params: {
                                                                    type: 'string',
                                                                  },
                                                                };
                                                                null === u
                                                                  ? (u = [e])
                                                                  : u.push(e),
                                                                  y++;
                                                              }
                                                              if (t !== y)
                                                                break;
                                                            }
                                                          } else {
                                                            const e = {
                                                              params: {
                                                                type: 'array',
                                                              },
                                                            };
                                                            null === u
                                                              ? (u = [e])
                                                              : u.push(e),
                                                              y++;
                                                          }
                                                        O = r === y;
                                                      } else O = !0;
                                                      if (O) {
                                                        if (
                                                          void 0 !==
                                                          t.compileInChildProcess
                                                        ) {
                                                          const e = y;
                                                          if (
                                                            'boolean' !=
                                                            typeof t.compileInChildProcess
                                                          ) {
                                                            const e = {
                                                              params: {
                                                                type: 'boolean',
                                                              },
                                                            };
                                                            null === u
                                                              ? (u = [e])
                                                              : u.push(e),
                                                              y++;
                                                          }
                                                          O = e === y;
                                                        } else O = !0;
                                                        if (O) {
                                                          if (
                                                            void 0 !==
                                                            t.compilerInstance
                                                          ) {
                                                            const e = y;
                                                            if (
                                                              'string' !=
                                                              typeof t.compilerInstance
                                                            ) {
                                                              const e = {
                                                                params: {
                                                                  type: 'string',
                                                                },
                                                              };
                                                              null === u
                                                                ? (u = [e])
                                                                : u.push(e),
                                                                y++;
                                                            }
                                                            O = e === y;
                                                          } else O = !0;
                                                          if (O) {
                                                            if (
                                                              void 0 !==
                                                              t.generateAPITypes
                                                            ) {
                                                              const e = y;
                                                              if (
                                                                'boolean' !=
                                                                typeof t.generateAPITypes
                                                              ) {
                                                                const e = {
                                                                  params: {
                                                                    type: 'boolean',
                                                                  },
                                                                };
                                                                null === u
                                                                  ? (u = [e])
                                                                  : u.push(e),
                                                                  y++;
                                                              }
                                                              O = e === y;
                                                            } else O = !0;
                                                            if (O) {
                                                              if (
                                                                void 0 !==
                                                                t.extractThirdParty
                                                              ) {
                                                                let e =
                                                                  t.extractThirdParty;
                                                                const r = y,
                                                                  n = y;
                                                                let s = !1;
                                                                const o = y;
                                                                if (
                                                                  'boolean' !=
                                                                  typeof e
                                                                ) {
                                                                  const e = {
                                                                    params: {
                                                                      type: 'boolean',
                                                                    },
                                                                  };
                                                                  null === u
                                                                    ? (u = [e])
                                                                    : u.push(e),
                                                                    y++;
                                                                }
                                                                var T = o === y;
                                                                if (
                                                                  ((s = s || T),
                                                                  !s)
                                                                ) {
                                                                  const t = y;
                                                                  if (y === t)
                                                                    if (
                                                                      e &&
                                                                      'object' ==
                                                                        typeof e &&
                                                                      !Array.isArray(
                                                                        e,
                                                                      )
                                                                    ) {
                                                                      const t =
                                                                        y;
                                                                      for (const t in e)
                                                                        if (
                                                                          'exclude' !==
                                                                          t
                                                                        ) {
                                                                          const e =
                                                                            {
                                                                              params:
                                                                                {
                                                                                  additionalProperty:
                                                                                    t,
                                                                                },
                                                                            };
                                                                          null ===
                                                                          u
                                                                            ? (u =
                                                                                [
                                                                                  e,
                                                                                ])
                                                                            : u.push(
                                                                                e,
                                                                              ),
                                                                            y++;
                                                                          break;
                                                                        }
                                                                      if (
                                                                        t ===
                                                                          y &&
                                                                        void 0 !==
                                                                          e.exclude
                                                                      ) {
                                                                        let t =
                                                                          e.exclude;
                                                                        if (
                                                                          y == y
                                                                        )
                                                                          if (
                                                                            Array.isArray(
                                                                              t,
                                                                            )
                                                                          ) {
                                                                            const e =
                                                                              t.length;
                                                                            for (
                                                                              let r = 0;
                                                                              r <
                                                                              e;
                                                                              r++
                                                                            ) {
                                                                              let e =
                                                                                t[
                                                                                  r
                                                                                ];
                                                                              const n =
                                                                                  y,
                                                                                s =
                                                                                  y;
                                                                              let o =
                                                                                !1;
                                                                              const i =
                                                                                y;
                                                                              if (
                                                                                'string' !=
                                                                                typeof e
                                                                              ) {
                                                                                const e =
                                                                                  {
                                                                                    params:
                                                                                      {
                                                                                        type: 'string',
                                                                                      },
                                                                                  };
                                                                                null ===
                                                                                u
                                                                                  ? (u =
                                                                                      [
                                                                                        e,
                                                                                      ])
                                                                                  : u.push(
                                                                                      e,
                                                                                    ),
                                                                                  y++;
                                                                              }
                                                                              var L =
                                                                                i ===
                                                                                y;
                                                                              if (
                                                                                ((o =
                                                                                  o ||
                                                                                  L),
                                                                                !o)
                                                                              ) {
                                                                                const t =
                                                                                  y;
                                                                                if (
                                                                                  !(
                                                                                    e instanceof
                                                                                    RegExp
                                                                                  )
                                                                                ) {
                                                                                  const e =
                                                                                    {
                                                                                      params:
                                                                                        {},
                                                                                    };
                                                                                  null ===
                                                                                  u
                                                                                    ? (u =
                                                                                        [
                                                                                          e,
                                                                                        ])
                                                                                    : u.push(
                                                                                        e,
                                                                                      ),
                                                                                    y++;
                                                                                }
                                                                                (L =
                                                                                  t ===
                                                                                  y),
                                                                                  (o =
                                                                                    o ||
                                                                                    L);
                                                                              }
                                                                              if (
                                                                                o
                                                                              )
                                                                                (y =
                                                                                  s),
                                                                                  null !==
                                                                                    u &&
                                                                                    (s
                                                                                      ? (u.length =
                                                                                          s)
                                                                                      : (u =
                                                                                          null));
                                                                              else {
                                                                                const e =
                                                                                  {
                                                                                    params:
                                                                                      {},
                                                                                  };
                                                                                null ===
                                                                                u
                                                                                  ? (u =
                                                                                      [
                                                                                        e,
                                                                                      ])
                                                                                  : u.push(
                                                                                      e,
                                                                                    ),
                                                                                  y++;
                                                                              }
                                                                              if (
                                                                                n !==
                                                                                y
                                                                              )
                                                                                break;
                                                                            }
                                                                          } else {
                                                                            const e =
                                                                              {
                                                                                params:
                                                                                  {
                                                                                    type: 'array',
                                                                                  },
                                                                              };
                                                                            null ===
                                                                            u
                                                                              ? (u =
                                                                                  [
                                                                                    e,
                                                                                  ])
                                                                              : u.push(
                                                                                  e,
                                                                                ),
                                                                              y++;
                                                                          }
                                                                      }
                                                                    } else {
                                                                      const e =
                                                                        {
                                                                          params:
                                                                            {
                                                                              type: 'object',
                                                                            },
                                                                        };
                                                                      null === u
                                                                        ? (u = [
                                                                            e,
                                                                          ])
                                                                        : u.push(
                                                                            e,
                                                                          ),
                                                                        y++;
                                                                    }
                                                                  (T = t === y),
                                                                    (s =
                                                                      s || T);
                                                                }
                                                                if (s)
                                                                  (y = n),
                                                                    null !==
                                                                      u &&
                                                                      (n
                                                                        ? (u.length =
                                                                            n)
                                                                        : (u =
                                                                            null));
                                                                else {
                                                                  const e = {
                                                                    params: {},
                                                                  };
                                                                  null === u
                                                                    ? (u = [e])
                                                                    : u.push(e),
                                                                    y++;
                                                                }
                                                                O = r === y;
                                                              } else O = !0;
                                                              if (O) {
                                                                if (
                                                                  void 0 !==
                                                                  t.extractRemoteTypes
                                                                ) {
                                                                  const e = y;
                                                                  if (
                                                                    'boolean' !=
                                                                    typeof t.extractRemoteTypes
                                                                  ) {
                                                                    const e = {
                                                                      params: {
                                                                        type: 'boolean',
                                                                      },
                                                                    };
                                                                    null === u
                                                                      ? (u = [
                                                                          e,
                                                                        ])
                                                                      : u.push(
                                                                          e,
                                                                        ),
                                                                      y++;
                                                                  }
                                                                  O = e === y;
                                                                } else O = !0;
                                                                if (O)
                                                                  if (
                                                                    void 0 !==
                                                                    t.abortOnError
                                                                  ) {
                                                                    const e = y;
                                                                    if (
                                                                      'boolean' !=
                                                                      typeof t.abortOnError
                                                                    ) {
                                                                      const e =
                                                                        {
                                                                          params:
                                                                            {
                                                                              type: 'boolean',
                                                                            },
                                                                        };
                                                                      null === u
                                                                        ? (u = [
                                                                            e,
                                                                          ])
                                                                        : u.push(
                                                                            e,
                                                                          ),
                                                                        y++;
                                                                    }
                                                                    O = e === y;
                                                                  } else O = !0;
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
                                              const e = {
                                                params: { type: 'object' },
                                              };
                                              null === u
                                                ? (u = [e])
                                                : u.push(e),
                                                y++;
                                            }
                                          (x = e === y), (s = s || x);
                                        }
                                        if (s)
                                          (y = n),
                                            null !== u &&
                                              (n ? (u.length = n) : (u = null));
                                        else {
                                          const e = { params: {} };
                                          null === u ? (u = [e]) : u.push(e),
                                            y++;
                                        }
                                        var R = r === y;
                                      } else R = !0;
                                      if (R) {
                                        if (void 0 !== e.consumeTypes) {
                                          let r = e.consumeTypes;
                                          const n = y,
                                            s = y;
                                          let o = !1;
                                          const i = y;
                                          if ('boolean' != typeof r) {
                                            const e = {
                                              params: { type: 'boolean' },
                                            };
                                            null === u ? (u = [e]) : u.push(e),
                                              y++;
                                          }
                                          var k = i === y;
                                          if (((o = o || k), !o)) {
                                            const e = y;
                                            if (y === e)
                                              if (
                                                r &&
                                                'object' == typeof r &&
                                                !Array.isArray(r)
                                              ) {
                                                if (void 0 !== r.typesFolder) {
                                                  const e = y;
                                                  if (
                                                    'string' !=
                                                    typeof r.typesFolder
                                                  ) {
                                                    const e = {
                                                      params: {
                                                        type: 'string',
                                                      },
                                                    };
                                                    null === u
                                                      ? (u = [e])
                                                      : u.push(e),
                                                      y++;
                                                  }
                                                  var E = e === y;
                                                } else E = !0;
                                                if (E) {
                                                  if (
                                                    void 0 !== r.abortOnError
                                                  ) {
                                                    const e = y;
                                                    if (
                                                      'boolean' !=
                                                      typeof r.abortOnError
                                                    ) {
                                                      const e = {
                                                        params: {
                                                          type: 'boolean',
                                                        },
                                                      };
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                        y++;
                                                    }
                                                    E = e === y;
                                                  } else E = !0;
                                                  if (E) {
                                                    if (
                                                      void 0 !==
                                                      r.remoteTypesFolder
                                                    ) {
                                                      const e = y;
                                                      if (
                                                        'string' !=
                                                        typeof r.remoteTypesFolder
                                                      ) {
                                                        const e = {
                                                          params: {
                                                            type: 'string',
                                                          },
                                                        };
                                                        null === u
                                                          ? (u = [e])
                                                          : u.push(e),
                                                          y++;
                                                      }
                                                      E = e === y;
                                                    } else E = !0;
                                                    if (E) {
                                                      if (
                                                        void 0 !==
                                                        r.deleteTypesFolder
                                                      ) {
                                                        const e = y;
                                                        if (
                                                          'boolean' !=
                                                          typeof r.deleteTypesFolder
                                                        ) {
                                                          const e = {
                                                            params: {
                                                              type: 'boolean',
                                                            },
                                                          };
                                                          null === u
                                                            ? (u = [e])
                                                            : u.push(e),
                                                            y++;
                                                        }
                                                        E = e === y;
                                                      } else E = !0;
                                                      if (E) {
                                                        if (
                                                          void 0 !==
                                                          r.maxRetries
                                                        ) {
                                                          const e = y;
                                                          if (
                                                            'number' !=
                                                            typeof r.maxRetries
                                                          ) {
                                                            const e = {
                                                              params: {
                                                                type: 'number',
                                                              },
                                                            };
                                                            null === u
                                                              ? (u = [e])
                                                              : u.push(e),
                                                              y++;
                                                          }
                                                          E = e === y;
                                                        } else E = !0;
                                                        if (E) {
                                                          if (
                                                            void 0 !==
                                                            r.consumeAPITypes
                                                          ) {
                                                            const e = y;
                                                            if (
                                                              'boolean' !=
                                                              typeof r.consumeAPITypes
                                                            ) {
                                                              const e = {
                                                                params: {
                                                                  type: 'boolean',
                                                                },
                                                              };
                                                              null === u
                                                                ? (u = [e])
                                                                : u.push(e),
                                                                y++;
                                                            }
                                                            E = e === y;
                                                          } else E = !0;
                                                          if (E) {
                                                            if (
                                                              void 0 !==
                                                              r.runtimePkgs
                                                            ) {
                                                              let e =
                                                                r.runtimePkgs;
                                                              const t = y;
                                                              if (y === t)
                                                                if (
                                                                  Array.isArray(
                                                                    e,
                                                                  )
                                                                ) {
                                                                  const t =
                                                                    e.length;
                                                                  for (
                                                                    let r = 0;
                                                                    r < t;
                                                                    r++
                                                                  ) {
                                                                    const t = y;
                                                                    if (
                                                                      'string' !=
                                                                      typeof e[
                                                                        r
                                                                      ]
                                                                    ) {
                                                                      const e =
                                                                        {
                                                                          params:
                                                                            {
                                                                              type: 'string',
                                                                            },
                                                                        };
                                                                      null === u
                                                                        ? (u = [
                                                                            e,
                                                                          ])
                                                                        : u.push(
                                                                            e,
                                                                          ),
                                                                        y++;
                                                                    }
                                                                    if (t !== y)
                                                                      break;
                                                                  }
                                                                } else {
                                                                  const e = {
                                                                    params: {
                                                                      type: 'array',
                                                                    },
                                                                  };
                                                                  null === u
                                                                    ? (u = [e])
                                                                    : u.push(e),
                                                                    y++;
                                                                }
                                                              E = t === y;
                                                            } else E = !0;
                                                            if (E) {
                                                              if (
                                                                void 0 !==
                                                                r.remoteTypeUrls
                                                              ) {
                                                                let e =
                                                                  r.remoteTypeUrls;
                                                                const t = y,
                                                                  n = y;
                                                                let s = !1;
                                                                const o = y;
                                                                if (
                                                                  !(
                                                                    e instanceof
                                                                    Function
                                                                  )
                                                                ) {
                                                                  const e = {
                                                                    params: {},
                                                                  };
                                                                  null === u
                                                                    ? (u = [e])
                                                                    : u.push(e),
                                                                    y++;
                                                                }
                                                                var I = o === y;
                                                                if (
                                                                  ((s = s || I),
                                                                  !s)
                                                                ) {
                                                                  const t = y;
                                                                  if (y === t)
                                                                    if (
                                                                      e &&
                                                                      'object' ==
                                                                        typeof e &&
                                                                      !Array.isArray(
                                                                        e,
                                                                      )
                                                                    )
                                                                      for (const t in e) {
                                                                        let r =
                                                                          e[t];
                                                                        const n =
                                                                          y;
                                                                        if (
                                                                          y ===
                                                                          n
                                                                        )
                                                                          if (
                                                                            r &&
                                                                            'object' ==
                                                                              typeof r &&
                                                                            !Array.isArray(
                                                                              r,
                                                                            )
                                                                          ) {
                                                                            let e;
                                                                            if (
                                                                              (void 0 ===
                                                                                r.api &&
                                                                                (e =
                                                                                  'api')) ||
                                                                              (void 0 ===
                                                                                r.zip &&
                                                                                (e =
                                                                                  'zip'))
                                                                            ) {
                                                                              const t =
                                                                                {
                                                                                  params:
                                                                                    {
                                                                                      missingProperty:
                                                                                        e,
                                                                                    },
                                                                                };
                                                                              null ===
                                                                              u
                                                                                ? (u =
                                                                                    [
                                                                                      t,
                                                                                    ])
                                                                                : u.push(
                                                                                    t,
                                                                                  ),
                                                                                y++;
                                                                            } else {
                                                                              const e =
                                                                                y;
                                                                              for (const e in r)
                                                                                if (
                                                                                  'alias' !==
                                                                                    e &&
                                                                                  'api' !==
                                                                                    e &&
                                                                                  'zip' !==
                                                                                    e
                                                                                ) {
                                                                                  const t =
                                                                                    {
                                                                                      params:
                                                                                        {
                                                                                          additionalProperty:
                                                                                            e,
                                                                                        },
                                                                                    };
                                                                                  null ===
                                                                                  u
                                                                                    ? (u =
                                                                                        [
                                                                                          t,
                                                                                        ])
                                                                                    : u.push(
                                                                                        t,
                                                                                      ),
                                                                                    y++;
                                                                                  break;
                                                                                }
                                                                              if (
                                                                                e ===
                                                                                y
                                                                              ) {
                                                                                if (
                                                                                  void 0 !==
                                                                                  r.alias
                                                                                ) {
                                                                                  const e =
                                                                                    y;
                                                                                  if (
                                                                                    'string' !=
                                                                                    typeof r.alias
                                                                                  ) {
                                                                                    const e =
                                                                                      {
                                                                                        params:
                                                                                          {
                                                                                            type: 'string',
                                                                                          },
                                                                                      };
                                                                                    null ===
                                                                                    u
                                                                                      ? (u =
                                                                                          [
                                                                                            e,
                                                                                          ])
                                                                                      : u.push(
                                                                                          e,
                                                                                        ),
                                                                                      y++;
                                                                                  }
                                                                                  var S =
                                                                                    e ===
                                                                                    y;
                                                                                } else
                                                                                  S =
                                                                                    !0;
                                                                                if (
                                                                                  S
                                                                                ) {
                                                                                  if (
                                                                                    void 0 !==
                                                                                    r.api
                                                                                  ) {
                                                                                    const e =
                                                                                      y;
                                                                                    if (
                                                                                      'string' !=
                                                                                      typeof r.api
                                                                                    ) {
                                                                                      const e =
                                                                                        {
                                                                                          params:
                                                                                            {
                                                                                              type: 'string',
                                                                                            },
                                                                                        };
                                                                                      null ===
                                                                                      u
                                                                                        ? (u =
                                                                                            [
                                                                                              e,
                                                                                            ])
                                                                                        : u.push(
                                                                                            e,
                                                                                          ),
                                                                                        y++;
                                                                                    }
                                                                                    S =
                                                                                      e ===
                                                                                      y;
                                                                                  } else
                                                                                    S =
                                                                                      !0;
                                                                                  if (
                                                                                    S
                                                                                  )
                                                                                    if (
                                                                                      void 0 !==
                                                                                      r.zip
                                                                                    ) {
                                                                                      const e =
                                                                                        y;
                                                                                      if (
                                                                                        'string' !=
                                                                                        typeof r.zip
                                                                                      ) {
                                                                                        const e =
                                                                                          {
                                                                                            params:
                                                                                              {
                                                                                                type: 'string',
                                                                                              },
                                                                                          };
                                                                                        null ===
                                                                                        u
                                                                                          ? (u =
                                                                                              [
                                                                                                e,
                                                                                              ])
                                                                                          : u.push(
                                                                                              e,
                                                                                            ),
                                                                                          y++;
                                                                                      }
                                                                                      S =
                                                                                        e ===
                                                                                        y;
                                                                                    } else
                                                                                      S =
                                                                                        !0;
                                                                                }
                                                                              }
                                                                            }
                                                                          } else {
                                                                            const e =
                                                                              {
                                                                                params:
                                                                                  {
                                                                                    type: 'object',
                                                                                  },
                                                                              };
                                                                            null ===
                                                                            u
                                                                              ? (u =
                                                                                  [
                                                                                    e,
                                                                                  ])
                                                                              : u.push(
                                                                                  e,
                                                                                ),
                                                                              y++;
                                                                          }
                                                                        if (
                                                                          n !==
                                                                          y
                                                                        )
                                                                          break;
                                                                      }
                                                                    else {
                                                                      const e =
                                                                        {
                                                                          params:
                                                                            {
                                                                              type: 'object',
                                                                            },
                                                                        };
                                                                      null === u
                                                                        ? (u = [
                                                                            e,
                                                                          ])
                                                                        : u.push(
                                                                            e,
                                                                          ),
                                                                        y++;
                                                                    }
                                                                  (I = t === y),
                                                                    (s =
                                                                      s || I);
                                                                }
                                                                if (s)
                                                                  (y = n),
                                                                    null !==
                                                                      u &&
                                                                      (n
                                                                        ? (u.length =
                                                                            n)
                                                                        : (u =
                                                                            null));
                                                                else {
                                                                  const e = {
                                                                    params: {},
                                                                  };
                                                                  null === u
                                                                    ? (u = [e])
                                                                    : u.push(e),
                                                                    y++;
                                                                }
                                                                E = t === y;
                                                              } else E = !0;
                                                              if (E) {
                                                                if (
                                                                  void 0 !==
                                                                  r.timeout
                                                                ) {
                                                                  const e = y;
                                                                  if (
                                                                    'number' !=
                                                                    typeof r.timeout
                                                                  ) {
                                                                    const e = {
                                                                      params: {
                                                                        type: 'number',
                                                                      },
                                                                    };
                                                                    null === u
                                                                      ? (u = [
                                                                          e,
                                                                        ])
                                                                      : u.push(
                                                                          e,
                                                                        ),
                                                                      y++;
                                                                  }
                                                                  E = e === y;
                                                                } else E = !0;
                                                                if (E) {
                                                                  if (
                                                                    void 0 !==
                                                                    r.family
                                                                  ) {
                                                                    let e =
                                                                      r.family;
                                                                    const n = y;
                                                                    if (
                                                                      4 !== e &&
                                                                      6 !== e
                                                                    ) {
                                                                      const e =
                                                                        {
                                                                          params:
                                                                            {
                                                                              allowedValues:
                                                                                t
                                                                                  .properties
                                                                                  .dts
                                                                                  .anyOf[1]
                                                                                  .properties
                                                                                  .consumeTypes
                                                                                  .anyOf[1]
                                                                                  .properties
                                                                                  .family
                                                                                  .enum,
                                                                            },
                                                                        };
                                                                      null === u
                                                                        ? (u = [
                                                                            e,
                                                                          ])
                                                                        : u.push(
                                                                            e,
                                                                          ),
                                                                        y++;
                                                                    }
                                                                    E = n === y;
                                                                  } else E = !0;
                                                                  if (E)
                                                                    if (
                                                                      void 0 !==
                                                                      r.typesOnBuild
                                                                    ) {
                                                                      const e =
                                                                        y;
                                                                      if (
                                                                        'boolean' !=
                                                                        typeof r.typesOnBuild
                                                                      ) {
                                                                        const e =
                                                                          {
                                                                            params:
                                                                              {
                                                                                type: 'boolean',
                                                                              },
                                                                          };
                                                                        null ===
                                                                        u
                                                                          ? (u =
                                                                              [
                                                                                e,
                                                                              ])
                                                                          : u.push(
                                                                              e,
                                                                            ),
                                                                          y++;
                                                                      }
                                                                      E =
                                                                        e === y;
                                                                    } else
                                                                      E = !0;
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
                                                const e = {
                                                  params: { type: 'object' },
                                                };
                                                null === u
                                                  ? (u = [e])
                                                  : u.push(e),
                                                  y++;
                                              }
                                            (k = e === y), (o = o || k);
                                          }
                                          if (o)
                                            (y = s),
                                              null !== u &&
                                                (s
                                                  ? (u.length = s)
                                                  : (u = null));
                                          else {
                                            const e = { params: {} };
                                            null === u ? (u = [e]) : u.push(e),
                                              y++;
                                          }
                                          R = n === y;
                                        } else R = !0;
                                        if (R) {
                                          if (void 0 !== e.tsConfigPath) {
                                            const t = y;
                                            if (
                                              'string' != typeof e.tsConfigPath
                                            ) {
                                              const e = {
                                                params: { type: 'string' },
                                              };
                                              null === u
                                                ? (u = [e])
                                                : u.push(e),
                                                y++;
                                            }
                                            R = t === y;
                                          } else R = !0;
                                          if (R) {
                                            if (void 0 !== e.extraOptions) {
                                              let t = e.extraOptions;
                                              const r = y;
                                              if (
                                                !t ||
                                                'object' != typeof t ||
                                                Array.isArray(t)
                                              ) {
                                                const e = {
                                                  params: { type: 'object' },
                                                };
                                                null === u
                                                  ? (u = [e])
                                                  : u.push(e),
                                                  y++;
                                              }
                                              R = r === y;
                                            } else R = !0;
                                            if (R) {
                                              if (void 0 !== e.implementation) {
                                                const t = y;
                                                if (
                                                  'string' !=
                                                  typeof e.implementation
                                                ) {
                                                  const e = {
                                                    params: { type: 'string' },
                                                  };
                                                  null === u
                                                    ? (u = [e])
                                                    : u.push(e),
                                                    y++;
                                                }
                                                R = t === y;
                                              } else R = !0;
                                              if (R) {
                                                if (void 0 !== e.cwd) {
                                                  const t = y;
                                                  if (
                                                    'string' != typeof e.cwd
                                                  ) {
                                                    const e = {
                                                      params: {
                                                        type: 'string',
                                                      },
                                                    };
                                                    null === u
                                                      ? (u = [e])
                                                      : u.push(e),
                                                      y++;
                                                  }
                                                  R = t === y;
                                                } else R = !0;
                                                if (R)
                                                  if (
                                                    void 0 !==
                                                    e.displayErrorInTerminal
                                                  ) {
                                                    const t = y;
                                                    if (
                                                      'boolean' !=
                                                      typeof e.displayErrorInTerminal
                                                    ) {
                                                      const e = {
                                                        params: {
                                                          type: 'boolean',
                                                        },
                                                      };
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                        y++;
                                                    }
                                                    R = t === y;
                                                  } else R = !0;
                                              }
                                            }
                                          }
                                        }
                                      }
                                    } else {
                                      const e = { params: { type: 'object' } };
                                      null === u ? (u = [e]) : u.push(e), y++;
                                    }
                                  (D = r === y), (s = s || D);
                                }
                                if (!s) {
                                  const e = { params: {} };
                                  return (
                                    null === u ? (u = [e]) : u.push(e),
                                    y++,
                                    (A.errors = u),
                                    !1
                                  );
                                }
                                (y = n),
                                  null !== u &&
                                    (n ? (u.length = n) : (u = null)),
                                  (b = r === y);
                              } else b = !0;
                              if (b) {
                                if (void 0 !== o.experiments) {
                                  let e = o.experiments;
                                  const r = y;
                                  if (y === r) {
                                    if (
                                      !e ||
                                      'object' != typeof e ||
                                      Array.isArray(e)
                                    )
                                      return (
                                        (A.errors = [
                                          { params: { type: 'object' } },
                                        ]),
                                        !1
                                      );
                                    if (void 0 !== e.asyncStartup) {
                                      const t = y;
                                      if ('boolean' != typeof e.asyncStartup)
                                        return (
                                          (A.errors = [
                                            { params: { type: 'boolean' } },
                                          ]),
                                          !1
                                        );
                                      var $ = t === y;
                                    } else $ = !0;
                                    if ($) {
                                      if (void 0 !== e.externalRuntime) {
                                        const t = y;
                                        if (
                                          'boolean' != typeof e.externalRuntime
                                        )
                                          return (
                                            (A.errors = [
                                              { params: { type: 'boolean' } },
                                            ]),
                                            !1
                                          );
                                        $ = t === y;
                                      } else $ = !0;
                                      if ($) {
                                        if (
                                          void 0 !== e.provideExternalRuntime
                                        ) {
                                          const t = y;
                                          if (
                                            'boolean' !=
                                            typeof e.provideExternalRuntime
                                          )
                                            return (
                                              (A.errors = [
                                                { params: { type: 'boolean' } },
                                              ]),
                                              !1
                                            );
                                          $ = t === y;
                                        } else $ = !0;
                                        if ($)
                                          if (void 0 !== e.optimization) {
                                            let r = e.optimization;
                                            const n = y;
                                            if (y === n) {
                                              if (
                                                !r ||
                                                'object' != typeof r ||
                                                Array.isArray(r)
                                              )
                                                return (
                                                  (A.errors = [
                                                    {
                                                      params: {
                                                        type: 'object',
                                                      },
                                                    },
                                                  ]),
                                                  !1
                                                );
                                              {
                                                const e = y;
                                                for (const e in r)
                                                  if (
                                                    'disableSnapshot' !== e &&
                                                    'target' !== e
                                                  )
                                                    return (
                                                      (A.errors = [
                                                        {
                                                          params: {
                                                            additionalProperty:
                                                              e,
                                                          },
                                                        },
                                                      ]),
                                                      !1
                                                    );
                                                if (e === y) {
                                                  if (
                                                    void 0 !== r.disableSnapshot
                                                  ) {
                                                    const e = y;
                                                    if (
                                                      'boolean' !=
                                                      typeof r.disableSnapshot
                                                    )
                                                      return (
                                                        (A.errors = [
                                                          {
                                                            params: {
                                                              type: 'boolean',
                                                            },
                                                          },
                                                        ]),
                                                        !1
                                                      );
                                                    var q = e === y;
                                                  } else q = !0;
                                                  if (q)
                                                    if (void 0 !== r.target) {
                                                      let e = r.target;
                                                      const n = y;
                                                      if (
                                                        'web' !== e &&
                                                        'node' !== e
                                                      )
                                                        return (
                                                          (A.errors = [
                                                            {
                                                              params: {
                                                                allowedValues:
                                                                  t.properties
                                                                    .experiments
                                                                    .properties
                                                                    .optimization
                                                                    .properties
                                                                    .target
                                                                    .enum,
                                                              },
                                                            },
                                                          ]),
                                                          !1
                                                        );
                                                      q = n === y;
                                                    } else q = !0;
                                                }
                                              }
                                            }
                                            $ = n === y;
                                          } else $ = !0;
                                      }
                                    }
                                  }
                                  b = r === y;
                                } else b = !0;
                                if (b) {
                                  if (void 0 !== o.bridge) {
                                    let e = o.bridge;
                                    const t = y;
                                    if (y === t) {
                                      if (
                                        !e ||
                                        'object' != typeof e ||
                                        Array.isArray(e)
                                      )
                                        return (
                                          (A.errors = [
                                            { params: { type: 'object' } },
                                          ]),
                                          !1
                                        );
                                      {
                                        const t = y;
                                        for (const t in e)
                                          if (
                                            'enableBridgeRouter' !== t &&
                                            'disableAlias' !== t
                                          )
                                            return (
                                              (A.errors = [
                                                {
                                                  params: {
                                                    additionalProperty: t,
                                                  },
                                                },
                                              ]),
                                              !1
                                            );
                                        if (t === y) {
                                          if (void 0 !== e.enableBridgeRouter) {
                                            const t = y;
                                            if (
                                              'boolean' !=
                                              typeof e.enableBridgeRouter
                                            )
                                              return (
                                                (A.errors = [
                                                  {
                                                    params: { type: 'boolean' },
                                                  },
                                                ]),
                                                !1
                                              );
                                            var C = t === y;
                                          } else C = !0;
                                          if (C)
                                            if (void 0 !== e.disableAlias) {
                                              const t = y;
                                              if (
                                                'boolean' !=
                                                typeof e.disableAlias
                                              )
                                                return (
                                                  (A.errors = [
                                                    {
                                                      params: {
                                                        type: 'boolean',
                                                      },
                                                    },
                                                  ]),
                                                  !1
                                                );
                                              C = t === y;
                                            } else C = !0;
                                        }
                                      }
                                    }
                                    b = t === y;
                                  } else b = !0;
                                  if (b) {
                                    if (void 0 !== o.virtualRuntimeEntry) {
                                      const e = y;
                                      if (
                                        'boolean' !=
                                        typeof o.virtualRuntimeEntry
                                      )
                                        return (
                                          (A.errors = [
                                            { params: { type: 'boolean' } },
                                          ]),
                                          !1
                                        );
                                      b = e === y;
                                    } else b = !0;
                                    if (b) {
                                      if (void 0 !== o.dev) {
                                        let e = o.dev;
                                        const t = y,
                                          r = y;
                                        let n = !1;
                                        const s = y;
                                        if ('boolean' != typeof e) {
                                          const e = {
                                            params: { type: 'boolean' },
                                          };
                                          null === u ? (u = [e]) : u.push(e),
                                            y++;
                                        }
                                        var V = s === y;
                                        if (((n = n || V), !n)) {
                                          const t = y;
                                          if (y === t)
                                            if (
                                              e &&
                                              'object' == typeof e &&
                                              !Array.isArray(e)
                                            ) {
                                              const t = y;
                                              for (const t in e)
                                                if (
                                                  'disableLiveReload' !== t &&
                                                  'disableHotTypesReload' !==
                                                    t &&
                                                  'disableDynamicRemoteTypeHints' !==
                                                    t
                                                ) {
                                                  const e = {
                                                    params: {
                                                      additionalProperty: t,
                                                    },
                                                  };
                                                  null === u
                                                    ? (u = [e])
                                                    : u.push(e),
                                                    y++;
                                                  break;
                                                }
                                              if (t === y) {
                                                if (
                                                  void 0 !== e.disableLiveReload
                                                ) {
                                                  const t = y;
                                                  if (
                                                    'boolean' !=
                                                    typeof e.disableLiveReload
                                                  ) {
                                                    const e = {
                                                      params: {
                                                        type: 'boolean',
                                                      },
                                                    };
                                                    null === u
                                                      ? (u = [e])
                                                      : u.push(e),
                                                      y++;
                                                  }
                                                  var w = t === y;
                                                } else w = !0;
                                                if (w) {
                                                  if (
                                                    void 0 !==
                                                    e.disableHotTypesReload
                                                  ) {
                                                    const t = y;
                                                    if (
                                                      'boolean' !=
                                                      typeof e.disableHotTypesReload
                                                    ) {
                                                      const e = {
                                                        params: {
                                                          type: 'boolean',
                                                        },
                                                      };
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                        y++;
                                                    }
                                                    w = t === y;
                                                  } else w = !0;
                                                  if (w)
                                                    if (
                                                      void 0 !==
                                                      e.disableDynamicRemoteTypeHints
                                                    ) {
                                                      const t = y;
                                                      if (
                                                        'boolean' !=
                                                        typeof e.disableDynamicRemoteTypeHints
                                                      ) {
                                                        const e = {
                                                          params: {
                                                            type: 'boolean',
                                                          },
                                                        };
                                                        null === u
                                                          ? (u = [e])
                                                          : u.push(e),
                                                          y++;
                                                      }
                                                      w = t === y;
                                                    } else w = !0;
                                                }
                                              }
                                            } else {
                                              const e = {
                                                params: { type: 'object' },
                                              };
                                              null === u
                                                ? (u = [e])
                                                : u.push(e),
                                                y++;
                                            }
                                          (V = t === y), (n = n || V);
                                        }
                                        if (!n) {
                                          const e = { params: {} };
                                          return (
                                            null === u ? (u = [e]) : u.push(e),
                                            y++,
                                            (A.errors = u),
                                            !1
                                          );
                                        }
                                        (y = r),
                                          null !== u &&
                                            (r ? (u.length = r) : (u = null)),
                                          (b = t === y);
                                      } else b = !0;
                                      if (b) {
                                        if (void 0 !== o.manifest) {
                                          let e = o.manifest;
                                          const t = y,
                                            r = y;
                                          let n = !1;
                                          const s = y;
                                          if ('boolean' != typeof e) {
                                            const e = {
                                              params: { type: 'boolean' },
                                            };
                                            null === u ? (u = [e]) : u.push(e),
                                              y++;
                                          }
                                          var F = s === y;
                                          if (((n = n || F), !n)) {
                                            const t = y;
                                            if (y === t)
                                              if (
                                                e &&
                                                'object' == typeof e &&
                                                !Array.isArray(e)
                                              ) {
                                                const t = y;
                                                for (const t in e)
                                                  if (
                                                    'filePath' !== t &&
                                                    'disableAssetsAnalyze' !==
                                                      t &&
                                                    'fileName' !== t &&
                                                    'additionalData' !== t &&
                                                    'rsc' !== t
                                                  ) {
                                                    const e = {
                                                      params: {
                                                        additionalProperty: t,
                                                      },
                                                    };
                                                    null === u
                                                      ? (u = [e])
                                                      : u.push(e),
                                                      y++;
                                                    break;
                                                  }
                                                if (t === y) {
                                                  if (void 0 !== e.filePath) {
                                                    const t = y;
                                                    if (
                                                      'string' !=
                                                      typeof e.filePath
                                                    ) {
                                                      const e = {
                                                        params: {
                                                          type: 'string',
                                                        },
                                                      };
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                        y++;
                                                    }
                                                    var N = t === y;
                                                  } else N = !0;
                                                  if (N) {
                                                    if (
                                                      void 0 !==
                                                      e.disableAssetsAnalyze
                                                    ) {
                                                      const t = y;
                                                      if (
                                                        'boolean' !=
                                                        typeof e.disableAssetsAnalyze
                                                      ) {
                                                        const e = {
                                                          params: {
                                                            type: 'boolean',
                                                          },
                                                        };
                                                        null === u
                                                          ? (u = [e])
                                                          : u.push(e),
                                                          y++;
                                                      }
                                                      N = t === y;
                                                    } else N = !0;
                                                    if (N) {
                                                      if (
                                                        void 0 !== e.fileName
                                                      ) {
                                                        const t = y;
                                                        if (
                                                          'string' !=
                                                          typeof e.fileName
                                                        ) {
                                                          const e = {
                                                            params: {
                                                              type: 'string',
                                                            },
                                                          };
                                                          null === u
                                                            ? (u = [e])
                                                            : u.push(e),
                                                            y++;
                                                        }
                                                        N = t === y;
                                                      } else N = !0;
                                                      if (N)
                                                        if (
                                                          void 0 !==
                                                          e.additionalData
                                                        ) {
                                                          const t = y;
                                                          if (
                                                            !(
                                                              e.additionalData instanceof
                                                              Function
                                                            )
                                                          ) {
                                                            const e = {
                                                              params: {},
                                                            };
                                                            null === u
                                                              ? (u = [e])
                                                              : u.push(e),
                                                              y++;
                                                          }
                                                          N = t === y;
                                                        } else N = !0;
                                                      if (N)
                                                        if (void 0 !== e.rsc) {
                                                          const t = y;
                                                          if (
                                                            !(
                                                              e.rsc &&
                                                              'object' ==
                                                                typeof e.rsc &&
                                                              !Array.isArray(
                                                                e.rsc,
                                                              )
                                                            )
                                                          ) {
                                                            const e = {
                                                              params: {
                                                                type: 'object',
                                                              },
                                                            };
                                                            null === u
                                                              ? (u = [e])
                                                              : u.push(e),
                                                              y++;
                                                          }
                                                          N = t === y;
                                                        } else N = !0;
                                                    }
                                                  }
                                                }
                                              } else {
                                                const e = {
                                                  params: { type: 'object' },
                                                };
                                                null === u
                                                  ? (u = [e])
                                                  : u.push(e),
                                                  y++;
                                              }
                                            (F = t === y), (n = n || F);
                                          }
                                          if (!n) {
                                            const e = { params: {} };
                                            return (
                                              null === u
                                                ? (u = [e])
                                                : u.push(e),
                                              y++,
                                              (A.errors = u),
                                              !1
                                            );
                                          }
                                          (y = r),
                                            null !== u &&
                                              (r ? (u.length = r) : (u = null)),
                                            (b = t === y);
                                        } else b = !0;
                                        if (b) {
                                          if (void 0 !== o.runtimePlugins) {
                                            let e = o.runtimePlugins;
                                            const t = y;
                                            if (y === t) {
                                              if (!Array.isArray(e))
                                                return (
                                                  (A.errors = [
                                                    {
                                                      params: { type: 'array' },
                                                    },
                                                  ]),
                                                  !1
                                                );
                                              {
                                                const t = e.length;
                                                for (let r = 0; r < t; r++) {
                                                  let t = e[r];
                                                  const n = y,
                                                    s = y;
                                                  let o = !1;
                                                  const i = y;
                                                  if ('string' != typeof t) {
                                                    const e = {
                                                      params: {
                                                        type: 'string',
                                                      },
                                                    };
                                                    null === u
                                                      ? (u = [e])
                                                      : u.push(e),
                                                      y++;
                                                  }
                                                  var z = i === y;
                                                  if (((o = o || z), !o)) {
                                                    const e = y;
                                                    if (y === e)
                                                      if (Array.isArray(t))
                                                        if (t.length > 2) {
                                                          const e = {
                                                            params: {
                                                              limit: 2,
                                                            },
                                                          };
                                                          null === u
                                                            ? (u = [e])
                                                            : u.push(e),
                                                            y++;
                                                        } else if (
                                                          t.length < 2
                                                        ) {
                                                          const e = {
                                                            params: {
                                                              limit: 2,
                                                            },
                                                          };
                                                          null === u
                                                            ? (u = [e])
                                                            : u.push(e),
                                                            y++;
                                                        } else {
                                                          const e = t.length;
                                                          if (e > 0) {
                                                            const e = y;
                                                            if (
                                                              'string' !=
                                                              typeof t[0]
                                                            ) {
                                                              const e = {
                                                                params: {
                                                                  type: 'string',
                                                                },
                                                              };
                                                              null === u
                                                                ? (u = [e])
                                                                : u.push(e),
                                                                y++;
                                                            }
                                                            var U = e === y;
                                                          }
                                                          if (U && e > 1) {
                                                            let e = t[1];
                                                            const r = y;
                                                            if (
                                                              !e ||
                                                              'object' !=
                                                                typeof e ||
                                                              Array.isArray(e)
                                                            ) {
                                                              const e = {
                                                                params: {
                                                                  type: 'object',
                                                                },
                                                              };
                                                              null === u
                                                                ? (u = [e])
                                                                : u.push(e),
                                                                y++;
                                                            }
                                                            U = r === y;
                                                          }
                                                        }
                                                      else {
                                                        const e = {
                                                          params: {
                                                            type: 'array',
                                                          },
                                                        };
                                                        null === u
                                                          ? (u = [e])
                                                          : u.push(e),
                                                          y++;
                                                      }
                                                    (z = e === y), (o = o || z);
                                                  }
                                                  if (!o) {
                                                    const e = { params: {} };
                                                    return (
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                      y++,
                                                      (A.errors = u),
                                                      !1
                                                    );
                                                  }
                                                  if (
                                                    ((y = s),
                                                    null !== u &&
                                                      (s
                                                        ? (u.length = s)
                                                        : (u = null)),
                                                    n !== y)
                                                  )
                                                    break;
                                                }
                                              }
                                            }
                                            b = t === y;
                                          } else b = !0;
                                          if (b) {
                                            if (void 0 !== o.getPublicPath) {
                                              const e = y;
                                              if (
                                                'string' !=
                                                typeof o.getPublicPath
                                              )
                                                return (
                                                  (A.errors = [
                                                    {
                                                      params: {
                                                        type: 'string',
                                                      },
                                                    },
                                                  ]),
                                                  !1
                                                );
                                              b = e === y;
                                            } else b = !0;
                                            if (b) {
                                              if (void 0 !== o.dataPrefetch) {
                                                const e = y;
                                                if (
                                                  'boolean' !=
                                                  typeof o.dataPrefetch
                                                )
                                                  return (
                                                    (A.errors = [
                                                      {
                                                        params: {
                                                          type: 'boolean',
                                                        },
                                                      },
                                                    ]),
                                                    !1
                                                  );
                                                b = e === y;
                                              } else b = !0;
                                              if (b)
                                                if (
                                                  void 0 !== o.implementation
                                                ) {
                                                  const e = y;
                                                  if (
                                                    'string' !=
                                                    typeof o.implementation
                                                  )
                                                    return (
                                                      (A.errors = [
                                                        {
                                                          params: {
                                                            type: 'string',
                                                          },
                                                        },
                                                      ]),
                                                      !1
                                                    );
                                                  b = e === y;
                                                } else b = !0;
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
  return (A.errors = u), 0 === y;
}
